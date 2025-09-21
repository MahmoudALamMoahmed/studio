'use server';

import { Product, products } from '@/lib/products';
import { randomBytes } from 'crypto';

export async function createCheckoutSession(product: Product) {
  if (!process.env.KASHIER_API_KEY || !process.env.KASHIER_MERCHANT_ID) {
    throw new Error('Kashier API Key or Merchant ID is not configured.');
  }

  const selectedProduct = products.find((p) => p.id === product.id);
  if (!selectedProduct) {
    throw new Error('Product not found.');
  }

  const merchantId = process.env.KASHIER_MERCHANT_ID;
  const apiKey = process.env.KASHIER_API_KEY;
  const orderId = `order-${randomBytes(8).toString('hex')}`;
  const amount = selectedProduct.price.toFixed(2);
  const currency = selectedProduct.currency;

  const path = `/?payment=${merchantId}.${orderId}.${amount}.${currency}`;
  
  const crypto = await import('crypto');
  const signature = crypto.createHmac('sha256', apiKey).update(path).digest('hex');

  const baseUrl = 'https://checkout.kashier.io';
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`;

  const queryParams = new URLSearchParams({
    merchantId: merchantId,
    orderId: orderId,
    amount: amount,
    currency: currency,
    hash: signature,
    merchantRedirect: callbackUrl,
    failureRedirect: callbackUrl, 
    redirect: 'true',
    display: 'ar',
    store: selectedProduct.name,
    mode: 'test',
  });

  const redirectUrl = `${baseUrl}?${queryParams.toString()}`;

  return { redirectUrl };
}

export async function verifyTransaction(orderId: string | null, transactionId: string | null): Promise<{verified: boolean; status: string, message: string, orderId?: string}> {
  if (!process.env.KASHIER_SECERET_KEY) {
    throw new Error("Kashier API Key is not configured.");
  }
  if (!orderId && !transactionId) {
    throw new Error("Missing merchantOrderId or transactionId");
  }

  let url;
  if (transactionId) {
    url = `https://test-api.kashier.io/v2/aggregator/transactions/${transactionId}`;
  } else {
    // Fallback to orderId if transactionId is not present
    url = `https://test-api.kashier.io/v2/aggregator/transactions?merchantOrderId=${orderId}`;
  }
  
  try {
    const resp = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: process.env.KASHIER_SECERET_KEY,
        Accept: "application/json"
      }
    });

    if (!resp.ok) {
       const errorData = await resp.text();
       console.error("Kashier API Error Response:", errorData);
       throw new Error(`Kashier API error: ${resp.status} - ${resp.statusText}`);
    }

    const data = await resp.json();
    
    const txn = Array.isArray(data?.body) && data.body.length > 0 ? data.body[0] : data.body || null;

    if (!txn) {
      return { verified: false, status: 'NOT_FOUND', message: "لم يتم العثور على المعاملة.", orderId: orderId ?? undefined};
    }
    
    const status = txn.paymentStatus?.toUpperCase() || txn.status?.toUpperCase() || txn.lastStatus?.toUpperCase();
    const successKeywords = ["SUCCESS", "APPROVED", "CAPTURED", "COMPLETED"];
    const verified = successKeywords.includes(status);
    const message = verified ? 'تم الدفع بنجاح' : (txn.response?.message || 'فشلت عملية الدفع');

    return { verified, status, message, orderId: txn.merchantOrderId };

  } catch (error) {
    console.error("Verification failed:", error);
    const message = error instanceof Error ? error.message : "حدث خطأ أثناء التحقق من المعاملة";
    return { verified: false, status: 'ERROR', message, orderId: orderId ?? undefined };
  }
}
