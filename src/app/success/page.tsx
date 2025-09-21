'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="items-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="pt-4 text-2xl font-headline">تم الدفع بنجاح!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            شكراً لك على شرائك. سيتم معالجة طلبك قريباً.
          </p>
          {orderId && (
            <div className="mt-4 rounded-md bg-muted p-3 text-sm">
              <p className="font-semibold">رقم الطلب:</p>
              <p className="font-mono text-xs">{orderId}</p>
            </div>
          )}
          <Button asChild className="mt-6 w-full text-lg py-6">
            <Link href="/">العودة إلى الصفحة الرئيسية</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}
