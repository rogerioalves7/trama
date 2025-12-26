import { useEffect, useState } from 'react'
import { 
  CurrencyDollarIcon, ShoppingBagIcon, ArrowTrendingUpIcon, ExclamationTriangleIcon,
  TrophyIcon, ChartBarIcon, CalendarDaysIcon, XMarkIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../api'

// --- MODAL ADAPTADO ---
const DetailModal = ({ isOpen, onClose, title, data, type }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg animate-fade-in max-h-[80vh] flex flex-col transition-colors">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">{title}</h3>
          <button onClick={onClose}><XMarkIcon className="w-6 h-6 text-gray-400 hover:text-gray-200"/></button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-1">
          {data.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">Nenhum registro encontrado.</p>
          ) : (
            <ul className="space-y-3">
              {data.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center border-b dark:border-gray-700 pb-2 last:border-0">
                  <div>
                    {type === 'stock' && (
                        <>
                            <p className="font-bold text-gray-800 dark:text-gray-200">{item.name}</p>
                            <p className="text-xs text-red-500">Estoque: {item.stock_quantity}</p>
                        </>
                    )}
                    {type === 'sales' && (
                        <>
                           <p className="font-bold text-gray-800 dark:text-gray-200">{item.sale__customer_name || 'Balcão'}</p>
                           <p className="text-xs text-gray-500 dark:text-gray-400">{item.description || item.date}</p>
                        </>
                    )}
                  </div>
                  
                  {type === 'stock' ? (
                     <span className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100 text-xs font-bold px-2 py-1 rounded">Crítico</span>
                  ) : (
                     <span className="font-bold text-green-700 dark:text-green-400">R$ {parseFloat(item.amount).toFixed(2)}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg text-right">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm font-bold text-gray-700 dark:text-white">Fechar</button>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalConfig, setModalConfig] = useState({ title: '', data: [], type: '' })

  useEffect(() => {
    api.get('dashboard/')
      .then(res => { setStats(res.data); setLoading(false) })
      .catch(err => { console.error(err); setLoading(false) })
  }, [])

  const openModal = (title, data, type) => {
    setModalConfig({ title, data: data || [], type })
    setModalOpen(true)
  }

  if (loading || !stats) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>
  }

  // Estilo do Tooltip do Gráfico (Para Dark Mode)
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border dark:border-gray-700 rounded shadow-lg text-sm">
          <p className="font-bold text-gray-700 dark:text-gray-200">{label}</p>
          <p className="text-indigo-600 dark:text-indigo-400 font-bold">R$ {parseFloat(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto transition-colors">
      <DetailModal 
        isOpen={modalOpen} onClose={() => setModalOpen(false)} 
        title={modalConfig.title} data={modalConfig.data} type={modalConfig.type}
      />

      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Visão Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* CARD VENDAS HOJE */}
        <div 
            onClick={() => openModal('Vendas de Hoje', stats.sales_today_list, 'sales')}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-indigo-500 flex items-center justify-between cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1"
        >
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendas Hoje</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              R$ {parseFloat(stats.sales_today).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-indigo-400 mt-1 underline">Ver detalhes</p>
          </div>
          <div className="bg-indigo-50 dark:bg-gray-700 p-3 rounded-full text-indigo-600 dark:text-indigo-400">
            <CurrencyDollarIcon className="w-6 h-6" />
          </div>
        </div>

        {/* CARD VENDAS MÊS */}
        <div 
            onClick={() => openModal('Últimas Vendas do Mês', stats.sales_month_list, 'sales')}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-green-500 flex items-center justify-between cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1"
        >
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Vendas Mês</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              R$ {parseFloat(stats.sales_month).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-green-400 mt-1 underline">Ver últimas</p>
          </div>
          <div className="bg-green-50 dark:bg-gray-700 p-3 rounded-full text-green-600 dark:text-green-400">
            <ArrowTrendingUpIcon className="w-6 h-6" />
          </div>
        </div>

        {/* CARD ESTOQUE */}
        <div 
            onClick={() => openModal('Produtos com Estoque Crítico', stats.low_stock_list, 'stock')}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border-l-4 border-red-500 flex items-center justify-between cursor-pointer hover:shadow-lg transition transform hover:-translate-y-1"
        >
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Estoque Crítico</p>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {stats.low_stock_count} <span className="text-sm font-normal text-gray-400">itens</span>
            </p>
            <p className="text-xs text-red-400 mt-1 underline">Ver produtos</p>
          </div>
          <div className="bg-red-50 dark:bg-gray-700 p-3 rounded-full text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="w-6 h-6" />
          </div>
        </div>

        {/* CARD PREVISÃO */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-orange-400 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
                <CalendarDaysIcon className="w-5 h-5 text-orange-500" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Previsão Futura</p>
            </div>
            <div className="space-y-1">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">A Receber:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                        + {parseFloat(stats.future_in).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">A Pagar:</span>
                    <span className="font-bold text-red-600 dark:text-red-400">
                        - {parseFloat(stats.future_out).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="border-t dark:border-gray-700 mt-1 pt-1 flex justify-between text-sm font-bold">
                    <span className="dark:text-white">Projeção:</span>
                    <span className={(stats.future_in - stats.future_out) >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-red-600 dark:text-red-400'}>
                        R$ {(stats.future_in - stats.future_out).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                </div>
            </div>
        </div>

      </div>

      {/* ÁREA DE GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 flex flex-col h-96">
            <div className="flex items-center gap-2 mb-6">
                <ChartBarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-gray-700 dark:text-gray-200 font-bold">Desempenho (7 dias - Pagos)</h3>
            </div>
            <div className="flex-1 w-full text-xs">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.sales_history} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                        <XAxis dataKey="date" tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} />
                        <YAxis tickFormatter={(val) => `R$ ${val}`} tick={{fill: '#9CA3AF'}} axisLine={false} tickLine={false} width={60} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Receita" maxBarSize={50} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700 flex flex-col h-96">
            <div className="flex items-center gap-2 mb-4">
                <TrophyIcon className="w-5 h-5 text-yellow-500" />
                <h3 className="text-gray-700 dark:text-gray-200 font-bold">Top Produtos</h3>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Produto</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qtd</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {stats.top_products.map((item, idx) => (
                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium flex items-center gap-2">
                                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${idx < 3 ? 'bg-yellow-500' : 'bg-gray-500'}`}>{idx + 1}</span>
                                    {item.name}
                                </td>
                                <td className="px-4 py-3 text-right text-sm font-bold text-indigo-600 dark:text-indigo-400">{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard