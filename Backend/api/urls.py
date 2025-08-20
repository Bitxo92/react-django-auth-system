from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('profile/', views.get_user_profile, name='user-profile'),
    path('verify/', views.verify_token, name='verify-token'),
    path('health/', views.health_check, name='health-check'),

]
