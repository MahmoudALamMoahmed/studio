import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ success: false, message: 'رقم الطلب غير موجود.' }, { status: 400 });
  }

  const { KASHIER_API_KEY, KASHIER_MERCHANT_ID } = process.env;

  if (!KASHIER_API_KEY || !KASHIER_MERCHANT_ID) {
    return NextResponse.json({ success: false, message: 'إعدادات كاشير غير مكتملة.' }, { status: 500 });
  }

  try {
    const path = `/v1/payment/transaction/${orderId}`;
    const signature = crypto.createHmac('sha256', KASHIER_API_KEY).update(`GET${path}`).digest('hex');

    const response = await fetch(`https://api.kashier.io${path}`, {
      method: 'GET',
      headers: {
        'Authorization': `${KASHIER_MERCHANT_ID}:${signature}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
        // Use the message from Kashier if available
        const kashierMessage = data?.message || 'فشل الاتصال بخدمة كاشير.';
        return NextResponse.json({ success: false, message: kashierMessage }, { status: response.status });
    }

    if (data.status === 'SUCCESS' && data.payment.status === 'SUCCESSFUL') {
        return NextResponse.json({ success: true, message: 'تم الدفع بنجاح' });
    } else {
        const failureReason = data.payment.response.message || 'فشلت عملية الدفع.';
        return NextResponse.json({ success: false, message: failureReason });
    }

  } catch (error) {
    console.error('Kashier verification error:', error);
    return NextResponse.json({ success: false, message: 'حدث خطأ غير متوقع أثناء التحقق.' }, { status: 500 });
  }
}
