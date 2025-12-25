import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom' // Importado useParams
import toast from 'react-hot-toast'
import api from '../api'
import CurrencyInput from '../components/CurrencyInput'
import NumberInput from '../components/NumberInput'

function MaterialForm() {
  const navigate = useNavigate()
  const { id } = useParams() // Pega o ID da URL, se existir
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    unit: 'UN',
    current_cost: 0,
    stock_quantity: 0
  })

  // Modo Edição: Se tiver ID, busca os dados
  useEffect(() => {
    if (id) {
        setLoading(true)
        api.get(`materials/${id}/`)
        .then(res => {
            setFormData(res.data)
            setLoading(false)
        })
        .catch(() => {
            toast.error("Erro ao carregar material.")
            navigate('/inventory')
        })
    }
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)

    // Lógica inteligente: Se tem ID é Edição (PATCH), senão é Criação (POST)
    const request = id 
        ? api.patch(`materials/${id}/`, formData) 
        : api.post('materials/', formData)

    request
    .then(() => {
      toast.success(id ? "Insumo atualizado!" : "Insumo criado!")
      navigate('/inventory')
    })
    .catch((err) => {
      console.error(err)
      toast.error("Erro ao salvar insumo.")
      setLoading(false)
    })
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {id ? 'Editar Insumo' : 'Novo Insumo'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Material</label>
          <input 
            type="text" name="name" required
            value={formData.name} onChange={handleChange}
            className="w-full border-gray-300 rounded-md px-3 py-2 border focus:ring-indigo-500 outline-none"
            placeholder="Ex: Tecido Tricoline Estampado"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unidade de Medida</label>
                <select 
                    name="unit" 
                    value={formData.unit} onChange={handleChange}
                    className="w-full border-gray-300 rounded-md px-3 py-2 border focus:ring-indigo-500 outline-none bg-white"
                >
                    <option value="UN">Unidade (UN)</option>
                    <option value="MT">Metro (MT)</option>
                    <option value="KG">Quilo (KG)</option>
                    <option value="LT">Litro (LT)</option>
                </select>
            </div>

            <div>
                <NumberInput 
                    label="Estoque Atual"
                    name="stock_quantity"
                    step={0.1}
                    value={formData.stock_quantity}
                    onChange={handleChange}
                />
            </div>
        </div>

        <div>
            <CurrencyInput 
                label="Custo Atual (por unidade/metro)"
                name="current_cost"
                value={formData.current_cost}
                onChange={handleChange}
                required
            />
            <p className="text-xs text-gray-500 mt-1">
                Valor usado para calcular o custo dos produtos que usam este material.
            </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button type="button" onClick={() => navigate('/inventory')} className="px-4 py-2 border rounded hover:bg-gray-50">Cancelar</button>
          <button type="submit" disabled={loading} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded hover:bg-indigo-700">
            {loading ? 'Salvando...' : (id ? 'Atualizar Insumo' : 'Salvar Insumo')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default MaterialForm