from django.contrib import admin
from .models import PaymentMethod, Sale, SaleItem, FinancialTransaction, BusinessSettings

# Permite ver os itens da venda dentro da tela da Venda no Admin
class SaleItemInline(admin.TabularInline):
    model = SaleItem
    extra = 0
    readonly_fields = ('subtotal',)

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):
    list_display = ('id', 'created_at', 'customer_name', 'total_amount', 'payment_method', 'status')
    list_filter = ('created_at', 'payment_method', 'status')
    search_fields = ('customer_name',)
    inlines = [SaleItemInline]
    readonly_fields = ('total_amount',)

@admin.register(FinancialTransaction)
class FinancialTransactionAdmin(admin.ModelAdmin):
    # Atualizado para refletir o novo Model
    list_display = ('id', 'type', 'description', 'amount', 'date', 'sale')
    list_filter = ('type', 'date')
    search_fields = ('description',)
    date_hierarchy = 'date'

@admin.register(PaymentMethod)
class PaymentMethodAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')

@admin.register(BusinessSettings)
class BusinessSettingsAdmin(admin.ModelAdmin):
    list_display = ('hourly_labor_rate',)   