import React from 'react';
import Navbar from '../../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import CancelTripButton from '../../components/CancelTripButton';

async function getMyTrips() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/api/bookings/me?user_id=1`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function TripsPage() {
  const trips = await getMyTrips();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        <h1 className="text-3xl font-bold text-airbnb-text mb-8">Trips</h1>

        {trips.length === 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">No trips booked... yet!</h2>
            <p className="text-gray-600 mb-6">Time to dust off your bags and start planning your next adventure.</p>
            <Link href="/">
              <button className="border border-airbnb-text text-airbnb-text font-semibold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Start searching
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip: any) => (
              <div key={trip.id} className="border border-airbnb-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-48 w-full">
                  <Image 
                    src={trip?.listing?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'} 
                    alt="Listing image" 
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{trip?.listing?.location_city || 'Unknown'}</h3>
                  <div className="text-gray-600 text-sm mt-1">Hosted by {trip?.listing?.host?.name || 'Unknown'}</div>
                  <div className="text-gray-600 text-sm mt-1">
                    {new Date(trip.check_in).toLocaleDateString()} - {new Date(trip.check_out).toLocaleDateString()}
                  </div>
                  <div className="mt-3 pt-3 border-t border-airbnb-border flex justify-between items-center">
                    <span className="font-semibold">₹{trip.total_price}</span>
                    <div className="flex items-center gap-3">
                      {trip.status === 'confirmed' && <CancelTripButton bookingId={trip.id} />}
                      <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{trip.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
