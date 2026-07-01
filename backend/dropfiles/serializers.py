from rest_framework import serializers
from dropfiles.models import FileUpload


class DroppageSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ['id', 'code', 'files', 'size', 'created_at', 'user']