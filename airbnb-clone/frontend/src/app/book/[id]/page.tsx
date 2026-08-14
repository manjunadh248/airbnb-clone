'use client';
import React, { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Star } from 'lucide-react';

export default function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkin = searchParams.get('checkin');
  const checkout = searchParams.get('checkout');
  const guests = searchParams.get('guests');
  
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Mock Payment state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [zipCode, setZipCode] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}`}/api/listings/${id}`);
        if (res.ok) {
          const data = await res.json();
          setListing(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center">Listing not found</div>;

  const nights = (checkin && checkout) 
    ? Math.max(1, Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 3600 * 24)))
    : 1;

  const baseTotal = listing.price_per_night * nights;
  const serviceFee = Math.floor(baseTotal * 0.14); // 14% Airbnb service fee mock
  const total = baseTotal + serviceFee;

  const formatDates = () => {
    if (!checkin || !checkout) return 'Select dates';
    const start = new Date(checkin);
    const end = new Date(checkout);
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} – ${endStr}`;
  };

  const handleConfirmPay = async () => {
    if (!cardNumber || !expiry || !cvv || !zipCode) {
      setError('Please fill out all payment details.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: Number(id),
          guest_id: 1, // Mock guest ID
          check_in: checkin,
          check_out: checkout,
          guests_count: Number(guests) || 1
        })
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || 'Failed to confirm booking.');
      } else {
        router.push('/trips');
      }
    } catch (err) {
      setError('Network error processing payment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Checkout Header */}
      <header className="border-b border-gray-200 h-20 flex items-center bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto w-full px-6">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center -ml-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-20">
        {/* Left Column: Flow */}
        <div className="flex-1 max-w-[600px]">
          <h1 className="text-[32px] font-semibold text-gray-900 mb-10">Request to book</h1>
          
          <div className="flex flex-col gap-8 pb-8 border-b border-gray-200">
            <h2 className="text-[22px] font-semibold text-gray-900">Your trip</h2>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">Dates</h3>
                <p className="text-gray-600">{formatDates()}</p>
              </div>
              <button className="font-semibold underline text-gray-900">Edit</button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">Guests</h3>
                <p className="text-gray-600">{guests} guest{Number(guests) > 1 ? 's' : ''}</p>
              </div>
              <button className="font-semibold underline text-gray-900">Edit</button>
            </div>
          </div>

          <div className="py-8 border-b border-gray-200">
            <h2 className="text-[22px] font-semibold text-gray-900 mb-6">Pay with</h2>
            
            <div className="border border-gray-300 rounded-xl overflow-hidden mb-4">
              <div className="p-4 flex items-center justify-between border-b border-gray-300 bg-white cursor-pointer group hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-6 bg-gray-200 rounded text-[10px] font-bold flex items-center justify-center text-gray-500">CARD</div>
                  <span className="font-medium text-gray-900">Credit or debit card</span>
                </div>
              </div>

              <div className="p-4 bg-white flex flex-col gap-4">
                <div className="border border-gray-400 rounded-lg overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <input 
                    type="text" 
                    placeholder="Card number" 
                    className="w-full p-3 border-b border-gray-400 outline-none"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                  <div className="flex">
                    <input 
                      type="text" 
                      placeholder="Expiration" 
                      className="w-1/2 p-3 border-r border-gray-400 outline-none"
                      value={expiry}
                      onChange={(e) => setExpiry(e.target.value)}
                    />
                    <input 
                      type="text" 
                      placeholder="CVV" 
                      className="w-1/2 p-3 outline-none"
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="border border-gray-400 rounded-lg overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                  <input 
                    type="text" 
                    placeholder="ZIP code" 
                    className="w-full p-3 outline-none"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">Mock payment capture - enter any details</div>
              </div>
            </div>
            
            <button className="font-semibold underline text-gray-900">Enter a coupon</button>
          </div>

          <div className="py-8 border-b border-gray-200">
            <h2 className="text-[22px] font-semibold text-gray-900 mb-4">Required for your trip</h2>
            <div className="flex justify-between items-start gap-4">
              <div className="flex flex-col gap-1">
                <h3 className="font-semibold text-gray-900">Message the host</h3>
                <p className="text-sm text-gray-600">Let the host know why you're travelling and when you'll check in.</p>
              </div>
              <button className="px-4 py-2 border border-black rounded-lg font-semibold hover:bg-gray-50 transition-colors">Add</button>
            </div>
          </div>
          
          <div className="py-8">
            <p className="text-xs text-gray-600 mb-6">
              By selecting the button below, I agree to the <span className="underline font-semibold text-gray-900 cursor-pointer">Host's House Rules</span>, <span className="underline font-semibold text-gray-900 cursor-pointer">Ground rules for guests</span>, <span className="underline font-semibold text-gray-900 cursor-pointer">Airbnb's Rebooking and Refund Policy</span>, and that Airbnb can <span className="underline font-semibold text-gray-900 cursor-pointer">charge my payment method</span> if I'm responsible for damage.
            </p>
            
            {error && <div className="text-[#E31C5F] text-sm mb-4 font-semibold p-3 bg-rose-50 rounded-lg border border-rose-200">{error}</div>}

            <button 
              onClick={handleConfirmPay}
              disabled={submitting}
              className="w-full md:w-auto bg-[#E31C5F] text-white font-semibold py-4 px-10 rounded-xl hover:bg-[#D70466] transition-colors disabled:opacity-50 text-lg"
            >
              {submitting ? 'Confirming...' : 'Confirm and pay'}
            </button>
          </div>
        </div>

        {/* Right Column: Summary Card */}
        <div className="w-full md:w-[450px]">
          <div className="sticky top-28 bg-white border border-gray-200 rounded-2xl shadow-xl p-6">
            <div className="flex gap-4 pb-6 border-b border-gray-200">
              <div className="w-[120px] h-[100px] rounded-lg overflow-hidden shrink-0">
                <img 
                  src={listing.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=300&q=80'} 
                  alt="Listing thumbnail" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-gray-500 font-semibold">{listing.location_city}</span>
                  <span className="text-sm font-semibold text-gray-900 line-clamp-2">{listing.title}</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="font-semibold">{listing.average_rating > 0 ? listing.average_rating.toFixed(2) : 'New'}</span>
                  <span className="text-gray-500">({listing.reviews_count || 0} reviews)</span>
                </div>
              </div>
            </div>

            <div className="py-6">
              <h2 className="text-[22px] font-semibold text-gray-900 mb-4">Price details</h2>
              
              <div className="flex justify-between items-center mb-4 text-gray-600">
                <span>₹{listing.price_per_night.toLocaleString('en-IN')} x {nights} nights</span>
                <span>₹{baseTotal.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between items-center pb-6 border-b border-gray-200 text-gray-600">
                <span className="underline">Airbnb service fee</span>
                <span>₹{serviceFee.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="flex justify-between items-center pt-6 font-semibold text-gray-900 text-lg">
                <span>Total (INR)</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
