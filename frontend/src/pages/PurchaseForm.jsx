import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { PlusIcon, TrashIcon, TruckIcon } from '@heroicons/react/24/outline'

import api from '../api'
import CurrencyInput from '../components/CurrencyInput'
import NumberInput from '../components/NumberInput'
import Modal from '../components/Modal'

function PurchaseForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [materials, setMaterials] = useState([])
  
  // Controle de Modal (Novo Insumo)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newMaterial, setNewMaterial] = useState({ name: '', unit: 'UN' })
  const [loadingNew, setLoadingNew] = useState(false)

  // ESTADO DA COMPRA
  const [header, setHeader] = useState({
    supplier: '',
    date: new Date().toISOString().split('T')[0],
    freight_cost: 0
  })

  const [items, setItems] = useState([]) // Lista de itens no carrinho
  
  // Estado do Item sendo adicionado agora
  const [currentItem, setCurrentItem] = useState({
    material_id: '',
    quantity: '',
    unit_cost: ''
  })

  // 1. Carregar Materiais
  const fetchMaterials = () => {
    return api.get('materials/').then(res => setMaterials(res.data))
  }
  useEffect(() => { fetchMaterials() }, [])

  // 2. Adicionar Item ao Carrinho Local
  const addItem = () => {
    if (!currentItem.material_id || !currentItem.quantity || !currentItem.unit_cost) {
        return toast.error("Preencha o material, quantidade e custo.")
    }
    const mat = materials.find(m => m.id === parseInt(currentItem.material_id))
    
    setItems([...items, { ...currentItem, material_name: mat.name, material_unit: mat.unit }])
    // Limpa campos
    setCurrentItem({ material_id: '', quantity: '', unit_cost: '' })
  }

  const removeItem = (index) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  // 3. Cálculos de Totais (Visual)
  const subtotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity) * parseFloat(item.unit_cost)), 0)
  const total = subtotal + parseFloat(header.freight_cost || 0)

  // 4. Salvar Tudo
  const handleSubmit = (e) => {
    e.preventDefault()
    if (items.length === 0) return toast.error("Adicione pelo menos um item.")

    setLoading(true)
    
    const payload = {
        supplier: header.supplier,
        date: header.date,
        freight_cost: header.freight_cost,
        items: items // O Backend espera essa lista
    }

    api.post('purchases/', payload)
    .then(() => {
        toast.success("Compra registrada! Custos rateados e estoque atualizado.")
        navigate('/purchases')
    })
    .catch(err => {
        console.error(err)
        toast.error("Erro ao registrar compra.")
        setLoading(false)
    })
  }

  // --- Quick Add Material Logic ---
  const handleQuickCreate = (e) => {
    e.preventDefault()
    if (!newMaterial.name) return toast.error("Nome obrigatório")
    setLoadingNew(true)
    api.post('materials/', { ...newMaterial, current_cost: 0, stock_quantity: 0 })
      .then(async (res) => {
        toast.success("Insumo criado!")
        await fetchMaterials()
        setCurrentItem(prev => ({ ...prev, material_id: res.data.id }))
        setIsModalOpen(false)
        setNewMaterial({ name: '', unit: 'UN' })
      })
      .finally(() => setLoadingNew(false))
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto pb-20">
      
      {/* MODAL NOVO INSUMO */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Novo Insumo">
        <div className="space-y-4">
            <input className="w-full border p-2 rounded" placeholder="Nome" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
            <select className="w-full border p-2 rounded" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})}>
                <option value="UN">UN</option><option value="MT">MT</option><option value="KG">KG</option><option value="LT">LT</option>
            </select>
            <button onClick={handleQuickCreate} disabled={loadingNew} className="w-full bg-green-600 text-white p-2 rounded font-bold">
                {loadingNew ? 'Criando...' : 'Criar'}
            </button>
        </div>
      </Modal>

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Nova Entrada (Compra)</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* CABEÇALHO DA NOTA */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Fornecedor</label>
                <input type="text" className="w-full border p-2 rounded" value={header.supplier} onChange={e => setHeader({...header, supplier: e.target.value})} />
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Data</label>
                <input type="date" className="w-full border p-2 rounded" value={header.date} onChange={e => setHeader({...header, date: e.target.value})} />
            </div>
        </div>

        {/* ADICIONAR ITEM */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Itens da Compra</h2>
            
            <div className="flex flex-col md:flex-row gap-2 items-end mb-4 bg-gray-50 p-3 rounded">
                <div className="flex-1 w-full">
                    <label className="text-xs font-bold text-gray-500">Material</label>
                    <div className="flex gap-1">
                        <select 
                            className="w-full border p-2 rounded bg-white" 
                            value={currentItem.material_id} 
                            onChange={e => setCurrentItem({...currentItem, material_id: e.target.value})}
                        >
                            <option value="">Selecione...</option>
                            {materials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                        </select>
                        <button type="button" onClick={() => setIsModalOpen(true)} className="bg-green-600 text-white p-2 rounded"><PlusIcon className="w-5 h-5"/></button>
                    </div>
                </div>
                <div className="w-full md:w-32">
                    <NumberInput label="Qtd" name="qtd" step={0.1} value={currentItem.quantity} onChange={e => setCurrentItem({...currentItem, quantity: e.target.value})} />
                </div>
                <div className="w-full md:w-40">
                    <CurrencyInput label="Custo Unit." name="cost" value={currentItem.unit_cost} onChange={e => setCurrentItem({...currentItem, unit_cost: e.target.value})} />
                </div>
                <button type="button" onClick={addItem} className="bg-indigo-600 text-white p-2.5 rounded hover:bg-indigo-700 w-full md:w-auto flex justify-center">
                    <PlusIcon className="w-5 h-5" />
                </button>
            </div>

            {/* LISTA DE ITENS */}
            {items.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-2 text-left">Material</th>
                                <th className="p-2 text-right">Qtd</th>
                                <th className="p-2 text-right">Unit.</th>
                                <th className="p-2 text-right">Total</th>
                                <th className="p-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-2">{item.material_name}</td>
                                    <td className="p-2 text-right">{item.quantity} {item.material_unit}</td>
                                    <td className="p-2 text-right">R$ {parseFloat(item.unit_cost).toFixed(2)}</td>
                                    <td className="p-2 text-right font-medium">R$ {(item.quantity * item.unit_cost).toFixed(2)}</td>
                                    <td className="p-2 text-right">
                                        <button type="button" onClick={() => removeItem(idx)} className="text-red-500"><TrashIcon className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-gray-400 py-4 italic">Nenhum item adicionado.</p>
            )}
        </div>

        {/* TOTAIS E FRETE */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200 border-l-4 border-indigo-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="w-full md:w-1/3">
                    <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                        <TruckIcon className="w-5 h-5 text-indigo-600" /> Valor do Frete
                    </label>
                    <CurrencyInput 
                        value={header.freight_cost} 
                        onChange={e => setHeader({...header, freight_cost: e.target.value})} 
                    />
                    <p className="text-xs text-gray-500 mt-1">Será diluído no custo dos itens.</p>
                </div>

                <div className="text-right w-full md:w-1/3 space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Subtotal Produtos:</span>
                        <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-indigo-600">
                        <span>Frete:</span>
                        <span>+ R$ {parseFloat(header.freight_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-gray-800 border-t pt-2">
                        <span>Total Nota:</span>
                        <span>R$ {total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        {/* BOTÕES */}
        <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/purchases')} className="px-6 py-3 border rounded hover:bg-gray-50">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-3 bg-green-600 text-white font-bold rounded hover:bg-green-700 shadow-lg">
                {loading ? 'Processando...' : 'Finalizar Compra'}
            </button>
        </div>
      </form>
    </div>
  )
}

export default PurchaseForm