#!/usr/bin/env python3
"""
Backend API Test Suite for Urlaubsplaner (Vacation Planner)
KRITISCHE REGRESSION-TESTS nach Authentication-Fix

**HINTERGRUND:**
User berichtet 3 kritische Probleme:
1. Login für andere Benutzer funktioniert nicht  
2. Kann keinen Urlaub beantragen (failed to fetch)
3. Bei Updates werden alle Mitarbeiter gelöscht außer 3

**ROOT CAUSE IDENTIFIZIERT UND BEHOBEN:**
- logins.json hatte gemischte Datenformate (String vs Object)
- Standardisiert auf konsistentes Object-Format mit korrekten Rollen
- Backend Authentication-Logic korrekt implementiert

**TESTE ALLE DREI PROBLEME:**
1. MULTI-USER LOGIN TEST: Alle 6 Benutzer testen
2. VACATION CREATION TEST: Urlaubsantrag erstellen und validieren
3. EMPLOYEE DATA PERSISTENCE TEST: Mitarbeiter-Anzahl nach Updates prüfen
"""

import requests
import sys
import json
from datetime import datetime, date
import uuid

class UrlaubsplanerRegressionTester:
    def __init__(self, base_url="https://estyria-urlaubsplan-vercel-2.onrender.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_vacation_id = None
        self.created_employee_id = None
        self.initial_employee_count = 0
        
        # Test users from the review request
        self.test_users = [
            {"username": "admin", "password": "admin123", "expected_role": "admin"},
            {"username": "logistik", "password": "logistik123", "expected_role": "user"},
            {"username": "manager", "password": "manager123", "expected_role": "user"},
            {"username": "hr", "password": "hr123", "expected_role": "user"},
            {"username": "gerhard", "password": "gerhard123", "expected_role": "user"},
            {"username": "express", "password": "express123", "expected_role": "user"}
        ]

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def test_health_check(self):
        """Test health endpoint - BACKEND VERFÜGBARKEIT"""
        print("\n🔍 TESTING: Backend Health Check")
        try:
            response = requests.get(f"{self.api_url}/health", timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {data.get('status', 'unknown')}, Data Files: {data.get('data_files', {})}"
                print(f"   📡 Backend URL: {self.api_url}/health")
                print(f"   ✅ Response: {json.dumps(data, indent=2)}")
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("Backend Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Backend Health Check", False, f"Error: {str(e)}")
            return False

    def test_multi_user_login(self):
        """Test all 6 users can login - PROBLEM 1: Login für andere Benutzer"""
        print("\n🔍 TESTING: Multi-User Login (Problem 1)")
        all_passed = True
        login_results = {}
        
        for user in self.test_users:
            username = user["username"]
            password = user["password"]
            expected_role = user["expected_role"]
            
            print(f"\n   Testing login: {username}/{password}")
            try:
                payload = {"username": username, "password": password}
                response = requests.post(f"{self.api_url}/auth/login", json=payload, timeout=15)
                
                success = response.status_code == 200
                if success:
                    data = response.json()
                    actual_role = data.get('user', {}).get('role', 'unknown')
                    role_correct = actual_role == expected_role
                    
                    if role_correct:
                        details = f"✅ Success: {data.get('success')}, Role: {actual_role}"
                        print(f"      ✅ {username} login successful, role: {actual_role}")
                        login_results[username] = True
                        
                        # Store admin token for later tests
                        if username == "admin":
                            self.token = data.get('token')
                    else:
                        details = f"❌ Role mismatch - Expected: {expected_role}, Got: {actual_role}"
                        print(f"      ❌ {username} role mismatch: expected {expected_role}, got {actual_role}")
                        login_results[username] = False
                        all_passed = False
                else:
                    details = f"Status Code: {response.status_code}, Response: {response.text}"
                    print(f"      ❌ {username} login failed: {response.status_code}")
                    login_results[username] = False
                    all_passed = False
                    
                self.log_test(f"Login {username}", success and role_correct, details)
                
            except Exception as e:
                print(f"      ❌ {username} login error: {str(e)}")
                login_results[username] = False
                all_passed = False
                self.log_test(f"Login {username}", False, f"Error: {str(e)}")
        
        # Summary
        passed_count = sum(1 for result in login_results.values() if result)
        total_count = len(self.test_users)
        
        print(f"\n   📊 Multi-User Login Summary: {passed_count}/{total_count} users can login")
        for username, passed in login_results.items():
            status = "✅" if passed else "❌"
            print(f"      {status} {username}")
        
        return all_passed

    def get_initial_employee_count(self):
        """Get initial employee count for persistence test"""
        print("\n🔍 TESTING: Getting initial employee count")
        try:
            response = requests.get(f"{self.api_url}/employees", timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                self.initial_employee_count = len(data)
                print(f"   📊 Initial employee count: {self.initial_employee_count}")
                
                # Show sample employees
                if data:
                    names = [emp.get('name', 'Unknown') for emp in data[:3]]
                    print(f"   📋 Sample employees: {', '.join(names)}")
                
                self.log_test("Get Initial Employee Count", True, f"Found {self.initial_employee_count} employees")
                return True
            else:
                self.log_test("Get Initial Employee Count", False, f"Status: {response.status_code}")
                return False
                
        except Exception as e:
            self.log_test("Get Initial Employee Count", False, f"Error: {str(e)}")
            return False

    def test_vacation_creation(self):
        """Test vacation creation - PROBLEM 2: Kann keinen Urlaub beantragen"""
        print("\n🔍 TESTING: Vacation Creation (Problem 2)")
        
        if not self.token:
            self.log_test("Vacation Creation", False, "No admin token available")
            return False
        
        # First get employees to use a valid employee_id
        try:
            response = requests.get(f"{self.api_url}/employees", timeout=15)
            if response.status_code != 200:
                self.log_test("Vacation Creation", False, "Could not get employees list")
                return False
                
            employees = response.json()
            if not employees:
                self.log_test("Vacation Creation", False, "No employees found")
                return False
                
            # Use first employee for vacation test
            test_employee = employees[0]
            employee_id = test_employee["id"]
            employee_name = test_employee["name"]
            
            print(f"   👤 Using employee: {employee_name} (ID: {employee_id})")
            
        except Exception as e:
            self.log_test("Vacation Creation", False, f"Error getting employees: {str(e)}")
            return False
        
        # Create vacation entry
        try:
            vacation_data = {
                "employee_id": employee_id,
                "employee_name": employee_name,
                "vacation_type": "URLAUB",
                "start_date": "2025-12-20",
                "end_date": "2025-12-22",
                "days_count": 3,
                "description": "Regression test vacation"
            }
            
            print(f"   📡 POST {self.api_url}/vacations")
            print(f"   📝 Payload: {json.dumps(vacation_data, indent=2)}")
            
            response = requests.post(f"{self.api_url}/vacations", json=vacation_data, timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                self.created_vacation_id = data.get('id')
                
                # Verify UUID format
                uuid_valid = self.created_vacation_id and len(self.created_vacation_id) > 20
                
                details = f"Created vacation ID: {self.created_vacation_id}, UUID valid: {uuid_valid}"
                print(f"   ✅ Vacation created successfully")
                print(f"   🆔 Vacation ID: {self.created_vacation_id}")
                print(f"   📅 Days: {data.get('days_count')}, Type: {data.get('vacation_type')}")
                
                self.log_test("Vacation Creation", success and uuid_valid, details)
                return success and uuid_valid
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                print(f"   ❌ Vacation creation failed: {response.status_code}")
                print(f"   📄 Response: {response.text}")
                
                self.log_test("Vacation Creation", False, details)
                return False
                
        except Exception as e:
            self.log_test("Vacation Creation", False, f"Error: {str(e)}")
            return False

    def test_vacation_retrieval(self):
        """Test that created vacation appears in GET /api/vacations"""
        print("\n🔍 TESTING: Vacation Retrieval Verification")
        
        if not self.created_vacation_id:
            self.log_test("Vacation Retrieval", False, "No vacation was created")
            return False
        
        try:
            response = requests.get(f"{self.api_url}/vacations", timeout=15)
            
            success = response.status_code == 200
            if success:
                vacations = response.json()
                
                # Find our created vacation
                found_vacation = None
                for vacation in vacations:
                    if vacation.get('id') == self.created_vacation_id:
                        found_vacation = vacation
                        break
                
                if found_vacation:
                    details = f"Found vacation in list, Type: {found_vacation.get('vacation_type')}, Days: {found_vacation.get('days_count')}"
                    print(f"   ✅ Created vacation found in vacation list")
                    print(f"   📋 Total vacations: {len(vacations)}")
                    print(f"   🎯 Our vacation: {found_vacation.get('vacation_type')} - {found_vacation.get('days_count')} days")
                    
                    self.log_test("Vacation Retrieval", True, details)
                    return True
                else:
                    details = f"Created vacation ID {self.created_vacation_id} not found in {len(vacations)} vacations"
                    print(f"   ❌ Created vacation not found in vacation list")
                    print(f"   📋 Total vacations: {len(vacations)}")
                    
                    self.log_test("Vacation Retrieval", False, details)
                    return False
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                self.log_test("Vacation Retrieval", False, details)
                return False
                
        except Exception as e:
            self.log_test("Vacation Retrieval", False, f"Error: {str(e)}")
            return False

    def test_employee_persistence(self):
        """Test employee data persistence - PROBLEM 3: Bei Updates werden alle Mitarbeiter gelöscht außer 3"""
        print("\n🔍 TESTING: Employee Data Persistence (Problem 3)")
        
        if not self.token:
            self.log_test("Employee Persistence", False, "No admin token available")
            return False
        
        # Step 1: Create a new employee
        try:
            new_employee_data = {
                "name": f"Test Employee {datetime.now().strftime('%H%M%S')}",
                "email": f"test{datetime.now().strftime('%H%M%S')}@express-logistik.com",
                "role": "employee",
                "vacation_days_total": 25.0
            }
            
            print(f"   📡 POST {self.api_url}/employees")
            print(f"   📝 Creating employee: {new_employee_data['name']}")
            
            response = requests.post(f"{self.api_url}/employees", json=new_employee_data, timeout=15)
            
            if response.status_code != 200:
                self.log_test("Employee Persistence", False, f"Could not create employee: {response.status_code}")
                return False
                
            created_employee = response.json()
            self.created_employee_id = created_employee.get('id')
            
            print(f"   ✅ Employee created: {created_employee.get('name')} (ID: {self.created_employee_id})")
            
        except Exception as e:
            self.log_test("Employee Persistence", False, f"Error creating employee: {str(e)}")
            return False
        
        # Step 2: Check current employee count
        try:
            response = requests.get(f"{self.api_url}/employees", timeout=15)
            
            if response.status_code != 200:
                self.log_test("Employee Persistence", False, f"Could not get employees: {response.status_code}")
                return False
                
            current_employees = response.json()
            current_count = len(current_employees)
            expected_count = self.initial_employee_count + 1
            
            print(f"   📊 Employee count check:")
            print(f"      Initial count: {self.initial_employee_count}")
            print(f"      Current count: {current_count}")
            print(f"      Expected count: {expected_count}")
            
            # Verify count increased correctly
            count_correct = current_count == expected_count
            
            # Verify count is not fallen back to 3 (the reported problem)
            not_fallen_to_3 = current_count != 3 or self.initial_employee_count == 2
            
            if count_correct and not_fallen_to_3:
                details = f"Employee count correct: {current_count} (was {self.initial_employee_count}, added 1)"
                print(f"   ✅ Employee persistence test passed")
                print(f"   ✅ Count did not fall back to 3")
                
                self.log_test("Employee Persistence", True, details)
                return True
            else:
                if not count_correct:
                    details = f"Count mismatch: Expected {expected_count}, Got {current_count}"
                    print(f"   ❌ Employee count mismatch")
                elif not not_fallen_to_3:
                    details = f"Employee count fell back to 3 (reported bug)"
                    print(f"   ❌ CRITICAL: Employee count fell back to 3!")
                
                self.log_test("Employee Persistence", False, details)
                return False
                
        except Exception as e:
            self.log_test("Employee Persistence", False, f"Error checking employee count: {str(e)}")
            return False

    def cleanup_test_data(self):
        """Clean up created test data"""
        print("\n🧹 CLEANUP: Removing test data")
        
        # Clean up vacation
        if self.created_vacation_id:
            try:
                response = requests.delete(f"{self.api_url}/vacations/{self.created_vacation_id}", timeout=15)
                if response.status_code == 200:
                    print(f"   ✅ Deleted test vacation: {self.created_vacation_id}")
                else:
                    print(f"   ⚠️ Could not delete vacation: {response.status_code}")
            except Exception as e:
                print(f"   ⚠️ Vacation cleanup error: {str(e)}")
        
        # Clean up employee
        if self.created_employee_id:
            try:
                response = requests.delete(f"{self.api_url}/employees/{self.created_employee_id}", timeout=15)
                if response.status_code == 200:
                    print(f"   ✅ Deleted test employee: {self.created_employee_id}")
                else:
                    print(f"   ⚠️ Could not delete employee: {response.status_code}")
            except Exception as e:
                print(f"   ⚠️ Employee cleanup error: {str(e)}")

    def run_regression_tests(self):
        """Run all regression tests for the three reported problems"""
        print("🚀 KRITISCHE REGRESSION-TESTS nach Authentication-Fix")
        print("=" * 80)
        print(f"🎯 Backend URL: {self.base_url}")
        print(f"🔗 API Endpoint: {self.api_url}")
        print("\n📋 TESTING THREE CRITICAL PROBLEMS:")
        print("   1. Login für andere Benutzer funktioniert nicht")
        print("   2. Kann keinen Urlaub beantragen (failed to fetch)")
        print("   3. Bei Updates werden alle Mitarbeiter gelöscht außer 3")
        print("=" * 80)
        
        # Phase 1: Backend Health Check
        print("\n📡 PHASE 1: BACKEND VERFÜGBARKEIT")
        health_ok = self.test_health_check()
        
        if not health_ok:
            print("❌ Backend nicht verfügbar - Tests abgebrochen")
            return 1
        
        # Phase 2: Multi-User Login Test (Problem 1)
        print("\n🔐 PHASE 2: MULTI-USER LOGIN TEST (Problem 1)")
        multi_login_ok = self.test_multi_user_login()
        
        # Phase 3: Get initial employee count
        print("\n📊 PHASE 3: INITIAL DATA COLLECTION")
        initial_count_ok = self.get_initial_employee_count()
        
        # Phase 4: Vacation Creation Test (Problem 2)
        print("\n📅 PHASE 4: VACATION CREATION TEST (Problem 2)")
        vacation_create_ok = self.test_vacation_creation()
        vacation_retrieve_ok = self.test_vacation_retrieval()
        
        # Phase 5: Employee Persistence Test (Problem 3)
        print("\n👥 PHASE 5: EMPLOYEE PERSISTENCE TEST (Problem 3)")
        employee_persistence_ok = self.test_employee_persistence()
        
        # Phase 6: Cleanup
        print("\n🧹 PHASE 6: CLEANUP")
        self.cleanup_test_data()
        
        # Results Summary
        print("\n" + "=" * 80)
        print(f"📊 REGRESSION TEST RESULTS: {self.tests_passed}/{self.tests_run} tests passed")
        print("=" * 80)
        
        # Critical problem results
        problem_results = {
            "Problem 1 - Multi-User Login": multi_login_ok,
            "Problem 2 - Vacation Creation": vacation_create_ok and vacation_retrieve_ok,
            "Problem 3 - Employee Persistence": employee_persistence_ok
        }
        
        print("\n🎯 KRITISCHE PROBLEME STATUS:")
        all_problems_fixed = True
        for problem, fixed in problem_results.items():
            status = "✅ BEHOBEN" if fixed else "❌ WEITERHIN PROBLEM"
            print(f"   {status} {problem}")
            if not fixed:
                all_problems_fixed = False
        
        print("\n" + "=" * 80)
        if all_problems_fixed:
            print("🎉 ALLE DREI KRITISCHEN PROBLEME BEHOBEN!")
            print("✅ Multi-User Login funktioniert für alle 6 Benutzer")
            print("✅ Vacation Creation funktioniert ohne 'failed to fetch'")
            print("✅ Employee Data Persistence - keine Löschung auf 3 Mitarbeiter")
            print("✅ Authentication-Fix erfolgreich implementiert")
            return 0
        else:
            print("⚠️ KRITISCHE PROBLEME WEITERHIN BESTEHEND!")
            print("❌ Weitere Behebung erforderlich")
            
            # Specific recommendations
            if not multi_login_ok:
                print("🔧 EMPFEHLUNG: logins.json Datenformat überprüfen")
            if not (vacation_create_ok and vacation_retrieve_ok):
                print("🔧 EMPFEHLUNG: Vacation API und CORS-Konfiguration überprüfen")
            if not employee_persistence_ok:
                print("🔧 EMPFEHLUNG: Employee Update-Logic und Datenpersistierung überprüfen")
            
            return 1

def main():
    """Main test runner"""
    print("🎯 KRITISCHE REGRESSION-TESTS nach Authentication-Fix")
    print("📋 Testing der drei gemeldeten kritischen Probleme")
    print("🔗 Backend: https://estyria-urlaubsplan-vercel-2.onrender.com")
    
    tester = UrlaubsplanerRegressionTester()
    return tester.run_regression_tests()

if __name__ == "__main__":
    sys.exit(main())