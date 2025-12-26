import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  TruckIcon, 
  CalendarIcon,
  UserIcon,
  PlusIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../api'

function PurchaseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id // Apenas visualização por enquanto, backend não suporta edição completa de estoque retroativo facilmente

  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState([])

  // Estado do Formulário
  const [formData, setFormData] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    freight_cost: '', // String para lógica ATM
    items: [] // { material: id, quantity: 1, unit_cost: '' }
  })

  // Estado Calculado
  const [totals, setTotals] = useState({
    itemsTotal: 0,
    grandTotal: 0
  })

  // --- 1. CARGA DE DADOS ---
  useEffect(() => {
    api.get('materials/')
      .then(res => setMaterials(res.data))
      .catch(() => toast.error("Erro ao carregar materiais."))

    // Se for edição (visualização/correção básica)
    if (isEdit) {
      // Implementar carga se necessário no futuro
    }
  }, [id, isEdit])

  // --- 2. CÁLCULOS ---
  useEffect(() => {
    const itemsTotal = formData.items.reduce((acc, item) => {
        const cost = parseFloat(item.unit_cost) || 0
        const qty = parseFloat(item.quantity) || 0
        return acc + (cost * qty)
    }, 0)

    const freight = parseFloat(formData.freight_cost) || 0
    
    setTotals({
        itemsTotal,
        grandTotal: itemsTotal + freight
    })
  }, [formData.items, formData.freight_cost])


  // --- 3. HELPERS DE MÁSCARA (ATM) ---
  const formatCurrencyDisplay = (value) => {
    if (!value && value !== 0) return ''
    const number = parseFloat(value)
    if (isNaN(number)) return ''
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  // Máscara para Frete
  const handleFreightChange = (e) => {
    let value = e.target.value.replace(/\D/g, "")
    const floatValue = value ? parseFloat(value) / 100 : 0
    setFormData({ ...formData, freight_cost: floatValue.toFixed(2) })
  }

  // Máscara para Itens (Custo Unitário)
  const handleItemCostChange = (index, e) => {
    let value = e.target.value.replace(/\D/g, "")
    const floatValue = value ? parseFloat(value) / 100 : 0
    
    const newItems = [...formData.items]
    newItems[index].unit_cost = floatValue.toFixed(2)
    setFormData({ ...formData, items: newItems })
  }

  // --- 4. MANIPULAÇÃO DE ITENS ---
  const addItem = () => {
    setFormData({
        ...formData,
        items: [...formData.items, { material: '', quantity: 1, unit_cost: '' }]
    })
  }

  const removeItem = (index) => {
    const newItems = [...formData.items]
    newItems.splice(index, 1)
    setFormData({ ...formData, items: newItems })
  }

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({ ...formData, items: newItems })
  }

  // --- 5. SUBMIT ---
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    if (formData.items.length === 0) {
        toast.error("Adicione pelo menos um item.")
        setLoading(false)
        return
    }

    // Prepara payload (converte strings vazias para 0)
    const payload = {
        supplier: formData.supplier,
        date: formData.date,
        freight_cost: formData.freight_cost || 0,
        items: formData.items.map(i => ({
            material_id: i.material,
            quantity: i.quantity,
            unit_cost: i.unit_cost || 0
        }))
    }

    api.post('purchases/', payload)
      .then(() => {
        toast.success("Compra registrada e estoque atualizado!")
        navigate('/purchases')
      })
      .catch(err => {
        console.error(err)
        toast.error("Erro ao registrar compra.")
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <Link to="/purchases" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300">
                <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    Nova Compra
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Registrar entrada de nota fiscal</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- COLUNA ESQUERDA: DADOS GERAIS --- */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-500"/> Dados da Nota
                </h2>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <UserIcon className="w-4 h-4" /> Fornecedor
                        </label>
                        <input 
                            type="text" 
                            placeholder="Ex: Armarinhos Fernando"
                            className="w-full border dark:border-gray-600 rounded p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                            value={formData.supplier}
                            onChange={e => setFormData({...formData, supplier: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <CalendarIcon className="w-4 h-4" /> Data da Compra
                        </label>
                        <input 
                            type="date" 
                            className="w-full border dark:border-gray-600 rounded p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                            value={formData.date}
                            onChange={e => setFormData({...formData, date: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <TruckIcon className="w-4 h-4" /> Valor do Frete
                        </label>
                        <input 
                            type="text"
                            inputMode="numeric" 
                            placeholder="R$ 0,00"
                            className="w-full border dark:border-gray-600 rounded p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors font-bold"
                            value={formatCurrencyDisplay(formData.freight_cost)}
                            onChange={handleFreightChange}
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            O frete será rateado proporcionalmente no custo dos materiais.
                        </p>
                    </div>
                </div>
            </div>

            {/* CARD DE RESUMO (TOTAL) */}
            <div className="bg-indigo-900 text-white p-6 rounded-lg shadow-lg">
                <h3 className="text-indigo-200 font-bold text-xs uppercase mb-4">Resumo da Compra</h3>
                
                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-indigo-200">Subtotal Itens</span>
                        <span>R$ {totals.itemsTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-indigo-200">Frete</span>
                        <span>R$ {(parseFloat(formData.freight_cost) || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-indigo-700 text-lg">
                        <span>Total Geral</span>
                        <span>R$ {totals.grandTotal.toFixed(2)}</span>
                    </div>
                </div>

                <button 
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow transition transform hover:-translate-y-1 disabled:opacity-50"
                >
                    {loading ? 'Processando...' : 'Finalizar Entrada'}
                </button>
            </div>
        </div>

        {/* --- COLUNA DIREITA: ITENS --- */}
        <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">Itens da Nota</h2>
                    <button 
                        type="button" 
                        onClick={addItem}
                        className="flex items-center gap-1 text-sm bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
                    >
                        <PlusIcon className="w-4 h-4" /> Adicionar Item
                    </button>
                </div>

                <div className="flex-1 overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 uppercase text-xs">
                                <th className="px-3 py-2 text-left rounded-l-lg">Material</th>
                                <th className="px-3 py-2 text-left w-24">Qtd</th>
                                <th className="px-3 py-2 text-right w-32">Custo Un.</th>
                                <th className="px-3 py-2 text-right">Subtotal</th>
                                <th className="px-3 py-2 rounded-r-lg"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {formData.items.map((item, idx) => {
                                const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0)

                                return (
                                    <tr key={idx} className="group hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                                        <td className="px-2 py-2">
                                            <select 
                                                className="w-full border border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                                value={item.material}
                                                onChange={e => updateItem(idx, 'material', e.target.value)}
                                            >
                                                <option value="">Selecione...</option>
                                                {materials.map(m => (
                                                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                className="w-full text-center border border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                                                value={item.quantity}
                                                onChange={e => updateItem(idx, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-2 py-2">
                                            <input 
                                                type="text"
                                                inputMode="numeric"
                                                className="w-full text-right border border-gray-200 dark:border-gray-600 rounded p-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                                                value={formatCurrencyDisplay(item.unit_cost)}
                                                onChange={e => handleItemCostChange(idx, e)}
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-gray-700 dark:text-gray-300">
                                            {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <button type="button" onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 transition">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {formData.items.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-400 dark:text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <ClipboardDocumentListIcon className="w-10 h-10 mb-2 opacity-50" />
                                            <p>Nenhum item adicionado ainda.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

      </form>
    </div>
  )
}

export default PurchaseForm