import React from 'react';
import { Globe, Facebook, Twitter, Instagram, ChevronDown } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  const inspirationData = [
    { title: "Leadville", subtitle: "Cabin rentals" },
    { title: "Tucson", subtitle: "Apartment rentals" },
    { title: "Idaho Springs", subtitle: "Monthly Rentals" },
    { title: "Ozark", subtitle: "House rentals" },
    { title: "San Mateo", subtitle: "Apartment rentals" },
    { title: "Bentonville", subtitle: "House rentals" },
    
    { title: "McCall", subtitle: "Flat rentals" },
    { title: "Staunton", subtitle: "Pet-friendly rentals" },
    { title: "Glendale", subtitle: "Holiday rentals" },
    { title: "Anacortes", subtitle: "Flat rentals" },
    { title: "Sisters", subtitle: "Pet-friendly rentals" },
    { title: "Bristol", subtitle: "Holiday rentals" },
    
    { title: "Brevard", subtitle: "Cabin rentals" },
    { title: "Oslo", subtitle: "House rentals" },
    { title: "Harrisonburg", subtitle: "Cabin rentals" },
    { title: "Waynesville", subtitle: "Pet-friendly rentals" },
    { title: "Zermatt", subtitle: "Pet-friendly rentals" },
  ];

  return (
    <footer className="bg-gray-50 border-t border-airbnb-border mt-10">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-12">
        
        {/* Inspiration for future getaways */}
        <div className="mb-12 border-b border-gray-200 pb-12">
          <h2 className="text-2xl font-semibold mb-6">Inspiration for future getaways</h2>
          
          <div className="flex gap-6 border-b border-gray-200 mb-8 overflow-x-auto hide-scrollbar">
            <button className="pb-4 text-sm font-semibold text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-200 transition-colors whitespace-nowrap">Popular</button>
            <button className="pb-4 text-sm font-semibold text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-200 transition-colors whitespace-nowrap">Arts & culture</button>
            <button className="pb-4 text-sm font-semibold text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-200 transition-colors whitespace-nowrap">Beach</button>
            <button className="pb-4 text-sm font-semibold text-black border-b-2 border-black whitespace-nowrap">Mountains</button>
            <button className="pb-4 text-sm font-semibold text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-200 transition-colors whitespace-nowrap">Outdoors</button>
            <button className="pb-4 text-sm font-semibold text-gray-500 hover:text-gray-800 border-b-2 border-transparent hover:border-gray-200 transition-colors whitespace-nowrap">Things to do</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-y-6 gap-x-4">
            {inspirationData.map((item, index) => (
              <Link key={index} href={`/?location=${encodeURIComponent(item.title)}`} className="flex flex-col cursor-pointer group">
                <span className="text-sm font-semibold text-gray-800 group-hover:underline">{item.title}</span>
                <span className="text-sm text-gray-500">{item.subtitle}</span>
              </Link>
            ))}
            <div className="flex items-center gap-1 cursor-pointer group">
              <span className="text-sm font-semibold text-gray-800 group-hover:underline">Show more</span>
              <ChevronDown className="w-4 h-4 text-gray-800" />
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 border-b border-gray-200 pb-8">
          
          {/* Support */}
          <div>
            <h3 className="font-semibold text-airbnb-text mb-4">Support</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li><a href="https://www.airbnb.com/help" target="_blank" rel="noopener noreferrer" className="hover:underline">Help Centre</a></li>
              <li><a href="https://www.airbnb.com/help/article/3234" target="_blank" rel="noopener noreferrer" className="hover:underline">Get help with a safety issue</a></li>
              <li><a href="https://www.airbnb.com/aircover" target="_blank" rel="noopener noreferrer" className="hover:underline">AirCover</a></li>
              <li><a href="https://www.airbnb.com/against-discrimination" target="_blank" rel="noopener noreferrer" className="hover:underline">Anti-discrimination</a></li>
              <li><a href="https://www.airbnb.com/accessibility" target="_blank" rel="noopener noreferrer" className="hover:underline">Disability support</a></li>
              <li><a href="https://www.airbnb.com/help/article/169" target="_blank" rel="noopener noreferrer" className="hover:underline">Cancellation options</a></li>
              <li><a href="https://www.airbnb.com/neighbors" target="_blank" rel="noopener noreferrer" className="hover:underline">Report neighbourhood concern</a></li>
            </ul>
          </div>

          {/* Hosting */}
          <div>
            <h3 className="font-semibold text-airbnb-text mb-4">Hosting</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li><a href="https://www.airbnb.com/host/homes" target="_blank" rel="noopener noreferrer" className="hover:underline">Airbnb your home</a></li>
              <li><a href="https://www.airbnb.com/host/experiences" target="_blank" rel="noopener noreferrer" className="hover:underline">Airbnb your experience</a></li>
              <li><Link href="/?section=services" className="hover:underline">Airbnb your service</Link></li>
              <li><a href="https://www.airbnb.com/aircover-for-hosts" target="_blank" rel="noopener noreferrer" className="hover:underline">AirCover for Hosts</a></li>
              <li><a href="https://www.airbnb.com/resources/hosting-homes" target="_blank" rel="noopener noreferrer" className="hover:underline">Hosting resources</a></li>
              <li><a href="https://community.withairbnb.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Community forum</a></li>
              <li><a href="https://www.airbnb.com/help/article/1376" target="_blank" rel="noopener noreferrer" className="hover:underline">Hosting responsibly</a></li>
              <li><a href="https://www.airbnb.com/resources/hosting-homes/a/join-a-free-hosting-class-225" target="_blank" rel="noopener noreferrer" className="hover:underline">Join a free hosting class</a></li>
              <li><Link href="/cohost" className="hover:underline">Find a co-host</Link></li>
              <li><Link href="/refer" className="hover:underline">Refer a host</Link></li>
            </ul>
          </div>

          {/* Airbnb */}
          <div>
            <h3 className="font-semibold text-airbnb-text mb-4">Airbnb</h3>
            <ul className="space-y-3 text-sm text-gray-700">
              <li><a href="https://www.airbnb.com/release" target="_blank" rel="noopener noreferrer" className="hover:underline">2026 Summer Release</a></li>
              <li><a href="https://news.airbnb.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Newsroom</a></li>
              <li><a href="https://careers.airbnb.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Careers</a></li>
              <li><a href="https://investors.airbnb.com" target="_blank" rel="noopener noreferrer" className="hover:underline">Investors</a></li>
              <li><a href="https://www.airbnb.org" target="_blank" rel="noopener noreferrer" className="hover:underline">Airbnb.org emergency stays</a></li>
            </ul>
          </div>
          
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-700">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 Airbnb, Inc.</span>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:underline">Privacy</Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:underline">Terms</Link>
            <span className="hidden md:inline">·</span>
            <Link href="#" className="hover:underline">Company details</Link>
          </div>
          
          <div className="flex items-center gap-6 font-semibold">
            <div className="flex items-center gap-2 cursor-pointer hover:underline">
              <Globe className="w-4 h-4" />
              <span>English (IN)</span>
            </div>
            <div className="cursor-pointer hover:underline">
              <span>₹ INR</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-gray-900"><Facebook className="w-5 h-5 fill-current" /></Link>
              <Link href="#" className="hover:text-gray-900"><Twitter className="w-5 h-5 fill-current" /></Link>
              <Link href="#" className="hover:text-gray-900"><Instagram className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
