from rest_framework import serializers
from .models import PaymentMethod, Sale, SaleItem, FinancialTransaction, BusinessSettings
from inventory.models import Product

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = '__all__'

class SaleItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    
    # Define explicitamente que esperamos 'product_id' na entrada
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), 
        source='product'
    )

    # CORREÇÃO: O subtotal é calculado no Model, então é apenas leitura na API
    subtotal = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = SaleItem
        fields = ['id', 'product_id', 'product_name', 'quantity', 'unit_price', 'subtotal']

class SaleSerializer(serializers.ModelSerializer):
    items = SaleItemSerializer(many=True)
    payment_method_name = serializers.ReadOnlyField(source='payment_method.name')

    class Meta:
        model = Sale
        fields = ['id', 'created_at', 'total_amount', 'payment_method', 'payment_method_name', 'customer_name', 'customer_phone', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        sale = Sale.objects.create(**validated_data)
        for item in items_data:
            SaleItem.objects.create(sale=sale, **item)
        return sale

class FinancialTransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FinancialTransaction
        fields = '__all__'

class BusinessSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = BusinessSettings
        fields = '__all__'