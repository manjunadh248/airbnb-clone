import React from 'react';
import ListingCard from './ListingCard';

export default function ListingGrid({ listings }: { listings: any[] }) {
  if (!listings || listings.length === 0) {
    return <div className="text-center py-10">No listings found.</div>;
  }
  return (
    <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-10">
        {listings.map(listing => {
          // Sort images by sort_order
          const sortedImages = listing.images?.sort((a: any, b: any) => a.sort_order - b.sort_order) || [];
          const imageUrls = sortedImages.length > 0 
            ? sortedImages.map((img: any) => img.image_url)
            : ['https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'];

          return (
            <ListingCard 
              key={listing.id} 
              id={String(listing.id)}
              title={`${listing.location_city || 'Location'}, ${listing.location_country || 'Country'}`}
              distance={listing.title}
              dates="Oct 16 - 21"
              price={listing.price_per_night}
              rating={listing.average_rating || (listing.reviews_count > 0 ? 5.0 : 0)}
              imageUrls={imageUrls}
            />
          );
        })}
      </div>
    </div>
  );
}
