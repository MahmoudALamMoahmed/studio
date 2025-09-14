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
  const queryParams = new URLSearchParams({
    merchantId: merchantId,
    orderId: orderId,
    amount: amount,
    currency: currency,
    hash: signature,
    // Use the correct redirect parameters as per Kashier's documentation
    merchantRedirect: `${process.env.NEXT_PUBLIC_APP_URL}/success`,
    failureRedirect: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    redirect: 'true', // Automatically redirect to Kashier's page
    display: 'ar', // To display the payment page in Arabic
    store: selectedProduct.name,
    mode: 'test', // <-- هنا تم إضافة Test Mode
  });

  const redirectUrl = `${baseUrl}?${queryParams.toString()}`;

  return { redirectUrl };
}