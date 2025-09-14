import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";
import Link from "next/link";

export default function CancelPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="items-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="pt-4 text-2xl font-headline">تم إلغاء الدفع</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            حدث خطأ ما أو قمت بإلغاء العملية. لم يتم خصم أي مبلغ.
          </p>
          <Button asChild className="mt-6 w-full text-lg py-6">
            <Link href="/">العودة والمحاولة مرة أخرى</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
