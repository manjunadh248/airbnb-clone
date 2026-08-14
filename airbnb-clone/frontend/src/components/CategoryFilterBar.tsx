'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

const categories = [
  { name: 'Icons', icon: '🌟' },
  { name: 'Amazing pools', icon: '🏊' },
  { name: 'Farms', icon: '🚜' },
  { name: 'Tiny homes', icon: '🏡' },
  { name: 'Cabins', icon: '🪵' },
  { name: 'Castles', icon: '🏰' },
  { name: 'Beachfront', icon: '🏖️' },
  { name: 'Amazing views', icon: '🏔️' },
  { name: 'Lakefront', icon: '⛵' },
  { name: 'OMG!', icon: '🛸' },
  { name: 'Golfing', icon: '⛳' },
  { name: 'Design', icon: '📐' },
  { name: 'Rooms', icon: '🚪' },
  { name: 'Surfing', icon: '🏄' },
  { name: 'Skiing', icon: '🎿' },
  { name: 'Mansions', icon: '🏛️' },
];

export default function CategoryFilterBar() {
  const [activeCategory, setActiveCategory] = useState('Icons');
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);
  const [isTotalPriceToggle, setIsTotalPriceToggle] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  const scrollBy = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20 pt-6 pb-4 bg-white sticky top-[80px] z-40 border-b border-transparent shadow-[0_1px_0_0_#ebebeb]">
      <div className="flex items-center gap-6">
        
        {/* Scrollable Categories Container */}
        <div className="relative flex-1 overflow-hidden">
          
          {/* Left Gradient & Button */}
          <div className={`absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 flex items-center pointer-events-none transition-opacity duration-200 ${showLeftScroll ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={() => scrollBy(-300)}
              className="ml-2 w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:shadow-md transition-shadow pointer-events-auto"
            >
              <ChevronLeft className="w-4 h-4 text-black" strokeWidth={2.5} />
            </button>
          </div>

          {/* Scrolling List */}
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex items-center gap-8 overflow-x-auto scrollbar-hide scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => (
              <div 
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex flex-col items-center gap-2 cursor-pointer min-w-max pb-2 border-b-2 transition-all duration-200 ${
                  activeCategory === cat.name 
                    ? 'border-black text-black opacity-100' 
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-black opacity-70 hover:opacity-100'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className={`text-[13px] font-semibold ${activeCategory === cat.name ? 'text-black' : ''}`}>{cat.name}</span>
              </div>
            ))}
          </div>

          {/* Right Gradient & Button */}
          <div className={`absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white to-transparent z-10 flex items-center justify-end pointer-events-none transition-opacity duration-200 ${showRightScroll ? 'opacity-100' : 'opacity-0'}`}>
            <button 
              onClick={() => scrollBy(300)}
              className="mr-2 w-7 h-7 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:shadow-md transition-shadow pointer-events-auto"
            >
              <ChevronRight className="w-4 h-4 text-black" strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          <button className="flex items-center gap-2 border border-gray-300 rounded-xl px-4 py-3 hover:border-black hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-[14px] h-[14px] text-black" />
            <span className="text-sm font-semibold text-black">Filters</span>
          </button>
          
          <div 
            onClick={() => setIsTotalPriceToggle(!isTotalPriceToggle)}
            className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm font-semibold text-black">Display total price</span>
            <div className={`w-12 h-8 rounded-full p-1 transition-colors flex items-center ${isTotalPriceToggle ? 'bg-black' : 'bg-gray-400'}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 flex items-center justify-center ${isTotalPriceToggle ? 'translate-x-4' : 'translate-x-0'}`}>
                {isTotalPriceToggle && (
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'none', height: '12px', width: '12px', stroke: 'black', strokeWidth: '5.33333', overflow: 'visible' }}><path fill="none" d="m4 16.5 8 8 16-16"></path></svg>
                )}
              </div>
            </div>
            <div className="border-l border-gray-300 pl-3 hidden lg:block">
              <span className="text-[13px] text-gray-500">Includes all fees, before taxes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
