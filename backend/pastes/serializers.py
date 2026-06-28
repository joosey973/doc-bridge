from rest_framework import serializers
from pastes.models import Pastes


class PasteSerializer(serializers.ModelSerializer):
    def validate(self, attrs):
        text = attrs.get('text')
        if len(text) <= 5:
            raise serializers.ValidationError({
                'text': 'Длина текста должна быть больше 5 символов!',
            })
        
        return attrs

    class Meta:
        model = Pastes
        fields = ['id', 'code', 'title', 'text', 'category', 'language',
                  'tags', 'created_at', 'updated_at', 'views', 'size', 'user']
        read_only_fields = ['created_at', 'updated_at', 'views', 'size']