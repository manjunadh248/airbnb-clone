import Navbar from "../components/Navbar";
import CategoryFilterBar from "../components/CategoryFilterBar";
import FloatingMapButton from "../components/FloatingMapButton";
import MobileNav from "../components/MobileNav";
import ListingGroup from "../components/ListingGroup";
import ListingGrid from "../components/ListingGrid";
import Footer from "../components/Footer";

async function getListings(searchParams?: { [key: string]: string | string[] | undefined }) {
  const params = new URLSearchParams();
  if (searchParams?.category) {
    params.set('category', searchParams.category as string);
  }
  if (searchParams?.location) {
    params.set('location', searchParams.location as string);
  }
  if (searchParams?.guests_count) {
    params.set('guests_count', searchParams.guests_count as string);
  }
  
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}`}/api/listings?${params.toString()}`, { cache: 'no-store' });
  if (!res.ok) {
    return [];
  }
  return res.json();
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedParams = searchParams ? await searchParams : {};
  const listings = await getListings(resolvedParams);

  // Group listings by city for the new layout
  const groups: Record<string, any[]> = {};
  listings.forEach((listing: any) => {
    const city = listing.location_city || 'Destinations';
    if (!groups[city]) groups[city] = [];
    groups[city].push(listing);
  });

  const currentSection = resolvedParams.section || 'all';
  const isSearching = !!resolvedParams.location;

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      {(currentSection === 'all' || currentSection === 'homes') && <CategoryFilterBar />}
      <main className="flex-grow w-full pb-12 mt-4">
        {currentSection === 'homes' && !isSearching ? (
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20">
            {Object.entries(groups).length > 0 ? (
              Object.entries(groups).map(([city, cityListings], idx) => {
                const title = idx % 2 === 0 
                  ? `Popular homes in ${city}` 
                  : `Available next month in ${city}`;
                return <ListingGroup key={city} title={title} listings={cityListings} />;
              })
            ) : (
              <div className="text-center py-20 text-gray-500">No listings found.</div>
            )}
          </div>
        ) : (currentSection === 'all' || currentSection === 'homes' || isSearching) ? (
          <ListingGrid listings={listings} />
        ) : currentSection === 'services' ? (
          <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20 mt-10">
            <h2 className="text-[32px] font-semibold mb-6 text-gray-900">Services in Gurgaon District</h2>
            <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar relative">
              {listings.length > 0 ? (
                listings.slice(0, 6).map((listing: any, idx: number) => (
                  <div key={listing.id} className="min-w-[280px] w-[280px] group cursor-pointer">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3">
                      <img src={listing.images[0]?.image_url || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {idx === 0 && <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-bold shadow-md">Popular</div>}
                      <button className="absolute top-3 right-3 p-1 rounded-full text-white hover:scale-110 transition-transform">
                        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', fill: 'rgba(0, 0, 0, 0.5)', height: '24px', width: '24px', stroke: 'white', strokeWidth: 2, overflow: 'visible' }}><path d="m16 28c7-4.733 14-10 14-17 0-1.792-.683-3.583-2.05-4.95-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05l-2.051 2.051-2.05-2.051c-1.367-1.366-3.158-2.05-4.95-2.05-1.791 0-3.583.684-4.949 2.05-1.367 1.367-2.051 3.158-2.051 4.95 0 7 7 12.267 14 17z"></path></svg>
                      </button>
                    </div>
                    <h3 className="font-semibold text-[15px] truncate text-gray-900">{listing.title}</h3>
                    <div className="text-gray-500 text-sm mt-0.5">From ₹{listing.price_per_night} / guest · ★ {listing.average_rating ? listing.average_rating.toFixed(2) : '5.0'}</div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 py-10">No services found in this area.</div>
              )}
            </div>
            
            <div className="border-t border-gray-200 my-12"></div>
            
            <h2 className="text-[22px] font-semibold mb-6">Inspiration for future getaways</h2>
            <div className="flex gap-4 border-b border-gray-200 mb-6 overflow-x-auto hide-scrollbar">
              <button className="px-4 py-3 border-b-2 border-black font-semibold text-sm whitespace-nowrap text-gray-900">Destinations for arts & culture</button>
              <button className="px-4 py-3 text-gray-500 font-medium hover:text-black hover:bg-gray-50 rounded-t-lg transition-colors text-sm whitespace-nowrap">Destinations for outdoor adventure</button>
              <button className="px-4 py-3 text-gray-500 font-medium hover:text-black hover:bg-gray-50 rounded-t-lg transition-colors text-sm whitespace-nowrap">Mountain cabins</button>
              <button className="px-4 py-3 text-gray-500 font-medium hover:text-black hover:bg-gray-50 rounded-t-lg transition-colors text-sm whitespace-nowrap">Beach destinations</button>
              <button className="px-4 py-3 text-gray-500 font-medium hover:text-black hover:bg-gray-50 rounded-t-lg transition-colors text-sm whitespace-nowrap">Popular destinations</button>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">Coming soon</div>
        )}
      </main>
      
      {(currentSection === 'all' || currentSection === 'homes') && <FloatingMapButton />}
      
      <Footer />
      <MobileNav />
    </div>
  );
}
