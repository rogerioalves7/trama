import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { 
  BanknotesIcon, 
  ArrowDownCircleIcon, 
  ArrowUpCircleIcon, 
  TrashIcon, 
  FunnelIcon 
} from '@heroicons/react/24/outline'

import api from '../api'
import Modal from '../components/Modal'
import CurrencyInput from '../components/CurrencyInput'

function Financial() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  
  // Filtros de Data (Padrão: Mês Atual)
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

  const [filters, setFilters] = useState({
    start_date: firstDay,
    end_date: lastDay
  })

  // Estado do Modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTrans, setNewTrans] = useState({
    type: 'EXPENSE', // EXPENSE ou REVENUE
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })
  const [saving, setSaving] = useState(false)

  // Carregar Transações
  const fetchTransactions = () => {
    setLoading(true)
    api.get(`transactions/?start_date=${filters.start_date}&end_date=${filters.end_date}`)
      .then(res => {
        setTransactions(res.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error("Erro ao carregar extrato.")
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTransactions()
  }, [filters]) // Recarrega sempre que mudar as datas

  // Salvar Nova Transação
  const handleSave = () => {
    if (!newTrans.description || !newTrans.amount) return toast.error("Preencha todos os campos")
    
    setSaving(true)
    api.post('transactions/', newTrans)
      .then(() => {
        toast.success("Lançamento realizado!")
        setIsModalOpen(false)
        setNewTrans({ ...newTrans, description: '', amount: '' })
        fetchTransactions()
      })
      .catch(() => toast.error("Erro ao salvar."))
      .finally(() => setSaving(false))
  }

  // Excluir Transação
  const handleDelete = (id) => {
    if(!window.confirm("Confirmar exclusão deste lançamento?")) return
    
    api.delete(`transactions/${id}/`)
      .then(() => {
        toast.success("Excluído.")
        fetchTransactions()
      })
      .catch(() => toast.error("Erro ao excluir."))
  }

  // Cálculos do Período
  const revenue = transactions.filter(t => t.type === 'REVENUE').reduce((acc, t) => acc + parseFloat(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE').reduce((acc, t) => acc + parseFloat(t.amount), 0)
  const balance = revenue - expense

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* MODAL DE LANÇAMENTO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento">
        <div className="space-y-4">
            
            {/* Tipo */}
            <div className="flex gap-2">
                <button 
                    onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})}
                    className={`flex-1 py-2 rounded font-bold border ${newTrans.type === 'EXPENSE' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-white text-gray-500'}`}
                >
                    Saída (Despesa)
                </button>
                <button 
                    onClick={() => setNewTrans({...newTrans, type: 'REVENUE'})}
                    className={`flex-1 py-2 rounded font-bold border ${newTrans.type === 'REVENUE' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-gray-500'}`}
                >
                    Entrada (Receita)
                </button>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                <input 
                    type="text" 
                    placeholder={newTrans.type === 'EXPENSE' ? "Ex: Conta de Luz" : "Ex: Venda Extra"}
                    className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newTrans.description}
                    onChange={e => setNewTrans({...newTrans, description: e.target.value})}
                />
            </div>

            <div>
                <CurrencyInput 
                    label="Valor (R$)" 
                    value={newTrans.amount} 
                    onChange={e => setNewTrans({...newTrans, amount: e.target.value})}
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data</label>
                <input 
                    type="date"
                    className="w-full border p-2 rounded outline-none"
                    value={newTrans.date}
                    onChange={e => setNewTrans({...newTrans, date: e.target.value})}
                />
            </div>

            <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 mt-4"
            >
                {saving ? 'Salvando...' : 'Confirmar Lançamento'}
            </button>
        </div>
      </Modal>

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BanknotesIcon className="w-8 h-8 text-indigo-600" /> Financeiro
          </h1>
          <p className="text-sm text-gray-500">Livro Caixa e Extrato</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-sm w-full md:w-auto text-center"
        >
          + Nova Movimentação
        </button>
      </div>

      {/* FILTROS E RESUMO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Filtros */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 lg:col-span-1">
            <h3 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
                <FunnelIcon className="w-4 h-4"/> Período
            </h3>
            <div className="flex gap-2">
                <input 
                    type="date" 
                    className="w-full border p-2 rounded text-sm"
                    value={filters.start_date}
                    onChange={e => setFilters({...filters, start_date: e.target.value})}
                />
                <input 
                    type="date" 
                    className="w-full border p-2 rounded text-sm"
                    value={filters.end_date}
                    onChange={e => setFilters({...filters, end_date: e.target.value})}
                />
            </div>
        </div>

        {/* Resumo Card */}
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200 lg:col-span-2 flex flex-col md:flex-row justify-around items-center gap-4">
            <div className="text-center">
                <p className="text-xs text-gray-500 font-bold uppercase">Entradas</p>
                <p className="text-xl font-bold text-green-600">+ R$ {revenue.toFixed(2)}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            <div className="text-center">
                <p className="text-xs text-gray-500 font-bold uppercase">Saídas</p>
                <p className="text-xl font-bold text-red-600">- R$ {expense.toFixed(2)}</p>
            </div>
            <div className="h-8 w-px bg-gray-200 hidden md:block"></div>
            <div className="text-center">
                <p className="text-xs text-gray-500 font-bold uppercase">Saldo Período</p>
                <p className={`text-xl font-bold ${balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
                    R$ {balance.toFixed(2)}
                </p>
            </div>
        </div>
      </div>

      {/* LISTAGEM */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
             <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Valor</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {t.description}
                      {t.sale && <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Venda Auto</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        {t.type === 'REVENUE' 
                            ? <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full"><ArrowUpCircleIcon className="w-4 h-4"/> Receita</span>
                            : <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-1 rounded-full"><ArrowDownCircleIcon className="w-4 h-4"/> Despesa</span>
                        }
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${t.type === 'REVENUE' ? 'text-green-700' : 'text-red-700'}`}>
                      {t.type === 'EXPENSE' ? '- ' : '+ '} R$ {t.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {/* Só permite excluir se não for venda automática (opcional, para segurança) */}
                        {!t.sale && (
                            <button onClick={() => handleDelete(t.id)} className="text-gray-400 hover:text-red-600 transition">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                    <tr>
                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                            Nenhuma movimentação neste período.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
            </div>
        </div>
      )}
    </div>
  )
}

export default Financial