from rest_framework import serializers
from userfiles.models import FileUpload


class DroppageSerializer(serializers.Serializer):
    class Meta:
        model = FileUpload
        fields = ['id', 'code', 'files', 'size', 'created_at', 'user']