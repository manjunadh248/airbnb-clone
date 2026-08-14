from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime, date

class UserBase(BaseModel):
    name: str
    email: str
    avatar_url: Optional[str] = None
    role: str = "guest"
    is_superhost: bool = False

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class AmenityBase(BaseModel):
    name: str
    icon: Optional[str] = None

class Amenity(AmenityBase):
    id: int

    class Config:
        from_attributes = True

class ListingImageBase(BaseModel):
    image_url: str
    sort_order: int = 0

class ListingImage(ListingImageBase):
    id: int

    class Config:
        from_attributes = True

class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    property_type: Optional[str] = None
    room_type: Optional[str] = None
    price_per_night: float
    currency: str = "INR"
    location_city: Optional[str] = None
    location_country: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    max_guests: int
    bedrooms: int
    beds: int
    baths: float

class ListingCreate(ListingBase):
    host_id: int
    amenity_ids: List[int] = []

class Listing(ListingBase):
    id: int
    host_id: int
    created_at: datetime
    updated_at: datetime
    host: User
    images: List[ListingImage] = []
    amenities: List[Amenity] = []
    average_rating: Optional[float] = None
    reviews_count: Optional[int] = 0

    class Config:
        from_attributes = True

class BookingBase(BaseModel):
    check_in: date
    check_out: date
    guests_count: int

class BookingCreate(BookingBase):
    listing_id: int
    guest_id: int

class Booking(BookingBase):
    id: int
    listing_id: int
    guest_id: int
    nightly_rate_snapshot: float
    total_price: float
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class BookingWithListing(Booking):
    listing: Listing

    class Config:
        from_attributes = True

class ReviewBase(BaseModel):
    rating: float
    comment: Optional[str] = None

class ReviewCreate(ReviewBase):
    listing_id: int
    booking_id: int
    guest_id: int

class Review(ReviewBase):
    id: int
    listing_id: int
    booking_id: int
    guest_id: int
    created_at: datetime
    guest: User

    class Config:
        from_attributes = True

class WishlistBase(BaseModel):
    listing_id: int
    user_id: int

class Wishlist(WishlistBase):
    id: int
    created_at: datetime
    listing: Listing

    class Config:
        from_attributes = True
