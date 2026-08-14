import React from 'react';
import Navbar from '../../../components/Navbar';
import BookingCard from '../../../components/BookingCard';
import Image from 'next/image';
import { DoorOpen, MapPin, MessageSquare, Utensils, Wifi, PawPrint, MonitorPlay, Wind, Refrigerator, ChevronRight, Keyboard } from 'lucide-react';
import Link from 'next/link';
import { BookingProvider } from '../../../components/BookingContext';
import ListingCalendar from '../../../components/ListingCalendar';

async function getListing(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}`}/api/listings/${id}`, { cache: 'no-store' });
  if (!res.ok) {
    return null;
  }
  return res.json();
}

export default async function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const listing = await getListing(resolvedParams.id);

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <h1 className="text-2xl font-bold">Listing not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-grow relative text-[#222222]">
        
        {/* Photo Gallery (Unchanged but stylized) */}
        <h1 className="text-[26px] font-semibold mb-2">{listing.title}</h1>
        <div className="flex items-center gap-1 text-sm mb-6 font-semibold underline">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '14px', width: '14px', fill: 'currentcolor' }}><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" fillRule="evenodd"></path></svg>
            {listing.average_rating ? listing.average_rating.toFixed(2) : 'New'}
          </span>
          <span className="mx-1 font-normal text-gray-500">·</span>
          <span>{listing.reviews_count || 0} reviews</span>
          <span className="mx-1 font-normal text-gray-500">·</span>
          <span>{listing.location_city}, {listing.location_country}</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 h-auto md:h-[400px] mb-8 overflow-hidden rounded-2xl relative">
          <div className="md:col-span-2 lg:col-span-2 row-span-2 relative h-64 md:h-full">
            <Image 
              src={listing.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be'} 
              alt="Main listing photo" 
              layout="fill"
              objectFit="cover"
              className="hover:brightness-95 transition-all cursor-pointer"
            />
          </div>
          {listing.images?.slice(1, 5).map((img: any, idx: number) => (
            <div key={idx} className="relative hidden md:block h-32 md:h-[196px]">
              <Image 
                src={img.image_url} 
                alt={`Photo ${idx + 2}`} 
                layout="fill"
                objectFit="cover"
                className="hover:brightness-95 transition-all cursor-pointer"
              />
            </div>
          ))}
          <button className="absolute bottom-4 right-4 bg-white text-[#222222] px-4 py-1.5 rounded-lg text-sm font-semibold border border-black shadow hover:bg-gray-50 transition-colors flex items-center gap-2">
            <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '16px', width: '16px', fill: 'currentcolor' }}><path d="M14 2v12H2V2h12zm2-2H0v16h16V0zM4 6h2v2H4V6zm0 4h2v2H4v-2zm4-4h2v2H8V6zm0 4h2v2H8v-2z"></path></svg>
            Show all photos
          </button>
        </div>

        {/* Local Sticky Nav */}
        <div className="sticky top-[80px] bg-white/95 backdrop-blur z-40 border-b border-gray-200 hidden md:flex items-center gap-6 py-4 mb-8">
          <span className="font-semibold text-sm text-gray-800 cursor-pointer hover:underline">Photos</span>
          <span className="font-semibold text-sm text-gray-800 cursor-pointer hover:underline">Amenities</span>
          <span className="font-semibold text-sm text-gray-800 cursor-pointer hover:underline">Reviews</span>
          <span className="font-semibold text-sm text-gray-800 cursor-pointer hover:underline">Location</span>
        </div>

        <BookingProvider>
          <div className="flex flex-col md:flex-row gap-20">
          
          {/* Main Info */}
          <div className="flex-grow md:w-[58%]">
            
            {/* Header Block */}
            <div className="pb-6 border-b border-gray-200">
              <h2 className="text-[22px] font-semibold text-[#222222] mb-1">
                Entire rental unit in {listing.location_city}, {listing.location_country}
              </h2>
              <div className="text-base text-[#222222]">
                {listing.max_guests} guests · {listing.bedrooms} bedrooms · {listing.beds} beds · {listing.baths} bathrooms
              </div>
              <div className="text-base font-semibold flex items-center gap-1 mt-1">
                ★ {listing.average_rating ? listing.average_rating.toFixed(2) : 'New'} <span className="mx-1 font-normal text-gray-500">·</span> <span className="underline cursor-pointer">{listing.reviews_count || 0} reviews</span>
              </div>
            </div>

            {/* Host Block */}
            <div className="py-6 border-b border-gray-200 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img src={listing.host?.avatar_url || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80"} alt="Host" className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-base">Hosted by {listing.host?.name || "Siddharth"}</h3>
                <p className="text-sm text-gray-500">New Host</p>
              </div>
            </div>

            {/* Features Block */}
            <div className="py-6 border-b border-gray-200 flex flex-col gap-6">
              <div className="flex gap-4 items-start">
                <DoorOpen className="w-6 h-6 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h4 className="font-semibold text-base">Self check-in</h4>
                  <p className="text-gray-500 text-sm">Check yourself in with the lockbox.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <MapPin className="w-6 h-6 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h4 className="font-semibold text-base">Unbeatable location</h4>
                  <p className="text-gray-500 text-sm">100% of guests in the past year gave this location a 5-star rating.</p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <MessageSquare className="w-6 h-6 mt-1 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <h4 className="font-semibold text-base">Exceptional host communication</h4>
                  <p className="text-gray-500 text-sm">Recent guests gave Siddharth a 5-star rating for communication.</p>
                </div>
              </div>
            </div>

            {/* Description Block */}
            <div className="py-8 border-b border-gray-200">
              <p className="text-base text-[#222222] leading-relaxed">
                ApnaCasa presents a cozy 2BHK BnB designed for your comfortable stay. Enjoy well-appointed rooms with all the essential amenities and equipment you need to feel right at home. Whether you're traveling for business or leisure, we've got everything covered for a relaxing and hassle-free experience.
              </p>
            </div>

            {/* Where you'll sleep */}
            <div className="py-12 border-b border-gray-200">
              <h3 className="text-[22px] font-semibold mb-6">Where you'll sleep</h3>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar">
                <div className="min-w-[280px]">
                  <div className="w-full h-[200px] relative rounded-xl overflow-hidden mb-4">
                    <Image src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80" layout="fill" objectFit="cover" alt="Bedroom 1" />
                  </div>
                  <h4 className="font-semibold text-base">Bedroom 1</h4>
                  <p className="text-sm text-gray-500">1 queen bed</p>
                </div>
                <div className="min-w-[280px]">
                  <div className="w-full h-[200px] relative rounded-xl overflow-hidden mb-4">
                    <Image src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80" layout="fill" objectFit="cover" alt="Bedroom 2" />
                  </div>
                  <h4 className="font-semibold text-base">Bedroom 2</h4>
                  <p className="text-sm text-gray-500">1 queen bed</p>
                </div>
              </div>
            </div>

            {/* What this place offers */}
            <div className="py-12 border-b border-gray-200">
              <h3 className="text-[22px] font-semibold mb-6">What this place offers</h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <div className="flex items-center gap-4"><Utensils className="w-6 h-6 shrink-0" strokeWidth={1.5} /><span className="text-base">Kitchen</span></div>
                <div className="flex items-center gap-4"><Wifi className="w-6 h-6 shrink-0" strokeWidth={1.5} /><span className="text-base">Wifi</span></div>
                <div className="flex items-center gap-4"><PawPrint className="w-6 h-6 shrink-0" strokeWidth={1.5} /><span className="text-base">Pets allowed</span></div>
                <div className="flex items-center gap-4"><MonitorPlay className="w-6 h-6 shrink-0" strokeWidth={1.5} /><span className="text-base">55-inch TV</span></div>
                <div className="flex items-center gap-4"><Wind className="w-6 h-6 shrink-0" strokeWidth={1.5} /><span className="text-base">Air conditioning</span></div>
                <div className="flex items-center gap-4"><Refrigerator className="w-6 h-6 shrink-0" strokeWidth={1.5} /><span className="text-base">Fridge</span></div>
              </div>
            </div>

            {/* Calendar */}
            <ListingCalendar listingId={listing.id} />

          </div>

          {/* Sticky Booking Card Sidebar */}
          <div className="w-full md:w-[32%] relative pb-12">
            <BookingCard listing={listing} />
          </div>
          </div>
        </BookingProvider>
        
        {/* Reviews Section */}
        <div className="py-12 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '24px', width: '24px', fill: 'currentcolor' }}><path d="M15.094 1.579l-4.124 8.885-9.86 1.27a1 1 0 0 0-.542 1.736l7.293 6.565-1.965 9.852a1 1 0 0 0 1.483 1.061L16 25.951l8.625 4.997a1 1 0 0 0 1.482-1.06l-1.965-9.853 7.293-6.565a1 1 0 0 0-.541-1.735l-9.86-1.271-4.127-8.885a1 1 0 0 0-1.814 0z" fillRule="evenodd"></path></svg>
            <h2 className="text-[26px] font-semibold">{listing.average_rating ? listing.average_rating.toFixed(2) : 'New'} · {listing.reviews_count || 0} reviews</h2>
          </div>
          <span className="text-sm font-semibold underline text-gray-600 cursor-pointer block mb-8">How reviews work</span>
          
          <div className="grid grid-cols-7 gap-4 mb-8">
            <div className="col-span-1 border-r border-gray-200">
              <div className="text-sm mb-2">Overall rating</div>
              <div className="flex items-center gap-2 text-xs text-[#222222]"><div className="w-2">5</div><div className="flex-1 bg-black h-1 rounded-full relative"><div className="absolute inset-0 bg-black rounded-full"></div></div></div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1"><div className="w-2">4</div><div className="flex-1 bg-gray-200 h-1 rounded-full"></div></div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1"><div className="w-2">3</div><div className="flex-1 bg-gray-200 h-1 rounded-full"></div></div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1"><div className="w-2">2</div><div className="flex-1 bg-gray-200 h-1 rounded-full"></div></div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1"><div className="w-2">1</div><div className="flex-1 bg-gray-200 h-1 rounded-full"></div></div>
            </div>
            
            <div className="col-span-1 border-r border-gray-200 px-2">
              <div className="text-sm mb-2 font-medium">Cleanliness</div>
              <div className="font-semibold text-lg mb-2">5.0</div>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}><path d="M11 26a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM22 6a4 4 0 0 0-4-4h-4a4 4 0 0 0-4 4v4H7a2 2 0 0 0-2 2v6h17V12a2 2 0 0 0-2-2h-3V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v14h-2v2h4V6zm-10 4v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4z"></path></svg>
            </div>
            
            <div className="col-span-1 border-r border-gray-200 px-2">
              <div className="text-sm mb-2 font-medium">Accuracy</div>
              <div className="font-semibold text-lg mb-2">5.0</div>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}><path d="M16 2a14 14 0 1 0 14 14A14.016 14.016 0 0 0 16 2zm6.293 10.293l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L13.586 18.17l7.293-7.293a1 1 0 0 1 1.414 1.414z"></path></svg>
            </div>
            
            <div className="col-span-1 border-r border-gray-200 px-2">
              <div className="text-sm mb-2 font-medium">Check-in</div>
              <div className="font-semibold text-lg mb-2">5.0</div>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}><path d="M18 2a8 8 0 0 0-8 8v2H8a2 2 0 0 0-2 2v16h18V14a2 2 0 0 0-2-2h-2v-2a8 8 0 0 0-8-8zm-6 10v-2a6 6 0 1 1 12 0v2zm8 8.73V24h-4v-3.27a4 4 0 1 1 4 0z"></path></svg>
            </div>

            <div className="col-span-1 border-r border-gray-200 px-2">
              <div className="text-sm mb-2 font-medium">Communication</div>
              <div className="font-semibold text-lg mb-2">5.0</div>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}><path d="M26 2H6a4 4 0 0 0-4 4v16a4 4 0 0 0 4 4h5.33l4.9 6.53a1 1 0 0 0 1.6 0l4.9-6.53H26a4 4 0 0 0 4-4V6a4 4 0 0 0-4-4zm2 20a2 2 0 0 1-2 2h-3.67a1 1 0 0 0-.8.4L16 31.87l-5.53-7.47a1 1 0 0 0-.8-.4H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h20a2 2 0 0 1 2 2z"></path></svg>
            </div>

            <div className="col-span-1 border-r border-gray-200 px-2">
              <div className="text-sm mb-2 font-medium">Location</div>
              <div className="font-semibold text-lg mb-2">5.0</div>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}><path d="M16 2C9.925 2 5 6.925 5 13c0 7.219 9.387 15.656 10.334 16.5a1 1 0 0 0 1.332 0C17.613 28.656 27 20.219 27 13c0-6.075-4.925-11-11-11zm0 25.844C13.411 25.32 7 18.064 7 13c0-4.97 4.03-9 9-9s9 4.03 9 9c0 5.064-6.411 12.32-9 14.844zM16 8a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"></path></svg>
            </div>

            <div className="col-span-1 px-2">
              <div className="text-sm mb-2 font-medium">Value</div>
              <div className="font-semibold text-lg mb-2">5.0</div>
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '32px', width: '32px', fill: 'currentcolor' }}><path d="M28.43 8.35L21.3.15A2 2 0 0 0 19.78 0H4a2 2 0 0 0-2 2v15.78a2 2 0 0 0 .15 1.52l8.2 11.27a2 2 0 0 0 1.52.85 2 2 0 0 0 1.52-.85l15.04-17.3a2 2 0 0 0 0-2.92zM12 12a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"></path></svg>
            </div>
          </div>

          <div className="flex gap-4 mb-10 overflow-x-auto hide-scrollbar pb-2">
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 shrink-0 font-medium text-sm"><span className="text-xl">🛋️</span> Comfort 3</div>
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 shrink-0 font-medium text-sm"><span className="text-xl">🧼</span> Cleanliness 3</div>
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 shrink-0 font-medium text-sm"><span className="text-xl">🖼️</span> Decor 2</div>
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 shrink-0 font-medium text-sm"><span className="text-xl">✅</span> Accuracy 2</div>
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 shrink-0 font-medium text-sm"><span className="text-xl">🎁</span> Hospitality 3</div>
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 shrink-0 font-medium text-sm"><span className="text-xl">📍</span> Location 2</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
            {listing.reviews && listing.reviews.length > 0 ? (
              listing.reviews.map((review: any) => (
                <div key={review.id}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-800">
                      {review.guest?.name?.charAt(0) || 'G'}
                    </div>
                    <div>
                      <div className="font-semibold text-base">{review.guest?.name || 'Guest'}</div>
                      <div className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-xs mb-2">
                    <span className="flex">{'★'.repeat(Math.round(review.rating))}</span>
                    <span className="mx-1 text-gray-500">·</span>
                    <span className="text-gray-500">Rating: {review.rating}</span>
                  </div>
                  <p className="text-[#222222] mb-2 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-gray-500 py-4">No reviews yet.</div>
            )}
          </div>
        </div>

        {/* Where you'll be Map */}
        <div className="py-12 border-t border-gray-200">
          <h2 className="text-[22px] font-semibold mb-6">Where you'll be</h2>
          <p className="text-base text-[#222222] mb-6">{listing.location_city}, {listing.location_country}</p>
          <div className="w-full h-[400px] md:h-[500px] relative rounded-2xl overflow-hidden bg-gray-200">
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ border: 0 }} 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location_city + ', ' + listing.location_country)}&t=&z=13&ie=UTF8&iwloc=&output=embed`} 
              allowFullScreen
            ></iframe>
          </div>
        </div>

      </main>
    </div>
  );
}
