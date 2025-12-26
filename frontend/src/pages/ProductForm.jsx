import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeftIcon, 
  TrashIcon, 
  CalculatorIcon, 
  CubeIcon,
  ClockIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import api from '../api'

function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  
  // Dados Auxiliares
  const [materials, setMaterials] = useState([])
  const [categories, setCategories] = useState([])
  const [hourlyRate, setHourlyRate] = useState(0)

  // Estado do Produto
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: '',
    price: '', // String numérica "10.50"
    profit_margin: 50,
    labor_time_minutes: 0,
    composition: [] 
  })

  // Dados Calculados (Visualização)
  const [calculatedCosts, setCalculatedCosts] = useState({
    materialCost: 0,
    laborCost: 0,
    totalCost: 0,
    suggestedPrice: 0
  })

  // --- 1. CARGA DE DADOS ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [matRes, catRes, setRes] = await Promise.all([
          api.get('materials/'),
          api.get('categories/'),
          api.get('settings/')
        ])

        setMaterials(matRes.data)
        setCategories(catRes.data)
        if (setRes.data.length > 0) {
            setHourlyRate(parseFloat(setRes.data[0].hourly_labor_rate))
        }

        if (isEdit) {
            const prodRes = await api.get(`products/${id}/`)
            const prod = prodRes.data
            setFormData({
                name: prod.name,
                sku: prod.sku,
                category: prod.category,
                price: prod.price,
                profit_margin: prod.profit_margin,
                labor_time_minutes: prod.labor_time_minutes,
                composition: prod.composition.map(c => ({
                    material: c.material_id, 
                    quantity: c.quantity,
                    temp_cost: c.material_cost
                }))
            })
        }
      } catch (error) {
        toast.error("Erro ao carregar dados.")
      }
    }
    loadData()
  }, [id, isEdit])

  // --- 2. CÁLCULOS AUTOMÁTICOS ---
  useEffect(() => {
    // 1. Materiais
    const matCost = formData.composition.reduce((acc, item) => {
        const mat = materials.find(m => m.id === parseInt(item.material))
        const cost = mat ? parseFloat(mat.current_cost) : (item.temp_cost || 0)
        return acc + (parseFloat(item.quantity || 0) * cost)
    }, 0)

    // 2. Mão de Obra
    const labCost = (formData.labor_time_minutes / 60) * hourlyRate
    
    // 3. Custo Total
    const total = matCost + labCost
    
    // 4. Preço Sugerido (MARKUP)
    // Correção: Agora usamos Markup (Custo * (1 + Margem%))
    // Ex: Custo 100, Margem 50% -> 100 * 1.5 = 150
    const marginMultiplier = 1 + (formData.profit_margin / 100)
    const suggested = total * marginMultiplier

    setCalculatedCosts({
        materialCost: matCost,
        laborCost: labCost,
        totalCost: total,
        suggestedPrice: suggested
    })
  }, [formData.composition, formData.labor_time_minutes, formData.profit_margin, materials, hourlyRate])


  // --- 3. HELPERS DE FORMATAÇÃO E INPUT ---
  
  const formatCurrencyDisplay = (value) => {
    if (!value) return ''
    const number = parseFloat(value)
    if (isNaN(number)) return ''
    return number.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }

  const handlePriceChange = (e) => {
    let value = e.target.value
    value = value.replace(/\D/g, "")
    const floatValue = value ? parseFloat(value) / 100 : 0
    setFormData({ ...formData, price: floatValue.toFixed(2) })
  }

  const handleCompChange = (index, field, value) => {
    const newComp = [...formData.composition]
    newComp[index][field] = value
    setFormData({ ...formData, composition: newComp })
  }

  const addMaterialRow = () => {
    setFormData({
        ...formData,
        composition: [...formData.composition, { material: '', quantity: 1 }]
    })
  }

  const removeMaterialRow = (index) => {
    const newComp = [...formData.composition]
    newComp.splice(index, 1)
    setFormData({ ...formData, composition: newComp })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.name || !formData.price) {
        toast.error("Nome e Preço são obrigatórios")
        setLoading(false)
        return
    }

    const payload = {
        ...formData,
        composition: formData.composition.filter(c => c.material && c.quantity > 0)
    }

    const request = isEdit 
        ? api.put(`products/${id}/`, payload)
        : api.post('products/', payload)

    request
        .then(() => {
            toast.success("Produto salvo com sucesso!")
            navigate('/products')
        })
        .catch(err => {
            console.error(err)
            toast.error("Erro ao salvar produto.")
        })
        .finally(() => setLoading(false))
  }

  const applySuggestedPrice = () => {
      setFormData({...formData, price: calculatedCosts.suggestedPrice.toFixed(2)})
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <Link to="/products" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition text-gray-600 dark:text-gray-300">
                <ArrowLeftIcon className="w-6 h-6" />
            </Link>
            <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {isEdit ? 'Editar Produto' : 'Novo Produto'}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Defina a ficha técnica e precificação</p>
            </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* --- COLUNA ESQUERDA: DADOS E FICHA TÉCNICA --- */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Card: Informações Básicas */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                    <CubeIcon className="w-5 h-5 text-indigo-500"/> Dados Básicos
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
                        <input 
                            type="text" 
                            required
                            className="w-full border dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-colors"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">SKU (Código)</label>
                        <input 
                            type="text" 
                            className="w-full border dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                            value={formData.sku}
                            onChange={e => setFormData({...formData, sku: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
                        <select 
                            className="w-full border dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                            value={formData.category}
                            onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="">Selecione...</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Card: Ficha Técnica */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <CalculatorIcon className="w-5 h-5 text-indigo-500"/> Ficha Técnica (Materiais)
                    </h2>
                    <button 
                        type="button" 
                        onClick={addMaterialRow}
                        className="text-sm bg-indigo-50 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
                    >
                        + Adicionar Material
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 uppercase text-xs">
                                <th className="px-3 py-2 text-left rounded-l-lg">Material</th>
                                <th className="px-3 py-2 text-left w-24">Qtd</th>
                                <th className="px-3 py-2 text-right">Custo Un.</th>
                                <th className="px-3 py-2 text-right">Subtotal</th>
                                <th className="px-3 py-2 rounded-r-lg"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {formData.composition.map((item, idx) => {
                                const selectedMat = materials.find(m => m.id === parseInt(item.material))
                                const unitCost = selectedMat ? parseFloat(selectedMat.current_cost) : 0
                                const subtotal = unitCost * (item.quantity || 0)

                                return (
                                    <tr key={idx} className="group">
                                        <td className="px-2 py-2">
                                            <select 
                                                className="w-full border-b border-transparent group-hover:border-gray-300 dark:group-hover:border-gray-500 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500 transition-colors"
                                                value={item.material}
                                                onChange={e => handleCompChange(idx, 'material', e.target.value)}
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
                                                step="0.001"
                                                className="w-full text-center border-b border-transparent group-hover:border-gray-300 dark:group-hover:border-gray-500 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                                                value={item.quantity}
                                                onChange={e => handleCompChange(idx, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">
                                            R$ {unitCost.toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 text-right font-bold text-gray-700 dark:text-gray-300">
                                            R$ {subtotal.toFixed(2)}
                                        </td>
                                        <td className="px-2 py-2 text-center">
                                            <button type="button" onClick={() => removeMaterialRow(idx)} className="text-gray-400 hover:text-red-500 transition">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                        {formData.composition.length > 0 && (
                            <tfoot>
                                <tr className="border-t border-gray-200 dark:border-gray-600">
                                    <td colSpan="3" className="text-right py-3 font-bold text-gray-600 dark:text-gray-300">Total Materiais:</td>
                                    <td className="text-right py-3 font-bold text-indigo-600 dark:text-indigo-400">R$ {calculatedCosts.materialCost.toFixed(2)}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>

        {/* --- COLUNA DIREITA: CUSTOS E PRECIFICAÇÃO --- */}
        <div className="space-y-6">
            
            {/* Card: Mão de Obra */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-200 dark:border-gray-700 transition-colors">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-4 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4"/> Tempo de Produção
                </h2>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Minutos Gastos</label>
                    <div className="flex items-center gap-2">
                        <input 
                            type="number" 
                            className="w-full border dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white outline-none transition-colors"
                            value={formData.labor_time_minutes}
                            onChange={e => setFormData({...formData, labor_time_minutes: e.target.value})}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            = R$ {calculatedCosts.laborCost.toFixed(2)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Baseado em R$ {hourlyRate}/hora</p>
                </div>
            </div>

            {/* Card: Resumo de Custos e Margem */}
            <div className="bg-indigo-900 text-white p-6 rounded-lg shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-20 h-20 bg-white opacity-10 rounded-full blur-xl"></div>
                
                <h3 className="text-indigo-200 font-bold text-xs uppercase mb-4">Composição de Preço</h3>
                
                <div className="space-y-2 mb-4 text-sm">
                    <div className="flex justify-between">
                        <span className="text-indigo-200">Custos Materiais</span>
                        <span>R$ {calculatedCosts.materialCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-indigo-200">Mão de Obra</span>
                        <span>R$ {calculatedCosts.laborCost.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t border-indigo-700 text-lg">
                        <span>Custo Total</span>
                        <span>R$ {calculatedCosts.totalCost.toFixed(2)}</span>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-bold text-indigo-200 mb-1">Margem de Lucro (%)</label>
                    <input 
                        type="number"
                        className="w-full bg-indigo-800 border border-indigo-700 rounded p-2 text-white font-bold outline-none focus:ring-1 focus:ring-white"
                        value={formData.profit_margin}
                        onChange={e => setFormData({...formData, profit_margin: e.target.value})}
                    />
                </div>

                <div className="bg-white/10 p-3 rounded-lg mb-4">
                    <p className="text-xs text-indigo-200 mb-1">Preço Sugerido</p>
                    <div className="flex justify-between items-center">
                        <span className="text-xl font-bold">R$ {calculatedCosts.suggestedPrice.toFixed(2)}</span>
                        <button 
                            type="button" 
                            onClick={applySuggestedPrice}
                            className="text-xs bg-white text-indigo-900 px-2 py-1 rounded font-bold hover:bg-gray-200 transition"
                        >
                            Usar
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-bold text-white mb-1 flex items-center gap-1">
                        <CurrencyDollarIcon className="w-4 h-4"/> Preço Final de Venda
                    </label>
                    <input 
                        type="text"
                        inputMode="numeric"
                        required
                        className="w-full bg-white text-indigo-900 text-xl font-bold rounded p-3 outline-none border-2 border-transparent focus:border-indigo-400 shadow-inner"
                        value={formatCurrencyDisplay(formData.price)}
                        onChange={handlePriceChange}
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg shadow-lg transition transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Salvando...' : 'Salvar Produto'}
            </button>
        </div>

      </form>
    </div>
  )
}

export default ProductForm