from django.db import models
from django.utils import timezone
from decimal import Decimal

class Category(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self): 
        return self.name

class Material(models.Model):
    name = models.CharField(max_length=200)
    unit = models.CharField(max_length=4, choices=[('UN', 'UN'), ('MT', 'MT'), ('KG', 'KG'), ('LT', 'LT')])
    # Este custo será atualizado automaticamente ao salvar uma Compra
    current_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=3, default=0)

    def __str__(self): 
        return self.name

class Product(models.Model):
    name = models.CharField(max_length=200)
    sku = models.CharField(max_length=50, unique=True, blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    stock_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    acquisition_price = models.DecimalField(max_digits=10, decimal_places=2, default=0, blank=True, null=True)
    labor_time_minutes = models.IntegerField(default=0)
    profit_margin = models.DecimalField(max_digits=5, decimal_places=2, default=50.00)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self): 
        return self.name

class ProductComposition(models.Model):
    product = models.ForeignKey(Product, related_name='composition', on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.PROTECT)
    quantity = models.DecimalField(max_digits=10, decimal_places=3)

    # CORREÇÃO: Propriedade calculada necessária para o Serializer
    @property
    def total_cost(self):
        # Garante que usamos o custo atual do material
        cost = self.material.current_cost if self.material else 0
        return self.quantity * cost

# --- MODELOS DE COMPRA (Mestre-Detalhe) ---

class Purchase(models.Model):
    """Cabeçalho da Compra (Nota Fiscal)"""
    supplier = models.CharField(max_length=100, blank=True, null=True, help_text="Fornecedor")
    date = models.DateField(default=timezone.now)
    
    # Valores totais
    freight_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Valor do Frete")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Total Produtos + Frete")
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self): 
        return f"Compra #{self.id} - {self.supplier} ({self.date})"

class PurchaseItem(models.Model):
    """Itens da Compra"""
    purchase = models.ForeignKey(Purchase, related_name='items', on_delete=models.CASCADE)
    material = models.ForeignKey(Material, related_name='purchase_history', on_delete=models.PROTECT)
    
    quantity = models.DecimalField(max_digits=10, decimal_places=3)
    unit_cost = models.DecimalField(max_digits=10, decimal_places=2, help_text="Preço na Nota (sem frete)")
    
    # Campo calculado: Custo final unitário após rateio do frete
    effective_unit_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0, help_text="Custo Final (Com Frete)")

    def __str__(self):
        return f"{self.quantity}x {self.material.name}"