import uuid
from django.test import TestCase, TransactionTestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.db import IntegrityError
from django.utils import timezone

User = get_user_model()


class UserModelTests(TestCase):
    """Tests for the User model"""


    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_user_creation(self):
        """Test creating a user with valid data"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertIsInstance(user.id, uuid.UUID)
        self.assertIsNotNone(user.created_at)
        self.assertIsNotNone(user.updated_at)
        self.assertIsNone(user.last_logged_in)

    def test_user_str_method(self):
        """Test the __str__ method returns username"""
        user = User.objects.create_user(**self.user_data)
        self.assertEqual(str(user), 'testuser')

    def test_unique_email_constraint(self):
        """Test that email must be unique"""
        User.objects.create_user(**self.user_data)
        duplicate_data = self.user_data.copy()
        duplicate_data['username'] = 'testuser2'

        with self.assertRaises(IntegrityError):
            User.objects.create_user(**duplicate_data)

    def test_uuid_primary_key(self):
        """Test that user ID is a UUID"""
        user = User.objects.create_user(**self.user_data)
        self.assertIsInstance(user.id, uuid.UUID)
        self.assertTrue(len(str(user.id)) == 36)  # UUID string length

    def test_timestamps_auto_update(self):
        """Test that timestamps are automatically set and updated"""
        user = User.objects.create_user(**self.user_data)
        original_updated_at = user.updated_at

        # Add a small delay to ensure timestamp difference
        import time
        time.sleep(0.01)

        # Update user and check if updated_at changes
        user.first_name = 'Updated'
        user.save()
        user.refresh_from_db()

        self.assertGreater(user.updated_at, original_updated_at)

#################################################################################
class UserRegistrationTests(APITestCase):
    """Tests for user registration endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('register')
        self.valid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_successful_registration(self):
        """Test successful user registration"""
        response = self.client.post(self.register_url, self.valid_data)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('token', response.data)
        self.assertIn('access', response.data['token'])
        self.assertIn('refresh', response.data['token'])
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')

        # Verify user was created in database
        user = User.objects.get(username='testuser')
        self.assertEqual(user.email, 'test@example.com')

    def test_password_mismatch(self):
        """Test registration with mismatched passwords"""
        data = self.valid_data.copy()
        data['password_confirm'] = 'differentpassword'

        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_duplicate_username(self):
        """Test registration with duplicate username"""
        User.objects.create_user(
            username='testuser',
            email='existing@example.com',
            password='password123'
        )

        response = self.client.post(self.register_url, self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_duplicate_email(self):
        """Test registration with duplicate email"""
        User.objects.create_user(
            username='existinguser',
            email='test@example.com',
            password='password123'
        )

        response = self.client.post(self.register_url, self.valid_data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_missing_required_fields(self):
        """Test registration with missing required fields"""
        required_fields = ['username', 'email', 'password', 'password_confirm']

        for field in required_fields:
            data = self.valid_data.copy()
            del data[field]

            response = self.client.post(self.register_url, data)
            self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
            self.assertIn(field, response.data)

    def test_invalid_email_format(self):
        """Test registration with invalid email format"""
        data = self.valid_data.copy()
        data['email'] = 'invalid-email'

        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

#################################################################################

class UserLoginTests(APITestCase):
    """Tests for user login endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.login_url = reverse('login')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_successful_login(self):
        """Test successful user login"""
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }

        response = self.client.post(self.login_url, data)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)
        self.assertIn('access', response.data['token'])
        self.assertIn('refresh', response.data['token'])

        # Verify last_logged_in was updated
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.last_login)

    def test_invalid_credentials(self):
        """Test login with invalid credentials"""
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }

        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_nonexistent_user(self):
        """Test login with nonexistent user"""
        data = {
            'username': 'nonexistent',
            'password': 'testpass123'
        }

        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_inactive_user_login(self):
        """Test login with inactive user account"""
        self.user.is_active = False
        self.user.save()

        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }

        response = self.client.post(self.login_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_missing_credentials(self):
        """Test login with missing username or password"""
        # Missing username
        response = self.client.post(self.login_url, {'password': 'testpass123'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        # Missing password
        response = self.client.post(self.login_url, {'username': 'testuser'})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

#################################################################################
class ProtectedEndpointTests(APITestCase):
    """Tests for protected endpoints requiring JWT authentication"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User'
        )
        self.refresh = RefreshToken.for_user(self.user)
        self.access_token = str(self.refresh.access_token)

        self.profile_url = reverse('user-profile')
        self.verify_url = reverse('verify-token')

    def test_get_user_profile_authenticated(self):
        """Test getting user profile with valid token"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.get(self.profile_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertEqual(response.data['user']['email'], 'test@example.com')
        self.assertIn('message', response.data)

    def test_get_user_profile_unauthenticated(self):
        """Test getting user profile without token"""
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_user_profile_invalid_token(self):
        """Test getting user profile with invalid token"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_verify_token_valid(self):
        """Test token verification with valid token"""
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        response = self.client.post(self.verify_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['valid'])
        self.assertEqual(response.data['user']['username'], 'testuser')

    def test_verify_token_invalid(self):
        """Test token verification with invalid token"""
        self.client.credentials(HTTP_AUTHORIZATION='Bearer invalid_token')
        response = self.client.post(self.verify_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_expired_token(self):
        """Test with expired token"""
        # Create token and manually set it to be expired by manipulating time
        from django.utils import timezone
        from datetime import timedelta
        import jwt
        from django.conf import settings

        # Create a token that's already expired
        payload = {
            'user_id': str(self.user.id),
            'exp': timezone.now() - timedelta(minutes=1),  # Expired 1 minute ago
            'iat': timezone.now() - timedelta(minutes=2),
        }

        # Get the secret key used by SimpleJWT
        from rest_framework_simplejwt.settings import api_settings
        expired_token = jwt.encode(payload, api_settings.SIGNING_KEY, algorithm=api_settings.ALGORITHM)

        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {expired_token}')
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

#################################################################################

class HealthCheckTests(APITestCase):
    """Tests for health check endpoint"""

    def setUp(self):
        self.client = APIClient()
        self.health_url = reverse('health-check')

    def test_health_check(self):
        """Test health check endpoint"""
        response = self.client.get(self.health_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'ok')

#################################################################################
class SerializerTests(TestCase):
    """Tests for custom serializers"""

    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }

    def test_registration_serializer_token_generation(self):
        """Test that registration serializer generates tokens"""
        from .serializers import UserRegistrationSerializer

        serializer = UserRegistrationSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())

        user = serializer.save()
        token_data = serializer.get_token(user)

        self.assertIn('access', token_data)
        self.assertIn('refresh', token_data)
        self.assertIsInstance(token_data['access'], str)
        self.assertIsInstance(token_data['refresh'], str)

    def test_login_serializer_validation(self):
        """Test login serializer validation logic"""
        from .serializers import UserLoginSerializer

        # Create user first (only use fields that User model accepts)
        user_creation_data = {
            'username': self.user_data['username'],
            'email': self.user_data['email'],
            'password': self.user_data['password'],
            'first_name': self.user_data['first_name'],
            'last_name': self.user_data['last_name']
        }
        User.objects.create_user(**user_creation_data)

        login_data = {
            'username': 'testuser',
            'password': 'testpass123'
        }

        serializer = UserLoginSerializer(data=login_data)
        self.assertTrue(serializer.is_valid())
        self.assertIn('user', serializer.validated_data)

#################################################################################
class IntegrationTests(TransactionTestCase):
    """Integration tests for complete user flows"""

    def setUp(self):
        self.client = APIClient()

    def test_complete_user_registration_and_login_flow(self):
        """Test complete flow: register -> login -> access protected endpoint"""
        # 1. Register user
        register_data = {
            'username': 'integrationuser',
            'email': 'integration@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123',
            'first_name': 'Integration',
            'last_name': 'User'
        }

        register_response = self.client.post(reverse('register'), register_data)
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        # 2. Login with registered user
        login_data = {
            'username': 'integrationuser',
            'password': 'testpass123'
        }

        login_response = self.client.post(reverse('login'), login_data)
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)

        # 3. Use token to access protected endpoint
        access_token = login_response.data['token']['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')

        profile_response = self.client.get(reverse('user-profile'))
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data['user']['username'], 'integrationuser')

#################################################################################

class SecurityTests(APITestCase):
    """Security-focused tests"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='securityuser',
            email='security@example.com',
            password='securepass123'
        )

    def test_password_not_returned_in_response(self):
        """Test that passwords are never returned in API responses"""
        register_data = {
            'username': 'newuser',
            'email': 'new@example.com',
            'password': 'newpass123',
            'password_confirm': 'newpass123'
        }

        response = self.client.post(reverse('register'), register_data)
        self.assertNotIn('password', response.data)
        self.assertNotIn('password_confirm', response.data)

    def test_jwt_token_refresh(self):
        """Test that a refresh token returns a new access token"""
        # Create refresh + access tokens for a user
        refresh = RefreshToken.for_user(self.user)

        url = reverse("token_refresh")  # provided by SimpleJWT at /api/token/refresh/
        response = self.client.post(url, {"refresh": str(refresh)})

        # Response should be 200 and contain a new access token
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)

    def test_jwt_token_contains_user_info(self):
        """Test that JWT tokens contain correct user information"""
        refresh = RefreshToken.for_user(self.user)
        access_token = refresh.access_token

        # Verify token payload contains user ID
        self.assertEqual(str(access_token['user_id']), str(self.user.id))

    def test_unauthorized_access_to_admin(self):
        """Non-admin users should be redirected from the Django admin"""
        self.client.login(username="testuser", password="pass123")  # regular user
        response = self.client.get("/admin/", follow=False)
        self.assertEqual(response.status_code, 302)

#################################################################################

class PerformanceTests(APITestCase):
    """Basic performance and load tests"""

    def test_bulk_user_creation_performance(self):
        """Test creating multiple users doesn't cause performance issues"""
        users_data = []
        for i in range(10):
            users_data.append({
                'username': f'user{i}',
                'email': f'user{i}@example.com',
                'password': 'testpass123',
                'password_confirm': 'testpass123'
            })

        start_time = timezone.now()

        for user_data in users_data:
            response = self.client.post(reverse('register'), user_data)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        end_time = timezone.now()
        duration = (end_time - start_time).total_seconds()

        # Assert that it doesn't take unreasonably long (adjust threshold as needed)
        self.assertLess(duration, 5.0)  # Should complete within 5 seconds
