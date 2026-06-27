from rest_framework import serializers
from pastes.models import Paste
import django.contrib.auth

User = django.contrib.auth.get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class PasteSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Paste
        fields = [
            'id', 'code', 'title', 'content', 'language', 
            'category', 'tags', 'user', 'username', 
            'created_at', 'updated_at', 'views', 'size'
        ]
        read_only_fields = ['code', 'username', 'created_at', 'updated_at', 'views', 'size']

class PasteCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Paste
        fields = ['title', 'content', 'language', 'category', 'tags']
    
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user if request.user.is_authenticated else None
        return super().create(validated_data)