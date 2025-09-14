export type Product = {
  id: string;
  name: string;
  price: number; // in EGP
  currency: 'EGP';
  imageUrl: string;
  imageHint: string;
};

export const products: Product[] = [
  { 
    id: 'prod_1', 
    name: 'مزهرية فخارية يدوية', 
    price: 250,
    currency: 'EGP',
    imageUrl: 'https://picsum.photos/seed/kashier1/600/400', 
    imageHint: 'pottery vase' 
  },
  { 
    id: 'prod_2', 
    name: 'قهوة أرابيكا مختصة', 
    price: 150, 
    currency: 'EGP',
    imageUrl: 'https://picsum.photos/seed/kashier2/600/400', 
    imageHint: 'coffee beans' 
  },
  { 
    id: 'prod_3', 
    name: 'وشاح صوف منسوج', 
    price: 300, 
    currency: 'EGP',
    imageUrl: 'https://picsum.photos/seed/kashier3/600/400', 
    imageHint: 'woven scarf'
  },
];
