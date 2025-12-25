from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.db.models import F
from decimal import Decimal
from .models import Category, Material, Product, Purchase
from .serializers import CategorySerializer, MaterialSerializer, ProductSerializer, PurchaseSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class MaterialViewSet(viewsets.ModelViewSet):
    queryset = Material.objects.all()
    serializer_class = MaterialSerializer

class PurchaseViewSet(viewsets.ModelViewSet):
    """
    Gerencia as Compras (Entradas).
    Ao criar, calcula o rateio do frete e atualiza o estoque/custo dos materiais.
    """
    queryset = Purchase.objects.all().order_by('-date', '-created_at')
    serializer_class = PurchaseSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            with transaction.atomic():
                # 1. Salva o Cabeçalho e os Itens (via Serializer)
                purchase = serializer.save()
                
                # --- LÓGICA DE RATEIO DE FRETE ---
                freight = purchase.freight_cost
                items = purchase.items.all()
                
                # Calcula subtotal dos produtos (para peso financeiro)
                subtotal_products = sum(item.quantity * item.unit_cost for item in items)
                
                if subtotal_products > 0:
                    for item in items:
                        # Cálculo do Rateio
                        item_total_raw = item.quantity * item.unit_cost
                        ratio = item_total_raw / subtotal_products
                        item_freight_share = freight * ratio
                        
                        # Custo total da linha (Produto + Parcela do Frete)
                        line_total_with_freight = item_total_raw + item_freight_share
                        
                        # Novo Custo Unitário Efetivo
                        new_unit_cost = line_total_with_freight / item.quantity
                        
                        # Atualiza o item da compra
                        item.effective_unit_cost = new_unit_cost
                        item.save()

                        # --- ATUALIZAÇÃO DO MATERIAL ---
                        material = item.material
                        
                        # 1. Aumenta o Estoque (Entrada)
                        # Usamos F() para evitar 'race conditions'
                        Material.objects.filter(id=material.id).update(
                            stock_quantity=F('stock_quantity') + item.quantity
                        )
                        
                        # 2. Atualiza o Custo Atual (Média ou Último Preço)
                        # Aqui estamos usando o "Último Preço Pago" como custo padrão
                        material.current_cost = new_unit_cost
                        material.save()
                        
                # Atualiza total da nota
                purchase.total_amount = subtotal_products + freight
                purchase.save()

                headers = self.get_success_headers(serializer.data)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        except Exception as e:
            print(f"Erro ao salvar compra: {e}")
            return Response({"error": "Erro ao processar compra.", "detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=True, methods=['post'])
    def produce(self, request, pk=None):
        """
        Registra a Produção.
        1. Verifica se tem insumos suficientes.
        2. Baixa o estoque dos insumos.
        3. Aumenta o estoque do produto acabado.
        """
        product = self.get_object()
        
        try:
            quantity_produced = Decimal(str(request.data.get('quantity', 0)))
        except:
            return Response({"error": "Quantidade inválida"}, status=status.HTTP_400_BAD_REQUEST)

        if quantity_produced <= 0:
            return Response({"error": "A quantidade deve ser maior que zero"}, status=status.HTTP_400_BAD_REQUEST)

        print(f"--- 🏭 PRODUÇÃO: {product.name} (Qtd: {quantity_produced}) ---")

        try:
            with transaction.atomic():
                composition = product.composition.all()
                
                if not composition.exists():
                    print("⚠️ AVISO: Produto sem ficha técnica. Baixa de insumos ignorada.")

                # 1. VERIFICAÇÃO DE ESTOQUE (Bloqueia as linhas para evitar conflito)
                for item in composition:
                    # Carrega o material garantindo os dados mais recentes
                    material = Material.objects.select_for_update().get(id=item.material.id)
                    
                    required_qty = item.quantity * quantity_produced
                    
                    print(f"Checking: {material.name} | Precisa: {required_qty} | Tem: {material.stock_quantity}")

                    if material.stock_quantity < required_qty:
                        return Response(
                            {
                                "error": f"Estoque insuficiente de {material.name}.",
                                "detail": f"Necessário: {required_qty} {material.unit}. Disponível: {material.stock_quantity} {material.unit}."
                            },
                            status=status.HTTP_400_BAD_REQUEST
                        )

                # 2. BAIXA DE ESTOQUE DOS INSUMOS
                for item in composition:
                    required_qty = item.quantity * quantity_produced
                    
                    # UPDATE inventory_material SET stock_quantity = stock_quantity - required_qty
                    Material.objects.filter(id=item.material.id).update(
                        stock_quantity=F('stock_quantity') - required_qty
                    )
                    print(f"🔻 Baixou {required_qty} de {item.material.name}")

                # 3. ENTRADA DO PRODUTO ACABADO
                Product.objects.filter(id=product.id).update(
                    stock_quantity=F('stock_quantity') + quantity_produced
                )
                print(f"✅ Produziu {quantity_produced} de {product.name}")

            # Recarrega para retornar os dados atualizados
            product.refresh_from_db()

            return Response({
                "status": "Produção registrada com sucesso",
                "product": product.name,
                "produced": str(quantity_produced),
                "new_stock": str(product.stock_quantity)
            })

        except Exception as e:
            print(f"Erro na produção: {e}")
            return Response({"error": "Erro interno ao registrar produção.", "detail": str(e)}, status=500)