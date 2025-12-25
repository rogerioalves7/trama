import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'

function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('purchases/')
      .then(res => {
        setPurchases(res.data)
        setLoading(false)
      })
      .catch(() => {
        toast.error('Erro ao carregar histórico.')
        setLoading(false)
      })
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Histórico de Compras</h1>
          <p className="text-sm text-gray-500">Notas de Entrada</p>
        </div>
        <Link to="/purchases/new" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-sm w-full md:w-auto text-center">
          + Registrar Compra
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
      ) : (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
             <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fornecedor</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qtd Itens</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Frete</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {purchases.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(p.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{p.supplier || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{p.items.length}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">R$ {p.freight_cost}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-green-700">R$ {p.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
            {purchases.length === 0 && <div className="p-8 text-center text-gray-500">Nenhuma compra registrada.</div>}
        </div>
      )}
    </div>
  )
}

export default Purchases