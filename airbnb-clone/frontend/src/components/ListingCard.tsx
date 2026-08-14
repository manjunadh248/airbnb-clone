'use client';
import React, { useState } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export interface ListingCardProps {
  id: string;
  title: string;
  distance: string;
  dates: string;
  price: number;
  rating: number;
  imageUrls: string[];
}

export default function ListingCard({
  id,
  title,
  distance, // Not used in this specific layout, but keeping for compatibility
  dates,
  price,
  rating,
  imageUrls
}: ListingCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to link
    setCurrentImageIndex((prev) => (prev === imageUrls.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to link
    setCurrentImageIndex((prev) => (prev === 0 ? imageUrls.length - 1 : prev - 1));
  };

  const [isSaved, setIsSaved] = useState(false);
  const isGuestFavourite = rating >= 4.9;
  const twoNightsPrice = price * 2;

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      if (isSaved) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}`}/api/wishlist/${id}?user_id=1`, { method: 'DELETE' });
        setIsSaved(false);
      } else {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}`}/api/wishlist/${id}?user_id=1`, { method: 'POST' });
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error toggling wishlist', err);
    }
  };

  return (
    <Link href={`/listings/${id}`} className="flex flex-col gap-3 group cursor-pointer w-full">
      <div className="relative aspect-[20/19] overflow-hidden rounded-xl w-full">
        {/* Carousel Images */}
        <div 
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
        >
          {imageUrls.map((url, idx) => (
            <img 
              key={idx}
              src={url} 
              alt={`${title} - image ${idx + 1}`} 
              className="object-cover w-full h-full flex-shrink-0"
            />
          ))}
        </div>
        
        {/* Guest favourite Badge */}
        {isGuestFavourite && (
          <div className="absolute top-3 left-3 bg-white px-3 py-1 rounded-full text-[14px] font-semibold text-[#222222] shadow-sm z-10 pointer-events-none">
            Guest favourite
          </div>
        )}

        {/* Heart Icon */}
        <button className="absolute top-3 right-3 p-1 rounded-full hover:scale-105 transition-transform z-10"
                onClick={toggleWishlist}>
          <Heart 
            className={`w-[28px] h-[28px] drop-shadow-md ${isSaved ? 'fill-brand stroke-brand' : 'text-black/50 fill-black/20 stroke-white'}`} 
            strokeWidth={1.5} 
          />
        </button>
        
        {/* Carousel Arrows - Only visible on group hover */}
        {imageUrls.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 border border-black/10 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 z-10 shadow-md"
            >
              <ChevronLeft className="w-4 h-4 text-[#222222]" strokeWidth={2.5} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 border border-black/10 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:scale-105 z-10 shadow-md"
            >
              <ChevronRight className="w-4 h-4 text-[#222222]" strokeWidth={2.5} />
            </button>
          </>
        )}
        
        {/* Carousel Dots */}
        {imageUrls.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-[5px] z-10">
            {imageUrls.map((_, idx) => (
              <div 
                key={idx} 
                className={`rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-[6px] h-[6px] bg-white' : 'w-[5px] h-[5px] bg-white/60'}`} 
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="flex flex-col text-[#222222]">
        <div className="flex justify-between items-start">
          <span className="font-semibold text-[15px] truncate text-[#222222]">{title}</span>
          <div className="flex items-center gap-1 text-[15px] shrink-0 pl-2">
            <Star className="w-[13px] h-[13px] fill-current" />
            <span className="font-light">{rating > 0 ? rating.toFixed(2) : 'New'}</span>
          </div>
        </div>
        <span className="text-[#717171] text-[15px] leading-snug mt-0.5">{distance || 'Professional Host'}</span>
        <span className="text-[#717171] text-[15px] leading-snug">{dates}</span>
        
        <div className="flex items-center mt-1.5 text-[15px]">
          <span className="font-semibold">₹{price.toLocaleString('en-IN')}</span>
          <span className="text-[#222222] ml-1">night</span>
        </div>
      </div>
    </Link>
  );
}
