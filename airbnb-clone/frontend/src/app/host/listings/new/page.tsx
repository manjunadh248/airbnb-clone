'use client';
import React, { useState } from 'react';
import Navbar from '../../../../components/Navbar';
import { useRouter } from 'next/navigation';

export default function NewListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'Apartment',
    room_type: 'Entire home/apt',
    price_per_night: '',
    location_city: '',
    location_country: '',
    max_guests: 1,
    bedrooms: 1,
    beds: 1,
    baths: 1
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}/api/listings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          host_id: 2, // mock host ID
          price_per_night: Number(formData.price_per_night)
        })
      });
      if (res.ok) {
        router.push('/host/dashboard');
      } else {
        alert('Failed to create listing');
      }
    } catch (err) {
      alert('Error creating listing');
    }
  };

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-grow">
        <h1 className="text-3xl font-bold text-airbnb-text mb-8">Tell us about your place</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-airbnb-border space-y-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="Cozy Downtown Apartment" />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full border rounded-lg p-3 h-32" placeholder="Describe your place..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Property Type</label>
              <select name="property_type" value={formData.property_type} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white">
                <option>Apartment</option>
                <option>House</option>
                <option>Villa</option>
                <option>Cabin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Room Type</label>
              <select name="room_type" value={formData.room_type} onChange={handleChange} className="w-full border rounded-lg p-3 bg-white">
                <option>Entire home/apt</option>
                <option>Private room</option>
                <option>Shared room</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">City</label>
              <input required type="text" name="location_city" value={formData.location_city} onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="Mumbai" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Country</label>
              <input required type="text" name="location_country" value={formData.location_country} onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="India" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Price per night (₹)</label>
            <input required type="number" name="price_per_night" value={formData.price_per_night} onChange={handleChange} className="w-full border rounded-lg p-3" placeholder="5000" />
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Max Guests</label>
              <input type="number" name="max_guests" value={formData.max_guests} onChange={handleChange} className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Bedrooms</label>
              <input type="number" name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Beds</label>
              <input type="number" name="beds" value={formData.beds} onChange={handleChange} className="w-full border rounded-lg p-3" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Baths</label>
              <input type="number" step="0.5" name="baths" value={formData.baths} onChange={handleChange} className="w-full border rounded-lg p-3" />
            </div>
          </div>

          <button type="submit" className="w-full bg-brand text-white font-semibold py-4 rounded-lg hover:bg-rose-600 transition-colors text-lg">
            Create Listing
          </button>
        </form>
      </main>
    </div>
  );
}
