import os
import joblib
import numpy as np
import logging
from typing import Tuple, List, Dict

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "..", "ml", "model", "random_forest.joblib"
)

# Global variables for model caching
_model = None

def get_model():
    """
    Loads and caches the Random Forest model from the serialized file.
    Raises RuntimeError if the model file is not found.
    """
    global _model
    if _model is not None:
        return _model
        
    if os.path.exists(MODEL_PATH):
        try:
            logger.info(f"Loading trained crop recommendation model from: {MODEL_PATH}")
            _model = joblib.load(MODEL_PATH)
            return _model
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise RuntimeError(f"Error loading trained ML model: {e}")
            
    raise RuntimeError(
        "Trained Machine Learning model file (random_forest.joblib) not found. "
        "Please run the model training script (backend/ml/train.py) before starting the server."
    )

def predict_crop(
    n: float, p: float, k: float, temp: float, humidity: float, ph: float, rainfall: float
) -> Tuple[str, float, List[Dict[str, any]]]:
    """
    Inputs: N, P, K, temperature, humidity, pH, rainfall
    Returns: (predicted_crop_label, confidence_score, top_3_recommendations_list)
    """
    model = get_model()
    
    # Feature vector shape (1, 7) - exactly matches ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    features = np.array([[n, p, k, temp, humidity, ph, rainfall]])
    
    # Run inference
    # 1. Predict class
    prediction = model.predict(features)[0]
    
    # 2. Get probabilities for all classes
    probabilities = model.predict_proba(features)[0]
    classes = model.classes_
    
    # 3. Sort indices descending by probability and grab top 3
    top_indices = np.argsort(probabilities)[::-1][:3]
    
    top_recommendations = []
    for idx in top_indices:
        top_recommendations.append({
            "crop": str(classes[idx]).lower(),
            "probability": round(float(probabilities[idx]), 4)
        })
        
    recommended_crop = str(prediction).lower()
    # Find matching confidence of top crop
    class_idx = np.where(classes == prediction)[0][0]
    confidence = round(float(probabilities[class_idx]), 4)
    
    return recommended_crop, confidence, top_recommendations
