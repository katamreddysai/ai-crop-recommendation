from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SoilTestInfo(BaseModel):
    n: Optional[int] = Field(None, description="Measured Nitrogen level (mg/kg)")
    p: Optional[int] = Field(None, description="Measured Phosphorus level (mg/kg)")
    k: Optional[int] = Field(None, description="Measured Potassium level (mg/kg)")
    ph: Optional[float] = Field(None, description="Measured Soil pH")

class RecommendRequest(BaseModel):
    farmer_name: Optional[str] = Field(None, example="Ramesh Kumar")
    location: str = Field(..., example="Pune, Maharashtra")
    season: str = Field(..., example="Kharif")
    soil_type: str = Field(..., example="Black")
    irrigation: bool = Field(..., example=True)
    previous_crop: str = Field(..., example="Legumes")
    soil_test_info: Optional[SoilTestInfo] = None

class EstimatedFeatures(BaseModel):
    n: float
    p: float
    k: float
    ph: float
    temperature: float
    humidity: float
    rainfall: float

class CropDetails(BaseModel):
    about: str
    planting_tips: str
    growth_duration: str
    market_demand: str

class TopRecommendation(BaseModel):
    crop: str
    probability: float

class RecommendResponse(BaseModel):
    recommended_crop: str
    confidence: float
    top_recommendations: List[TopRecommendation]
    estimated_features: EstimatedFeatures
    crop_details: CropDetails

class PredictionHistoryResponse(BaseModel):
    id: int
    farmer_name: Optional[str]
    location: str
    season: str
    soil_type: str
    irrigation: bool
    previous_crop: str
    soil_test_used: bool
    calculated_n: int
    calculated_p: int
    calculated_k: int
    calculated_ph: float
    calculated_temp: float
    calculated_humidity: float
    calculated_rainfall: float
    recommended_crop: str
    confidence: float
    top_recommendations: Optional[List[TopRecommendation]] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class OptionsResponse(BaseModel):
    seasons: List[str]
    soil_types: List[str]
    previous_crops: List[str]
