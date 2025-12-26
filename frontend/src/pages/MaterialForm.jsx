import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  CubeIcon, 
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../api'

function MaterialForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(false)

  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    unit: 'UN',
    min_stock_level: 5,
    current_cost: '' // String para a lógica ATM
  })

  // Unidades comuns para facilitar
  const commonUnits = ['UN', 'KG', 'M', 'L', 'CX', 'PCT', 'PAR', 'M2']

  // --- 1. CARGA DE DADOS ---
  useEffect(() => {
    if (isEdit) {
      setLoading(true)
      api.get(`materials/${id}/`)
        .then(res => {
          setFormData({
            name: res.data.name,
            unit: res.data.unit,
            min_stock_level: res.data.min_stock_level,
            current_cost: res.data.current_cost // Vem como string/decimal do back
          })
          setLoading(false)
        })
        .catch(err => {
          toast.error("Erro ao carregar insumo.")
          setLoading(false)
        })
    }
  }, [id, isEdit])

  // --- 2. HELPERS DE MÁSCARA (ATM) ---
  const formatCurrencyDisplay = (value) => {
    if (!value && value !== 0) return ''
    const number = parseFloat(value)
    if (isNaN(number)) return ''
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handleCostChange = (e) => {
    let value = e.target.value
    // Remove tudo que não é dígito
    value = value.replace(/\D/g, "")
    // Converte para float (dividir por 100)
    const floatValue = value ? parseFloat(value) / 100 : 0
    setFormData({ ...formData, current_cost: floatValue.toFixed(2) })
  }

  // --- 3. ENVIO ---
  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name) {
        toast.error("O nome do insumo é obrigatório.")
        setLoading(false)
        return
    }

    const payload = { ...formData }
    // Se o custo estiver vazio, envia 0
    if (!payload.current_cost) payload.current_cost = 0

    const request = isEdit 
      ? api.put(`materials/${id}/`, payload)
      : api.post('materials/', payload)

    request
      .then(() => {
        toast.success("Insumo salvo com sucesso!")
        navigate('/inventory')
      })
      .catch(err => {
        console.error(err)
        toast.error("Erro ao salvar insumo.")
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <Link to="/inventory" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300">
                <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isEdit ? 'Editar Insumo' : 'Novo Insumo'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Cadastre matérias-primas para produção</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* COLUNA ESQUERDA: ICONE DESTAQUE (Apenas decorativo em Desktop) */}
        <div className="hidden md:flex flex-col items-center justify-center bg-indigo-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-indigo-200 dark:border-gray-600 p-6 text-center">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-full shadow-sm mb-4">
                <CubeIcon className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h3 className="text-gray-800 dark:text-white font-bold">Gerenciamento de Estoque</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Mantenha os custos atualizados e defina o estoque mínimo para receber alertas.
            </p>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO */}
        <div className="md:col-span-2 space-y-6">
            
            {/* Card Principal */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                
                {/* Nome */}
                <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome do Insumo</label>
                    <input 
                        type="text" 
                        required
                        placeholder="Ex: Tecido Algodão, Botão 5mm..."
                        className="w-full border dark:border-gray-600 rounded p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Unidade */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <BeakerIcon className="w-4 h-4" /> Unidade
                        </label>
                        <div className="relative">
                            <input 
                                type="text" 
                                list="units-list"
                                className="w-full border dark:border-gray-600 rounded p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none uppercase transition-colors"
                                value={formData.unit}
                                onChange={e => setFormData({...formData, unit: e.target.value.toUpperCase()})}
                            />
                            <datalist id="units-list">
                                {commonUnits.map(u => <option key={u} value={u} />)}
                            </datalist>
                        </div>
                    </div>

                    {/* Estoque Mínimo */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                            <ExclamationTriangleIcon className="w-4 h-4" /> Estoque Mínimo (Alerta)
                        </label>
                        <input 
                            type="number"
                            className="w-full border dark:border-gray-600 rounded p-2.5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                            value={formData.min_stock_level}
                            onChange={e => setFormData({...formData, min_stock_level: e.target.value})}
                        />
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                     <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <CurrencyDollarIcon className="w-4 h-4" /> Custo Unitário Atual
                    </label>
                    <div className="relative">
                        <input 
                            type="text"
                            inputMode="numeric"
                            className="w-full border dark:border-gray-600 rounded p-3 bg-indigo-50 dark:bg-gray-900 text-indigo-900 dark:text-indigo-200 font-bold text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                            value={formatCurrencyDisplay(formData.current_cost)}
                            onChange={handleCostChange}
                            placeholder="R$ 0,00"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Este valor será usado para calcular o custo dos produtos automaticamente.
                        </p>
                    </div>
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Salvando...' : 'Salvar Insumo'}
            </button>
        </div>

      </form>
    </div>
  )
}

export default MaterialForm