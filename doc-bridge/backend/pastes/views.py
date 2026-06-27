from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import Paste
from pastes.serializers import PasteSerializer, PasteCreateSerializer

class PasteListView(generics.ListCreateAPIView):
    queryset = Paste.objects.all().order_by('-created_at')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PasteCreateSerializer
        return PasteSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

class PasteDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Paste.objects.all()
    lookup_field = 'code'
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return PasteCreateSerializer
        return PasteSerializer
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if instance.user and instance.user != request.user:
            return Response(
                {'error': 'Вы не можете удалить эту пасту'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response({'success': True, 'message': 'Паста удалена'})