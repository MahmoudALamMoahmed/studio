'use server';

import { Product, products } from '@/lib/products';
import { randomBytes } from 'crypto';
import { redirect } from 'next/navigation';

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
  const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/payment/callback`; // 🔥 خلي الكولباك يروح API

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

// 👇 هذي هنستدعيها من الكولباك API
export async function verifyTransaction(orderId: string | null, transactionId: string | null) {
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
    url = `https://test-api.kashier.io/v2/aggregator/transactions?search=${orderId}`;
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
      redirect(`/payment/failed?orderId=${orderId ?? ''}&status=NOT_FOUND`);
    }
    
    const status = txn.paymentStatus?.toUpperCase() || txn.status?.toUpperCase() || txn.lastStatus?.toUpperCase();
    const successKeywords = ["SUCCESS", "APPROVED", "CAPTURED", "COMPLETED"];
    const verified = successKeywords.includes(status);

    if (verified) {
      redirect(`/success?orderId=${txn.merchantOrderId}`);
    } else {
      redirect(`/cancel?orderId=${txn.merchantOrderId}&status=${status}`);
    }

  } catch (error) {
    console.error("Verification failed:", error);
    const message = error instanceof Error ? error.message : "حدث خطأ أثناء التحقق من المعاملة";
    redirect(`/cancel?orderId=${orderId ?? ''}&status=ERROR&message=${encodeURIComponent(message)}`);
  }
}
