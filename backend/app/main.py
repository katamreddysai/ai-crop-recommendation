from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .models import SoilBaseline, CropNutrientEffect
from .api.endpoints import router
import logging
import os
from dotenv import load_dotenv

load_dotenv(override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI-Based Crop Recommendation API",
    description="A farmer-friendly backend translation and estimation model for crop recommendations.",
    version="1.0.0"
)

# Enable CORS for React frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Router
app.include_router(router, prefix="/api")

def seed_database():
    """
    Seeds default soil baselines and nutrient modifiers if database is empty.
    """
    db = SessionLocal()
    try:
        # Check if soil baselines are already seeded
        if db.query(SoilBaseline).count() == 0:
            logger.info("Seeding soil_baselines table...")
            baselines = [
                SoilBaseline(soil_type="Black", base_n=50, base_p=45, base_k=50, base_ph=7.8),
                SoilBaseline(soil_type="Red", base_n=65, base_p=35, base_k=40, base_ph=6.2),
                SoilBaseline(soil_type="Alluvial", base_n=80, base_p=50, base_k=70, base_ph=7.0),
                SoilBaseline(soil_type="Sandy", base_n=30, base_p=25, base_k=30, base_ph=6.0),
                SoilBaseline(soil_type="Clayey", base_n=60, base_p=40, base_k=55, base_ph=6.6),
                SoilBaseline(soil_type="Loamy", base_n=75, base_p=45, base_k=60, base_ph=6.8)
            ]
            db.bulk_save_objects(baselines)
            db.commit()
            logger.info("Successfully seeded soil_baselines.")
            
        # Check if crop adjustments are already seeded
        if db.query(CropNutrientEffect).count() == 0:
            logger.info("Seeding crop_nutrient_effects table...")
            effects = [
                CropNutrientEffect(previous_crop="Legumes", n_adjust=20, p_adjust=5, k_adjust=5),
                CropNutrientEffect(previous_crop="Rice/Wheat", n_adjust=-10, p_adjust=-5, k_adjust=-10),
                CropNutrientEffect(previous_crop="Sugarcane", n_adjust=-25, p_adjust=-15, k_adjust=-20),
                CropNutrientEffect(previous_crop="Maize", n_adjust=-15, p_adjust=-10, k_adjust=-15),
                CropNutrientEffect(previous_crop="None/Fallow", n_adjust=5, p_adjust=2, k_adjust=5)
            ]
            db.bulk_save_objects(effects)
            db.commit()
            logger.info("Successfully seeded crop_nutrient_effects.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
    finally:
        db.close()

@app.on_event("startup")
def startup_db_setup():
    logger.info("Initializing database schemas...")
    Base.metadata.create_all(bind=engine)
    seed_database()
    logger.info("FastAPI backend bootstrap complete!")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "AI Crop Recommendation backend API service is operational."
    }
