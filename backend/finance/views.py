from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F, Sum
from django.utils import timezone
from datetime import timedelta

# Importação dos Modelos
from .models import PaymentMethod, Sale, SaleItem, FinancialTransaction, BusinessSettings
from inventory.models import Product

# Importação dos Serializers
from .serializers import PaymentMethodSerializer, SaleSerializer, FinancialTransactionSerializer, BusinessSettingsSerializer

class PaymentMethodViewSet(viewsets.ModelViewSet):
    queryset = PaymentMethod.objects.all()
    serializer_class = PaymentMethodSerializer

class SaleViewSet(viewsets.ModelViewSet):
    """
    Gerencia Vendas.
    Ao criar uma venda:
    1. Verifica estoque.
    2. Cria a venda e os itens.
    3. Baixa o estoque.
    4. Gera o lançamento financeiro (Receita).
    """
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                # 1. Separar dados
                items_data = serializer.validated_data.pop('items')
                sale_data = serializer.validated_data
                
                # 2. Verificar Estoque ANTES de salvar qualquer coisa
                for item in items_data:
                    product = item['product'] 
                    qty = item['quantity']
                    
                    # Trava a linha do banco para evitar condição de corrida
                    product_db = Product.objects.select_for_update().get(id=product.id)
                    
                    if product_db.stock_quantity < qty:
                        raise ValueError(f"Estoque insuficiente para {product.name}. Disponível: {product_db.stock_quantity}")

                # 3. Criar a Venda
                sale = Sale.objects.create(**sale_data)

                # 4. Processar Itens e Baixar Estoque
                for item in items_data:
                    product = item['product']
                    qty = item['quantity']
                    price = item['unit_price']
                    
                    # Cria o item da venda
                    SaleItem.objects.create(sale=sale, product=product, quantity=qty, unit_price=price)
                    
                    # BAIXA DE ESTOQUE
                    Product.objects.filter(id=product.id).update(stock_quantity=F('stock_quantity') - qty)

                # 5. Gerar Transação Financeira (Caixa)
                FinancialTransaction.objects.create(
                    description=f"Venda #{sale.id} - {sale.customer_name or 'Balcão'}",
                    amount=sale.total_amount,
                    type='REVENUE',
                    sale=sale,
                    date=sale.created_at.date()
                )

                # Retorno completo da venda criada
                full_serializer = self.get_serializer(sale)
                return Response(full_serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Erro na venda: {e}")
            return Response({"error": "Erro interno ao processar venda."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FinancialTransactionViewSet(viewsets.ModelViewSet):
    """
    Gerencia o Livro Caixa (Receitas e Despesas).
    Suporta filtros por data: ?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD
    """
    # CORREÇÃO: O queryset precisa estar definido aqui para o Router funcionar,
    # mesmo que o get_queryset o sobrescreva dinamicamente.
    queryset = FinancialTransaction.objects.all()
    serializer_class = FinancialTransactionSerializer

    def get_queryset(self):
        # Começa com todas as transações, ordenadas por data e criação
        queryset = FinancialTransaction.objects.all().order_by('-date', '-created_at')
        
        # Filtros de Data vindos da URL
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
            
        return queryset

class BusinessSettingsViewSet(viewsets.ModelViewSet):
    queryset = BusinessSettings.objects.all()
    serializer_class = BusinessSettingsSerializer

class DashboardStatsView(APIView):
    """
    API dedicada para alimentar os cards do Dashboard com dados reais.
    """
    def get(self, request):
        today = timezone.now().date()
        first_day_month = today.replace(day=1)

        # 1. Vendas Hoje (Transações do tipo RECEITA com data de hoje)
        sales_today = FinancialTransaction.objects.filter(
            type='REVENUE', 
            date=today
        ).aggregate(total=Sum('amount'))['total'] or 0

        # 2. Vendas Mês
        sales_month = FinancialTransaction.objects.filter(
            type='REVENUE', 
            date__gte=first_day_month
        ).aggregate(total=Sum('amount'))['total'] or 0

        # 3. Lucro/Saldo Total (Receitas - Despesas)
        total_revenue = FinancialTransaction.objects.filter(type='REVENUE').aggregate(total=Sum('amount'))['total'] or 0
        total_expense = FinancialTransaction.objects.filter(type='EXPENSE').aggregate(total=Sum('amount'))['total'] or 0
        balance = total_revenue - total_expense

        # 4. Produtos com Estoque Baixo (Alerta)
        low_stock_count = Product.objects.filter(stock_quantity__lte=5).count()

        return Response({
            "sales_today": sales_today,
            "sales_month": sales_month,
            "balance": balance,
            "low_stock_count": low_stock_count
        })