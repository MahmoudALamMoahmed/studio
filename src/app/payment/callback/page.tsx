'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

function VerificationComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const orderId = searchParams.get('orderId');
    const transactionId = searchParams.get('transactionId');

    if (!orderId && !transactionId) {
      router.replace('/');
      return;
    }

    const checkTransaction = async () => {
      try {
        const resp = await fetch(
          `/api/payment/verify?orderId=${orderId ?? ''}&transactionId=${transactionId ?? ''}`
        );
        const result = await resp.json();

        const params = new URLSearchParams();
        if (result.orderId) params.set('orderId', result.orderId);
        if (result.message) params.set('message', result.message);

        if (result.verified) {
          router.replace(`/success?${params.toString()}`);
        } else {
          router.replace(`/cancel?${params.toString()}`);
        }
      } catch (error) {
        console.error('Verification failed', error);
        const params = new URLSearchParams();
        if (orderId) params.set('orderId', orderId);
        params.set('message', 'حدث خطأ أثناء التحقق من الدفع.');
        router.replace(`/cancel?${params.toString()}`);
      }
    };

    checkTransaction();
  }, [router, searchParams]);

  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4 px-4 py-8 text-center">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <h1 className="text-2xl font-headline">جاري التحقق من حالة الدفع...</h1>
      <p className="text-muted-foreground">
        يرجى الانتظار، سيتم توجيهك قريباً.
      </p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4 px-4 py-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-2xl font-headline">جاري التحميل...</h1>
        </div>
      }
    >
      <VerificationComponent />
    </Suspense>
  );
}
