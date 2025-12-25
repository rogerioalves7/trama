from rest_framework import serializers
from .models import Category, Material, Product, ProductComposition, Purchase, PurchaseItem

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class MaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Material
        fields = '__all__'

# --- SERIALIZERS DE COMPRA ---

class PurchaseItemSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='material.name')
    material_unit = serializers.ReadOnlyField(source='material.unit')
    
    # Recebemos o ID na escrita
    material_id = serializers.PrimaryKeyRelatedField(
        queryset=Material.objects.all(), source='material'
    )

    class Meta:
        model = PurchaseItem
        fields = ['id', 'material_id', 'material_name', 'material_unit', 'quantity', 'unit_cost', 'effective_unit_cost']
        read_only_fields = ['effective_unit_cost'] # Calculado pelo backend

class PurchaseSerializer(serializers.ModelSerializer):
    items = PurchaseItemSerializer(many=True)

    class Meta:
        model = Purchase
        fields = ['id', 'supplier', 'date', 'freight_cost', 'total_amount', 'items']

    def create(self, validated_data):
        # Remove os itens do payload para criar o cabeçalho primeiro
        items_data = validated_data.pop('items')
        purchase = Purchase.objects.create(**validated_data)
        
        # Cria os itens vinculados
        for item_data in items_data:
            PurchaseItem.objects.create(purchase=purchase, **item_data)
            
        return purchase

# --- SERIALIZERS DE PRODUTO ---

class ProductCompositionSerializer(serializers.ModelSerializer):
    material_name = serializers.ReadOnlyField(source='material.name')
    material_unit = serializers.ReadOnlyField(source='material.unit')
    material_cost = serializers.ReadOnlyField(source='material.current_cost')
    
    # CORREÇÃO: Definimos explicitamente como leitura para o DRF mapear a property do Model
    total_cost = serializers.ReadOnlyField() 
    
    material_id = serializers.PrimaryKeyRelatedField(queryset=Material.objects.all(), source='material')

    class Meta:
        model = ProductComposition
        fields = ['id', 'material_id', 'material_name', 'material_unit', 'material_cost', 'quantity', 'total_cost']

class ProductSerializer(serializers.ModelSerializer):
    composition = ProductCompositionSerializer(many=True, required=False)
    category_name = serializers.ReadOnlyField(source='category.name')

    class Meta:
        model = Product
        fields = '__all__'

    def create(self, validated_data):
        composition_data = validated_data.pop('composition', [])
        product = Product.objects.create(**validated_data)
        for comp in composition_data:
            ProductComposition.objects.create(product=product, **comp)
        return product

    def update(self, instance, validated_data):
        composition_data = validated_data.pop('composition', [])
        # Atualização genérica de campos simples
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Atualiza composição (Limpa e recria)
        if composition_data is not None:
            instance.composition.all().delete()
            for comp in composition_data:
                ProductComposition.objects.create(product=instance, **comp)
        return instance