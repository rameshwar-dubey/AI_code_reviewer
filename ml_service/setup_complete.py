#!/usr/bin/env python3
"""
Complete Setup and Training Script
Trains all ML models and prepares the system
"""

import os
import sys
import subprocess

def run_command(cmd, description):
    """Run a shell command with error handling"""
    print(f"\n{'='*60}")
    print(f"{description}")
    print(f"{'='*60}")
    try:
        result = subprocess.run(cmd, shell=True, cwd=os.path.dirname(__file__))
        if result.returncode != 0:
            print(f"⚠️  Command failed: {cmd}")
            return False
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    """Main setup script"""
    
    print("\n" + "="*60)
    print("🚀 AI CODE REVIEWER - COMPLETE SETUP")
    print("="*60)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Step 1: Train ML model
    print("\n1️⃣ Training ML Model...")
    train_cmd = f'"{sys.executable}" "{os.path.join(script_dir, "train_model.py")}"'
    if not run_command(train_cmd, "Running Model Training"):
        print("⚠️  Model training failed, will use heuristic scoring")
    
    # Step 2: Verify setup
    print("\n2️⃣ Verifying Setup...")
    verify_cmd = f'"{sys.executable}" "{os.path.join(script_dir, "verify_startup.py")}"'
    if not run_command(verify_cmd, "Running Verification"):
        print("⚠️  Some verification checks failed")
    
    print("\n" + "="*60)
    print("✅ SETUP COMPLETE")
    print("="*60)
    print("\n🎯 Next steps:")
    print("1. Open 3 terminals:")
    print("   Terminal 1: cd backend && npm start")
    print("   Terminal 2: cd ml_service && python app.py")
    print("   Terminal 3: cd frontend && npm run dev")
    print("\n2. Open http://localhost:5173 in your browser")
    print("3. Upload code files or paste code directly")
    print("4. Click 'Review' to analyze")
    print("5. View corrected code with improvements")
    print("\n" + "="*60)

if __name__ == "__main__":
    main()
