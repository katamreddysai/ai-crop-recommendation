import os
import json
import urllib.request
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

# Paths
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
DATA_FILE = os.path.join(DATA_DIR, "Crop_recommendation.csv")
MODEL_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "model")
MODEL_FILE = os.path.join(MODEL_DIR, "random_forest.joblib")
METADATA_FILE = os.path.join(MODEL_DIR, "metadata.json")

# Direct URL to standard Crop Recommendation Dataset (Gladiator07/Harvestify processed data)
DATASET_URL = "https://raw.githubusercontent.com/Gladiator07/Harvestify/master/Data-processed/crop_recommendation.csv"

def download_dataset():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
        print(f"Created data directory: {DATA_DIR}")
        
    if not os.path.exists(DATA_FILE):
        print(f"Dataset not found locally. Downloading from: {DATASET_URL}")
        try:
            # Set user-agent header to avoid blocked downloads
            req = urllib.request.Request(
                DATASET_URL, 
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            with urllib.request.urlopen(req) as response, open(DATA_FILE, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Successfully downloaded and saved dataset to {DATA_FILE}")
        except Exception as e:
            print(f"Error downloading dataset: {e}")
            raise e
    else:
        print(f"Dataset already exists at: {DATA_FILE}")

def train_model():
    print("Loading dataset...")
    df = pd.read_csv(DATA_FILE)
    
    # Clean column names (strip whitespace just in case)
    df.columns = df.columns.str.strip()
    
    # 2. Validate columns
    expected_columns = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall', 'label']
    for col in expected_columns:
        if col not in df.columns:
            raise ValueError(f"Missing expected column '{col}' in the dataset.")
            
    print(f"Dataset shape: {df.shape}")
    
    # 3. Check missing values
    missing_count = df.isnull().sum().sum()
    print(f"Total missing values in dataset: {missing_count}")
    if missing_count > 0:
        print("Handling missing values (dropping)...")
        df = df.dropna()
        
    # Split features and target
    features_list = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[features_list]
    y = df['label']
    
    # 4. Split into train/test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print(f"Training set size: {X_train.shape[0]}")
    print(f"Testing set size: {X_test.shape[0]}")
    
    # 5. Train Random Forest
    print("Training RandomForestClassifier...")
    model = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    model.fit(X_train, y_train)
    
    # 6. Evaluate accuracy
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\nModel Accuracy on test set: {accuracy * 100:.2f}%")
    
    # 7. Generate classification report
    report = classification_report(y_test, y_pred, output_dict=True)
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # 8. Save trained model
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR)
        print(f"Created model directory: {MODEL_DIR}")
        
    print(f"Saving serialized model to: {MODEL_FILE}")
    joblib.dump(model, MODEL_FILE)
    
    # 9 & 10. Save list/order of features and class labels in metadata.json
    class_labels = [str(c) for c in model.classes_]
    metadata = {
        "dataset_size": int(df.shape[0]),
        "features": features_list,
        "classes": class_labels,
        "accuracy": float(accuracy),
        "number_of_classes": len(class_labels)
    }
    
    with open(METADATA_FILE, 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print(f"Saved model metadata to: {METADATA_FILE}")
    print("Model training pipeline complete!")

if __name__ == "__main__":
    download_dataset()
    train_model()
