'use server';

import { Product } from '@/lib/products';
import { randomBytes } from 'crypto';

export async function createCheckoutSession(productId: string) {
  if (!process.env.KASHIER_API_KEY || !process.env.KASHIER_MERCHANT_ID) {
    throw new Error('Kashier API Key or Merchant ID is not configured.');
  }
  
  const merchantId = process.env.KASHIER_MERCHANT_ID;
  const apiKey = process.env.KASHIER_API_KEY;
  const orderId = `order-${randomBytes(8).toString('hex')}`;
  // For verification, we need to pass the actual product price, not just the ID.
  // We'll pass it through the verification URL.
  const path = `/?payment=${merchantId}.${orderId}.{amount}.{currency}`;
  
  const crypto = await import('crypto');
  const signature = crypto.createHmac('sha256', apiKey).update(path).digest('hex');

  const baseUrl = 'https://checkout.kashier.io';
  const queryParams = new URLSearchParams({
    merchantId: merchantId,
    orderId: orderId,
    // amount and currency will be set on the client side in the final URL
    hash: signature,
    // Use the correct redirect parameters as per Kashier's documentation
    merchantRedirect: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    failureRedirect: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    redirect: 'true',
    display: 'ar',
    mode: 'test',
  });

  const redirectUrlTemplate = `${baseUrl}?${queryParams.toString()}`;

  return { redirectUrlTemplate };
}
