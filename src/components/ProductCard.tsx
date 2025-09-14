'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { Product } from '@/lib/products';
import { createCheckoutSession } from '@/app/actions';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const result = await createCheckoutSession(product.id);

      if (result?.redirectUrl) {
        // توجيه المستخدم لصفحة Kashier
        window.location.href = result.redirectUrl;
      } else {
        throw new Error('فشل في إنشاء رابط الدفع.');
      }
    } catch (error) {
      console.error("Purchase error:", error);
      const errorMessage =
        error instanceof Error ? error.message : 'يرجى المحاولة مرة أخرى.';

      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-md transition-shadow hover:shadow-xl">
      <CardHeader className="p-0">
        <div className="relative aspect-[3/2]">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            data-ai-hint={product.imageHint}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-grow p-6">
        <CardTitle className="font-headline text-2xl">{product.name}</CardTitle>
        <p className="mt-4 text-3xl font-semibold text-accent">
          {product.price.toLocaleString('ar-EG')} جنيه
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0">
        <Button
          onClick={handlePurchase}
          disabled={isLoading}
          className="w-full text-lg py-6"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>جاري التحضير...</span>
            </div>
          ) : (
            'اشترِ الآن'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
