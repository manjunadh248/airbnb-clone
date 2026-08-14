'use client';
import React, { useState, useEffect } from 'react';
import { Keyboard, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBooking } from './BookingContext';

export default function ListingCalendar({ listingId }: { listingId: string }) {
  const { checkIn, setCheckIn, checkOut, setCheckOut } = useBooking();
  const [currentMonth, setCurrentMonth] = useState(new Date()); // Start at current month
  const [blockedDates, setBlockedDates] = useState<{check_in: string, check_out: string}[]>([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8001'}`}/api/listings/${listingId}/availability`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBlockedDates(data);
        } else {
          setBlockedDates([]);
        }
      })
      .catch(err => console.error("Error fetching availability:", err));
  }, [listingId]);

  const isDateBlocked = (dateStr: string) => {
    const curr = new Date(dateStr);
    for (const b of blockedDates) {
      if (curr >= new Date(b.check_in) && curr <= new Date(b.check_out)) {
        return true;
      }
    }
    return false;
  };

  const handleDateClick = (dateStr: string) => {
    if (isDateBlocked(dateStr)) return;
    
    const clickedDate = new Date(dateStr);
    
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      setCheckOut('');
    } else if (checkIn && !checkOut) {
      const inDate = new Date(checkIn);
      if (clickedDate > inDate) {
        // Check if there are any blocked dates between checkIn and clickedDate
        let hasBlocked = false;
        let d = new Date(checkIn);
        while (d <= clickedDate) {
          if (isDateBlocked(d.toISOString().split('T')[0])) {
            hasBlocked = true;
            break;
          }
          d.setDate(d.getDate() + 1);
        }
        if (hasBlocked) {
          setCheckIn(dateStr);
          setCheckOut('');
        } else {
          setCheckOut(dateStr);
        }
      } else {
        setCheckIn(dateStr);
      }
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const renderMonth = (offset: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + offset;
    
    const displayDate = new Date(year, month);
    const displayYear = displayDate.getFullYear();
    const displayMonth = displayDate.getMonth();
    
    const monthName = displayDate.toLocaleString('default', { month: 'long' });
    const daysInMonth = getDaysInMonth(displayYear, displayMonth);
    const firstDay = getFirstDayOfMonth(displayYear, displayMonth);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="py-2" />);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${displayYear}-${String(displayMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isCheckIn = checkIn === dateStr;
      const isCheckOut = checkOut === dateStr;
      
      const curr = new Date(dateStr);
      let inRange = false;
      if (checkIn && checkOut) {
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        if (curr > start && curr < end) {
          inRange = true;
        }
      }

      let classes = "py-2 cursor-pointer transition-colors relative z-10 w-10 h-10 mx-auto flex items-center justify-center rounded-full hover:border hover:border-black";
      let wrapperClasses = "relative w-full text-center py-1";
      
      const blocked = isDateBlocked(dateStr);

      if (blocked) {
        classes = "w-10 h-10 mx-auto flex items-center justify-center relative z-10 text-gray-300 line-through cursor-not-allowed";
      } else if (isCheckIn || isCheckOut) {
        classes = "w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-black text-white relative z-10";
        if (isCheckIn && checkOut) {
          wrapperClasses += " bg-gray-100 rounded-l-full";
        }
        if (isCheckOut && checkIn) {
          wrapperClasses += " bg-gray-100 rounded-r-full";
        }
      } else if (inRange) {
        wrapperClasses += " bg-gray-100";
        classes = "w-10 h-10 mx-auto flex items-center justify-center relative z-10";
      }

      days.push(
        <div key={dateStr} className={wrapperClasses}>
          <div className={classes} onClick={() => !blocked && handleDateClick(dateStr)}>
            {i}
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1">
        <div className="flex justify-between items-center mb-4">
          {offset === 0 ? (
            <button 
              onClick={() => setCurrentMonth(new Date(year, month - 1))}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>
          ) : <div className="w-6" />}
          <h4 className="font-semibold text-base text-center">{monthName} {displayYear}</h4>
          {offset === 1 ? (
             <button 
               onClick={() => setCurrentMonth(new Date(year, month))}
               className="p-1 hover:bg-gray-100 rounded-full transition-colors"
             >
               <ChevronRight className="w-4 h-4 text-gray-700" />
             </button>
          ) : <div className="w-6" />}
        </div>
        <div className="grid grid-cols-7 mb-2 text-xs font-semibold text-gray-500 text-center">
          <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
        </div>
        <div className="grid grid-cols-7 gap-y-1 text-sm text-center font-semibold">
          {days}
        </div>
      </div>
    );
  };

  const nights = (checkIn && checkOut) 
    ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 3600 * 24)))
    : null;

  return (
    <div className="py-12 border-b border-gray-200">
      <h3 className="text-[22px] font-semibold mb-1">
        {nights ? `${nights} nights in this place` : 'Select checkout date'}
      </h3>
      <p className="text-sm text-gray-500 mb-8">
        {checkIn && checkOut 
          ? `${new Date(checkIn).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})} - ${new Date(checkOut).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric'})}`
          : 'Add your travel dates for exact pricing'
        }
      </p>
      
      <div className="flex gap-12">
        {renderMonth(0)}
        {renderMonth(1)}
      </div>
      <div className="flex justify-between items-center mt-6">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Keyboard className="w-6 h-6 text-gray-700" />
        </button>
        <button 
          onClick={() => { setCheckIn(''); setCheckOut(''); }}
          className="text-sm font-semibold underline"
        >
          Clear dates
        </button>
      </div>
    </div>
  );
}
