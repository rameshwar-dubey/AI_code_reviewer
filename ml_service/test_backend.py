#!/usr/bin/env python3
"""Test complete pipeline through backend API"""
import requests

buggy_python = """def calculateTotal(items):
    total=0
    for item in items:
        if item['price']>0:
            if item['quantity']>0:
                if item['available']:
                    total = total + item['price'] * item['quantity']
    return total"""

print("=" * 70)
print("🧪 TEST 3: BACKEND PIPELINE API")
print("=" * 70)

print("\n❌ INPUT (Buggy Code):")
print(buggy_python)

print("\n\n✅ SENDING TO BACKEND PIPELINE...")
try:
    response = requests.post(
        'http://localhost:5000/api/analyze/pipeline',
        json={'code': buggy_python, 'language': 'python'},
        timeout=10
    )
    result = response.json()
    
    if result.get('success'):
        print("\n✅ PIPELINE RESULT:")
        print("-" * 70)
        
        # Show corrected code
        corrected = result.get('corrected_code', 'N/A')
        print("\n✅ CORRECTED CODE:")
        print(corrected[:500] if len(corrected) > 500 else corrected)
        
        # Show ML errors
        if result.get('ml_analysis'):
            ml = result['ml_analysis']
            print(f"\n🔍 ML ANALYSIS:")
            print(f"  Error Score: {ml.get('error_score')}/100")
            print(f"  Errors Detected: {ml.get('errors_detected_count', 0)}")
            print(f"  Warnings: {ml.get('warnings_count', 0)}")
        
        # Show improvements
        if result.get('ml_corrections'):
            fixes = result['ml_corrections'].get('fixes_applied', [])
            print(f"\n✓ Fixes Applied: {len(fixes)}")
            for fix in fixes[:3]:
                print(f"  • {fix}")
        
        print("\n✅ SUCCESS - Full pipeline works!")
    else:
        print("❌ Pipeline returned error:", result.get('error'))
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
