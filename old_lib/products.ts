export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  colors: string[];
  images: string[];
  sizes: {
    name: string;
    inStock: boolean;
    measurements?: {
      chest?: string;
      length?: string;
      sleeve?: string;
      waist?: string;
    };
  }[];
  details: {
    material: string;
    care: string[];
    features: string[];
  };
  shipping: {
    freeShipping: boolean;
    estimatedDelivery: string;
  };
}

export const products: Product[] = [
  {
    id: 1,
    name: 'Classic Cotton T-Shirt',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
    ],
    category: 'T-Shirts',
    description: 'Premium cotton t-shirt with a comfortable fit. Perfect for everyday wear with breathable fabric and durable construction.',
    colors: ['White', 'Black', 'Navy', 'Gray'],
    sizes: [
      { name: 'XS', inStock: true, measurements: { chest: '36"', length: '27"', sleeve: '8"' } },
      { name: 'S', inStock: true, measurements: { chest: '38"', length: '28"', sleeve: '8.5"' } },
      { name: 'M', inStock: true, measurements: { chest: '40"', length: '29"', sleeve: '9"' } },
      { name: 'L', inStock: true, measurements: { chest: '42"', length: '30"', sleeve: '9.5"' } },
      { name: 'XL', inStock: false, measurements: { chest: '44"', length: '31"', sleeve: '10"' } },
      { name: 'XXL', inStock: true, measurements: { chest: '46"', length: '32"', sleeve: '10.5"' } }
    ],
    details: {
      material: '100% Organic Cotton',
      care: [
        'Machine wash cold',
        'Tumble dry low',
        'Do not bleach',
        'Iron on low heat if needed'
      ],
      features: [
        'Pre-shrunk fabric',
        'Ribbed crew neck',
        'Double-stitched hem',
        'Breathable material'
      ]
    },
    shipping: {
      freeShipping: true,
      estimatedDelivery: '3-5 business days'
    }
  },
  // Add more products with similar detailed structure...
];

export const getProductById = (id: number) => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string) => {
  if (category === 'all') return products;
  return products.filter(product => 
    product.category.toLowerCase() === category.toLowerCase()
  );
};

export const searchProducts = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.category.toLowerCase().includes(lowercaseQuery)
  );
};