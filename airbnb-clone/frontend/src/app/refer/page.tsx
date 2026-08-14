'use client';

import React from 'react';
import { Plane, Link as LinkIcon, QrCode } from 'lucide-react';
import Link from 'next/link';

export default function ReferHostPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-6 py-4 flex justify-between items-center w-full max-w-[1200px] mx-auto">
        <Link href="/">
          <div className="flex items-center gap-1 cursor-pointer text-brand z-50">
            <Plane className="w-8 h-8 fill-brand" strokeWidth={1.5} />
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
            <QrCode className="w-4 h-4" />
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-semibold transition-colors">
            <LinkIcon className="w-4 h-4" />
            Customise link
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1000px] mx-auto px-6 pt-20 pb-32">
        <h1 className="text-5xl font-bold text-center mb-16 tracking-tight text-gray-900">
          Refer a host, earn cash
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Home Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Home</h3>
              <p className="text-gray-500 text-sm">You'll earn ₹1,908 INR – ₹3,339 INR</p>
            </div>
            <div className="text-4xl ml-4">🏠</div>
          </div>

          {/* Experience Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Experience</h3>
              <p className="text-gray-500 text-sm">You'll earn ₹4,771 INR</p>
            </div>
            <div className="text-4xl ml-4">🎈</div>
          </div>

          {/* Service Card */}
          <div className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer flex justify-between items-center">
            <div className="flex flex-col">
              <h3 className="font-semibold text-lg text-gray-900 mb-1">Service</h3>
              <p className="text-gray-500 text-sm">You'll earn ₹9,541 INR</p>
            </div>
            <div className="text-4xl ml-4">🛎️</div>
          </div>
        </div>

        <div className="flex justify-center flex-col items-center max-w-[400px] mx-auto">
          <button className="w-full bg-gray-100 text-gray-400 font-semibold py-4 rounded-xl cursor-not-allowed">
            Share referral link
          </button>
        </div>
      </main>
    </div>
  );
}
