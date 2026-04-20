"""
ML Model - Code Quality Scoring Model using scikit-learn
"""

import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from typing import Dict, Tuple
from feature_extractor import CodeFeatureExtractor


class CodeQualityModel:
    """Machine Learning model for code quality assessment"""
    
    def __init__(self):
        """Initialize the model"""
        self.scaler = StandardScaler()
        self.model = RandomForestClassifier(n_estimators=100, random_state=42)
        self.feature_names = [
            'num_lines', 'num_characters', 'num_words', 'num_functions',
            'avg_function_length', 'max_nesting_depth', 'num_unused_vars',
            'num_comments', 'comment_ratio', 'has_error_handling',
            'has_type_hints', 'cyclomatic_complexity', 'complexity_score',
            'maintainability_score'
        ]
        self.is_trained = False
        
    def train(self, X_train: np.ndarray, y_train: np.ndarray):
        """Train the model"""
        X_scaled = self.scaler.fit_transform(X_train)
        self.model.fit(X_scaled, y_train)
        self.is_trained = True
        
    def predict(self, features: Dict[str, float]) -> Tuple[float, str]:
        """
        Predict code quality score and risk level
        
        Args:
            features: Dictionary of extracted features
            
        Returns:
            Tuple of (score: 0-100, risk_level: 'Low'/'Medium'/'High')
        """
        # Convert features dict to array
        feature_vector = np.array([
            features.get(name, 0.0) for name in self.feature_names
        ]).reshape(1, -1)
        
        # If model is not trained, use heuristic scoring
        if not self.is_trained:
            return self._heuristic_score(features)
        
        # Scale features
        feature_scaled = self.scaler.transform(feature_vector)
        
        # Get probability predictions
        try:
            prediction = self.model.predict(feature_scaled)[0]
            probabilities = self.model.predict_proba(feature_scaled)[0]
            
            # Convert to score (0-100)
            score = float(probabilities[1] * 100) if len(probabilities) > 1 else 50.0
        except:
            score = self._calculate_base_score(features)
        
        # Determine risk level
        risk_level = self._determine_risk_level(score, features)
        
        return score, risk_level
    
    @staticmethod
    def _heuristic_score(features: Dict[str, float]) -> Tuple[float, str]:
        """
        Calculate score using heuristics when model is not trained
        
        Returns:
            Tuple of (score: 0-100, risk_level: 'Low'/'Medium'/'High')
        """
        score = CodeQualityModel._calculate_base_score(features)
        risk_level = CodeQualityModel._determine_risk_level(score, features)
        return score, risk_level
    
    @staticmethod
    def _calculate_base_score(features: Dict[str, float]) -> float:
        """Calculate base quality score"""
        score = features.get('maintainability_score', 50)
        
        # Adjust based on features
        if features.get('num_lines', 0) > 500:
            score -= 10
        
        if features.get('cyclomatic_complexity', 0) > 20:
            score -= 15
        
        if features.get('max_nesting_depth', 0) > 5:
            score -= 10
        
        if features.get('comment_ratio', 0) < 0.05:
            score -= 15
        
        if features.get('has_error_handling', 0) == 1:
            score += 10
        
        if features.get('has_type_hints', 0) == 1:
            score += 10
        
        return max(0, min(score, 100))
    
    @staticmethod
    def _determine_risk_level(score: float, features: Dict[str, float]) -> str:
        """
        Determine risk level based on score and features
        
        Returns:
            'Low', 'Medium', or 'High'
        """
        if score >= 80:
            return "Low"
        elif score >= 60:
            return "Medium"
        else:
            return "High"


# Initialize global model instance
model_instance = CodeQualityModel()


def extract_and_score(code: str) -> Dict:
    """
    Extract features and generate score for code
    
    Args:
        code: Source code string
        
    Returns:
        Dictionary with score, risk level, and features
    """
    try:
        # Extract features
        features = CodeFeatureExtractor.extract_features(code)
        
        # Get score and risk
        score, risk_level = model_instance.predict(features)
        
        return {
            'score': float(score),
            'risk_level': risk_level,
            'features': {k: float(v) for k, v in features.items()},
            'success': True
        }
    except Exception as e:
        return {
            'score': 50,
            'risk_level': 'Medium',
            'features': {},
            'success': False,
            'error': str(e)
        }
