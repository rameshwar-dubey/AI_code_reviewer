"""
ML Model Training Script
Trains the code quality assessment model
"""

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
import pickle
import os
from feature_extractor import CodeFeatureExtractor


def generate_training_data(n_samples=200):
    """
    Generate synthetic training data for code quality
    
    In production, this would use real code samples from databases
    """
    training_data = []
    
    # Good code examples (quality_score > 75)
    good_code_samples = [
        """
def calculate_total(items):
    '''Calculate total price of items.'''
    total = 0
    for item in items:
        if item.get('price', 0) > 0:
            total += item['price'] * item.get('quantity', 1)
    return total
        """,
        """
def validate_email(email):
    '''Validate email format.'''
    if not email or '@' not in email:
        raise ValueError('Invalid email')
    return True
        """,
        """
class UserManager:
    '''Manages user operations.'''
    
    def __init__(self):
        self.users = []
    
    def add_user(self, user):
        '''Add a new user.'''
        if user not in self.users:
            self.users.append(user)
        return True
        """,
    ]
    
    # Medium quality code (quality_score 50-75)
    medium_code_samples = [
        """
def calculateTotal(items):
    total=0
    for item in items:
        if item['price']>0:
            total = total + item['price']
    return total
        """,
        """
def validate_email(email):
    if not email:
        return False
    if '@' not in email:
        return False
    if '.' not in email:
        return False
    return True
        """,
        """
class UserManager:
    def __init__(self):
        self.users = []
    def add_user(self, user):
        self.users.append(user)
        return True
    def remove_user(self, user):
        self.users.remove(user)
        return True
        """,
    ]
    
    # Poor quality code (quality_score < 50)
    poor_code_samples = [
        """
def ct(i):
    t=0
    for x in i:
        if x['p']>0:
            if x['q']>0:
                if x['a']:
                    t=t+x['p']*x['q']
    return t
        """,
        """
def ve(e):
    if e and '@' in e and '.' in e and len(e)>5:
        return True
    return False
        """,
        """
def process_data(d):
    r = []
    for item in d:
        if item > 0:
            for sub in d:
                if sub > 0:
                    for s in d:
                        if s > 0:
                            r.append(item + sub + s)
    return r
        """,
    ]
    
    X_data = []
    y_data = []
    
    # Extract features from good code
    for code in good_code_samples:
        features = CodeFeatureExtractor.extract_features(code)
        feature_vector = [
            features.get('num_lines', 0),
            features.get('num_characters', 0),
            features.get('num_words', 0),
            features.get('num_functions', 0),
            features.get('avg_function_length', 0),
            features.get('max_nesting_depth', 0),
            features.get('num_unused_vars', 0),
            features.get('num_comments', 0),
            features.get('comment_ratio', 0),
            features.get('has_error_handling', 0),
            features.get('has_type_hints', 0),
            features.get('cyclomatic_complexity', 0),
            features.get('complexity_score', 0),
            features.get('maintainability_score', 0),
        ]
        X_data.append(feature_vector)
        y_data.append(1)  # Good quality
    
    # Extract features from medium code
    for code in medium_code_samples:
        features = CodeFeatureExtractor.extract_features(code)
        feature_vector = [
            features.get('num_lines', 0),
            features.get('num_characters', 0),
            features.get('num_words', 0),
            features.get('num_functions', 0),
            features.get('avg_function_length', 0),
            features.get('max_nesting_depth', 0),
            features.get('num_unused_vars', 0),
            features.get('num_comments', 0),
            features.get('comment_ratio', 0),
            features.get('has_error_handling', 0),
            features.get('has_type_hints', 0),
            features.get('cyclomatic_complexity', 0),
            features.get('complexity_score', 0),
            features.get('maintainability_score', 0),
        ]
        X_data.append(feature_vector)
        y_data.append(0)  # Medium quality
    
    # Extract features from poor code
    for code in poor_code_samples:
        features = CodeFeatureExtractor.extract_features(code)
        feature_vector = [
            features.get('num_lines', 0),
            features.get('num_characters', 0),
            features.get('num_words', 0),
            features.get('num_functions', 0),
            features.get('avg_function_length', 0),
            features.get('max_nesting_depth', 0),
            features.get('num_unused_vars', 0),
            features.get('num_comments', 0),
            features.get('comment_ratio', 0),
            features.get('has_error_handling', 0),
            features.get('has_type_hints', 0),
            features.get('cyclomatic_complexity', 0),
            features.get('complexity_score', 0),
            features.get('maintainability_score', 0),
        ]
        X_data.append(feature_vector)
        y_data.append(-1)  # Poor quality
    
    return np.array(X_data), np.array(y_data)


def train_model():
    """Train the ML model"""
    
    print("=" * 60)
    print("ML MODEL TRAINING")
    print("=" * 60)
    
    # Generate training data
    print("\n1️⃣ Generating training data...")
    X, y = generate_training_data()
    print(f"   Generated {len(X)} training samples")
    print(f"   Features per sample: {len(X[0])}")
    
    # Split data
    print("\n2️⃣ Splitting data (80% train, 20% test)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"   Training samples: {len(X_train)}")
    print(f"   Test samples: {len(X_test)}")
    
    # Scale features
    print("\n3️⃣ Scaling features...")
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print("   ✓ Features scaled")
    
    # Train model
    print("\n4️⃣ Training RandomForestClassifier...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        min_samples_split=5,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train_scaled, y_train)
    print("   ✓ Model trained")
    
    # Evaluate model
    print("\n5️⃣ Evaluating model...")
    train_score = model.score(X_train_scaled, y_train)
    test_score = model.score(X_test_scaled, y_test)
    print(f"   Training accuracy: {train_score:.2%}")
    print(f"   Test accuracy: {test_score:.2%}")
    
    # Feature importance
    print("\n6️⃣ Feature importance:")
    feature_names = [
        'num_lines', 'num_characters', 'num_words', 'num_functions',
        'avg_function_length', 'max_nesting_depth', 'num_unused_vars',
        'num_comments', 'comment_ratio', 'has_error_handling',
        'has_type_hints', 'cyclomatic_complexity', 'complexity_score',
        'maintainability_score'
    ]
    
    importances = model.feature_importances_
    for name, importance in sorted(
        zip(feature_names, importances), 
        key=lambda x: x[1], 
        reverse=True
    )[:5]:
        print(f"   • {name}: {importance:.4f}")
    
    # Save model
    print("\n7️⃣ Saving model and scaler...")
    
    # Create models directory if it doesn't exist
    models_dir = os.path.join(os.path.dirname(__file__), 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # Save model
    model_path = os.path.join(models_dir, 'quality_model.pkl')
    with open(model_path, 'wb') as f:
        pickle.dump(model, f)
    print(f"   ✓ Model saved to {model_path}")
    
    # Save scaler
    scaler_path = os.path.join(models_dir, 'scaler.pkl')
    with open(scaler_path, 'wb') as f:
        pickle.dump(scaler, f)
    print(f"   ✓ Scaler saved to {scaler_path}")
    
    print("\n" + "=" * 60)
    print("✓ TRAINING COMPLETE")
    print("=" * 60)
    print("\nThe ML model is now ready to use!")
    print("Start the ML service with: python app.py")
    print("\nModel will be used for:")
    print("  • Code quality scoring (0-100)")
    print("  • Risk level assessment (Low/Medium/High)")
    print("  • Feature extraction for error detection")
    

if __name__ == "__main__":
    train_model()
