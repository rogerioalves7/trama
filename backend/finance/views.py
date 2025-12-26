from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F, Sum
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal

# Importação dos Modelos
# Nota: Certifique-se de que Sale e SaleItem estão acessíveis aqui. 
# Se estiverem em outro app (ex: sales), ajuste para: from sales.models import Sale, SaleItem
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
    4. Gera o lançamento financeiro (Receita Líquida - descontando taxas).
    """
    queryset = Sale.objects.all().order_by('-created_at')
    serializer_class = SaleSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                items_data = serializer.validated_data.pop('items')
                sale_data = serializer.validated_data
                
                # Verificação de Estoque
                for item in items_data:
                    product = item['product'] 
                    qty = item['quantity']
                    product_db = Product.objects.select_for_update().get(id=product.id)
                    if product_db.stock_quantity < qty:
                        raise ValueError(f"Estoque insuficiente para {product.name}.")

                sale = Sale.objects.create(**sale_data)

                # Baixa de Estoque e Criação dos Itens
                for item in items_data:
                    product = item['product']
                    qty = item['quantity']
                    price = item['unit_price']
                    SaleItem.objects.create(sale=sale, product=product, quantity=qty, unit_price=price)
                    Product.objects.filter(id=product.id).update(stock_quantity=F('stock_quantity') - qty)

                # --- LÓGICA FINANCEIRA ---
                method = sale.payment_method
                method_name = method.name.lower()
                
                # 1. Calcular o valor LÍQUIDO (descontando a taxa)
                # Se não houver taxa definida, assume 0
                tax_rate = method.tax_rate if hasattr(method, 'tax_rate') and method.tax_rate else Decimal(0)
                
                fee_amount = sale.total_amount * (tax_rate / Decimal(100))
                net_amount = sale.total_amount - fee_amount # Valor que entra no caixa
                
                # 2. Definir datas e status
                trans_status = 'PAID'
                due_date = sale.created_at.date()
                
                # Regra: Crédito = Pendente (30 dias)
                if 'crédito' in method_name or 'credito' in method_name:
                    trans_status = 'PENDING'
                    due_date = sale.created_at.date() + timedelta(days=30)
                
                # 3. Criar Transação com valor LÍQUIDO
                description = f"Venda #{sale.id}"
                if sale.customer_name:
                    description += f" - {sale.customer_name}"
                
                if fee_amount > 0:
                    description += f" (Taxa {tax_rate}%: -R${fee_amount:.2f})"

                FinancialTransaction.objects.create(
                    description=description,
                    amount=net_amount, # Salva o valor líquido
                    type='REVENUE',
                    sale=sale,
                    date=sale.created_at.date(),
                    due_date=due_date,
                    status=trans_status
                )

                full_serializer = self.get_serializer(sale)
                return Response(full_serializer.data, status=status.HTTP_201_CREATED)

        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print(f"Erro venda: {e}")
            return Response({"error": "Erro interno ao processar venda."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FinancialTransactionViewSet(viewsets.ModelViewSet):
    """
    Gerencia o Livro Caixa (Receitas e Despesas).
    """
    queryset = FinancialTransaction.objects.all()
    serializer_class = FinancialTransactionSerializer

    def get_queryset(self):
        queryset = FinancialTransaction.objects.all().order_by('-date', '-created_at')
        
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
    Fornece os KPIs para o Dashboard.
    """
    def get(self, request):
        # CORREÇÃO AQUI:
        # Convertemos o horário atual (UTC) para o horário local configurado no settings
        # antes de extrair a data. Isso garante que 23h ainda seja "hoje".
        now = timezone.localtime(timezone.now())
        today = now.date()
        
        first_day_month = today.replace(day=1)

        # --- 1. VENDAS (Baseado no modelo Sale = Valor Bruto) ---
        sales_today_qs = Sale.objects.filter(created_at__date=today)
        sales_month_qs = Sale.objects.filter(created_at__date__gte=first_day_month)

        # Totais Brutos
        sales_today_total = sales_today_qs.aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        sales_month_total = sales_month_qs.aggregate(Sum('total_amount'))['total_amount__sum'] or 0

        # Cálculo das Taxas
        sales_today_fees = sum(
            sale.total_amount * (sale.payment_method.tax_rate / Decimal(100)) 
            for sale in sales_today_qs if hasattr(sale.payment_method, 'tax_rate') and sale.payment_method.tax_rate
        )

        sales_month_fees = sum(
            sale.total_amount * (sale.payment_method.tax_rate / Decimal(100)) 
            for sale in sales_month_qs if hasattr(sale.payment_method, 'tax_rate') and sale.payment_method.tax_rate
        )

        # Listas para detalhamento (Modal)
        sales_today_list = [
            {
                "id": s.id, 
                "amount": s.total_amount, 
                "description": s.created_at.astimezone().strftime('%H:%M'), # .astimezone() garante hora local na string
                "sale__customer_name": s.customer_name
            } 
            for s in sales_today_qs.order_by('-created_at')
        ]
        
        sales_month_list = [
            {
                "id": s.id, 
                "amount": s.total_amount, 
                "description": s.created_at.astimezone().strftime('%d/%m'), 
                "sale__customer_name": s.customer_name
            } 
            for s in sales_month_qs.order_by('-created_at')[:10]
        ]

        # --- 2. FINANCEIRO ---
        future_in = FinancialTransaction.objects.filter(type='REVENUE', status='PENDING').aggregate(total=Sum('amount'))['total'] or 0
        future_out = FinancialTransaction.objects.filter(type='EXPENSE', status='PENDING').aggregate(total=Sum('amount'))['total'] or 0

        # --- 3. ESTOQUE ---
        low_stock_qs = Product.objects.filter(stock_quantity__lte=5)
        low_stock_count = low_stock_qs.count()
        low_stock_list = low_stock_qs.values('id', 'name', 'stock_quantity')

        # --- 4. GRÁFICO (Últimos 7 dias - Vendas Brutas) ---
        sales_history = []
        for i in range(6, -1, -1):
            day = today - timedelta(days=i)
            total = Sale.objects.filter(created_at__date=day).aggregate(t=Sum('total_amount'))['t'] or 0
            sales_history.append({"date": day.strftime("%d/%m"), "value": total})

        # --- 5. TOP PRODUTOS ---
        top_products_qs = SaleItem.objects.filter(sale__created_at__date__gte=first_day_month)\
            .values('product__name')\
            .annotate(total_qty=Sum('quantity'))\
            .order_by('-total_qty')[:5]
        
        top_products = [{"name": i['product__name'], "quantity": i['total_qty']} for i in top_products_qs]

        return Response({
            "sales_today": sales_today_total,
            "sales_today_fees": sales_today_fees,
            "sales_today_list": sales_today_list,
            
            "sales_month": sales_month_total,
            "sales_month_fees": sales_month_fees,
            "sales_month_list": sales_month_list,
            
            "future_in": future_in,
            "future_out": future_out,
            
            "low_stock_count": low_stock_count,
            "low_stock_list": list(low_stock_list),
            
            "sales_history": sales_history,
            "top_products": top_products
        })