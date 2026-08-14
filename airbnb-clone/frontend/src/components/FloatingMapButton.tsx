'use client';
import React, { useState, useEffect } from 'react';
import { Map } from 'lucide-react';

export default function FloatingMapButton() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show when scrolling up or at the very top
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } 
      // Hide when scrolling down past the threshold
      else if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div 
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-40 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
    >
      <button className="bg-[#222222] hover:scale-105 hover:bg-black transition-all duration-200 text-white font-semibold text-[15px] px-5 py-3.5 rounded-full flex items-center gap-2 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
        <span>Show map</span>
        <Map className="w-[18px] h-[18px]" strokeWidth={2} />
      </button>
    </div>
  );
}
