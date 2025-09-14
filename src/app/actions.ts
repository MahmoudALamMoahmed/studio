'use server';

import { Product, products } from '@/lib/products';
import { randomBytes } from 'crypto';

export async function createCheckoutSession(productId: string) {
  if (!process.env.KASHIER_API_KEY || !process.env.KASHIER_MERCHANT_ID) {
    throw new Error('Kashier API Key or Merchant ID is not configured.');
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_APP_URL is not configured.');
  }

  const selectedProduct = products.find((p) => p.id === productId);
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
  const signature = crypto
    .createHmac('sha256', apiKey)
    .update(path)
    .digest('hex');

  const checkoutUrl = 'https://checkout.kashier.io';
  const queryParams = new URLSearchParams({
    merchantId: merchantId,
    orderId: orderId,
    amount: amount,
    currency: currency,
    hash: signature,
    successUrl: `${baseUrl}/success?orderId=${orderId}`,
    failureUrl: `${baseUrl}/cancel`,
    display: 'ar',
    mode: "test",
  });

  const redirectUrl = `${checkoutUrl}?${queryParams.toString()}`;

  return { redirectUrl };
}
