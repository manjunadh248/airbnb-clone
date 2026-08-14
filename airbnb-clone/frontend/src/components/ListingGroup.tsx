'use client';
import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import ListingCard from './ListingCard';

export interface ListingGroupProps {
  title: string;
  listings: any[];
}

export default function ListingGroup({ title, listings }: ListingGroupProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  if (!listings || listings.length === 0) return null;

  return (
    <div className="py-8 border-t border-gray-200 mt-8 first:mt-0 first:border-0">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 group cursor-pointer">
          <h2 className="text-[22px] font-semibold text-gray-900 group-hover:underline">{title}</h2>
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 text-black" />
          </div>
        </div>
        <div className="flex items-center gap-2 hidden sm:flex">
          <button 
            onClick={scrollLeft}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>
          <button 
            onClick={scrollRight}
            className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar snap-x snap-mandatory"
      >
        {listings.map(listing => {
          const sortedImages = listing.images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
          const imageUrls = sortedImages.length > 0 
            ? sortedImages.map((img: any) => img.image_url)
            : ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

          return (
            <div key={listing.id} className="snap-start shrink-0 w-[280px] md:w-[310px]">
              <ListingCard 
                id={String(listing.id)}
                title={listing.title} // Let's use title here to match "Room in Bengaluru" etc.
                distance=""
                dates="Oct 16 - 21" // Ignored by layout now
                price={listing.price_per_night}
                rating={listing.average_rating || (listing.reviews_count > 0 ? 5.0 : 0)}
                imageUrls={imageUrls}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
