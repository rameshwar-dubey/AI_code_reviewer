#!/usr/bin/env python3
"""Test ML API with JavaScript buggy code"""
import requests

buggy_js = """function addNumbers(a,b){
var result=a+b;
if(result>0){
console.log("Sum is positive")
}
return result
}"""

print("=" * 70)
print("🧪 TEST 2: JavaScript Buggy Code")
print("=" * 70)

print("\n❌ INPUT (Buggy JavaScript):")
print(buggy_js)

print("\n\n✅ CORRECTING CODE...")
try:
    response = requests.post(
        'http://localhost:5001/correct-code',
        json={'code': buggy_js, 'language': 'javascript'},
        timeout=5
    )
    result = response.json()
    
    print("\n✅ CORRECTED CODE:")
    print("-" * 70)
    print(result.get('corrected_code'))
    print("-" * 70)
    
    print("\nFixes Applied:")
    for fix in result.get('fixes_applied', []):
        print(f"  ✓ {fix}")
    
    print(f"\nTotal Improvements: {result.get('improvements')}")
    print("\n✅ SUCCESS - Code corrected!")
    
except Exception as e:
    print(f"❌ Error: {e}")
