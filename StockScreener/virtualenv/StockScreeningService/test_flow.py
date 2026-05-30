#!/usr/bin/env python3
"""
Test script for end-to-end flow validation
Tests: fetch_data() -> executing_all_strategy_run()
"""

import sys
import os
from datetime import datetime

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def test_fetch_data():
    """Test Step 1: Fetch data from yfinance"""
    print("\n" + "="*80)
    print("STEP 1: Testing fetch_data()")
    print("="*80)
    
    try:
        from Screener.run import fetch_data
        
        print("Calling fetch_data()...")
        result = fetch_data()
        
        if result is None:
            print("❌ FAILED: fetch_data() returned None")
            return False
        
        data, yf_tickers, company_names = result
        
        print(f"✅ SUCCESS: fetch_data() completed")
        print(f"   - Tickers fetched: {len(yf_tickers)}")
        print(f"   - Companies: {len(company_names)}")
        print(f"   - Data shape: {data.shape if hasattr(data, 'shape') else 'N/A'}")
        print(f"   - Sample tickers: {yf_tickers[:5]}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception in fetch_data()")
        print(f"   Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def test_strategy_run():
    """Test Step 2: Run all strategy analysis"""
    print("\n" + "="*80)
    print("STEP 2: Testing executing_all_strategy_run()")
    print("="*80)
    
    try:
        from Screener.run import executing_all_strategy_run
        
        print("Calling executing_all_strategy_run()...")
        result = executing_all_strategy_run()
        
        if result is None:
            print("❌ FAILED: executing_all_strategy_run() returned None")
            return False
        
        print(f"✅ SUCCESS: executing_all_strategy_run() completed")
        print(f"   - Result keys: {list(result.keys())}")
        
        # Print summary of results
        if isinstance(result, dict):
            for key in result.keys():
                if key != 'last_updated':
                    print(f"   - {key}: {type(result[key])}")
            print(f"   - last_updated: {result.get('last_updated', 'N/A')}")
        
        return True
        
    except Exception as e:
        print(f"❌ FAILED: Exception in executing_all_strategy_run()")
        print(f"   Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("END-TO-END FLOW TEST")
    print(f"Test started at: {datetime.now().isoformat()}")
    print("="*80)
    
    results = {}
    
    # Test 1: fetch_data
    results['fetch_data'] = test_fetch_data()
    
    # Test 2: executing_all_strategy_run (only if fetch_data passed)
    if results['fetch_data']:
        results['executing_all_strategy_run'] = test_strategy_run()
    else:
        print("\n⚠️  Skipping executing_all_strategy_run() test due to fetch_data() failure")
        results['executing_all_strategy_run'] = False
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    all_passed = all(results.values())
    print("\n" + ("="*80))
    if all_passed:
        print("✅ ALL TESTS PASSED")
    else:
        print("❌ SOME TESTS FAILED")
    print("="*80 + "\n")
    
    return 0 if all_passed else 1


if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
