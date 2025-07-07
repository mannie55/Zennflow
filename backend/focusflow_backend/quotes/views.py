from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils import fetch_daily_quote
from drf_spectacular.utils import extend_schema
from .serializers import QuoteSerializer

class DailyQuoteView(APIView):
    permission_classes = []  # Public view
    serializer_class = QuoteSerializer

    def get(self, request):
        quote = fetch_daily_quote()
        if not quote:
            return Response({"detail": "No quote available."}, status=503)
        
        serializer = self.serializer_class(quote)
        return Response({
            "quote": serializer.data,
            "message": "Daily quote fetched successfully."
        }, status=status.HTTP_200_OK)
