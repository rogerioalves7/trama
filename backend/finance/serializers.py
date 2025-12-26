from rest_framework import serializers
from .models import PaymentMethod, Sale, SaleItem, FinancialTransaction, BusinessSettings
from inventory.models import Product
from django.contrib.auth.models import User

class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id', 'name', 'tax_rate'] # Adicionado 'tax_rate'

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
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        # Adicionamos 'first_name' e 'last_name' na lista
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            # Salvamos os nomes passados
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        return user
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        # Garante que a senha só pode ser escrita, nunca lida (segurança)
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # O create_user é obrigatório para criptografar a senha corretamente
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user