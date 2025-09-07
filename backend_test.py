#!/usr/bin/env python3
"""
Backend API Test Suite for Urlaubsplaner (Vacation Planner)
KRITISCHER LOGIN-SYSTEM TEST nach Backend-URL-Korrektur
Tests the login system after fixing REACT_APP_BACKEND_URL from Preview-URL to Render-Backend-URL
"""

import requests
import sys
import json
from datetime import datetime
import uuid

class UrlaubsplanerAPITester:
    def __init__(self, base_url="https://estyria-urlaubsplan-vercel-2.onrender.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_employee_id = None
        self.created_user_username = None

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED {details}")
        else:
            print(f"❌ {name} - FAILED {details}")

    def test_health_check(self):
        """Test health endpoint - KRITISCHER BACKEND-VERBINDUNGSTEST"""
        print("\n🔍 TESTING: Backend-Verbindung Health-Check")
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
                
            self.log_test("Health Check (Render Backend)", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check (Render Backend)", False, f"Error: {str(e)}")
            return False

    def test_admin_login(self):
        """Test admin login - KRITISCHER ADMIN-LOGIN TEST"""
        print("\n🔍 TESTING: Admin-Login mit username/password")
        try:
            payload = {"username": "admin", "password": "admin123"}
            print(f"   📡 POST {self.api_url}/auth/login")
            print(f"   📝 Payload: {json.dumps(payload)}")
            
            response = requests.post(f"{self.api_url}/auth/login", json=payload, timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                self.token = data.get('token')
                user = data.get('user', {})
                details = f"Success: {data.get('success')}, Role: {user.get('role')}, Token: {self.token[:20]}..."
                print(f"   ✅ Response: {json.dumps(data, indent=2)}")
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                print(f"   ❌ Error Response: {response.text}")
                
            self.log_test("Admin Login (admin/admin123)", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login (admin/admin123)", False, f"Error: {str(e)}")
            return False

    def test_create_new_user(self):
        """Test creating new user - NEUER BENUTZER TEST"""
        print("\n🔍 TESTING: Neuen Testbenutzer erstellen")
        if not self.token:
            self.log_test("Create New User", False, "No admin token available")
            return False
            
        try:
            # Generate unique username
            timestamp = str(int(datetime.now().timestamp()))
            self.created_user_username = f"logintest{timestamp}"
            
            payload = {
                "username": self.created_user_username,
                "password": "test123",
                "role": "user"
            }
            
            print(f"   📡 POST {self.api_url}/users")
            print(f"   📝 Payload: {json.dumps(payload)}")
            
            response = requests.post(f"{self.api_url}/users", json=payload, timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Username: {data.get('username')}, Role: {data.get('role')}"
                print(f"   ✅ Response: {json.dumps(data, indent=2)}")
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                print(f"   ❌ Error Response: {response.text}")
                
            self.log_test("Create New User", success, details)
            return success
        except Exception as e:
            self.log_test("Create New User", False, f"Error: {str(e)}")
            return False

    def test_new_user_login(self):
        """Test login with newly created user - SOFORTIGER LOGIN TEST"""
        print("\n🔍 TESTING: Login mit neu erstelltem Benutzer")
        if not self.created_user_username:
            self.log_test("New User Login", False, "No created user available")
            return False
            
        try:
            payload = {"username": self.created_user_username, "password": "test123"}
            print(f"   📡 POST {self.api_url}/auth/login")
            print(f"   📝 Payload: {json.dumps(payload)}")
            
            response = requests.post(f"{self.api_url}/auth/login", json=payload, timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                user = data.get('user', {})
                details = f"Success: {data.get('success')}, Role: {user.get('role')}, Username: {user.get('username')}"
                print(f"   ✅ Response: {json.dumps(data, indent=2)}")
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                print(f"   ❌ Error Response: {response.text}")
                
            self.log_test("New User Login", success, details)
            return success
        except Exception as e:
            self.log_test("New User Login", False, f"Error: {str(e)}")
            return False

    def test_login_wrong_password(self):
        """Test login with wrong password - FEHLERFALL TEST"""
        print("\n🔍 TESTING: Login mit falschem Passwort")
        try:
            payload = {"username": "admin", "password": "wrongpassword"}
            print(f"   📡 POST {self.api_url}/auth/login")
            print(f"   📝 Payload: {json.dumps(payload)}")
            
            response = requests.post(f"{self.api_url}/auth/login", json=payload, timeout=15)
            
            success = response.status_code == 401
            details = f"Status Code: {response.status_code} (Expected 401)"
            if response.status_code == 401:
                try:
                    error_data = response.json()
                    print(f"   ✅ Correct Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   ✅ Correct Error Response: {response.text}")
            else:
                print(f"   ❌ Unexpected Response: {response.text}")
                
            self.log_test("Login Wrong Password", success, details)
            return success
        except Exception as e:
            self.log_test("Login Wrong Password", False, f"Error: {str(e)}")
            return False

    def test_login_nonexistent_user(self):
        """Test login with non-existent user - FEHLERFALL TEST"""
        print("\n🔍 TESTING: Login mit nicht-existierendem Benutzer")
        try:
            payload = {"username": "nonexistentuser999", "password": "anypassword"}
            print(f"   📡 POST {self.api_url}/auth/login")
            print(f"   📝 Payload: {json.dumps(payload)}")
            
            response = requests.post(f"{self.api_url}/auth/login", json=payload, timeout=15)
            
            success = response.status_code == 401
            details = f"Status Code: {response.status_code} (Expected 401)"
            if response.status_code == 401:
                try:
                    error_data = response.json()
                    print(f"   ✅ Correct Error Response: {json.dumps(error_data, indent=2)}")
                except:
                    print(f"   ✅ Correct Error Response: {response.text}")
            else:
                print(f"   ❌ Unexpected Response: {response.text}")
                
            self.log_test("Login Nonexistent User", success, details)
            return success
        except Exception as e:
            self.log_test("Login Nonexistent User", False, f"Error: {str(e)}")
            return False

    def test_get_employees_authorized(self):
        """Test getting employees with valid token - BACKEND API VALIDATION"""
        print("\n🔍 TESTING: Mitarbeiter-Daten vom Backend abrufen")
        if not self.token:
            self.log_test("Get Employees (Authorized)", False, "No token available")
            return False
            
        try:
            response = requests.get(f"{self.api_url}/employees", timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Found {len(data)} employees"
                print(f"   ✅ Employees loaded: {len(data)} entries")
                # Show first few employee names for validation
                if data:
                    names = [emp.get('name', 'Unknown') for emp in data[:3]]
                    print(f"   📋 Sample employees: {', '.join(names)}")
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                print(f"   ❌ Error Response: {response.text}")
                
            self.log_test("Get Employees (Backend API)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Employees (Backend API)", False, f"Error: {str(e)}")
            return False

    def test_get_vacations(self):
        """Test getting vacations - URLAUBSDATEN VALIDATION"""
        print("\n🔍 TESTING: Urlaubsdaten vom Backend abrufen")
        try:
            response = requests.get(f"{self.api_url}/vacations", timeout=15)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Found {len(data)} vacation entries"
                print(f"   ✅ Vacations loaded: {len(data)} entries")
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                print(f"   ❌ Error Response: {response.text}")
                
            self.log_test("Get Vacations (Backend API)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Vacations (Backend API)", False, f"Error: {str(e)}")
            return False

    def cleanup_created_user(self):
        """Clean up created test user"""
        if not self.token or not self.created_user_username:
            return True
            
        try:
            print(f"\n🧹 CLEANUP: Deleting test user {self.created_user_username}")
            response = requests.delete(f"{self.api_url}/users/{self.created_user_username}", timeout=15)
            
            success = response.status_code == 200
            if success:
                print(f"   ✅ Test user {self.created_user_username} deleted successfully")
            else:
                print(f"   ⚠️ Could not delete test user: {response.text}")
                
            return success
        except Exception as e:
            print(f"   ⚠️ Cleanup error: {str(e)}")
            return False

    def test_create_employee(self):
        """Test creating a new employee"""
        if not self.token:
            self.log_test("Create Employee", False, "No token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "name": "Test Mitarbeiter",
                "email": "test@example.com",
                "role": "employee",
                "vacation_days_total": 25,
                "skills": [
                    {"name": "JavaScript", "rating": 4},
                    {"name": "Python", "rating": 5}
                ]
            }
            
            response = requests.post(f"{self.api_url}/employees", json=payload, headers=headers, timeout=10)
            
            success = response.status_code == 201
            if success:
                data = response.json()
                self.created_employee_id = data.get('id')
                details = f"Created employee with ID: {self.created_employee_id}"
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("Create Employee", success, details)
            return success
        except Exception as e:
            self.log_test("Create Employee", False, f"Error: {str(e)}")
            return False

    def test_get_employee_by_id(self):
        """Test getting employee by ID"""
        if not self.token or not self.created_employee_id:
            self.log_test("Get Employee by ID", False, "No token or employee ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.api_url}/employees/{self.created_employee_id}", headers=headers, timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Employee: {data.get('name')}, Skills: {len(data.get('skills', []))}"
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("Get Employee by ID", success, details)
            return success
        except Exception as e:
            self.log_test("Get Employee by ID", False, f"Error: {str(e)}")
            return False

    def test_update_employee(self):
        """Test updating an employee"""
        if not self.token or not self.created_employee_id:
            self.log_test("Update Employee", False, "No token or employee ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            payload = {
                "name": "Updated Test Mitarbeiter",
                "email": "updated@example.com",
                "role": "admin",
                "vacation_days_total": 30,
                "skills": [
                    {"name": "JavaScript", "rating": 5},
                    {"name": "Python", "rating": 5},
                    {"name": "React", "rating": 4}
                ]
            }
            
            response = requests.put(f"{self.api_url}/employees/{self.created_employee_id}", json=payload, headers=headers, timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Updated: {data.get('name')}, Role: {data.get('role')}, Skills: {len(data.get('skills', []))}"
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("Update Employee", success, details)
            return success
        except Exception as e:
            self.log_test("Update Employee", False, f"Error: {str(e)}")
            return False

    def test_get_settings(self):
        """Test getting settings"""
        if not self.token:
            self.log_test("Get Settings", False, "No token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.api_url}/settings", headers=headers, timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Total employees: {data.get('total_employees')}, Max concurrent: {data.get('max_concurrent_calculated')}"
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("Get Settings", success, details)
            return success
        except Exception as e:
            self.log_test("Get Settings", False, f"Error: {str(e)}")
            return False

    def test_delete_employee(self):
        """Test deleting an employee"""
        if not self.token or not self.created_employee_id:
            self.log_test("Delete Employee", False, "No token or employee ID available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.delete(f"{self.api_url}/employees/{self.created_employee_id}", headers=headers, timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Message: {data.get('message')}"
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("Delete Employee", success, details)
            return success
        except Exception as e:
            self.log_test("Delete Employee", False, f"Error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting Urlaubsplaner API Tests")
        print("=" * 50)
        
        # Basic connectivity tests
        self.test_health_check()
        
        # Authentication tests
        self.test_login_admin()
        self.test_login_user()
        self.test_login_invalid()
        
        # Authorization tests
        self.test_get_employees_unauthorized()
        
        # Employee CRUD tests (using admin token)
        self.test_login_admin()  # Get fresh admin token
        self.test_get_employees_authorized()
        self.test_create_employee()
        self.test_get_employee_by_id()
        self.test_update_employee()
        self.test_get_settings()
        self.test_delete_employee()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return 1

def main():
    """Main test runner"""
    tester = UrlaubsplanerAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())