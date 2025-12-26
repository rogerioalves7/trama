import { useEffect, useState } from 'react'
import { 
  Cog6ToothIcon, 
  CreditCardIcon, 
  ClockIcon, 
  TrashIcon, 
  PlusIcon,
  CheckCircleIcon,
  PencilSquareIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../api'

function Settings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Dados
  const [settings, setSettings] = useState({ 
    id: null, 
    hourly_labor_rate: '' 
  })
  const [paymentMethods, setPaymentMethods] = useState([])
  const [newMethodName, setNewMethodName] = useState('')
  
  // Estado para edição de taxa
  const [editingId, setEditingId] = useState(null)
  const [editRate, setEditRate] = useState('')

  // --- 1. CARGA DE DADOS ---
  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    Promise.all([
        api.get('settings/'),
        api.get('payment-methods/')
      ]).then(([resSet, resPay]) => {
        if (resSet.data.length > 0) {
          setSettings({
              id: resSet.data[0].id,
              hourly_labor_rate: resSet.data[0].hourly_labor_rate
          })
        }
        setPaymentMethods(resPay.data)
        setLoading(false)
      }).catch(() => {
        toast.error("Erro ao carregar configurações.")
        setLoading(false)
      })
  }

  // --- 2. HELPERS ---
  const formatCurrencyDisplay = (value) => {
    if (!value && value !== 0) return ''
    const number = parseFloat(value)
    if (isNaN(number)) return ''
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleRateChange = (e) => {
    let value = e.target.value.replace(/\D/g, "")
    const floatValue = value ? parseFloat(value) / 100 : 0
    setSettings({ ...settings, hourly_labor_rate: floatValue.toFixed(2) })
  }

  // --- 3. AÇÕES DE CONFIGURAÇÃO GERAL ---
  const handleSaveSettings = () => {
    setSaving(true)
    const payload = { hourly_labor_rate: settings.hourly_labor_rate }
    const request = settings.id 
      ? api.put(`settings/${settings.id}/`, payload)
      : api.post('settings/', payload)

    request.then(res => {
      if (!settings.id) setSettings({ ...settings, id: res.data.id })
      toast.success("Configurações salvas!")
    })
    .catch(() => toast.error("Erro ao salvar."))
    .finally(() => setSaving(false))
  }

  // --- 4. AÇÕES DE PAGAMENTO ---
  const handleAddMethod = (e) => {
    e.preventDefault()
    if (!newMethodName.trim()) return

    // Cria com taxa 0 por padrão
    api.post('payment-methods/', { name: newMethodName, tax_rate: 0 })
      .then(res => {
        setPaymentMethods([...paymentMethods, res.data])
        setNewMethodName('')
        toast.success("Método adicionado.")
      })
      .catch(() => toast.error("Erro ao adicionar."))
  }

  const handleDeleteMethod = (id) => {
    if (!window.confirm("Excluir forma de pagamento?")) return
    api.delete(`payment-methods/${id}/`)
      .then(() => {
        setPaymentMethods(paymentMethods.filter(pm => pm.id !== id))
        toast.success("Removido.")
      })
      .catch(() => toast.error("Erro ao remover."))
  }

  // Iniciar edição de taxa
  const startEditing = (method) => {
    setEditingId(method.id)
    setEditRate(method.tax_rate)
  }

  // Salvar taxa editada
  const saveRate = (id) => {
    api.patch(`payment-methods/${id}/`, { tax_rate: editRate })
        .then(() => {
            toast.success("Taxa atualizada!")
            setEditingId(null)
            loadData() // Recarrega para garantir sincronia
        })
        .catch(() => toast.error("Erro ao atualizar taxa."))
  }

  if (loading) {
    return <div className="flex justify-center mt-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 dark:border-indigo-400"></div></div>
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
            <Cog6ToothIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Configurações</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Personalize o sistema para o seu negócio</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* --- CARD 1: MÃO DE OBRA --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-indigo-500" /> Mão de Obra e Precificação
            </h2>
            
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-6 border border-indigo-100 dark:border-indigo-900/30">
                <p className="text-sm text-indigo-800 dark:text-indigo-200">
                    Defina quanto vale sua hora de trabalho para cálculo de custo automático.
                </p>
            </div>

            <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Valor Hora (R$)</label>
                <input 
                    type="text"
                    inputMode="numeric"
                    className="w-full text-2xl font-bold border dark:border-gray-600 rounded-lg p-3 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                    value={formatCurrencyDisplay(settings.hourly_labor_rate)}
                    onChange={handleRateChange}
                    placeholder="R$ 0,00"
                />
            </div>

            <button 
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg shadow-md transition transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {saving ? 'Salvando...' : <><CheckCircleIcon className="w-5 h-5"/> Salvar Alterações</>}
            </button>
        </div>

        {/* --- CARD 2: FORMAS DE PAGAMENTO E TAXAS --- */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 transition-colors">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <CreditCardIcon className="w-5 h-5 text-green-500" /> Taxas da Maquininha
            </h2>

            {/* Formulário de Adição */}
            <form onSubmit={handleAddMethod} className="flex gap-2 mb-6">
                <input 
                    type="text" 
                    placeholder="Nova forma (ex: Vale Refeição)"
                    className="flex-1 border dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none transition-colors"
                    value={newMethodName}
                    onChange={e => setNewMethodName(e.target.value)}
                />
                <button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg shadow-md transition"
                    title="Adicionar"
                >
                    <PlusIcon className="w-6 h-6" />
                </button>
            </form>

            {/* Lista com Edição de Taxa */}
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {paymentMethods.map(method => (
                    <div key={method.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                        
                        <div className="flex-1">
                            <p className="font-bold text-gray-800 dark:text-gray-200">{method.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">Taxa:</span>
                                
                                {editingId === method.id ? (
                                    <div className="flex items-center gap-1">
                                        <input 
                                            type="number" 
                                            className="w-16 p-1 text-sm border dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            value={editRate}
                                            onChange={e => setEditRate(e.target.value)}
                                            autoFocus
                                        />
                                        <span className="text-gray-500 text-sm">%</span>
                                        <button onClick={() => saveRate(method.id)} className="text-green-600 hover:text-green-700 ml-1">
                                            <CheckCircleIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => startEditing(method)}>
                                        <span className={`text-sm font-bold ${parseFloat(method.tax_rate) > 0 ? 'text-red-500' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {method.tax_rate}%
                                        </span>
                                        <PencilSquareIcon className="w-3 h-3 text-gray-400 group-hover:text-indigo-500" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <button 
                            onClick={() => handleDeleteMethod(method.id)}
                            className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition p-2"
                            title="Excluir método"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  )
}

export default Settings