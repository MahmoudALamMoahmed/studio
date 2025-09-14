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

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePurchase = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: product.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'فشل في إنشاء رابط الدفع');
      }
      
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        throw new Error('لم يتم العثور على رابط الدفع في الاستجابة.');
      }

    } catch (error) {
      console.error(error);
      let errorMessage = 'يرجى المحاولة مرة أخرى.';
      if (error instanceof Error) {
        // Handle JSON parsing error specifically
        if (error.message.includes('Unexpected token')) {
            errorMessage = 'حدث خطأ غير متوقع من الخادم. لم يتمكن من معالجة الرد.';
        } else {
            errorMessage = error.message;
        }
      }
      
      toast({
        variant: 'destructive',
        title: 'حدث خطأ',
        description: errorMessage,
      });
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
        <Button onClick={handlePurchase} disabled={isLoading} className="w-full text-lg py-6">
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
