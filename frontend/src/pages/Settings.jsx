import { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import CurrencyInput from '../components/CurrencyInput'

function Settings({ token }) {
  const [settings, setSettings] = useState({
    hourly_labor_rate: 0
  })
  const [loading, setLoading] = useState(false)

  // Carrega configurações
  useEffect(() => {
    axios.get('http://127.0.0.1:8000/api/settings/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
        // A API pode retornar uma lista ou objeto único dependendo da view,
        // mas nosso hack no backend retorna o objeto direto no list.
        // Se vier array, pegamos o primeiro.
        const data = Array.isArray(res.data) ? res.data[0] : res.data
        setSettings(data)
    })
    .catch(() => toast.error("Erro ao carregar configurações"))
  }, [token])

  const handleSave = (e) => {
    e.preventDefault()
    setLoading(true)

    // Como forçamos ID 1 no backend, usamos put no ID 1
    axios.patch('http://127.0.0.1:8000/api/settings/1/', settings, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      toast.success("Configurações salvas!")
      setLoading(false)
    })
    .catch(() => {
      toast.error("Erro ao salvar.")
      setLoading(false)
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações do Sistema</h1>

      <form onSubmit={handleSave} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div>
          <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Parâmetros de Custo</h2>
          
          <div>
             <CurrencyInput 
                label="Valor da sua Hora de Trabalho"
                name="hourly_labor_rate"
                value={settings.hourly_labor_rate}
                onChange={handleChange}
             />
             <p className="text-sm text-gray-500 mt-1">
                Usado para calcular o custo de mão de obra nos produtos manufaturados.
             </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition"
          >
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default Settings