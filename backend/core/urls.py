from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# Importações dos Apps
from inventory.views import CategoryViewSet, MaterialViewSet, ProductViewSet, PurchaseViewSet
from finance.views import PaymentMethodViewSet, SaleViewSet, FinancialTransactionViewSet, BusinessSettingsViewSet, DashboardStatsView, UserViewSet

# Configuração do Router Automático
router = DefaultRouter()

# Inventory
router.register(r'categories', CategoryViewSet)
router.register(r'materials', MaterialViewSet)
router.register(r'products', ProductViewSet)
router.register(r'purchases', PurchaseViewSet)

# Finance
router.register(r'payment-methods', PaymentMethodViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'transactions', FinancialTransactionViewSet)
router.register(r'settings', BusinessSettingsViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Rotas da API (Router)
    path('api/', include(router.urls)),
    
    # Rota Manual do Dashboard (Stats)
    path('api/dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),

    # Autenticação JWT
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
]