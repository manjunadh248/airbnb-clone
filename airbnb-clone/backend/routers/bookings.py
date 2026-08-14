from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/bookings", tags=["bookings"])

@router.post("", response_model=schemas.Booking)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    # Validate date overlap
    overlap = db.query(models.Booking).filter(
        models.Booking.listing_id == booking.listing_id,
        models.Booking.status != 'cancelled',
        models.Booking.check_in < booking.check_out,
        models.Booking.check_out > booking.check_in
    ).first()
    
    if overlap:
        raise HTTPException(status_code=409, detail="Dates are not available for this listing")
        
    # Get listing for pricing
    listing = db.query(models.Listing).filter(models.Listing.id == booking.listing_id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    nights = (booking.check_out - booking.check_in).days
    if nights <= 0:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")
        
    total_price = nights * listing.price_per_night
    
    db_booking = models.Booking(
        listing_id=booking.listing_id,
        guest_id=booking.guest_id,
        check_in=booking.check_in,
        check_out=booking.check_out,
        guests_count=booking.guests_count,
        nightly_rate_snapshot=listing.price_per_night,
        total_price=total_price,
        status='confirmed'
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/me", response_model=List[schemas.BookingWithListing])
def get_my_bookings(user_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(models.Booking.guest_id == user_id).all()
    return bookings

@router.get("/host", response_model=List[schemas.BookingWithListing])
def get_host_bookings(host_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).join(models.Listing).filter(models.Listing.host_id == host_id).all()
    return bookings

@router.delete("/{id}")
def cancel_booking(id: int, db: Session = Depends(get_db)):
    db_booking = db.query(models.Booking).filter(models.Booking.id == id).first()
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
        
    # Instead of hard delete, we can soft delete or just delete it
    db.delete(db_booking)
    db.commit()
    return {"message": "Booking cancelled"}
