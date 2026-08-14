'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tag, Flag, ChevronDown } from 'lucide-react';
import { useBooking } from './BookingContext';

export default function BookingCard({ listing }: { listing: any }) {
  const router = useRouter();
  const { checkIn, setCheckIn, checkOut, setCheckOut, guests, setGuests } = useBooking();
  const [error, setError] = useState('');

  const handleReserveClick = () => {
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates.');
      return;
    }
    setError('');
    
    // Redirect to the dedicated checkout flow page
    const params = new URLSearchParams({
      checkin: checkIn,
      checkout: checkOut,
      guests: guests.toString()
    });
    router.push(`/book/${listing.id}?${params.toString()}`);
  };

  return (
    <div className="sticky top-28 flex flex-col gap-6">
      
      {/* Prices include all fees pill */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-center gap-2">
        <Tag className="w-5 h-5 text-brand fill-brand" />
        <span className="font-semibold text-gray-800 text-sm">Prices include all fees</span>
      </div>

      {/* Main Booking Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
        <div className="flex items-end gap-1 mb-6">
          <span className="text-2xl font-bold underline">₹{listing.price_per_night.toLocaleString('en-IN')}</span>
          <span className="text-gray-800 text-base">for 2 nights</span>
        </div>
        
        <div className="border border-gray-400 rounded-xl overflow-hidden mb-4 relative">
          <div className="flex border-b border-gray-400">
            <div className="w-1/2 p-3 border-r border-gray-400 relative cursor-pointer">
              <div className="text-[10px] font-bold text-gray-800 mb-1">CHECK-IN</div>
              <input 
                type="date" 
                className="text-sm outline-none w-full bg-transparent cursor-pointer text-gray-800" 
                value={checkIn}
                onChange={e => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="w-1/2 p-3 relative cursor-pointer">
              <div className="text-[10px] font-bold text-gray-800 mb-1">CHECKOUT</div>
              <input 
                type="date" 
                className="text-sm outline-none w-full bg-transparent cursor-pointer text-gray-800" 
                value={checkOut}
                onChange={e => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>
          <div className="p-3 relative cursor-pointer flex justify-between items-center group">
            <div className="w-full">
              <div className="text-[10px] font-bold text-gray-800 mb-1">GUESTS</div>
              <select 
                className="text-sm outline-none w-full bg-transparent appearance-none cursor-pointer text-gray-800"
                value={guests}
                onChange={e => setGuests(Number(e.target.value))}
              >
                {[...Array(listing.max_guests)].map((_, i) => (
                  <option key={i} value={i+1}>{i+1} guest{i > 0 ? 's' : ''}</option>
                ))}
              </select>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-800 shrink-0 pointer-events-none" />
          </div>
        </div>

        {error && <div className="text-brand text-sm mb-4 font-semibold">{error}</div>}

        <button 
          onClick={handleReserveClick}
          className="w-full bg-[#E31C5F] text-white font-semibold py-3.5 rounded-lg hover:bg-[#D70466] transition-colors"
        >
          Reserve
        </button>
        
        <div className="text-center text-sm text-gray-600 mt-4">
          You won't be charged yet
        </div>
      </div>

      {/* Report this listing */}
      <div className="flex items-center justify-center gap-2 cursor-pointer group mt-2">
        <Flag className="w-4 h-4 text-gray-600 group-hover:text-gray-900" />
        <span className="text-sm text-gray-600 group-hover:text-gray-900 underline">Report this listing</span>
      </div>

    </div>
  );
}
