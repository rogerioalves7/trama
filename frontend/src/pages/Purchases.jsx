import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, EyeIcon, TruckIcon, CalendarIcon, ClipboardDocumentListIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../api'
import Modal from '../components/Modal'

function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  // Estado para o Modal de Detalhes
  const [selectedPurchase, setSelectedPurchase] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    api.get('purchases/')
      .then(res => {
        setPurchases(res.data)
        setLoading(false)
      })
      .catch(err => {
        toast.error("Erro ao carregar compras.")
        setLoading(false)
      })
  }, [])

  const handleOpenDetails = (purchase) => {
    setSelectedPurchase(purchase)
    setIsModalOpen(true)
  }

  const formatCurrency = (val) => {
    return parseFloat(val).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* HEADER DA PÁGINA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <ClipboardDocumentListIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            Histórico de Compras
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Entradas de mercadoria e insumos</p>
        </div>
        <Link 
          to="/purchases/new" 
          className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 md:py-2 rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5" /> Nova Compra
        </Link>
      </div>

      {/* MODAL DE DETALHES */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={`Detalhes da Compra #${selectedPurchase?.id || ''}`}
      >
        {selectedPurchase && (
            <div className="space-y-6">
                {/* Cabeçalho da Compra */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 grid grid-cols-2 gap-4 text-sm transition-colors">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold">Fornecedor</p>
                        <p className="text-gray-900 dark:text-white font-medium">{selectedPurchase.supplier || 'Não informado'}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold">Data</p>
                        <p className="text-gray-900 dark:text-white font-medium">{new Date(selectedPurchase.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold">Frete</p>
                        <p className="text-gray-900 dark:text-white">{formatCurrency(selectedPurchase.freight_cost)}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 font-bold">Valor Total</p>
                        <p className="text-indigo-700 dark:text-indigo-300 font-bold text-lg">{formatCurrency(selectedPurchase.total_amount)}</p>
                    </div>
                </div>

                {/* Lista de Itens */}
                <div>
                    <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-2">Itens Comprados</h3>
                    <div className="border dark:border-gray-600 rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                            <thead className="bg-gray-100 dark:bg-gray-600">
                                <tr>
                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Material</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qtd</th>
                                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Custo Real</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {selectedPurchase.items.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200">
                                            {item.material_name} <br/>
                                            <span className="text-gray-400 text-xs">({item.material_unit})</span>
                                        </td>
                                        <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200 text-right">
                                            {parseFloat(item.quantity).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 text-sm text-indigo-700 dark:text-indigo-300 font-bold text-right bg-indigo-50 dark:bg-indigo-900/30">
                                            {formatCurrency(item.effective_unit_cost)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="pt-2">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded font-bold transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        )}
      </Modal>

      {/* LOADER */}
      {loading ? (
        <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>
      ) : (
        <>
            {/* --- VISÃO MOBILE: CARDS --- */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {purchases.map(purchase => (
                    <div key={purchase.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col gap-3 transition-colors">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-gray-800 dark:text-white">{purchase.supplier || 'Fornecedor Desconhecido'}</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                                    <CalendarIcon className="w-3 h-3" />
                                    {new Date(purchase.date).toLocaleDateString()}
                                </p>
                            </div>
                            <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded font-mono border dark:border-gray-600">
                                #{purchase.id}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                             <TruckIcon className="w-4 h-4 text-gray-400" />
                             Frete: {formatCurrency(purchase.freight_cost)}
                        </div>

                        <div className="border-t dark:border-gray-700 pt-3 flex justify-between items-center mt-1">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Total</p>
                                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(purchase.total_amount)}</p>
                            </div>
                            <button 
                                onClick={() => handleOpenDetails(purchase)}
                                className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-2 rounded-lg font-bold text-sm flex items-center gap-1 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition"
                            >
                                <EyeIcon className="w-4 h-4" /> Detalhes
                            </button>
                        </div>
                    </div>
                ))}
                {purchases.length === 0 && (
                    <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg border border-dashed dark:border-gray-700">
                        Nenhuma compra registrada.
                    </div>
                )}
            </div>

            {/* --- VISÃO DESKTOP: TABELA --- */}
            <div className="hidden md:block bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fornecedor</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Data</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Frete</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ações</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {purchases.map(purchase => (
                        <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">#{purchase.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {purchase.supplier || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {new Date(purchase.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                            {formatCurrency(purchase.freight_cost)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400 text-right">
                            {formatCurrency(purchase.total_amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button 
                                onClick={() => handleOpenDetails(purchase)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 p-2 rounded-full hover:bg-indigo-50 dark:hover:bg-gray-600 transition"
                                title="Ver Detalhes"
                            >
                                <EyeIcon className="w-5 h-5" />
                            </button>
                        </td>
                        </tr>
                    ))}
                    {purchases.length === 0 && (
                        <tr>
                            <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                Nenhuma compra registrada.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
      )}
    </div>
  )
}

export default Purchases