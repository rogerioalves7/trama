import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  CubeIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../api'

function Inventory() {
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchMaterials()
  }, [])

  const fetchMaterials = () => {
    api.get('materials/')
      .then(res => {
        setMaterials(res.data)
        setLoading(false)
      })
      .catch(err => {
        toast.error("Erro ao carregar insumos.")
        setLoading(false)
      })
  }

  const handleDelete = (id) => {
    if(!window.confirm("Tem certeza que deseja excluir este insumo?")) return

    api.delete(`materials/${id}/`)
      .then(() => {
        toast.success("Insumo excluído.")
        setMaterials(materials.filter(m => m.id !== id))
      })
      .catch(err => {
        toast.error("Erro ao excluir. Verifique se é usado em algum produto.")
      })
  }

  const filteredMaterials = materials.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto">
      
      {/* HEADER E BUSCA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <CubeIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Estoque de Insumos
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Gerencie matérias-primas e custos</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar insumo..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors shadow-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <Link 
              to="/inventory/new" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5" /> Novo Insumo
            </Link>
        </div>
      </div>

      {/* LISTA DE INSUMOS */}
      {loading ? (
        <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMaterials.map(material => {
                const isLowStock = material.stock_quantity <= material.min_stock_level;

                return (
                    <div 
                        key={material.id} 
                        className={`
                            rounded-xl shadow-sm border transition-all duration-300 flex flex-col justify-between overflow-hidden
                            ${isLowStock 
                                ? 'bg-red-50 dark:bg-gray-800 border-red-200 dark:border-red-900/50' 
                                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg'}
                        `}
                    >
                        <div className="p-5">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500">
                                    Insumo #{material.id}
                                </span>
                                <span className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded font-bold">
                                    {material.unit}
                                </span>
                            </div>

                            <h3 className="font-bold text-lg text-gray-800 dark:text-white leading-tight mb-4 line-clamp-2" title={material.name}>
                                {material.name}
                            </h3>
                            
                            <div className="flex items-center gap-2 mb-2">
                                <CurrencyDollarIcon className="w-4 h-4 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-400 uppercase font-bold">Custo Atual</p>
                                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                                        R$ {parseFloat(material.current_cost).toFixed(2)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CORREÇÃO AQUI: Alterado dark:bg-gray-750 para dark:bg-gray-700 */}
                        <div className={`p-4 flex items-center justify-between border-t transition-colors ${
                            isLowStock 
                                ? 'bg-red-100/50 dark:bg-red-900/20 border-red-200 dark:border-red-900/30' 
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-100 dark:border-gray-700'
                        }`}>
                             <div className="flex items-center gap-2">
                                {isLowStock ? (
                                    <ExclamationCircleIcon className="w-6 h-6 text-red-500 animate-pulse" />
                                ) : (
                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                )}
                                <div className="flex flex-col">
                                    <span className={`text-[10px] uppercase font-bold ${isLowStock ? 'text-red-600 dark:text-red-400' : 'text-gray-400 dark:text-gray-300'}`}>
                                        {isLowStock ? 'Estoque Baixo' : 'Disponível'}
                                    </span>
                                    <span className={`text-sm font-bold ${isLowStock ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-gray-200'}`}>
                                        {parseFloat(material.stock_quantity).toFixed(2)} {material.unit}
                                    </span>
                                </div>
                             </div>

                             <div className="flex gap-2">
                                <Link 
                                    to={`/inventory/edit/${material.id}`} 
                                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-gray-600 rounded-full transition"
                                    title="Editar"
                                >
                                    <PencilSquareIcon className="w-5 h-5" />
                                </Link>
                                <button 
                                    onClick={() => handleDelete(material.id)}
                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-white dark:hover:bg-gray-600 rounded-full transition"
                                    title="Excluir"
                                >
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                             </div>
                        </div>
                    </div>
                )
            })}
        </div>
      )}

      {!loading && filteredMaterials.length === 0 && (
          <div className="text-center py-20">
              <CubeIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhum insumo encontrado</h3>
              <p className="text-gray-500 dark:text-gray-400">Cadastre materiais para começar a controlar seus custos.</p>
          </div>
      )}
    </div>
  )
}

export default Inventory