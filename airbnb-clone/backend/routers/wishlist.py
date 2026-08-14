from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(prefix="/api/wishlist", tags=["wishlist"])

@router.get("", response_model=List[schemas.Wishlist])
def get_wishlist(user_id: int, db: Session = Depends(get_db)):
    wishlists = db.query(models.Wishlist).filter(models.Wishlist.user_id == user_id).all()
    return wishlists

@router.post("/{listing_id}", response_model=schemas.Wishlist)
def add_to_wishlist(listing_id: int, user_id: int, db: Session = Depends(get_db)):
    # Check if already exists
    existing = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == user_id,
        models.Wishlist.listing_id == listing_id
    ).first()
    
    if existing:
        return existing
        
    wishlist_item = models.Wishlist(user_id=user_id, listing_id=listing_id)
    db.add(wishlist_item)
    db.commit()
    db.refresh(wishlist_item)
    return wishlist_item

@router.delete("/{listing_id}")
def remove_from_wishlist(listing_id: int, user_id: int, db: Session = Depends(get_db)):
    wishlist_item = db.query(models.Wishlist).filter(
        models.Wishlist.user_id == user_id,
        models.Wishlist.listing_id == listing_id
    ).first()
    
    if not wishlist_item:
        raise HTTPException(status_code=404, detail="Wishlist item not found")
        
    db.delete(wishlist_item)
    db.commit()
    return {"message": "Successfully removed from wishlist"}
