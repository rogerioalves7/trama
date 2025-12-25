import { useEffect, useState } from 'react'
import { 
  CurrencyDollarIcon, 
  ShoppingBagIcon, 
  ArrowTrendingUpIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline'
import api from '../api'

function Dashboard() {
  const [stats, setStats] = useState({
    sales_today: 0,
    sales_month: 0,
    balance: 0,
    low_stock_count: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Busca dados reais do Backend
    api.get('dashboard/')
      .then(res => {
        setStats(res.data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Erro ao carregar dashboard:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Visão Geral</h1>
      
      {/* Grid de Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Card 1: Vendas Hoje */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500 flex items-center justify-between transition hover:scale-105">
          <div>
            <p className="text-sm font-medium text-gray-500">Vendas Hoje</p>
            <p className="text-2xl font-bold text-gray-800">
              R$ {parseFloat(stats.sales_today).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full text-indigo-600">
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Vendas Mês */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 flex items-center justify-between transition hover:scale-105">
          <div>
            <p className="text-sm font-medium text-gray-500">Vendas Mês</p>
            <p className="text-2xl font-bold text-gray-800">
              R$ {parseFloat(stats.sales_month).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-green-50 p-3 rounded-full text-green-600">
            <ArrowTrendingUpIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Saldo Geral */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 flex items-center justify-between transition hover:scale-105">
          <div>
            <p className="text-sm font-medium text-gray-500">Saldo em Caixa</p>
            <p className="text-2xl font-bold text-gray-800">
              R$ {parseFloat(stats.balance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-blue-50 p-3 rounded-full text-blue-600">
            <ShoppingBagIcon className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Alerta Estoque */}
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500 flex items-center justify-between transition hover:scale-105">
          <div>
            <p className="text-sm font-medium text-gray-500">Estoque Crítico</p>
            <p className="text-2xl font-bold text-gray-800">
              {stats.low_stock_count} <span className="text-sm font-normal text-gray-400">produtos</span>
            </p>
          </div>
          <div className="bg-red-50 p-3 rounded-full text-red-600">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Placeholders para Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow h-64 flex flex-col items-center justify-center border border-gray-100">
            <p className="text-gray-400 text-sm font-semibold">Desempenho de Vendas (Últimos 7 dias)</p>
            <p className="text-xs text-gray-300 mt-2">Em breve</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow h-64 flex flex-col items-center justify-center border border-gray-100">
            <p className="text-gray-400 text-sm font-semibold">Top Produtos Vendidos</p>
            <p className="text-xs text-gray-300 mt-2">Em breve</p>
        </div>
      </div>
    </div>
  )
}

export default Dashboard