import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PencilIcon, TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import api from '../api'
import ActionMenu, { ActionItem } from '../components/ActionMenu' // <--- Importamos o Menu

function Inventory() {
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMaterials = () => {
    setLoading(true)
    api.get('materials/')
    .then(res => {
      setMaterials(res.data)
      setLoading(false)
    })
    .catch(() => {
      toast.error('Erro ao carregar insumos.')
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchMaterials()
  }, [])

  const handleDelete = (id) => {
    if(!window.confirm("Deseja excluir?")) return;
    api.delete(`materials/${id}/`)
    .then(() => {
      toast.success("Excluído.")
      fetchMaterials()
    })
    .catch(() => toast.error("Em uso por produto."))
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Insumos</h1>
          <p className="text-sm text-gray-500">Gerencie matérias-primas</p>
        </div>
        <Link 
          to="/inventory/new" 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-sm w-full md:w-auto text-center"
        >
          + Novo Insumo
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          {/* Removemos o overflow-x-auto pois agora cabe tudo */}
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                {/* Coluna Principal: Cresce o quanto der */}
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-auto">Material / Custo</th>
                
                {/* Colunas Desktop (Somem no mobile) */}
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-24">Unidade</th>
                
                {/* Coluna Estoque: Tamanho fixo pequeno */}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Estoque</th>
                
                {/* Coluna Ações: Tamanho fixo do botão */}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-14"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map(mat => (
                <tr key={mat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[180px] md:max-w-none">
                      {mat.name}
                    </div>
                    {/* No mobile, mostramos os detalhes aqui em baixo */}
                    <div className="text-xs text-gray-500 mt-0.5">
                       R$ {mat.current_cost} / {mat.unit}
                    </div>
                  </td>
                  
                  {/* Desktop Only */}
                  <td className="hidden md:table-cell px-4 py-3 text-sm text-gray-500">{mat.unit}</td>
                  
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${parseFloat(mat.stock_quantity) <= 0 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {parseFloat(mat.stock_quantity).toFixed(1)}
                    </span>
                    {parseFloat(mat.stock_quantity) <= 0 && (
                        <div className="flex justify-center mt-1">
                             <ExclamationTriangleIcon className="w-3 h-3 text-red-500" />
                        </div>
                    )}
                  </td>
                  
                  <td className="px-1 py-3 text-right">
                     <ActionMenu>
                        <ActionItem 
                            icon={PencilIcon} 
                            label="Editar" 
                            onClick={() => navigate(`/inventory/edit/${mat.id}`)} 
                        />
                        <ActionItem 
                            icon={TrashIcon} 
                            label="Excluir" 
                            onClick={() => handleDelete(mat.id)}
                            colorClass="text-red-600 hover:bg-red-50"
                        />
                     </ActionMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Inventory