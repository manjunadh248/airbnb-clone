'use client';
import React, { useState } from 'react';
import { Search, Globe, Menu, User, Plane, Navigation, Palmtree, Building2, TreePine, Building, Minus, Plus, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import GlobeModal from './GlobeModal';
import AuthModal from './AuthModal';
import { useAuth } from '../context/AuthContext';
const suggestedDestinations = [
  { name: "Nearby", subtitle: "Find what's around you", icon: Navigation, iconColor: "text-blue-500", bgColor: "bg-blue-50" },
  { name: "Chandigarh", subtitle: "Near you", icon: TreePine, iconColor: "text-green-600", bgColor: "bg-green-50" },
  { name: "North Goa, Goa", subtitle: "Popular beach destination", icon: Palmtree, iconColor: "text-orange-500", bgColor: "bg-orange-50" },
  { name: "New Delhi, Delhi", subtitle: "For sights like India Gate", icon: Building2, iconColor: "text-green-600", bgColor: "bg-green-50" },
  { name: "Gurgaon District, Haryana", subtitle: "Popular destination", icon: Building, iconColor: "text-amber-700", bgColor: "bg-amber-50" },
  { name: "Manali, Himachal Pradesh", subtitle: "For nature lovers", icon: TreePine, iconColor: "text-green-600", bgColor: "bg-green-50" },
];

export default function Navbar() {
  const [showSearch, setShowSearch] = useState(false);
  const [showGlobe, setShowGlobe] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'where' | 'when' | 'who' | null>(null);
  
  const [location, setLocation] = useState('');
  
  // Guest state
  const [adults, setAdults] = useState(0);
  const [childrenCount, setChildrenCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [pets, setPets] = useState(0);

  // Calendar state
  const [calendarTab, setCalendarTab] = useState<'dates' | 'flexible'>('dates');
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  const router = useRouter();

  const handleDateClick = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      setSelectedDates(selectedDates.filter(d => d !== dateStr));
    } else {
      setSelectedDates([...selectedDates, dateStr]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) {
      params.set('location', location.trim());
    }
    const totalGuests = adults + childrenCount;
    if (totalGuests > 1) {
      params.set('guests_count', totalGuests.toString());
    }
    router.push(`/?${params.toString()}`);
    setShowSearch(false);
  };

  const handleSuggestionClick = (name: string) => {
    const searchName = name === "Nearby" ? "" : name;
    setLocation(searchName);
    setActiveTab('when');
  };

  const totalGuests = adults + childrenCount;
  const guestLabel = totalGuests === 0 
    ? "Add guests" 
    : `${totalGuests} guest${totalGuests > 1 ? 's' : ''}${infants > 0 ? `, ${infants} infant${infants > 1 ? 's' : ''}` : ''}${pets > 0 ? `, ${pets} pet${pets > 1 ? 's' : ''}` : ''}`;

  const formatSelectedDates = () => {
    if (selectedDates.length === 0) return "Add dates";
    
    // Sort logic to make sure we show start and end correctly
    // (This is a simplified mock sort since we only have aug-X and sep-X)
    const sorted = [...selectedDates].sort((a, b) => {
      const getVal = (d: string) => (d.startsWith('aug') ? 0 : 100) + parseInt(d.split('-')[1]);
      return getVal(a) - getVal(b);
    });

    const format = (d: string) => {
      const [month, day] = d.split('-');
      return `${month.charAt(0).toUpperCase() + month.slice(1)} ${day}`;
    };

    if (sorted.length === 1) return format(sorted[0]);
    return `${format(sorted[0])} – ${format(sorted[sorted.length - 1])}`;
  };

  const dateLabel = formatSelectedDates();  
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSection = searchParams.get('section') || 'all';
  const isHome = pathname === '/';

  return (
    <>
      <nav className="border-b border-airbnb-border bg-white sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-20">
          <div className="flex justify-between items-start pt-6 pb-2 h-[80px] relative">
            
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-1 cursor-pointer text-brand z-50">
                <Plane className="w-8 h-8 fill-brand" strokeWidth={1.5} />
                <span className="text-xl font-bold tracking-tight hidden md:block">airbnb</span>
              </div>
            </Link>

            {/* Minimized Search Bar (Hidden on Homepage) */}
            {!isHome && (
              <div 
                onClick={() => {
                  // Optional: Implement click-to-expand logic for non-home pages later
                }}
                className="hidden md:flex items-center border border-airbnb-border rounded-full shadow-sm hover:shadow-md transition-shadow cursor-pointer pl-6 pr-2 py-2 absolute left-1/2 -translate-x-1/2 -top-2 mt-4"
              >
                <div className="text-sm font-semibold px-4 border-r border-airbnb-border">
                  Anywhere
                </div>
                <div className="text-sm font-semibold px-4 border-r border-airbnb-border">
                  {selectedDates.length > 0 ? dateLabel : "Any week"}
                </div>
                <div className="text-sm text-gray-500 px-4 font-normal">
                  {guestLabel}
                </div>
                <div className="bg-brand p-2 rounded-full text-white ml-2">
                  <Search className="w-4 h-4" strokeWidth={3} />
                </div>
              </div>
            )}

            {/* Expanded Tabs (Visible on Homepage) */}
            {isHome && (
              <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 top-2 items-end gap-8 z-[110]">
                <div 
                  onClick={() => router.push('/?section=all')}
                  className={`flex flex-col items-center gap-1 cursor-pointer pb-1 px-2 transition-opacity ${currentSection === 'all' ? 'border-b-2 border-black opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                  <span className="text-2xl mb-1 block leading-none">🌍</span>
                  <span className={`text-sm ${currentSection === 'all' ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>All</span>
                </div>
                <div 
                  onClick={() => router.push('/?section=homes')}
                  className={`flex flex-col items-center gap-1 cursor-pointer pb-1 px-2 transition-opacity ${currentSection === 'homes' ? 'border-b-2 border-black opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                  <span className="text-2xl mb-1 block leading-none">🏠</span>
                  <span className={`text-sm ${currentSection === 'homes' ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>Homes</span>
                </div>
                <div 
                  onClick={() => router.push('/?section=experiences')}
                  className={`flex flex-col items-center gap-1 cursor-pointer pb-1 px-2 relative transition-opacity ${currentSection === 'experiences' ? 'border-b-2 border-black opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                  <span className="text-2xl mb-1 block leading-none">🎈</span>
                  <span className={`text-sm ${currentSection === 'experiences' ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>Experiences</span>
                </div>
                <div 
                  onClick={() => router.push('/?section=services')}
                  className={`flex flex-col items-center gap-1 cursor-pointer pb-1 px-2 relative transition-opacity ${currentSection === 'services' ? 'border-b-2 border-black opacity-100' : 'opacity-70 hover:opacity-100'}`}
                >
                  <span className="text-2xl mb-1 block leading-none">🛎️</span>
                  <span className={`text-sm ${currentSection === 'services' ? 'font-semibold text-gray-900' : 'font-medium text-gray-600'}`}>Services</span>
                </div>
              </div>
            )}

            {/* Right Menu */}
            <div className="flex items-center gap-1 z-[120] relative -mt-2">
              <Link href="/host/dashboard">
                <div className="hidden md:block text-sm font-semibold py-2 px-3 rounded-full hover:bg-gray-100 cursor-pointer transition-colors text-[#222222]">
                  Become a host
                </div>
              </Link>
              <div 
                className="p-2.5 rounded-full hover:bg-gray-100 cursor-pointer transition-colors mr-1"
                onClick={() => setShowGlobe(true)}
              >
                <Globe className="w-[18px] h-[18px] text-[#222222]" />
              </div>
              <div className="relative">
                <div 
                  className="flex items-center justify-center border border-gray-300 rounded-full w-10 h-10 hover:shadow-md transition-shadow cursor-pointer bg-white"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                >
                  <Menu className="w-[18px] h-[18px] text-[#222222]" strokeWidth={2.5} />
                </div>
                
                {showProfileMenu && (
                  <div className="absolute right-0 top-[120%] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] border border-gray-200 rounded-2xl w-[320px] py-4 z-50 flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 text-[#222222]">
                      <HelpCircle className="w-[18px] h-[18px]" strokeWidth={1.5} />
                      <span className="text-[15px]">Help Centre</span>
                    </div>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link href="/host/dashboard">
                      <div className="px-4 py-4 hover:bg-gray-50 cursor-pointer flex justify-between items-center group">
                        <div className="flex flex-col">
                          <span className="text-[15px] font-semibold text-[#222222]">Become a host</span>
                          <span className="text-[13px] text-gray-500 mt-0.5 leading-snug pr-4">It's easy to start hosting and earn extra income.</span>
                        </div>
                        <div className="w-11 h-11 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                          <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&q=80" alt="Host" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    <Link href="/refer" onClick={() => setShowProfileMenu(false)}>
                      <div className="px-4 py-3 hover:bg-gray-50 text-[15px] text-[#222222] cursor-pointer">Refer a host</div>
                    </Link>
                    <Link href="/cohost" onClick={() => setShowProfileMenu(false)}>
                      <div className="px-4 py-3 hover:bg-gray-50 text-[15px] text-[#222222] cursor-pointer">Find a co-host</div>
                    </Link>
                    <div className="border-t border-gray-200 my-2"></div>
                    {user ? (
                      <div className="px-4 py-3 hover:bg-gray-50 text-[15px] text-[#222222] cursor-pointer" onClick={() => { logout(); setShowProfileMenu(false); }}>
                        Log out ({user.name})
                      </div>
                    ) : (
                      <div className="px-4 py-3 hover:bg-gray-50 text-[15px] text-[#222222] cursor-pointer" onClick={() => { setShowAuthModal(true); setShowProfileMenu(false); }}>
                        Log in or sign up
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
          </div>
          
          {/* Expanded Search Bar Component (Visible on Homepage) */}
          {isHome && (
            <div className="max-w-[850px] mx-auto w-full pb-6 relative z-[100]">
              <form 
                onSubmit={handleSearch} 
                className={`rounded-full flex items-center shadow-md border border-gray-200 relative ${activeTab ? 'bg-gray-100' : 'bg-white'}`}
              >
                {/* Where */}
                <div 
                  onClick={() => setActiveTab('where')}
                  className={`flex-[1.2] rounded-full py-3 px-8 cursor-pointer transition-colors relative group ${activeTab === 'where' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                >
                  <label className="block text-xs font-bold text-gray-800">Where</label>
                  <input 
                    type="text" 
                    placeholder="Search destinations"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full text-sm outline-none bg-transparent placeholder-gray-500 truncate"
                  />
                </div>
                
                <div className={`h-8 w-px bg-gray-300 ${activeTab === 'where' || activeTab === 'when' ? 'opacity-0' : 'opacity-100'}`}></div>
                
                {/* When */}
                <div 
                  onClick={() => setActiveTab('when')}
                  className={`flex-1 rounded-full py-3 px-8 cursor-pointer transition-colors ${activeTab === 'when' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                >
                  <label className="block text-xs font-bold text-gray-800">When</label>
                  <div className={`text-sm truncate ${selectedDates.length > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                    {dateLabel}
                  </div>
                </div>
                
                <div className={`h-8 w-px bg-gray-300 ${activeTab === 'when' || activeTab === 'who' ? 'opacity-0' : 'opacity-100'}`}></div>

                {/* Who & Search Button */}
                <div 
                  onClick={() => setActiveTab('who')}
                  className={`flex-[1.2] rounded-full py-2 pl-8 pr-2 cursor-pointer transition-colors flex items-center justify-between ${activeTab === 'who' ? 'bg-white shadow-lg' : 'hover:bg-gray-200'}`}
                >
                  <div className="flex flex-col truncate pr-4">
                    <label className="block text-xs font-bold text-gray-800">Who</label>
                    <div className={`text-sm truncate ${totalGuests > 0 ? 'text-gray-800 font-semibold' : 'text-gray-500'}`}>
                      {guestLabel}
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="bg-brand hover:bg-rose-600 transition-colors text-white rounded-full p-4 flex items-center justify-center shrink-0 flex-nowrap whitespace-nowrap gap-2"
                  >
                    <Search className="w-5 h-5" strokeWidth={3} />
                    <span className="font-semibold pr-2">Search</span>
                  </button>
                </div>
              </form>

              {/* Dropdowns */}
              {activeTab === 'where' && (
                <div className="absolute top-full left-0 mt-4 w-[400px] bg-white rounded-3xl shadow-xl border border-gray-200 p-6 z-50 max-h-[60vh] overflow-y-auto">
                  <h3 className="text-xs font-bold text-gray-500 mb-4 px-2 uppercase">Suggested destinations</h3>
                  <div className="flex flex-col gap-2">
                    {suggestedDestinations.map((dest, idx) => {
                      const Icon = dest.icon;
                      return (
                        <div 
                          key={idx}
                          onClick={() => handleSuggestionClick(dest.name)}
                          className="flex items-center gap-4 hover:bg-gray-100 p-2 rounded-xl cursor-pointer transition-colors"
                        >
                          <div className={`p-3 rounded-lg ${dest.bgColor}`}>
                            <Icon className={`w-6 h-6 ${dest.iconColor}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-800">{dest.name}</span>
                            <span className="text-xs text-gray-500">{dest.subtitle}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'when' && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[850px] bg-white rounded-3xl shadow-xl border border-gray-200 p-8 z-50">
                  <div className="flex justify-center mb-6">
                    <div className="bg-gray-100 rounded-full flex p-1">
                      <button 
                        type="button"
                        onClick={() => setCalendarTab('dates')}
                        className={`${calendarTab === 'dates' ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:text-gray-900'} rounded-full px-6 py-2 text-sm font-semibold transition-colors`}
                      >
                        Dates
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCalendarTab('flexible')}
                        className={`${calendarTab === 'flexible' ? 'bg-white shadow-sm text-black' : 'text-gray-600 hover:text-gray-900'} rounded-full px-6 py-2 text-sm font-semibold transition-colors`}
                      >
                        Flexible
                      </button>
                    </div>
                  </div>
                  
                  {calendarTab === 'dates' ? (
                    <>
                      <div className="flex justify-between items-center mb-6">
                        <button type="button" className="p-2 hover:bg-gray-100 rounded-full text-gray-400"><ChevronLeft className="w-5 h-5" /></button>
                        <div className="flex flex-1 justify-around">
                          <h3 className="text-base font-semibold">August 2026</h3>
                          <h3 className="text-base font-semibold">September 2026</h3>
                        </div>
                        <button type="button" className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                      </div>

                      <div className="flex gap-12">
                        {/* Month 1 */}
                        <div className="flex-1">
                          <div className="grid grid-cols-7 mb-2 text-xs font-semibold text-gray-400 text-center">
                            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                          </div>
                          <div className="grid grid-cols-7 gap-y-2 text-sm text-center font-semibold">
                            <div></div><div></div><div></div><div></div><div></div>
                            {[...Array(31)].map((_, i) => {
                              const dateStr = `aug-${i+1}`;
                              const isSelected = selectedDates.includes(dateStr);
                              const isPast = i < 12; // Just mocking past dates for August
                              return (
                                <button
                                  key={dateStr}
                                  type="button"
                                  disabled={isPast}
                                  onClick={() => handleDateClick(dateStr)}
                                  className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full transition-colors ${isPast ? 'text-gray-300 cursor-not-allowed' : isSelected ? 'bg-black text-white' : 'hover:border hover:border-black'}`}
                                >
                                  {i + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Month 2 */}
                        <div className="flex-1">
                          <div className="grid grid-cols-7 mb-2 text-xs font-semibold text-gray-400 text-center">
                            <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
                          </div>
                          <div className="grid grid-cols-7 gap-y-2 text-sm text-center font-semibold">
                            <div></div>
                            {[...Array(30)].map((_, i) => {
                              const dateStr = `sep-${i+1}`;
                              const isSelected = selectedDates.includes(dateStr);
                              return (
                                <button
                                  key={dateStr}
                                  type="button"
                                  onClick={() => handleDateClick(dateStr)}
                                  className={`w-10 h-10 mx-auto flex items-center justify-center rounded-full transition-colors ${isSelected ? 'bg-black text-white' : 'hover:border hover:border-black'}`}
                                >
                                  {i + 1}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center py-8">
                      <h3 className="text-lg font-semibold mb-8 text-center">How long would you like to stay?</h3>
                      <div className="flex gap-4">
                        <button className="px-6 py-3 border border-gray-200 rounded-full hover:border-black hover:bg-gray-50 font-medium transition-colors">Weekend</button>
                        <button className="px-6 py-3 border border-gray-200 rounded-full hover:border-black hover:bg-gray-50 font-medium transition-colors">Week</button>
                        <button className="px-6 py-3 border border-gray-200 rounded-full hover:border-black hover:bg-gray-50 font-medium transition-colors">Month</button>
                      </div>
                      
                      <h3 className="text-lg font-semibold mt-12 mb-8 text-center">When do you want to go?</h3>
                      <div className="flex gap-4 overflow-x-auto w-full pb-4 px-12 hide-scrollbar">
                        {['August', 'September', 'October', 'November', 'December', 'January'].map(month => (
                          <div key={month} className="min-w-[120px] flex flex-col items-center gap-2 p-4 border border-gray-200 rounded-2xl hover:border-black hover:bg-gray-50 cursor-pointer transition-colors">
                            <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="presentation" focusable="false" style={{ display: 'block', height: '24px', width: '24px', fill: 'currentcolor' }}><path d="M29 5a2 2 0 0 1 1.995 1.85L31 7v20a2 2 0 0 1-1.85 1.995L29 29H3a2 2 0 0 1-1.995-1.85L1 27V7a2 2 0 0 1 1.85-1.995L3 5h4V1h2v4h14V1h2v4h4zm0 2H29v3h-2V7H15v3h-2V7H5v3H3V7zm0 7H3v13h26V14z"></path></svg>
                            <span className="text-sm font-medium">{month}</span>
                            <span className="text-xs text-gray-500">2026</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'who' && (
                <div className="absolute top-full right-0 mt-4 w-[400px] bg-white rounded-3xl shadow-xl border border-gray-200 p-6 z-50">
                  {/* Adults */}
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">Adults</span>
                      <span className="text-sm text-gray-500">Ages 13 or above</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setAdults(Math.max(0, adults - 1))}
                        className={`p-2 rounded-full border ${adults === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-gray-800 hover:text-gray-800'}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center">{adults}</span>
                      <button 
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="p-2 rounded-full border border-gray-400 text-gray-600 hover:border-gray-800 hover:text-gray-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">Children</span>
                      <span className="text-sm text-gray-500">Ages 2–12</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setChildrenCount(Math.max(0, childrenCount - 1))}
                        className={`p-2 rounded-full border ${childrenCount === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-gray-800 hover:text-gray-800'}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center">{childrenCount}</span>
                      <button 
                        type="button"
                        onClick={() => setChildrenCount(childrenCount + 1)}
                        className="p-2 rounded-full border border-gray-400 text-gray-600 hover:border-gray-800 hover:text-gray-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex justify-between items-center py-4 border-b border-gray-100">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">Infants</span>
                      <span className="text-sm text-gray-500">Under 2</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setInfants(Math.max(0, infants - 1))}
                        className={`p-2 rounded-full border ${infants === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-gray-800 hover:text-gray-800'}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center">{infants}</span>
                      <button 
                        type="button"
                        onClick={() => setInfants(infants + 1)}
                        className="p-2 rounded-full border border-gray-400 text-gray-600 hover:border-gray-800 hover:text-gray-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Pets */}
                  <div className="flex justify-between items-center py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800">Pets</span>
                      <span className="text-sm text-gray-500 hover:underline cursor-pointer">Bringing a service animal?</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        type="button"
                        onClick={() => setPets(Math.max(0, pets - 1))}
                        className={`p-2 rounded-full border ${pets === 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-400 text-gray-600 hover:border-gray-800 hover:text-gray-800'}`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-4 text-center">{pets}</span>
                      <button 
                        type="button"
                        onClick={() => setPets(pets + 1)}
                        className="p-2 rounded-full border border-gray-400 text-gray-600 hover:border-gray-800 hover:text-gray-800"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Mobile Search Bar */}
        <div className="md:hidden px-4 pb-4">
          <div className="flex items-center gap-3 border border-airbnb-border rounded-full shadow-sm p-3 bg-white">
            <Search className="w-5 h-5 text-airbnb-text ml-2" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-airbnb-text">Where to?</span>
              <span className="text-xs text-gray-500">Anywhere • Any week • Add guests</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Global Background Click Handler to close dropdowns */}
      {isHome && activeTab && (
        <div className="fixed inset-0 z-40" onClick={() => setActiveTab(null)}></div>
      )}

      {showGlobe && <GlobeModal onClose={() => setShowGlobe(false)} />}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
