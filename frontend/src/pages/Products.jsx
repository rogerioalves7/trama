import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { TrashIcon, WrenchScrewdriverIcon, XMarkIcon, ExclamationCircleIcon, PencilIcon } from '@heroicons/react/24/outline'

import api from '../api'
import NumberInput from '../components/NumberInput'
import ActionMenu, { ActionItem } from '../components/ActionMenu' // <--- Menu

// Modal Genérico (Mantido igual)
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in transform transition-all scale-100">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button onClick={onClose}><XMarkIcon className="w-5 h-5 text-gray-400 hover:text-gray-600"/></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const [productionModal, setProductionModal] = useState({ open: false, product: null, qty: 1 })
  const [deleteModal, setDeleteModal] = useState({ open: false, product: null })

  const fetchProducts = () => {
    setLoading(true)
    api.get('products/')
    .then(res => {
      setProducts(res.data)
      setLoading(false)
    })
    .catch(() => {
      toast.error('Erro ao carregar produtos.')
      setLoading(false)
    })
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleConfirmProduction = () => {
    const { product, qty } = productionModal
    if (parseFloat(qty) <= 0) {
        toast.error("Qtd inválida.")
        return
    }
    api.post(`products/${product.id}/produce/`, { quantity: qty })
    .then(() => {
      toast.success(`Produção registrada!`)
      setProductionModal({ open: false, product: null, qty: 1 })
      fetchProducts()
    })
    .catch(err => {
        const msg = err.response?.data?.detail || "Erro ao registrar."
        toast.error(msg)
    })
  }

  const handleConfirmDelete = () => {
    const { product } = deleteModal
    api.delete(`products/${product.id}/`)
    .then(() => {
      toast.success("Excluído!")
      setDeleteModal({ open: false, product: null })
      fetchProducts()
    })
    .catch(() => toast.error("Erro ao excluir."))
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* Modais (Mantidos) */}
      <Modal isOpen={productionModal.open} onClose={() => setProductionModal({ ...productionModal, open: false })} title="Registrar Produção">
        <p className="text-sm text-gray-600 mb-4">Produzindo: <strong>{productionModal.product?.name}</strong></p>
        <div className="mb-6">
          <NumberInput label="Qtd" name="qty" min={1} step={1} value={productionModal.qty} onChange={(e) => setProductionModal({...productionModal, qty: e.target.value})} />
        </div>
        <div className="flex justify-end gap-2">
            <button onClick={() => setProductionModal({...productionModal, open: false})} className="px-4 py-2 text-gray-600 bg-gray-100 rounded w-full">Cancelar</button>
            <button onClick={handleConfirmProduction} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded w-full">Confirmar</button>
        </div>
      </Modal>

      <Modal isOpen={deleteModal.open} onClose={() => setDeleteModal({ ...deleteModal, open: false })} title="Excluir">
        <div className="flex flex-col items-center text-center mb-6">
            <div className="bg-red-100 p-3 rounded-full mb-3"><ExclamationCircleIcon className="w-8 h-8 text-red-600" /></div>
            <p className="text-gray-800">Confirmar exclusão?</p>
            <p className="text-sm text-gray-500 font-bold mt-1">{deleteModal.product?.name}</p>
        </div>
        <div className="flex justify-center gap-3">
            <button onClick={() => setDeleteModal({...deleteModal, open: false})} className="px-4 py-2 border rounded w-full">Cancelar</button>
            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-red-600 text-white font-bold rounded w-full">Excluir</button>
        </div>
      </Modal>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-sm text-gray-500">Estoque de venda</p>
        </div>
        <Link to="/products/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-sm w-full md:w-auto text-center">
          + Novo Produto
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200">
          
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-auto">Produto / Preço</th>
                <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-32">Preço</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase w-20">Estoque</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase w-14"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-[170px] md:max-w-none">
                        {product.name}
                    </div>
                    {/* Preço aparece aqui no mobile */}
                    <div className="text-xs font-bold text-green-700 mt-0.5 md:hidden">
                        R$ {product.price}
                    </div>
                  </td>
                  
                  {/* Preço Desktop */}
                  <td className="hidden md:table-cell px-4 py-3 text-sm font-bold text-green-700">
                    R$ {product.price}
                  </td>
                  
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${product.stock_quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  
                  <td className="px-1 py-3 text-right">
                    <ActionMenu>
                        <ActionItem 
                            icon={WrenchScrewdriverIcon} 
                            label="Produzir" 
                            onClick={() => setProductionModal({ open: true, product, qty: 1 })}
                            colorClass="text-indigo-600 hover:bg-indigo-50 font-bold"
                        />
                        <ActionItem 
                            icon={PencilIcon} 
                            label="Editar" 
                            onClick={() => navigate(`/products/edit/${product.id}`)}
                        />
                        <ActionItem 
                            icon={TrashIcon} 
                            label="Excluir" 
                            onClick={() => setDeleteModal({ open: true, product })}
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

export default Products