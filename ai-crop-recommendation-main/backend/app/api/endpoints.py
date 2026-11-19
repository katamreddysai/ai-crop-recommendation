from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import PredictionHistory
from ..schemas import RecommendRequest, RecommendResponse, PredictionHistoryResponse, OptionsResponse, EstimatedFeatures, CropDetails
from ..core.estimator import estimate_soil_parameters, adjust_rainfall_for_irrigation
from ..core.weather import get_seasonal_weather
from ..core.predictor import predict_crop
from typing import List

router = APIRouter()

# Comprehensive database of farmer guides for all 22 crop labels in the training dataset
CROP_KNOWLEDGE_BASE = {
    "rice": {
        "about": "Rice is a primary staple crop, cultivated extensively in water-abundant, warm regions.",
        "planting_tips": "Sow seeds in nurseries first. Transplant healthy 25-day-old seedlings into puddled fields. Maintain 2-5 cm of standing water during initial growth phases.",
        "growth_duration": "120 - 150 days",
        "market_demand": "Very High (Stable domestic and export demand)"
    },
    "maize": {
        "about": "Maize (Corn) is a highly versatile cereal crop suited for food, fodder, and industrial usage.",
        "planting_tips": "Plant seeds directly in ridges at a depth of 3-5 cm. Ensure proper drainage to avoid waterlogging which damages roots.",
        "growth_duration": "90 - 110 days",
        "market_demand": "High (Strong demand from poultry feed and starch industries)"
    },
    "chickpea": {
        "about": "Chickpea (Bengal Gram) is a vital winter pulse crop requiring cold temperatures and dry climates.",
        "planting_tips": "Sow in seedbeds with residual moisture. Avoid excessive nitrogen fertilizer as chickpeas fix their own nitrogen.",
        "growth_duration": "110 - 130 days",
        "market_demand": "High (Major source of protein in South Asian diets)"
    },
    "kidneybeans": {
        "about": "Kidney beans (Rajma) are highly nutritious pulses rich in protein and dietary fiber.",
        "planting_tips": "Sow in well-drained loamy soil. Requires moderate irrigation; avoid water stagnation.",
        "growth_duration": "90 - 120 days",
        "market_demand": "Medium-High (Premium pulse category with stable market pricing)"
    },
    "pigeonpeas": {
        "about": "Pigeonpeas (Arhar/Tur) are deep-rooted perennial legumes highly resistant to drought.",
        "planting_tips": "Typically intercropped with cereals like sorghum or maize. Requires minimal watering after root establishment.",
        "growth_duration": "150 - 180 days",
        "market_demand": "Very High (Primary pulse consumed in India)"
    },
    "mothbeans": {
        "about": "Moth bean is an exceptionally drought-resistant legume grown in arid and semi-arid zones.",
        "planting_tips": "Sow in light sandy soil after the first monsoon shower. Requires very little nutrients.",
        "growth_duration": "75 - 90 days",
        "market_demand": "Medium (Popular in arid regions, used for snacks like bhujia)"
    },
    "mungbean": {
        "about": "Mungbean (Green Gram) is a short-duration pulse crop that fits well in multi-cropping systems.",
        "planting_tips": "Can be grown in Kharif, Rabi, or Summer seasons. Ensure seed treatment for root rot prevention.",
        "growth_duration": "60 - 75 days",
        "market_demand": "High (Quick cash crop for farmers between main seasons)"
    },
    "blackgram": {
        "about": "Blackgram (Urad Dal) is a nutritious pulse crop widely grown for both food and soil cover.",
        "planting_tips": "Sow in warm conditions. Excellent crop for crop-rotation to enhance soil nitrogen levels.",
        "growth_duration": "70 - 85 days",
        "market_demand": "High (Extensively used in staple food items like idli/dosa)"
    },
    "lentil": {
        "about": "Lentil (Masoor) is a cool-season winter pulse crop grown on a wide range of soils.",
        "planting_tips": "Sow in late autumn. Requires cool climate for growth and dry weather during maturity.",
        "growth_duration": "120 - 140 days",
        "market_demand": "High (Stable demand throughout the year)"
    },
    "pomegranate": {
        "about": "Pomegranate is a high-value fruit crop adapted to dry, arid climates with access to irrigation.",
        "planting_tips": "Propagated via cuttings. Use drip irrigation for optimal fruit development. Prune regularly for high yields.",
        "growth_duration": "2 - 3 years to first commercial harvest (Perennial)",
        "market_demand": "Very High (Premium pricing, great export potential)"
    },
    "banana": {
        "about": "Banana is a tropical herbaceous plant grown for its delicious fruit, requiring hot and humid conditions.",
        "planting_tips": "Plant tissue-cultured suckers in deep pits. Requires heavy organic manuring and consistent soil moisture.",
        "growth_duration": "10 - 12 months",
        "market_demand": "Very High (Continuous daily demand in domestic markets)"
    },
    "mango": {
        "about": "Mango is the 'King of Fruits', a long-lived perennial tree thriving in tropical and subtropical regions.",
        "planting_tips": "Plant grafted saplings. Protect young plants from frost. Requires dry weather during flowering for fruit set.",
        "growth_duration": "4 - 5 years to first fruiting (Perennial)",
        "market_demand": "Very High (Highly seasonal premium demand and exports)"
    },
    "grapes": {
        "about": "Grapes are woody deciduous vines cultivated for fresh consumption, raisins, or winemaking.",
        "planting_tips": "Train vines on a trellis system. Requires intensive pruning in winter and careful drip irrigation management.",
        "growth_duration": "2 - 3 years to full production (Perennial)",
        "market_demand": "High (High returns on capital investment)"
    },
    "watermelon": {
        "about": "Watermelon is a warm-season vining fruit crop rich in water content and refreshing sugars.",
        "planting_tips": "Sow seeds in sandy riverbeds or raised beds. Needs plenty of sunlight and warm temperatures.",
        "growth_duration": "80 - 100 days",
        "market_demand": "High (Seasonal summer boom with fast liquidation)"
    },
    "muskmelon": {
        "about": "Muskmelon is a sweet, aromatic dessert melon cultivated during hot summer months.",
        "planting_tips": "Grown similarly to watermelons. Ensure dry atmosphere during fruit ripening to develop high sugar content.",
        "growth_duration": "75 - 90 days",
        "market_demand": "High (Premium seasonal summer pricing)"
    },
    "apple": {
        "about": "Apple is a temperate pomaceous fruit crop requiring cold chill-hours during winter to break dormancy.",
        "planting_tips": "Thrives on high altitudes (above 1500m MSL). Plant in well-drained loamy soils on slopes.",
        "growth_duration": "3 - 5 years to fruiting (Perennial)",
        "market_demand": "Very High (Highly valued in domestic supply chain)"
    },
    "orange": {
        "about": "Orange (Citrus fruit) is a popular evergreen tree grown for citrus juice and fresh consumption.",
        "planting_tips": "Plant budded plants. Avoid waterlogged soils to prevent root rot. Feed regularly with micronutrients.",
        "growth_duration": "3 - 4 years to fruiting (Perennial)",
        "market_demand": "High (Constant demand from processing industries)"
    },
    "papaya": {
        "about": "Papaya is a fast-growing herbaceous tree yielding delicious fruit rich in Vitamin A and Papain.",
        "planting_tips": "Sow seeds in polythene bags, transplant when 20 cm tall. Plant both male and female plants for pollination.",
        "growth_duration": "9 - 10 months",
        "market_demand": "High (Quick returns for fruit farmers)"
    },
    "coconut": {
        "about": "Coconut is a versatile palm tree grown in coastal saline-tolerant sandy regions.",
        "planting_tips": "Plant high-quality seed-nuts in deep pits with salt and organic compost. Space palms at least 7.5 meters apart.",
        "growth_duration": "5 - 7 years to first harvest (Perennial)",
        "market_demand": "Very High (Steady demand for oil, tender water, and copra)"
    },
    "cotton": {
        "about": "Cotton is the leading fiber cash crop, cultivated in warm climates with moderate rainfall.",
        "planting_tips": "Thrives best in deep black soils that retain moisture. Control sucking pests during early vegetative growth.",
        "growth_duration": "150 - 180 days",
        "market_demand": "Very High (Staple raw material for textile industries)"
    },
    "jute": {
        "about": "Jute is a natural bast fiber crop (golden fiber) requiring high temperature and heavy rainfall.",
        "planting_tips": "Broadcast or line-sow seeds in damp alluvial soil. Harvest at flowering stage for premium fiber quality.",
        "growth_duration": "120 - 140 days",
        "market_demand": "Medium-High (Increasing demand due to global plastic bans)"
    },
    "coffee": {
        "about": "Coffee is a premium beverage plantation crop grown under shade at higher altitudes.",
        "planting_tips": "Grown on sloping hill terrains under forest shade canopy. Requires balanced rainfall followed by dry period.",
        "growth_duration": "3 - 4 years to fruiting (Perennial)",
        "market_demand": "Very High (Global cash commodity with strong export channels)"
    }
}

@router.post("/recommend", response_model=RecommendResponse)
async def get_recommendation(request: RecommendRequest, db: Session = Depends(get_db)):
    """
    Coordinates weather parameters retrieval, soil chemistry estimation,
    prediction model runner, and logs the action into the SQLite history.
    """
    import json
    
    # 1. Estimate Soil parameters (N, P, K, pH)
    n, p, k, ph, test_used = estimate_soil_parameters(
        db, request.soil_type, request.previous_crop, request.soil_test_info
    )
    
    # 2. Fetch Weather parameters (Temp, Humidity, Rainfall)
    try:
        temp, humidity, raw_rainfall = await get_seasonal_weather(request.location, request.season)
    except Exception as e:
        # Emergency fallback if something broke down completely in the weather routines
        temp, humidity, raw_rainfall = 27.0, 75.0, 500.0
        
    # 3. Adjust rainfall parameter based on irrigation availability
    adjusted_rainfall = adjust_rainfall_for_irrigation(raw_rainfall, request.irrigation)
    
    # 4. Predict crop using standard RandomForest model
    crop, confidence, top_recs = predict_crop(n, p, k, temp, humidity, ph, adjusted_rainfall)
    
    # 5. Fetch crop guide metadata
    crop_info = CROP_KNOWLEDGE_BASE.get(
        crop.lower(), 
        {
            "about": "This crop thrives under the estimated conditions.",
            "planting_tips": "Maintain standard spacing, weed control, and balanced NPK fertilizer usage.",
            "growth_duration": "Varies by variety",
            "market_demand": "Stable"
        }
    )
    
    # 6. Save prediction history to Database
    try:
        db_history = PredictionHistory(
            farmer_name=request.farmer_name,
            location=request.location,
            season=request.season,
            soil_type=request.soil_type,
            irrigation=request.irrigation,
            previous_crop=request.previous_crop,
            soil_test_used=test_used,
            calculated_n=int(n),
            calculated_p=int(p),
            calculated_k=int(k),
            calculated_ph=round(ph, 1),
            calculated_temp=round(temp, 1),
            calculated_humidity=round(humidity, 1),
            calculated_rainfall=round(adjusted_rainfall, 1),
            recommended_crop=crop,
            confidence=confidence,
            top_recommendations=json.dumps(top_recs)
        )
        db.add(db_history)
        db.commit()
        db.refresh(db_history)
    except Exception as e:
        # Log error but don't fail user request
        db.rollback()
        # logger.error(f"Failed to save prediction log: {e}")
        
    # 7. Package Response
    formatted_recs = [{"crop": item["crop"].capitalize(), "probability": item["probability"]} for item in top_recs]
    return RecommendResponse(
        recommended_crop=crop.capitalize(),
        confidence=confidence,
        top_recommendations=formatted_recs,
        estimated_features=EstimatedFeatures(
            n=n, p=p, k=k, ph=ph,
            temperature=temp, humidity=humidity, rainfall=adjusted_rainfall
        ),
        crop_details=CropDetails(
            about=crop_info["about"],
            planting_tips=crop_info["planting_tips"],
            growth_duration=crop_info["growth_duration"],
            market_demand=crop_info["market_demand"]
        )
    )

@router.get("/history", response_model=List[PredictionHistoryResponse])
def get_prediction_history(db: Session = Depends(get_db)):
    """
    Fetches the prediction logs, ordering by date descending.
    """
    import json
    history_logs = db.query(PredictionHistory).order_by(PredictionHistory.timestamp.desc()).limit(50).all()
    
    results = []
    for log in history_logs:
        top_recs = []
        if log.top_recommendations:
            try:
                raw_recs = json.loads(log.top_recommendations)
                top_recs = [{"crop": item["crop"].capitalize(), "probability": item["probability"]} for item in raw_recs]
            except Exception:
                pass
                
        results.append(
            PredictionHistoryResponse(
                id=log.id,
                farmer_name=log.farmer_name,
                location=log.location,
                season=log.season,
                soil_type=log.soil_type,
                irrigation=log.irrigation,
                previous_crop=log.previous_crop,
                soil_test_used=log.soil_test_used,
                calculated_n=log.calculated_n,
                calculated_p=log.calculated_p,
                calculated_k=log.calculated_k,
                calculated_ph=log.calculated_ph,
                calculated_temp=log.calculated_temp,
                calculated_humidity=log.calculated_humidity,
                calculated_rainfall=log.calculated_rainfall,
                recommended_crop=log.recommended_crop,
                confidence=log.confidence,
                top_recommendations=top_recs,
                timestamp=log.timestamp
            )
        )
    return results

@router.get("/options", response_model=OptionsResponse)
def get_available_options():
    """
    Returns dropdown listing configurations to frontend.
    """
    return OptionsResponse(
        seasons=["Kharif", "Rabi", "Zaid"],
        soil_types=["Black", "Red", "Alluvial", "Sandy", "Clayey", "Loamy"],
        previous_crops=["Legumes", "Rice/Wheat", "Sugarcane", "Maize", "None/Fallow"]
    )
