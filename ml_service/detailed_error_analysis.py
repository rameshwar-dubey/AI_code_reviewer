#!/usr/bin/env python3
"""
Detailed Error Analysis - Shows EXACTLY what's wrong with the code
"""
import requests
import json

def analyze_code_detailed(buggy_code, language):
    """Get detailed error analysis"""
    
    print("\n" + "=" * 80)
    print("🔍 DETAILED ERROR ANALYSIS")
    print("=" * 80)
    
    print("\n❌ INPUT CODE:")
    print("-" * 80)
    # Show code with line numbers
    lines = buggy_code.split('\n')
    for i, line in enumerate(lines, 1):
        print(f"{i:2d} | {line}")
    print("-" * 80)
    
    try:
        # Get error detection results
        response = requests.post(
            'http://localhost:5001/detect-errors',
            json={'code': buggy_code, 'language': language},
            timeout=5
        )
        
        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            return
            
        errors_data = response.json()
        
        # Show overall score
        print(f"\n📊 CODE QUALITY SCORE: {errors_data.get('error_score')}/100")
        print(f"🚨 Total Errors Found: {errors_data.get('total_errors')}")
        print(f"⚠️  Warnings: {len(errors_data.get('warnings', []))}")
        
        # Show ALL errors with details
        errors = errors_data.get('errors', [])
        if errors:
            print(f"\n\n🔴 DETAILED ERROR LIST ({len(errors)} errors found):")
            print("-" * 80)
            
            for i, error in enumerate(errors, 1):
                severity = error.get('severity', 'UNKNOWN')
                error_type = error.get('type', 'UNKNOWN')
                message = error.get('message', 'No message')
                suggestion = error.get('suggestion', 'No suggestion')
                
                # Color-coded severity
                if severity == 'HIGH':
                    severity_icon = "🔴"
                elif severity == 'MEDIUM':
                    severity_icon = "🟠"
                else:
                    severity_icon = "🟡"
                
                print(f"\n{i}. {severity_icon} [{error_type}] {severity} SEVERITY")
                print(f"   Problem: {message}")
                print(f"   Fix:     {suggestion}")
        
        # Show warnings
        warnings = errors_data.get('warnings', [])
        if warnings:
            print(f"\n\n⚠️  WARNINGS ({len(warnings)} warnings):")
            print("-" * 80)
            for i, warning in enumerate(warnings, 1):
                print(f"{i}. {warning}")
        
        # Show code correction
        print(f"\n\n🛠️  CODE CORRECTION:")
        print("-" * 80)
        
        response = requests.post(
            'http://localhost:5001/correct-code',
            json={'code': buggy_code, 'language': language},
            timeout=5
        )
        
        if response.status_code == 200:
            correction_data = response.json()
            corrected = correction_data.get('corrected_code', 'N/A')
            
            print("\n✅ CORRECTED CODE:")
            print("-" * 80)
            corrected_lines = corrected.split('\n')
            for i, line in enumerate(corrected_lines, 1):
                print(f"{i:2d} | {line}")
            print("-" * 80)
            
            fixes = correction_data.get('fixes_applied', [])
            if fixes:
                print(f"\n✓ FIXES APPLIED ({len(fixes)} fixes):")
                for i, fix in enumerate(fixes, 1):
                    print(f"   {i}. {fix}")
            
            print(f"\n📈 Total Improvements: {correction_data.get('improvements')}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

# Example 1: Python with multiple issues
print("\n\n" + "█" * 80)
print("█ EXAMPLE 1: PYTHON CODE WITH MULTIPLE ERRORS")
print("█" * 80)

buggy_python = """def calculateTotal(items):
    total=0
    for item in items:
        if item['price']>0:
            if item['quantity']>0:
                if item['available']:
                    total = total + item['price'] * item['quantity']
    return total"""

analyze_code_detailed(buggy_python, "python")

# Example 2: JavaScript with multiple issues
print("\n\n" + "█" * 80)
print("█ EXAMPLE 2: JAVASCRIPT CODE WITH MULTIPLE ERRORS")
print("█" * 80)

buggy_js = """function addNumbers(a,b){
var result=a+b;
if(result>0){
console.log("Sum is positive")
}
return result
}"""

analyze_code_detailed(buggy_js, "javascript")

# Example 3: More complex Python
print("\n\n" + "█" * 80)
print("█ EXAMPLE 3: COMPLEX PYTHON CODE WITH MULTIPLE ISSUES")
print("█" * 80)

complex_python = """def processData(data):
    result=[]
    for x in data:
        if x['active']==True:
            if x['status']=='valid':
                if x['score']>50:
                    temp=x['value']*2
                    result.append(temp)
    return result"""

analyze_code_detailed(complex_python, "python")

print("\n\n" + "=" * 80)
print("✅ DETAILED ANALYSIS COMPLETE")
print("=" * 80)
