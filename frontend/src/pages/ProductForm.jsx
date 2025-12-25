import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, CalculatorIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

import api from '../api'
import CurrencyInput from '../components/CurrencyInput'
import NumberInput from '../components/NumberInput'

function ProductForm() {
  const navigate = useNavigate()
  const { id } = useParams() // Pega ID se for edição
  
  const [loading, setLoading] = useState(false)
  const [materialsList, setMaterialsList] = useState([])
  const [hourlyRate, setHourlyRate] = useState(0)

  const [productType, setProductType] = useState('MANUFACTURE') 
  const [formData, setFormData] = useState({
    name: '', sku: '', stock_quantity: 0, labor_time_minutes: 0,
    profit_margin: 50.0, acquisition_price: 0, price: 0,
  })

  const [composition, setComposition] = useState([])
  const [newIngredient, setNewIngredient] = useState({ material_id: '', quantity: '' })

  // 1. Carregar Dados Iniciais (Materiais + Configs + Produto se for Edição)
  useEffect(() => {
    // Carrega Materiais
    api.get('materials/').then(res => setMaterialsList(res.data))
    
    // Carrega Configs
    api.get('settings/').then(res => {
        const data = Array.isArray(res.data) ? res.data[0] : res.data
        setHourlyRate(parseFloat(data.hourly_labor_rate) || 0)
    })

    // SE TIVER ID (MODO EDIÇÃO), CARREGA O PRODUTO
    if (id) {
        setLoading(true)
        api.get(`products/${id}/`)
        .then(res => {
            const prod = res.data
            setFormData({
                name: prod.name,
                sku: prod.sku || '',
                stock_quantity: prod.stock_quantity,
                labor_time_minutes: prod.labor_time_minutes,
                profit_margin: prod.profit_margin,
                acquisition_price: prod.acquisition_price,
                price: prod.price
            })

            // Define o tipo baseado na composição
            if (prod.composition && prod.composition.length > 0) {
                setProductType('MANUFACTURE')
                setComposition(prod.composition)
            } else {
                setProductType('RESALE')
            }
            setLoading(false)
        })
        .catch(() => {
            toast.error("Erro ao carregar produto para edição.")
            navigate('/products')
        })
    }
  }, [id])

  // 2. Cálculos (Mantido Igual)
  const calculateFinancials = () => {
    let materialCost = 0
    let laborCost = 0

    if (productType === 'MANUFACTURE') {
      materialCost = composition.reduce((acc, item) => {
        const mat = materialsList.find(m => m.id === parseInt(item.material_id))
        // Nota: Ao editar, o objeto 'item' pode vir do backend com 'material_cost' pronto, 
        // mas recalculamos com o custo ATUAL da lista de materiais para garantir precisão.
        const cost = mat ? parseFloat(mat.current_cost) : 0
        return acc + (cost * parseFloat(item.quantity))
      }, 0)
      const minutes = parseFloat(formData.labor_time_minutes) || 0
      laborCost = (minutes / 60) * hourlyRate
    } else {
      materialCost = parseFloat(formData.acquisition_price) || 0
    }

    const totalBaseCost = materialCost + laborCost
    const marginValue = totalBaseCost * (parseFloat(formData.profit_margin) / 100)
    const suggestedPrice = totalBaseCost + marginValue
    
    const actualPrice = parseFloat(formData.price) || 0
    const actualProfit = actualPrice - totalBaseCost
    let profitStatus = 'NEUTRAL'

    if (actualPrice > 0) {
        if (actualProfit < 0) profitStatus = 'LOSS'
        else if (actualPrice < suggestedPrice) profitStatus = 'LOW'
        else profitStatus = 'GOOD'
    }

    return { 
        materialCost, laborCost, totalBaseCost, 
        suggestedPrice: suggestedPrice.toFixed(2),
        profitStatus, actualProfit: actualProfit.toFixed(2)
    }
  }

  const financials = calculateFinancials()

  // 3. Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const addIngredient = () => {
    if (!newIngredient.material_id || !newIngredient.quantity || parseFloat(newIngredient.quantity) <= 0) {
      toast.error("Selecione um material e quantidade.")
      return
    }

    const selectedMaterial = materialsList.find(m => m.id === parseInt(newIngredient.material_id))
    if (selectedMaterial) {
        // Validação de estoque apenas visual, não impede adição na receita (pois pode comprar depois)
        // Mas se quiser manter a regra rígida de "Disponibilidade na Engenharia", descomente abaixo:
        /*
        if (parseFloat(newIngredient.quantity) > parseFloat(selectedMaterial.stock_quantity)) {
            toast.error(`Estoque insuficiente de ${selectedMaterial.name}`, { icon: '🚫' })
            return
        }
        */
    }

    setComposition([...composition, { ...newIngredient }])
    setNewIngredient({ material_id: '', quantity: '' })
  }

  const removeIngredient = (index) => {
    const newList = [...composition]
    newList.splice(index, 1)
    setComposition(newList)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (productType === 'MANUFACTURE' && composition.length === 0) {
        toast.error("Adicione pelo menos 1 insumo para salvar.")
        return 
    }

    setLoading(true)

    const payload = {
      ...formData,
      acquisition_price: productType === 'RESALE' ? formData.acquisition_price : 0,
      composition: productType === 'MANUFACTURE' ? composition : []
    }

    // Se tem ID usa PUT (Update), senão POST (Create)
    const request = id 
        ? api.put(`products/${id}/`, payload) 
        : api.post('products/', payload)

    request
      .then(() => {
        toast.success(id ? "Produto atualizado!" : "Produto criado!")
        navigate('/products')
      })
      .catch(err => {
        console.error(err)
        toast.error("Erro ao salvar produto.")
        setLoading(false)
      })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{id ? 'Editar Produto' : 'Novo Produto'}</h1>
        <button onClick={() => navigate('/products')} className="text-gray-500 hover:text-gray-700 underline">Voltar</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Identificação */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">1. Identificação</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
              <div className="flex bg-gray-100 p-1 rounded-md">
                <button type="button" onClick={() => setProductType('MANUFACTURE')}
                  className={`flex-1 py-1 text-sm font-medium rounded transition ${productType === 'MANUFACTURE' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>
                  Manufatura
                </button>
                <button type="button" onClick={() => setProductType('RESALE')}
                  className={`flex-1 py-1 text-sm font-medium rounded transition ${productType === 'RESALE' ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>
                  Revenda
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
              <input type="text" name="sku" value={formData.sku} onChange={handleInputChange}
                className="w-full border-gray-300 rounded-md px-3 py-2 border focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
              className="w-full border-gray-300 rounded-md px-3 py-2 border focus:ring-indigo-500 outline-none" />
          </div>
        </div>

        {/* Custos */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">2. Definição de Custos</h2>

          {productType === 'RESALE' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CurrencyInput label="Preço de Aquisição" name="acquisition_price" value={formData.acquisition_price} onChange={handleInputChange} />
            </div>
          ) : (
            <div>
              {/* Adicionar Insumo */}
              <div className="flex gap-2 items-end mb-4 bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Material</label>
                  <select 
                    className="w-full border-gray-300 rounded-md text-sm py-2 px-3 border focus:outline-none bg-white"
                    value={newIngredient.material_id}
                    onChange={(e) => setNewIngredient({...newIngredient, material_id: e.target.value})}
                  >
                    <option value="">Selecione...</option>
                    {materialsList.map(m => (
                      <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="w-40">
                  <NumberInput label="Qtd Receita" name="quantity" step={0.1} min={0} value={newIngredient.quantity} onChange={(e) => setNewIngredient({...newIngredient, quantity: e.target.value})} />
                </div>
                <button type="button" onClick={addIngredient} className="bg-indigo-600 text-white h-[42px] w-[42px] rounded-md hover:bg-indigo-700 flex items-center justify-center">
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Tabela de Insumos */}
              {composition.length > 0 ? (
                  <table className="min-w-full text-sm mb-6 border border-gray-100 rounded">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-gray-500">Material</th>
                        <th className="px-3 py-2 text-right text-gray-500">Qtd Receita</th>
                        <th className="px-3 py-2 text-right text-gray-500">Custo</th>
                        <th className="px-3 py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {composition.map((item, idx) => {
                        const mat = materialsList.find(m => m.id === parseInt(item.material_id))
                        const subtotal = mat ? (mat.current_cost * item.quantity).toFixed(2) : '0.00'
                        return (
                          <tr key={idx} className="border-b border-gray-100 last:border-0">
                            <td className="px-3 py-2">{mat?.name || item.material_name}</td>
                            <td className="px-3 py-2 text-right">{item.quantity} {mat?.unit}</td>
                            <td className="px-3 py-2 text-right">R$ {subtotal}</td>
                            <td className="px-3 py-2 text-right">
                              <button onClick={() => removeIngredient(idx)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4" /></button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
              ) : (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm text-center">
                    ⚠️ Adicione insumos na ficha técnica.
                </div>
              )}

              {/* Tempo de Produção */}
              <div className="flex gap-6 items-center bg-blue-50 p-4 rounded-md">
                 <div className="w-48"><NumberInput label="Tempo (min)" name="labor_time_minutes" step={5} value={formData.labor_time_minutes} onChange={handleInputChange}/></div>
                 <div className="flex-1 text-sm text-blue-800">
                    <p className="font-bold flex gap-1"><ClockIcon className="w-4 h-4"/> Custo MO: R$ {financials.laborCost.toFixed(2)}</p>
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Precificação (Igual ao anterior) */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 relative">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CalculatorIcon className="w-5 h-5" /> 3. Precificação Final
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
             <div><label className="block text-xs font-bold text-gray-500 mb-1">Custo Total</label><div className="py-2 text-gray-800 font-medium">R$ {financials.totalBaseCost.toFixed(2)}</div></div>
             <div><NumberInput label="Margem (%)" name="profit_margin" step={5} value={formData.profit_margin} onChange={handleInputChange}/></div>
             <div><label className="block text-sm font-bold text-gray-500 mb-1">Preço Sugerido</label><div className="bg-gray-100 border border-gray-300 rounded px-3 py-2 text-gray-500 font-medium h-[42px] flex items-center">R$ {financials.suggestedPrice}</div></div>
             <div><CurrencyInput label="Preço Final *" name="price" required value={formData.price} onChange={handleInputChange}/></div>
          </div>
          <div className="mt-6 border-t pt-4 flex justify-between items-center">
             <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-600">Status:</span>
                {financials.profitStatus === 'LOSS' && <span className="px-3 py-1 bg-red-100 text-red-700 font-bold rounded-full text-xs">PREJUÍZO (R$ {financials.actualProfit})</span>}
                {financials.profitStatus === 'LOW' && <span className="px-3 py-1 bg-yellow-100 text-yellow-700 font-bold rounded-full text-xs">BAIXO (R$ {financials.actualProfit})</span>}
                {financials.profitStatus === 'GOOD' && <span className="px-3 py-1 bg-green-100 text-green-700 font-bold rounded-full text-xs">LUCRO (R$ {financials.actualProfit})</span>}
             </div>
             <div className="w-40"><NumberInput label="Estoque Inicial" name="stock_quantity" value={formData.stock_quantity} onChange={handleInputChange}/></div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/products')} className="px-6 py-2 border rounded hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700 shadow-lg">
            {loading ? 'Salvando...' : (id ? 'Salvar Alterações' : 'Salvar Produto')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default ProductForm