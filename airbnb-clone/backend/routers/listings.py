from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from sqlalchemy import func
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/listings", tags=["listings"])

class ListingDetail(schemas.Listing):
    reviews: List[schemas.Review] = []

@router.get("", response_model=List[schemas.Listing])
def get_listings(
    location: Optional[str] = None,
    guests_count: Optional[int] = None,
    host_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Listing)
    if location and location.upper() not in ["NEARBY", "ANYWHERE"]:
        query = query.filter(
            (models.Listing.location_city.ilike(f"%{location}%")) |
            (models.Listing.location_country.ilike(f"%{location}%"))
        )
    if category:
        query = query.filter(models.Listing.property_type.ilike(f"%{category}%"))
    if guests_count:
        query = query.filter(models.Listing.max_guests >= guests_count)
    if host_id:
        query = query.filter(models.Listing.host_id == host_id)
    
    listings = query.all()
    for listing in listings:
        listing.reviews_count = db.query(func.count(models.Review.id)).filter(models.Review.listing_id == listing.id).scalar()
        avg_rating = db.query(func.avg(models.Review.rating)).filter(models.Review.listing_id == listing.id).scalar()
        listing.average_rating = round(avg_rating, 2) if avg_rating else None
        
    return listings

@router.get("/{id}", response_model=ListingDetail)
def get_listing(id: int, db: Session = Depends(get_db)):
    listing = db.query(models.Listing).filter(models.Listing.id == id).first()
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    listing.reviews_count = db.query(func.count(models.Review.id)).filter(models.Review.listing_id == listing.id).scalar()
    avg_rating = db.query(func.avg(models.Review.rating)).filter(models.Review.listing_id == listing.id).scalar()
    listing.average_rating = round(avg_rating, 2) if avg_rating else None
    
    return listing

@router.post("", response_model=schemas.Listing)
def create_listing(listing: schemas.ListingCreate, db: Session = Depends(get_db)):
    db_listing = models.Listing(
        host_id=listing.host_id,
        title=listing.title,
        description=listing.description,
        property_type=listing.property_type,
        room_type=listing.room_type,
        price_per_night=listing.price_per_night,
        currency=listing.currency,
        location_city=listing.location_city,
        location_country=listing.location_country,
        max_guests=listing.max_guests,
        bedrooms=listing.bedrooms,
        beds=listing.beds,
        baths=listing.baths,
        lat=listing.lat,
        lng=listing.lng
    )
    
    if listing.amenity_ids:
        amenities = db.query(models.Amenity).filter(models.Amenity.id.in_(listing.amenity_ids)).all()
        db_listing.amenities = amenities

    db.add(db_listing)
    db.commit()
    db.refresh(db_listing)
    return db_listing

@router.put("/{id}", response_model=schemas.Listing)
def update_listing(id: int, listing_update: schemas.ListingCreate, db: Session = Depends(get_db)):
    db_listing = db.query(models.Listing).filter(models.Listing.id == id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    for key, value in listing_update.model_dump(exclude={'amenity_ids'}).items():
        setattr(db_listing, key, value)
        
    if listing_update.amenity_ids is not None:
        amenities = db.query(models.Amenity).filter(models.Amenity.id.in_(listing_update.amenity_ids)).all()
        db_listing.amenities = amenities
        
    db.commit()
    db.refresh(db_listing)
    return db_listing

@router.delete("/{id}")
def delete_listing(id: int, db: Session = Depends(get_db)):
    db_listing = db.query(models.Listing).filter(models.Listing.id == id).first()
    if not db_listing:
        raise HTTPException(status_code=404, detail="Listing not found")
        
    db.delete(db_listing)
    db.commit()
    return {"message": "Listing deleted"}

@router.get("/{id}/availability")
def get_availability(id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(
        models.Booking.listing_id == id,
        models.Booking.status != 'cancelled'
    ).all()
    
    blocked_dates = []
    for b in bookings:
        blocked_dates.append({
            "check_in": b.check_in,
            "check_out": b.check_out
        })
        
    return blocked_dates

@router.get("/{id}/reviews", response_model=List[schemas.Review])
def get_reviews(id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.listing_id == id).all()
    return reviews

@router.post("/{id}/reviews", response_model=schemas.Review)
def create_review(id: int, review: schemas.ReviewCreate, db: Session = Depends(get_db)):
    if id != review.listing_id:
        raise HTTPException(status_code=400, detail="Listing ID mismatch")
        
    db_review = models.Review(
        listing_id=review.listing_id,
        booking_id=review.booking_id,
        guest_id=review.guest_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    return db_review
