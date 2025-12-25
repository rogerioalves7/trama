from django.contrib import admin
# Note que aqui importamos APENAS coisas de estoque
from .models import Category, Material, Product, ProductComposition

class ProductCompositionInline(admin.TabularInline):
    model = ProductComposition
    extra = 1

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock_quantity')
    inlines = [ProductCompositionInline]

admin.site.register(Category)
admin.site.register(Material)