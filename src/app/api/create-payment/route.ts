import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { products } from '@/lib/products';
import { randomUUID } from 'crypto';

const KASHIER_API_KEY = "73342d90-d195-41a6-b260-1ea6cbf380bb";
const KASHIER_MERCHANT_ID = "MID-37646-41";
const KASHIER_API_URL = "https://api.kashier.io/payment/request";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ message: 'معرف المنتج مطلوب' }, { status: 400 });
    }

    const product = products.find((p) => p.id === productId);

    if (!product) {
      return NextResponse.json({ message: 'المنتج غير موجود' }, { status: 404 });
    }
    
    // Using crypto.randomUUID for a unique order ID to avoid hydration issues
    const orderId = `${product.id}-${randomUUID()}`;

    const paymentData = {
      merchantId: KASHIER_MERCHANT_ID,
      amount: product.price.toString(),
      currency: "EGP",
      orderId: orderId,
      successUrl: `https://9000-firebase-studio-1757858785812.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev/success?orderId=${orderId}`,
      failureUrl: `https://9000-firebase-studio-1757858785812.cluster-fbfjltn375c6wqxlhoehbz44sk.cloudworkstations.dev/cancel`,
      display: "ar",
      mode: "redirect"
    };
    
    const response = await fetch(KASHIER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': KASHIER_API_KEY,
      },
      body: JSON.stringify(paymentData),
    });
    
    const responseData = await response.json();

    if (!response.ok || !responseData.success) {
      console.error('Kashier API Error:', responseData);
      const errorMessage = responseData.message || 'فشل في الاتصال ببوابة الدفع';
      return NextResponse.json({ message: errorMessage }, { status: response.status });
    }

    const paymentUrl = responseData.response.paymentRequest.url;
    if (!paymentUrl) {
      console.error('Kashier API Error: Payment URL not found', responseData);
      return NextResponse.json({ message: 'لم يتم العثور على رابط الدفع' }, { status: 500 });
    }

    return NextResponse.json({ paymentUrl });

  } catch (error) {
    console.error('Server Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'حدث خطأ في الخادم';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
