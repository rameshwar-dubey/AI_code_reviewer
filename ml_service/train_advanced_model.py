#!/usr/bin/env python3
"""
Enhanced ML Model Training Script
Trains and improves the code quality assessment model with comprehensive data
"""

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import pickle
import os
from datetime import datetime
from feature_extractor import CodeFeatureExtractor

print("\n" + "=" * 80)
print("🤖 ML MODEL TRAINING - COMPREHENSIVE TRAINING DATA")
print("=" * 80)

def generate_comprehensive_training_data(n_samples=500):
    """
    Generate comprehensive synthetic training data for code quality
    Includes Python, JavaScript, and Java examples
    """
    training_data = []
    
    print("\n📚 Generating training data...")
    print("   • High-quality code examples")
    print("   • Medium-quality code examples")
    print("   • Low-quality code examples")
    print("   • Multiple languages")
    
    # ===== HIGH QUALITY CODE EXAMPLES =====
    high_quality_samples = [
        # Python
        """
def calculate_total_price(items: list) -> float:
    '''
    Calculate the total price of all items.
    
    Args:
        items: List of items with price and quantity
        
    Returns:
        float: Total price
    '''
    total = 0.0
    for item in items:
        if item.get('price', 0) > 0 and item.get('quantity', 0) > 0:
            total += item['price'] * item['quantity']
    return total
        """,
        # Python with error handling
        """
def fetch_user_data(user_id: int) -> dict:
    '''Fetch user data from database.'''
    try:
        if not isinstance(user_id, int) or user_id <= 0:
            raise ValueError("Invalid user ID")
        # Fetch from database
        return {'id': user_id, 'name': 'User', 'status': 'active'}
    except ValueError as e:
        print(f"Error: {e}")
        return {}
        """,
        # JavaScript
        """
function calculateTotal(items) {
  // Calculate total price of items
  const validateItem = (item) => item && item.price > 0 && item.quantity > 0;
  const sum = items
    .filter(validateItem)
    .reduce((total, item) => total + (item.price * item.quantity), 0);
  return sum;
}
        """,
        # JavaScript with error handling
        """
async function fetchUserData(userId) {
  try {
    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}
        """,
        # Java
        """
public class UserManager {
    private List<User> users;
    
    public UserManager() {
        this.users = new ArrayList<>();
    }
    
    public boolean addUser(User user) throws IllegalArgumentException {
        if (user == null || user.getId() <= 0) {
            throw new IllegalArgumentException("Invalid user");
        }
        return users.add(user);
    }
}
        """,
    ]
    
    # ===== MEDIUM QUALITY CODE EXAMPLES =====
    medium_quality_samples = [
        # Python with issues
        """
def calculateTotal(items):
    total = 0
    for item in items:
        if item['price'] > 0:
            if item['quantity'] > 0:
                total = total + item['price'] * item['quantity']
    return total
        """,
        # JavaScript with var and no spacing
        """
function addNumbers(a,b){
var result=a+b;
if(result>0){
console.log("Sum is positive")
}
return result
}
        """,
        # Python without docstrings
        """
def process_data(data):
    result = []
    for item in data:
        if item['active'] == True:
            if item['status'] == 'valid':
                result.append(item)
    return result
        """,
        # JavaScript without error handling
        """
function getUserData(id) {
  const user = fetchFromAPI(id);
  const processed = processUser(user);
  const filtered = filterData(processed);
  return filtered;
}
        """,
    ]
    
    # ===== LOW QUALITY CODE EXAMPLES =====
    low_quality_samples = [
        # Terrible Python
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
        # Deeply nested JavaScript
        """
function process(d){
var r=[];
for(let i in d){
if(d[i]>0){
for(let j in d){
if(d[j]>0){
for(let k in d){
if(d[k]>0){
r.push(d[i]+d[j]+d[k])
}
}
}
}
}
}
return r;
}
        """,
        # Python with poor structure
        """
def getData(a,b,c):
    x=a+b+c
    if x>0:
        if x<100:
            if x%2==0:
                return x
    return 0
        """,
        # Java with no structure
        """
public class Utils{
public static void main(String[]args){
int a=5;int b=10;int c=a+b;
System.out.println(c);
}
}
        """,
    ]
    
    print("\n✓ Code samples prepared")
    
    X_data = []
    y_data = []
    
    # Process high quality samples
    print("   Processing high-quality samples (label: 1)...")
    for code in high_quality_samples * 3:  # Repeat to balance dataset
        try:
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
            y_data.append(1)  # High quality
        except Exception as e:
            print(f"   ⚠️  Error processing sample: {e}")
    
    # Process medium quality samples
    print("   Processing medium-quality samples (label: 0)...")
    for code in medium_quality_samples * 3:
        try:
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
        except Exception as e:
            print(f"   ⚠️  Error processing sample: {e}")
    
    # Process low quality samples
    print("   Processing low-quality samples (label: 0)...")
    for code in low_quality_samples * 3:
        try:
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
            y_data.append(0)  # Low quality
        except Exception as e:
            print(f"   ⚠️  Error processing sample: {e}")
    
    return np.array(X_data), np.array(y_data)

# Generate training data
print("\n🔄 Generating comprehensive training dataset...")
X, y = generate_comprehensive_training_data()

print(f"\n📊 Dataset Statistics:")
print(f"   • Total samples: {len(X)}")
print(f"   • Features per sample: {X.shape[1]}")
print(f"   • High quality samples: {np.sum(y)}")
print(f"   • Other quality samples: {len(y) - np.sum(y)}")
print(f"   • Class balance: {np.sum(y) / len(y) * 100:.1f}% vs {(1 - np.sum(y) / len(y)) * 100:.1f}%")

# Split data
print("\n✂️  Splitting data (80/20 train/test)...")
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Scale features
print("📏 Scaling features...")
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Train model
print("\n🏋️  Training Random Forest model...")
print("   • Number of trees: 150")
print("   • Max depth: None (unlimited)")
print("   • Min samples split: 2")
print("   • Random state: 42")

model = RandomForestClassifier(
    n_estimators=150,
    random_state=42,
    n_jobs=-1,
    verbose=1,
    max_depth=20,
    min_samples_split=2,
    class_weight='balanced'
)

model.fit(X_train_scaled, y_train)

# Evaluate model
print("\n📈 Model Evaluation:")
print("-" * 80)

# Training accuracy
y_train_pred = model.predict(X_train_scaled)
train_accuracy = accuracy_score(y_train, y_train_pred)
train_precision = precision_score(y_train, y_train_pred, zero_division=0)
train_recall = recall_score(y_train, y_train_pred, zero_division=0)
train_f1 = f1_score(y_train, y_train_pred, zero_division=0)

print(f"\n✓ Training Set Performance:")
print(f"   • Accuracy:  {train_accuracy * 100:.2f}%")
print(f"   • Precision: {train_precision * 100:.2f}%")
print(f"   • Recall:    {train_recall * 100:.2f}%")
print(f"   • F1 Score:  {train_f1 * 100:.2f}%")

# Test accuracy
y_test_pred = model.predict(X_test_scaled)
test_accuracy = accuracy_score(y_test, y_test_pred)
test_precision = precision_score(y_test, y_test_pred, zero_division=0)
test_recall = recall_score(y_test, y_test_pred, zero_division=0)
test_f1 = f1_score(y_test, y_test_pred, zero_division=0)

print(f"\n✓ Test Set Performance:")
print(f"   • Accuracy:  {test_accuracy * 100:.2f}%")
print(f"   • Precision: {test_precision * 100:.2f}%")
print(f"   • Recall:    {test_recall * 100:.2f}%")
print(f"   • F1 Score:  {test_f1 * 100:.2f}%")

# Feature importance
print(f"\n🎯 Top Feature Importance:")
feature_names = [
    'num_lines', 'num_characters', 'num_words', 'num_functions',
    'avg_function_length', 'max_nesting_depth', 'num_unused_vars',
    'num_comments', 'comment_ratio', 'has_error_handling',
    'has_type_hints', 'cyclomatic_complexity', 'complexity_score',
    'maintainability_score'
]

importances = model.feature_importances_
top_indices = np.argsort(importances)[::-1][:5]
for idx in top_indices:
    print(f"   {idx + 1}. {feature_names[idx]}: {importances[idx] * 100:.2f}%")

# Save model
print("\n💾 Saving model...")
models_dir = os.path.join(os.path.dirname(__file__), 'models')
os.makedirs(models_dir, exist_ok=True)

model_path = os.path.join(models_dir, 'quality_model.pkl')
scaler_path = os.path.join(models_dir, 'scaler.pkl')

with open(model_path, 'wb') as f:
    pickle.dump(model, f)
    print(f"   ✓ Model saved to: {model_path}")

with open(scaler_path, 'wb') as f:
    pickle.dump(scaler, f)
    print(f"   ✓ Scaler saved to: {scaler_path}")

# Summary
print("\n" + "=" * 80)
print("✅ MODEL TRAINING COMPLETE!")
print("=" * 80)
print(f"\n📊 Final Model Performance:")
print(f"   • Test Accuracy: {test_accuracy * 100:.2f}%")
print(f"   • Samples Used: {len(X)}")
print(f"   • Training Samples: {len(X_train)}")
print(f"   • Test Samples: {len(X_test)}")
print(f"\n✨ Model ready for production use!")
print(f"⏰ Trained at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
