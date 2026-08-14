import React from 'react';
import Navbar from '../../../components/Navbar';
import Image from 'next/image';
import Link from 'next/link';

async function getHostBookings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/api/bookings/host?host_id=2`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

async function getHostListings() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/api/listings?host_id=2`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function HostDashboard() {
  const bookings = await getHostBookings();
  const listings = await getHostListings();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-airbnb-text">Host Dashboard</h1>
          <Link href="/host/listings/new">
            <button className="bg-airbnb-text text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors">
              Create new listing
            </button>
          </Link>
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">Your Properties</h2>
          {listings.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-airbnb-border text-center">
              <p className="text-gray-600 mb-4">You have no properties yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-airbnb-border overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-b border-airbnb-border">
                    <th className="p-4 font-semibold text-gray-700">Property</th>
                    <th className="p-4 font-semibold text-gray-700">Location</th>
                    <th className="p-4 font-semibold text-gray-700">Price/Night</th>
                    <th className="p-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing: any) => (
                    <tr key={listing.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-12 h-12 relative rounded-md overflow-hidden">
                          <Image 
                            src={listing.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'} 
                            alt="Listing" 
                            layout="fill"
                            objectFit="cover"
                          />
                        </div>
                        <span className="font-semibold text-sm">{listing.title}</span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">{listing.location_city}, {listing.location_country}</td>
                      <td className="p-4 text-sm font-semibold">₹{listing.price_per_night}</td>
                      <td className="p-4 text-sm font-semibold flex gap-3">
                        <Link href={`/host/listings/${listing.id}/edit`}>
                          <span className="text-blue-600 hover:underline cursor-pointer">Edit</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold mb-4">Recent Bookings on Your Properties</h2>
        {bookings.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-airbnb-border text-center">
            <p className="text-gray-600 mb-4">No bookings found for your properties.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-airbnb-border overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-airbnb-border">
                  <th className="p-4 font-semibold text-gray-700">Property</th>
                  <th className="p-4 font-semibold text-gray-700">Guest</th>
                  <th className="p-4 font-semibold text-gray-700">Dates</th>
                  <th className="p-4 font-semibold text-gray-700">Total Payout</th>
                  <th className="p-4 font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-12 h-12 relative rounded-md overflow-hidden">
                        <Image 
                          src={booking?.listing?.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'} 
                          alt="Listing" 
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <span className="font-semibold text-sm">{booking?.listing?.title || 'Unknown Listing'}</span>
                    </td>
                    <td className="p-4 text-sm text-gray-700">Guest #{booking.guest_id}</td>
                    <td className="p-4 text-sm text-gray-700">
                      {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-sm font-semibold">₹{booking.total_price}</td>
                    <td className="p-4">
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">{booking.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
