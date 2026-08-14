'use client';
import React, { useState } from 'react';
import { Search, Heart, User } from 'lucide-react';
import Link from 'next/link';

export default function MobileNav() {
  const [activeTab, setActiveTab] = useState('explore');

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 pb-safe">
      <div className="flex justify-center items-center h-16">
        <Link 
          href="/"
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === 'explore' ? 'text-[#e61e4d]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Search className="w-6 h-6" strokeWidth={activeTab === 'explore' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Explore</span>
        </Link>
        
        <Link 
          href="#"
          onClick={() => setActiveTab('wishlists')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === 'wishlists' ? 'text-[#e61e4d]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <Heart className="w-6 h-6" strokeWidth={activeTab === 'wishlists' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Wishlists</span>
        </Link>
        
        <Link 
          href="#"
          onClick={() => setActiveTab('login')}
          className={`flex flex-col items-center justify-center w-full h-full gap-1 ${activeTab === 'login' ? 'text-[#e61e4d]' : 'text-gray-500 hover:text-gray-900'}`}
        >
          <User className="w-6 h-6" strokeWidth={activeTab === 'login' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Log in</span>
        </Link>
      </div>
    </div>
  );
}
