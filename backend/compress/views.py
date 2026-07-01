import os
import shutil
import zipfile
from PIL import Image
from PyPDF2 import PdfReader, PdfWriter
from docx import Document
import io

from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView


class CompressView(APIView):
    permission_classes = [AllowAny]
    supported_formats = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'txt', 'zip', 'rar']
    max_file_size = 100 * 1024 * 1024

    def post(self, request):
        pass
