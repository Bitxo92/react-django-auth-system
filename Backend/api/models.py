from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
import uuid

class User(AbstractUser):
    id = models.UUIDField(primary_key=True,default=uuid.uuid4,editable=False)
    email= models.EmailField(unique=True)
    created_at= models.DateTimeField(default=timezone.now,editable=False)
    updated_at= models.DateTimeField(auto_now=True)
    last_logged_in= models.DateTimeField(null=True,blank=True)

    def __str__(self):
        return self.username
