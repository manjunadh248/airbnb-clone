import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from database import engine, SessionLocal, Base
import models

# Recreate DB tables
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

def seed_db():
    db = SessionLocal()
    
    # Amenities
    amenity_names = [
        ("Wifi", "wifi"), ("Kitchen", "kitchen"), ("Pool", "pool"),
        ("Air conditioning", "ac"), ("Free parking", "parking"),
        ("TV", "tv"), ("Washer", "washer"), ("Dryer", "dryer"),
        ("Heating", "heating"), ("Dedicated workspace", "workspace")
    ]
    db_amenities = []
    for name, icon in amenity_names:
        am = models.Amenity(name=name, icon=icon)
        db.add(am)
        db_amenities.append(am)
    db.commit()
    
    # Users (Hosts & Guests)
    hosts = []
    for i in range(1, 11):
        user = models.User(
            name=f"Host User {i}",
            email=f"host{i}@example.com",
            role="host",
            avatar_url=f"https://ui-avatars.com/api/?name=Host+{i}&background=FF385C&color=fff",
            is_superhost=random.choice([True, False])
        )
        db.add(user)
        hosts.append(user)
    
    guests = []
    for i in range(1, 6):
        user = models.User(
            name=f"Guest User {i}",
            email=f"guest{i}@example.com",
            role="guest",
            avatar_url=f"https://ui-avatars.com/api/?name=Guest+{i}&background=222222&color=fff",
        )
        db.add(user)
        guests.append(user)
    db.commit()

    # Listings
    cities = ["New Delhi", "Goa", "Mumbai", "Bangalore", "Jaipur", "Manali", "Udaipur", "Kerala", "Shimla"]
    property_types = ["Apartment", "House", "Villa", "Cabin", "Cottage"]
    room_types = ["Entire home/apt", "Private room"]

    sample_images = [
        "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=800&q=80"
    ]

    listings = []
    for i in range(1, 41):
        host = random.choice(hosts)
        city = random.choice(cities)
        prop_type = random.choice(property_types)
        listing = models.Listing(
            host_id=host.id,
            title=f"Beautiful {prop_type} in {city}",
            description=f"Experience the best of {city} in this lovely {prop_type.lower()}. Perfect for your getaway with amazing amenities and a great location.",
            property_type=prop_type,
            room_type=random.choice(room_types),
            price_per_night=round(random.uniform(2000, 20000), 2),
            currency="INR",
            location_city=city,
            location_country="India",
            max_guests=random.randint(2, 10),
            bedrooms=random.randint(1, 5),
            beds=random.randint(1, 6),
            baths=random.choice([1.0, 1.5, 2.0, 2.5, 3.0])
        )
        db.add(listing)
        db.flush()
        
        # Add random images
        num_images = random.randint(4, 6)
        imgs = random.sample(sample_images, num_images)
        for idx, img in enumerate(imgs):
            l_img = models.ListingImage(listing_id=listing.id, image_url=img, sort_order=idx)
            db.add(l_img)
            
        # Add random amenities
        num_amenities = random.randint(3, len(db_amenities))
        listing.amenities = random.sample(db_amenities, num_amenities)
        listings.append(listing)
    
    db.commit()

    # Bookings & Reviews
    for listing in listings:
        if random.random() > 0.3: # 70% chance of having bookings
            num_bookings = random.randint(1, 5)
            for _ in range(num_bookings):
                guest = random.choice(guests)
                start_days = random.randint(-60, 60)
                check_in = datetime.utcnow().date() + timedelta(days=start_days)
                stay_length = random.randint(1, 7)
                check_out = check_in + timedelta(days=stay_length)
                
                booking = models.Booking(
                    listing_id=listing.id,
                    guest_id=guest.id,
                    check_in=check_in,
                    check_out=check_out,
                    guests_count=random.randint(1, listing.max_guests),
                    nightly_rate_snapshot=listing.price_per_night,
                    total_price=listing.price_per_night * stay_length,
                    status='completed' if check_out < datetime.utcnow().date() else 'confirmed'
                )
                db.add(booking)
                db.flush()
                
                # If completed, leave a review
                if booking.status == 'completed' and random.random() > 0.2:
                    review = models.Review(
                        listing_id=listing.id,
                        booking_id=booking.id,
                        guest_id=guest.id,
                        rating=random.choice([4.0, 4.5, 5.0, 5.0, 5.0]), # Skewed positive like Airbnb
                        comment="Great stay, highly recommended! The host was wonderful and the place was exactly as described."
                    )
                    db.add(review)
                    
    db.commit()
    db.close()
    print("Database seeded successfully!")

if __name__ == "__main__":
    seed_db()
