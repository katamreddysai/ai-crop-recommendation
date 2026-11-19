from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime
from datetime import datetime
from .database import Base

class SoilBaseline(Base):
    __tablename__ = "soil_baselines"

    id = Column(Integer, primary_key=True, index=True)
    soil_type = Column(String(50), unique=True, index=True, nullable=False)
    base_n = Column(Integer, nullable=False)
    base_p = Column(Integer, nullable=False)
    base_k = Column(Integer, nullable=False)
    base_ph = Column(Float, nullable=False)

class CropNutrientEffect(Base):
    __tablename__ = "crop_nutrient_effects"

    id = Column(Integer, primary_key=True, index=True)
    previous_crop = Column(String(50), unique=True, index=True, nullable=False)
    n_adjust = Column(Integer, nullable=False)
    p_adjust = Column(Integer, nullable=False)
    k_adjust = Column(Integer, nullable=False)

class PredictionHistory(Base):
    __tablename__ = "prediction_history"

    id = Column(Integer, primary_key=True, index=True)
    farmer_name = Column(String(100), nullable=True)
    location = Column(String(100), nullable=False)
    season = Column(String(50), nullable=False)
    soil_type = Column(String(50), nullable=False)
    irrigation = Column(Boolean, nullable=False)
    previous_crop = Column(String(50), nullable=False)
    soil_test_used = Column(Boolean, nullable=False, default=False)
    calculated_n = Column(Integer, nullable=False)
    calculated_p = Column(Integer, nullable=False)
    calculated_k = Column(Integer, nullable=False)
    calculated_ph = Column(Float, nullable=False)
    calculated_temp = Column(Float, nullable=False)
    calculated_humidity = Column(Float, nullable=False)
    calculated_rainfall = Column(Float, nullable=False)
    recommended_crop = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    top_recommendations = Column(String(500), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
