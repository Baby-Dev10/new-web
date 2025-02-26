'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import Autoplay from 'embla-carousel-autoplay';
import { Banner } from '@/types/models';
import Image from 'next/image';
import useSWR from 'swr';



export default function HeroCarousel() {


  const [api, setApi] = React.useState<any>();
  const [current, setCurrent] = React.useState(0);
  const [banners, setBanners] = React.useState<Banner[]>([])

  const autoplay = React.useRef(
    Autoplay({
      delay: 5000,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  );

  const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  };

  const { data, error } = useSWR('/api/public/banners', fetcher);

  React.useEffect(() => {
    if (data?.banners) {
      setBanners(data.banners);
    }
    if (error) {
      console.error("Failed to fetch banners:", error);
    }
  }, [data, error]);

  React.useEffect(() => {
    if (!api) return;

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      plugins={[autoplay.current as any]}
      className="relative h-[600px]"
      opts={{
        align: 'start',
        loop: true,
      }}
    >
      <CarouselContent>
      
        {
          banners?.map((banner) => (
            <CarouselItem key={banner._id}>
              <div className="relative h-[600px] transition-transform duration-500">
              <Image
                src={banner.imageUrl}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50" />
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                <div className="text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  {banner.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8">
                  {banner.description}
                </p>
                <Button
                  asChild
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  <Link href="/collection">Shop Now</Link>
                </Button>
                </div>
              </div>
              </div>
            </CarouselItem>
          ))
        }
      </CarouselContent>
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
        {banners.map((banner,index) => (
          <button
            key={banner._id}
            className={`w-2 h-2 rounded-full transition-all ${
              current === index ? 'bg-white w-4' : 'bg-white/50'
            }`}
            onClick={() => api?.scrollTo(index)}
          />
        ))}
      </div>
      <CarouselPrevious className="absolute left-4 top-1/2" />
      <CarouselNext className="absolute right-4 top-1/2" />
    </Carousel>
  );
}