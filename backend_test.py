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
        """Test health endpoint"""
        try:
            response = requests.get(f"{self.api_url}/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {data.get('status', 'unknown')}"
            else:
                details = f"Status Code: {response.status_code}"
                
            self.log_test("Health Check", success, details)
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Error: {str(e)}")
            return False

    def test_login_admin(self):
        """Test admin login with code 9999"""
        try:
            payload = {"code": "9999"}
            response = requests.post(f"{self.api_url}/auth/login", json=payload, timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                self.token = data.get('token')
                user = data.get('user', {})
                details = f"Role: {user.get('role')}, Username: {user.get('username')}"
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("Admin Login (9999)", success, details)
            return success
        except Exception as e:
            self.log_test("Admin Login (9999)", False, f"Error: {str(e)}")
            return False

    def test_login_user(self):
        """Test user login with code 1234"""
        try:
            payload = {"code": "1234"}
            response = requests.post(f"{self.api_url}/auth/login", json=payload, timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                user = data.get('user', {})
                details = f"Role: {user.get('role')}, Username: {user.get('username')}"
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("User Login (1234)", success, details)
            return success
        except Exception as e:
            self.log_test("User Login (1234)", False, f"Error: {str(e)}")
            return False

    def test_login_invalid(self):
        """Test login with invalid code"""
        try:
            payload = {"code": "0000"}
            response = requests.post(f"{self.api_url}/auth/login", json=payload, timeout=10)
            
            success = response.status_code == 401
            details = f"Status Code: {response.status_code} (Expected 401)"
                
            self.log_test("Invalid Login (0000)", success, details)
            return success
        except Exception as e:
            self.log_test("Invalid Login (0000)", False, f"Error: {str(e)}")
            return False

    def test_get_employees_unauthorized(self):
        """Test getting employees without token"""
        try:
            response = requests.get(f"{self.api_url}/employees", timeout=10)
            
            success = response.status_code == 401
            details = f"Status Code: {response.status_code} (Expected 401)"
                
            self.log_test("Get Employees (Unauthorized)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Employees (Unauthorized)", False, f"Error: {str(e)}")
            return False

    def test_get_employees_authorized(self):
        """Test getting employees with valid token"""
        if not self.token:
            self.log_test("Get Employees (Authorized)", False, "No token available")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.token}"}
            response = requests.get(f"{self.api_url}/employees", headers=headers, timeout=10)
            
            success = response.status_code == 200
            if success:
                data = response.json()
                details = f"Found {len(data)} employees"
            else:
                details = f"Status Code: {response.status_code}, Response: {response.text}"
                
            self.log_test("Get Employees (Authorized)", success, details)
            return success
        except Exception as e:
            self.log_test("Get Employees (Authorized)", False, f"Error: {str(e)}")
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