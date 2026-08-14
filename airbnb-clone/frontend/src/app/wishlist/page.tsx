import React from 'react';
import Navbar from '../../components/Navbar';
import ListingGrid from '../../components/ListingGrid';

async function getWishlist() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/api/wishlist?user_id=1`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function WishlistPage() {
  const wishlistItems = await getWishlist();
  const listings = wishlistItems.map((item: any) => item.listing);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        <h1 className="text-3xl font-bold text-airbnb-text mb-8">Wishlists</h1>
        
        {listings.length === 0 ? (
          <div>
            <h2 className="text-xl font-semibold mb-2">Create your first wishlist</h2>
            <p className="text-gray-600 mb-6">As you search, click the heart icon to save your favorite places and Experiences to a wishlist.</p>
          </div>
        ) : (
          <ListingGrid listings={listings} />
        )}
      </main>
    </div>
  );
}
