'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      // No orderId, redirect to home
      router.replace('/');
      return;
    }

    const verify = async () => {
      try {
        const response = await fetch(`/api/verify?orderId=${orderId}`);
        const data = await response.json();

        if (data.success) {
          router.replace(`/success?orderId=${orderId}`);
        } else {
          router.replace(`/cancel?orderId=${orderId}&message=${encodeURIComponent(data.message)}`);
        }
      } catch (error) {
        console.error('Verification failed:', error);
        router.replace(`/cancel?orderId=${orderId}&message=${encodeURIComponent('فشل التحقق من حالة الدفع.')}`);
      }
    };

    // Delay verification slightly to allow Kashier's backend to process the transaction
    const timer = setTimeout(verify, 2000); 

    return () => clearTimeout(timer);

  }, [orderId, router]);

  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center px-4 py-8 text-center">
      <Loader2 className="h-16 w-16 animate-spin text-primary" />
      <h1 className="mt-6 text-2xl font-headline font-bold">جاري التحقق من حالة الدفع...</h1>
      <p className="mt-2 text-muted-foreground">
        يرجى الانتظار، سيتم توجيهك قريباً.
      </p>
       {orderId && (
            <div className="mt-4 rounded-md bg-muted p-3 text-sm">
              <p className="font-semibold">رقم الطلب:</p>
              <p className="font-mono text-xs">{orderId}</p>
            </div>
        )}
    </div>
  );
}


export default function VerifyPaymentPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyPaymentContent/>
        </Suspense>
    )
}
