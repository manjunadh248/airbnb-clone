'use client';

import React from 'react';
import { Plane, ClipboardList, KeyRound, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function CoHostPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col relative pb-24">
      {/* Header */}
      <header className="px-6 py-4 w-full border-b border-gray-100 flex items-center">
        <Link href="/">
          <div className="flex items-center gap-1 cursor-pointer text-brand">
            <Plane className="w-8 h-8 fill-brand" strokeWidth={1.5} />
          </div>
        </Link>
      </header>

      {/* Main Content */}
      <main className="max-w-[700px] w-full mx-auto px-6 pt-12 flex-grow">
        <h1 className="text-[40px] leading-[1.1] font-bold text-gray-900 mb-2 tracking-tight">
          Find someone to help you host
        </h1>
        <p className="text-[17px] text-gray-500 mb-12">
          Get help managing your home and guests from a co-host – a top-rated Airbnb host.
        </p>

        <div className="flex flex-col gap-8">
          {/* Benefit 1 */}
          <div className="flex gap-4 items-start">
            <div className="mt-1 text-3xl">📋</div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900">Choose the help you need</h3>
              <p className="text-gray-500 text-[15px] leading-snug">Let a co-host handle everything, or choose from a list of services.</p>
            </div>
          </div>

          {/* Benefit 2 */}
          <div className="flex gap-4 items-start">
            <div className="mt-1 text-3xl">🗝️</div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900">Get on-site support</h3>
              <p className="text-gray-500 text-[15px] leading-snug">Co-hosts can be at your home to help when you need it.</p>
            </div>
          </div>

          {/* Benefit 3 */}
          <div className="flex gap-4 items-start">
            <div className="mt-1 text-3xl">🖼️</div>
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900">Make the most of your home</h3>
              <p className="text-gray-500 text-[15px] leading-snug">Get help styling your space, taking photos and writing a catchy description.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 flex justify-center z-50">
        <button className="w-full max-w-[500px] bg-[#E51D53] hover:bg-[#D70466] text-white font-semibold py-3.5 rounded-lg transition-colors">
          Log in to continue
        </button>
      </div>
    </div>
  );
}
