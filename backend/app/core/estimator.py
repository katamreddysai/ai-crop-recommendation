from sqlalchemy.orm import Session
from ..models import SoilBaseline, CropNutrientEffect
from ..schemas import SoilTestInfo
import logging

logger = logging.getLogger(__name__)

# Hardcoded fallback values in case DB is not seeded or query fails
DEFAULT_SOIL_BASELINES = {
    "black": {"n": 50, "p": 45, "k": 50, "ph": 7.8},
    "red": {"n": 65, "p": 35, "k": 40, "ph": 6.2},
    "alluvial": {"n": 80, "p": 50, "k": 70, "ph": 7.0},
    "sandy": {"n": 30, "p": 25, "k": 30, "ph": 6.0},
    "clayey": {"n": 60, "p": 40, "k": 55, "ph": 6.6},
    "loamy": {"n": 75, "p": 45, "k": 60, "ph": 6.8}
}

DEFAULT_CROP_EFFECTS = {
    "legumes": {"n": 20, "p": 5, "k": 5},
    "rice/wheat": {"n": -10, "p": -5, "k": -10},
    "sugarcane": {"n": -25, "p": -15, "k": -20},
    "maize": {"n": -15, "p": -10, "k": -15},
    "none/fallow": {"n": 5, "p": 2, "k": 5}
}

def estimate_soil_parameters(
    db: Session,
    soil_type: str,
    previous_crop: str,
    soil_test_info: SoilTestInfo = None
) -> tuple[float, float, float, float, bool]:
    """
    Translates simple inputs (soil type, previous crop, optional soil test) into N, P, K, pH values.
    Returns: (N, P, K, pH, soil_test_used)
    """
    soil_type_clean = soil_type.strip().lower()
    prev_crop_clean = previous_crop.strip().lower()
    
    # 1. Start with baselines (check DB, fallback to memory if missing)
    base_n, base_p, base_k, base_ph = 60, 40, 50, 6.5
    db_baseline = db.query(SoilBaseline).filter(SoilBaseline.soil_type.ilike(soil_type_clean)).first() if db else None
    
    if db_baseline:
        base_n = db_baseline.base_n
        base_p = db_baseline.base_p
        base_k = db_baseline.base_k
        base_ph = db_baseline.base_ph
    elif soil_type_clean in DEFAULT_SOIL_BASELINES:
        fallback = DEFAULT_SOIL_BASELINES[soil_type_clean]
        base_n = fallback["n"]
        base_p = fallback["p"]
        base_k = fallback["k"]
        base_ph = fallback["ph"]
    else:
        # Generic fallback if soil type is unrecognized
        fallback = DEFAULT_SOIL_BASELINES["loamy"]
        base_n = fallback["n"]
        base_p = fallback["p"]
        base_k = fallback["k"]
        base_ph = fallback["ph"]

    # 2. Apply adjustments based on previous crop
    n_adj, p_adj, k_adj = 0, 0, 0
    db_effect = db.query(CropNutrientEffect).filter(CropNutrientEffect.previous_crop.ilike(prev_crop_clean)).first() if db else None
    
    if db_effect:
        n_adj = db_effect.n_adjust
        p_adj = db_effect.p_adjust
        k_adj = db_effect.k_adjust
    elif prev_crop_clean in DEFAULT_CROP_EFFECTS:
        fallback_eff = DEFAULT_CROP_EFFECTS[prev_crop_clean]
        n_adj = fallback_eff["n"]
        p_adj = fallback_eff["p"]
        k_adj = fallback_eff["k"]

    calc_n = max(5, base_n + n_adj)
    calc_p = max(5, base_p + p_adj)
    calc_k = max(5, base_k + k_adj)
    calc_ph = base_ph

    # 3. Override with soil test if provided
    soil_test_used = False
    if soil_test_info:
        if soil_test_info.n is not None:
            calc_n = soil_test_info.n
            soil_test_used = True
        if soil_test_info.p is not None:
            calc_p = soil_test_info.p
            soil_test_used = True
        if soil_test_info.k is not None:
            calc_k = soil_test_info.k
            soil_test_used = True
        if soil_test_info.ph is not None:
            calc_ph = soil_test_info.ph
            soil_test_used = True

    return float(calc_n), float(calc_p), float(calc_k), float(calc_ph), soil_test_used

def adjust_rainfall_for_irrigation(raw_rainfall: float, irrigation: bool) -> float:
    """
    If irrigation is available, we simulate a higher effective rainfall.
    This allows water-intensive crops (like rice/jute) to be recommended in seasons
    or regions where seasonal rain is insufficient, but the farmer has irrigation water.
    """
    if irrigation:
        # Boost rainfall parameter to represent abundant water availability.
        # In the crop recommendation dataset, rice/jute require rainfall between 140-300mm.
        # We ensure irrigation lifts the effective water levels to support high-yield crops.
        return max(raw_rainfall, 160.0)
    return raw_rainfall
