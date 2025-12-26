from django.db import models
from django.utils import timezone
from inventory.models import Product

class PaymentMethod(models.Model):
    name = models.CharField(max_length=50)
    # Adicionamos este campo novo:
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00) 

    def __str__(self):
        return self.name

class Sale(models.Model):
    """Cabeçalho da Venda"""
    created_at = models.DateTimeField(auto_now_add=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.ForeignKey(PaymentMethod, on_delete=models.SET_NULL, null=True)
    status = models.CharField(max_length=20, default='COMPLETED')
    
    customer_name = models.CharField(max_length=100, blank=True, null=True, default="Consumidor Final")
    # NOVO CAMPO:
    customer_phone = models.CharField(max_length=20, blank=True, null=True, help_text="Telefone/WhatsApp")

    def __str__(self): return f"Venda #{self.id} - R$ {self.total_amount}"

class SaleItem(models.Model):
    sale = models.ForeignKey(Sale, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    quantity = models.IntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    def save(self, *args, **kwargs):
        self.subtotal = self.quantity * self.unit_price
        super().save(*args, **kwargs)

class FinancialTransaction(models.Model):
    TRANSACTION_TYPES = [('REVENUE', 'Receita'), ('EXPENSE', 'Despesa')]
    STATUS_CHOICES = [('PAID', 'Pago/Recebido'), ('PENDING', 'Pendente/Agendado')] # <--- NOVO
    
    description = models.CharField(max_length=200)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    
    # Mudança: 'date' passa a ser a data de competência/pagamento
    date = models.DateField(default=timezone.now)
    
    # NOVO: Data de Vencimento (para previsão)
    due_date = models.DateField(default=timezone.now)
    
    # NOVO: Status
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PAID')

    created_at = models.DateTimeField(auto_now_add=True)
    sale = models.ForeignKey('Sale', on_delete=models.CASCADE, null=True, blank=True)
    
    def __str__(self): return f"{self.type}: {self.description} - R$ {self.amount}"

class BusinessSettings(models.Model):
    hourly_labor_rate = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)