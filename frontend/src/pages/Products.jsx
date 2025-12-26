import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  ArchiveBoxIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../api'

function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = () => {
    api.get('products/')
      .then(res => {
        setProducts(res.data)
        setLoading(false)
      })
      .catch(err => {
        toast.error("Erro ao carregar produtos.")
        setLoading(false)
      })
  }

  const handleDelete = (id) => {
    if(!window.confirm("Tem certeza que deseja excluir este produto?")) return

    api.delete(`products/${id}/`)
      .then(() => {
        toast.success("Produto excluído com sucesso.")
        setProducts(products.filter(p => p.id !== id))
      })
      .catch(err => {
        toast.error("Erro ao excluir. Verifique se há vendas vinculadas.")
      })
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* HEADER E BUSCA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <ArchiveBoxIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Produtos Acabados
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie seu catálogo de venda</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar produto..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <Link 
              to="/products/new" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" /> Novo Produto
            </Link>
        </div>
      </div>

      {/* LISTA DE PRODUTOS */}
      {loading ? (
        <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
                <div 
                    key={product.id} 
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between overflow-hidden"
                >
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded font-mono">
                                {product.sku || 'S/ SKU'}
                            </span>
                            {product.category_name && (
                                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                                    {product.category_name}
                                </span>
                            )}
                        </div>

                        <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-tight mb-1 line-clamp-2" title={product.name}>
                            {product.name}
                        </h3>
                        
                        <div className="mt-4 flex items-end justify-between">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold">Preço de Venda</p>
                                <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                                    R$ {parseFloat(product.price).toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CORREÇÃO AQUI: Alterado dark:bg-gray-750 para dark:bg-gray-700 */}
                    <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-100 dark:border-gray-700 p-4 flex items-center justify-between transition-colors">
                         <div className="flex items-center gap-2">
                            {product.stock_quantity <= 5 ? (
                                <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            )}
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-300">Estoque</span>
                                <span className={`text-sm font-bold ${product.stock_quantity <= 5 ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                                    {product.stock_quantity} un
                                </span>
                            </div>
                         </div>

                         <div className="flex gap-2">
                            <Link 
                                to={`/products/edit/${product.id}`} 
                                className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-600 rounded-full transition"
                                title="Editar"
                            >
                                <PencilSquareIcon className="w-5 h-5" />
                            </Link>
                            <button 
                                onClick={() => handleDelete(product.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-600 rounded-full transition"
                                title="Excluir"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                         </div>
                    </div>
                </div>
            ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20">
              <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhum produto encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">Tente buscar por outro termo ou cadastre um novo produto.</p>
          </div>
      )}
    </div>
  )
}

export default Products