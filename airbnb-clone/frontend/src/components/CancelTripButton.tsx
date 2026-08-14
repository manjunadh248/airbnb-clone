'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function CancelTripButton({ bookingId }: { bookingId: number }) {
  const router = useRouter();

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}`}/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert("Trip cancelled successfully.");
        router.refresh();
      } else {
        alert("Failed to cancel trip.");
      }
    } catch (err) {
      alert("Error cancelling trip.");
    }
  };

  return (
    <button onClick={handleCancel} className="text-sm font-semibold text-red-600 hover:underline">
      Cancel Trip
    </button>
  );
}
