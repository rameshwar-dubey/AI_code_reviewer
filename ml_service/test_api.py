#!/usr/bin/env python3
"""
Test the ML Service API with buggy code
"""
import requests
import json

# Buggy Python code
buggy_code = """def calculateTotal(items):
    total=0
    for item in items:
        if item['price']>0:
            if item['quantity']>0:
                if item['available']:
                    total = total + item['price'] * item['quantity']
    return total"""

print("=" * 70)
print("🧪 TESTING ML API - BUGGY CODE → CORRECTED CODE")
print("=" * 70)

print("\n❌ INPUT (Buggy Code):")
print("-" * 70)
print(buggy_code)
print("-" * 70)

# Test 1: Error Detection
print("\n\n🔍 TEST 1: ERROR DETECTION")
print("-" * 70)
try:
    response = requests.post(
        'http://localhost:5001/detect-errors',
        json={'code': buggy_code, 'language': 'python'},
        timeout=5
    )
    result = response.json()
    print("✅ Status:", response.status_code)
    print("\nErrors Found:")
    for error in result.get('errors', [])[:5]:  # Show first 5
        print(f"  • {error.get('type')}: {error.get('message')}")
    print(f"\nTotal Errors: {result.get('total_errors')}")
    print(f"Error Score: {result.get('error_score')}/100")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 2: Code Correction
print("\n\n🛠️  TEST 2: CODE CORRECTION")
print("-" * 70)
try:
    response = requests.post(
        'http://localhost:5001/correct-code',
        json={'code': buggy_code, 'language': 'python'},
        timeout=5
    )
    result = response.json()
    print("✅ Status:", response.status_code)
    print("\n✅ CORRECTED CODE:")
    print("-" * 70)
    print(result.get('corrected_code', 'N/A'))
    print("-" * 70)
    print("\nFixes Applied:")
    for fix in result.get('fixes_applied', []):
        print(f"  ✓ {fix}")
    print(f"\nTotal Improvements: {result.get('improvements')}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n\n" + "=" * 70)
print("✅ TEST COMPLETE")
print("=" * 70)
