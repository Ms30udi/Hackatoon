#!/usr/bin/env python3
"""
Test script to verify the verification logic works correctly.
This tests the comparison functions with various inputs.
"""

import sys
sys.path.insert(0, 'app')

from utils.verification import compare_names, compare_cin

def test_compare_cin():
    print("=" * 60)
    print("Testing CIN comparison")
    print("=" * 60)
    
    test_cases = [
        # (db_cin, extracted_cin, expected_result, description)
        ("AB123456", "AB123456", True, "Exact match"),
        ("ab123456", "AB123456", True, "Case insensitive"),
        ("AB 123456", "AB123456", True, "DB has space"),
        ("AB123456", "AB 123456", True, "Extracted has space"),
        ("AB-123456", "AB123456", True, "DB has hyphen"),
        ("AB123456", "AB-123456", True, "Extracted has hyphen"),
        ("AB 123 456", "AB123456", True, "Multiple spaces"),
        ("AB123456", "CD123456", False, "Different CIN"),
        ("", "AB123456", False, "Empty DB CIN"),
        ("AB123456", "", False, "Empty extracted CIN"),
        ("AB123456", None, False, "None extracted CIN"),
    ]
    
    passed = 0
    failed = 0
    
    for db_cin, extracted_cin, expected, description in test_cases:
        try:
            result = compare_cin(db_cin, extracted_cin)
            status = "✓ PASS" if result == expected else "✗ FAIL"
            if result == expected:
                passed += 1
            else:
                failed += 1
            print(f"{status}: {description}")
            print(f"  DB: '{db_cin}', Extracted: '{extracted_cin}' → {result} (expected {expected})")
        except Exception as e:
            print(f"✗ ERROR: {description}")
            print(f"  Exception: {e}")
            failed += 1
    
    print(f"\nCIN Tests: {passed} passed, {failed} failed")
    return failed == 0


def test_compare_names():
    print("\n" + "=" * 60)
    print("Testing Name comparison")
    print("=" * 60)
    
    test_cases = [
        # (db_name, extracted_name, expected_min_score, description)
        ("MOHAMMED AHMED", "MOHAMMED AHMED", 0.99, "Exact match"),
        ("MOHAMMED AHMED ALI", "MOHAMMED AHMED", 0.75, "Name with 3 words vs 2 words"),
        ("JOSE GARCIA", "JOSE GARCIA", 0.99, "Exact match (no accents needed)"),
        ("JOSÉ GARCÍA", "JOSE GARCIA", 0.90, "Accents handled"),
        ("JOHN DOE", "JOHN DOE", 0.99, "English name"),
        ("FATIMA", "FATIMA", 0.99, "Single word"),
        ("FATIMA", "FATIMAH", 0.85, "Similar single word"),
        ("MOHAMMED AHMED", "AHMAD MOHAMAD", 0.50, "Very different spelling"),
        ("", "JOHN DOE", 0.0, "Empty DB name"),
        ("JOHN DOE", "", 0.0, "Empty extracted name"),
    ]
    
    passed = 0
    failed = 0
    
    for db_name, extracted_name, expected_min_score, description in test_cases:
        try:
            result = compare_names(db_name, extracted_name)
            # For fuzzy matching, we check if it meets the minimum threshold
            meets_threshold = result >= expected_min_score
            status = "✓ PASS" if meets_threshold else "✗ FAIL"
            if meets_threshold:
                passed += 1
            else:
                failed += 1
            print(f"{status}: {description}")
            print(f"  DB: '{db_name}', Extracted: '{extracted_name}' → {result:.2f} (expected >= {expected_min_score})")
        except Exception as e:
            print(f"✗ ERROR: {description}")
            print(f"  Exception: {e}")
            failed += 1
    
    print(f"\nName Tests: {passed} passed, {failed} failed")
    return failed == 0


def test_verification_logic():
    print("\n" + "=" * 60)
    print("Testing Full Verification Logic")
    print("=" * 60)
    
    test_cases = [
        # (db_name, extracted_name, db_cin, extracted_cin, expected_verified, description)
        ("MOHAMMED AHMED", "MOHAMMED AHMED", "AB123456", "AB123456", True, "Perfect match"),
        ("MOHAMMED AHMED ALI", "MOHAMMED AHMED", "AB123456", "AB123456", False, "Name too short (would fail 80% threshold)"),
        ("JOHN DOE", "JOHN DOE", "CD789012", "CD 789012", True, "CIN with space"),
        ("JOHN DOE", "JOHN DOE", "CD789012", "XY789012", False, "CIN mismatch"),
        ("JOHN DOE", "JANE DOE", "CD789012", "CD789012", False, "Name mismatch"),
        ("JOHN DOE", None, "CD789012", "CD789012", False, "None extracted name"),
        ("JOHN DOE", "JOHN DOE", "CD789012", None, False, "None extracted CIN"),
    ]
    
    passed = 0
    failed = 0
    
    for db_name, extracted_name, db_cin, extracted_cin, expected_verified, description in test_cases:
        try:
            name_score = compare_names(db_name, extracted_name)
            cin_match = compare_cin(db_cin, extracted_cin)
            verified = name_score >= 0.8 and cin_match
            
            status = "✓ PASS" if verified == expected_verified else "✗ FAIL"
            if verified == expected_verified:
                passed += 1
            else:
                failed += 1
            print(f"{status}: {description}")
            print(f"  Name score: {name_score:.2f}, CIN match: {cin_match} → Verified: {verified} (expected {expected_verified})")
        except Exception as e:
            print(f"✗ ERROR: {description}")
            print(f"  Exception: {e}")
            failed += 1
    
    print(f"\nVerification Logic Tests: {passed} passed, {failed} failed")
    return failed == 0


if __name__ == "__main__":
    print("\nRUNNING VERIFICATION TESTS\n")
    
    cin_ok = test_compare_cin()
    names_ok = test_compare_names()
    logic_ok = test_verification_logic()
    
    print("\n" + "=" * 60)
    if cin_ok and names_ok and logic_ok:
        print("✓ ALL TESTS PASSED")
    else:
        print("✗ SOME TESTS FAILED")
    print("=" * 60 + "\n")
