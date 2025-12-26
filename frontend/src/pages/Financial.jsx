import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { 
  BanknotesIcon, 
  TrashIcon, 
  FunnelIcon,
  CheckCircleIcon,
  ClockIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

import api from '../api'
import Modal from '../components/Modal'

function Financial() {
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  
  const date = new Date()
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0]

  const [filters, setFilters] = useState({
    start_date: firstDay,
    end_date: lastDay
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTrans, setNewTrans] = useState({
    type: 'EXPENSE', 
    description: '',
    amount: '', 
    date: new Date().toISOString().split('T')[0], 
    due_date: new Date().toISOString().split('T')[0], 
    status: 'PAID' 
  })
  const [saving, setSaving] = useState(false)

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
  }, [filters])

  const formatCurrencyDisplay = (value) => {
    if (!value && value !== 0) return ''
    const number = parseFloat(value)
    if (isNaN(number)) return ''
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleAmountChange = (e) => {
    let value = e.target.value.replace(/\D/g, "")
    const floatValue = value ? parseFloat(value) / 100 : 0
    setNewTrans({ ...newTrans, amount: floatValue.toFixed(2) })
  }

  const handleSave = () => {
    if (!newTrans.description || !newTrans.amount) return toast.error("Preencha descrição e valor")
    setSaving(true)
    
    const payload = { ...newTrans }

    api.post('transactions/', payload)
      .then(() => {
        toast.success("Lançamento realizado!")
        setIsModalOpen(false)
        setNewTrans({ 
            type: 'EXPENSE', 
            description: '', 
            amount: '', 
            date: new Date().toISOString().split('T')[0],
            due_date: new Date().toISOString().split('T')[0],
            status: 'PAID'
        })
        fetchTransactions()
      })
      .catch(() => toast.error("Erro ao salvar."))
      .finally(() => setSaving(false))
  }

  const handleDelete = (id) => {
    if(!window.confirm("Confirmar exclusão deste lançamento?")) return
    api.delete(`transactions/${id}/`)
      .then(() => {
        toast.success("Excluído.")
        fetchTransactions()
      })
      .catch(() => toast.error("Erro ao excluir."))
  }

  const revenue = transactions.filter(t => t.type === 'REVENUE' && t.status === 'PAID').reduce((acc, t) => acc + parseFloat(t.amount), 0)
  const expense = transactions.filter(t => t.type === 'EXPENSE' && t.status === 'PAID').reduce((acc, t) => acc + parseFloat(t.amount), 0)
  const balance = revenue - expense

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* --- MODAL DE LANÇAMENTO --- */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Lançamento">
        <div className="space-y-5">
            
            {/* Seletor de Tipo */}
            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg transition-colors">
                <button 
                    onClick={() => setNewTrans({...newTrans, type: 'EXPENSE'})}
                    className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${newTrans.type === 'EXPENSE' ? 'bg-white dark:bg-gray-600 text-red-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Saída (Despesa)
                </button>
                <button 
                    onClick={() => setNewTrans({...newTrans, type: 'REVENUE'})}
                    className={`flex-1 py-2 rounded-md font-bold text-sm transition-all ${newTrans.type === 'REVENUE' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                >
                    Entrada (Receita)
                </button>
            </div>

            {/* Valor */}
            <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Valor</label>
                <input 
                    type="text"
                    inputMode="numeric"
                    className={`w-full text-2xl font-bold border-b-2 bg-transparent outline-none p-2 ${newTrans.type === 'EXPENSE' ? 'text-red-600 border-red-200 focus:border-red-500 dark:border-red-900/50' : 'text-green-600 border-green-200 focus:border-green-500 dark:border-green-900/50'}`}
                    placeholder="R$ 0,00"
                    value={formatCurrencyDisplay(newTrans.amount)}
                    onChange={handleAmountChange}
                />
            </div>

            {/* Descrição */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
                <input 
                    type="text" 
                    placeholder={newTrans.type === 'EXPENSE' ? "Ex: Conta de Luz" : "Ex: Venda Extra"}
                    className="w-full border dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    value={newTrans.description}
                    onChange={e => setNewTrans({...newTrans, description: e.target.value})}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Data Competência */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Data Competência</label>
                    <input 
                        type="date"
                        className="w-full border dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                        value={newTrans.date}
                        onChange={e => setNewTrans({...newTrans, date: e.target.value})}
                    />
                </div>
                {/* Data Vencimento */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Vencimento</label>
                    <input 
                        type="date"
                        className="w-full border dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                        value={newTrans.due_date}
                        onChange={e => setNewTrans({...newTrans, due_date: e.target.value})}
                    />
                </div>
            </div>

            {/* Status */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Situação</label>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <input 
                            type="radio" 
                            name="status" 
                            value="PAID"
                            checked={newTrans.status === 'PAID'}
                            onChange={() => setNewTrans({...newTrans, status: 'PAID'})}
                            className="text-green-600 focus:ring-green-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                            {newTrans.type === 'REVENUE' ? 'Recebido' : 'Pago'}
                        </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                        <input 
                            type="radio" 
                            name="status" 
                            value="PENDING"
                            checked={newTrans.status === 'PENDING'}
                            onChange={() => setNewTrans({...newTrans, status: 'PENDING'})}
                            className="text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">
                            Pendente
                        </span>
                    </label>
                </div>
            </div>

            <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition shadow-md mt-4 disabled:opacity-50"
            >
                {saving ? 'Salvando...' : 'Confirmar Lançamento'}
            </button>
        </div>
      </Modal>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <BanknotesIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" /> 
            Financeiro
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Livro Caixa e Contas a Pagar/Receber</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition transform hover:scale-105"
        >
          <PlusIcon className="w-5 h-5"/> Nova Movimentação
        </button>
      </div>

      {/* --- FILTROS E RESUMO --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-1 transition-colors">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                <FunnelIcon className="w-4 h-4"/> Período
            </h3>
            <div className="flex gap-2">
                <input 
                    type="date" 
                    className="w-full border dark:border-gray-600 rounded p-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                    value={filters.start_date}
                    onChange={e => setFilters({...filters, start_date: e.target.value})}
                />
                <input 
                    type="date" 
                    className="w-full border dark:border-gray-600 rounded p-2 text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                    value={filters.end_date}
                    onChange={e => setFilters({...filters, end_date: e.target.value})}
                />
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 lg:col-span-2 flex flex-col md:flex-row justify-around items-center gap-4 transition-colors">
            <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Entradas (Realizadas)</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">+ R$ {revenue.toFixed(2)}</p>
            </div>
            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
            <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Saídas (Realizadas)</p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">- R$ {expense.toFixed(2)}</p>
            </div>
            <div className="h-10 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>
            <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase mb-1">Saldo do Período</p>
                <p className={`text-xl font-bold ${balance >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}`}>
                    R$ {balance.toFixed(2)}
                </p>
            </div>
        </div>
      </div>

      {/* --- TABELA --- */}
      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
             <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              {/* CORREÇÃO: bg-gray-50 no light, bg-gray-700 no dark (agora visível) */}
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descrição</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Valor</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase"></th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div>
                          <p className="font-bold">{new Date(t.date).toLocaleDateString()}</p>
                          {t.status === 'PENDING' && (
                              <p className="text-xs text-orange-500">Vence: {new Date(t.due_date).toLocaleDateString()}</p>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {t.description}
                      {t.sale && <span className="ml-2 text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-0.5 rounded-full uppercase">Venda Auto</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                        {t.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full border border-green-200 dark:border-green-800">
                                <CheckCircleIcon className="w-3 h-3"/> {t.type === 'REVENUE' ? 'Recebido' : 'Pago'}
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 dark:text-orange-300 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-200 dark:border-orange-800">
                                <ClockIcon className="w-3 h-3"/> Pendente
                            </span>
                        )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${t.type === 'REVENUE' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      {t.type === 'EXPENSE' ? '- ' : '+ '} 
                      {parseFloat(t.amount).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {!t.sale && (
                            <button 
                                onClick={() => handleDelete(t.id)} 
                                className="text-gray-400 hover:text-red-600 transition p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                    <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
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