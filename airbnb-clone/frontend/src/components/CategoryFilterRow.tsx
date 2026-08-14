'use client';

import React from 'react';
import { 
  Palmtree, 
  Waves, 
  Flame, 
  Castle, 
  Coffee, 
  MountainSnow, 
  Tent, 
  Home,
  Umbrella,
  Warehouse,
  Wind
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const categories = [
  { name: 'Amazing pools', icon: Waves },
  { name: 'Beachfront', icon: Umbrella },
  { name: 'Trending', icon: Flame },
  { name: 'Tropical', icon: Palmtree },
  { name: 'Castles', icon: Castle },
  { name: 'Bed & breakfasts', icon: Coffee },
  { name: 'Skiing', icon: MountainSnow },
  { name: 'Camping', icon: Tent },
  { name: 'Tiny homes', icon: Home },
  { name: 'Barns', icon: Warehouse },
  { name: 'Windmills', icon: Wind },
];

function CategoryFilterRowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category') || 'Amazing pools';

  const handleCategoryClick = (name: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', name);
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
      <div className="flex space-x-8 overflow-x-auto no-scrollbar py-4 border-b border-airbnb-border">
        {categories.map((category) => {
          const Icon = category.icon;
          const isActive = currentCategory === category.name;
          return (
            <div 
              key={category.name} 
              onClick={() => handleCategoryClick(category.name)}
              className={`flex flex-col items-center gap-2 cursor-pointer min-w-max pb-3 border-b-2 transition-all ${
                isActive 
                  ? 'border-airbnb-text text-airbnb-text' 
                  : 'border-transparent text-gray-500 hover:text-airbnb-text hover:border-gray-300'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={1.5} />
              <span className="text-xs font-semibold">{category.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CategoryFilterRow() {
  return (
    <React.Suspense fallback={<div className="h-[80px]"></div>}>
      <CategoryFilterRowInner />
    </React.Suspense>
  );
}
