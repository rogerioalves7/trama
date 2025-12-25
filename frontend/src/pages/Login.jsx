import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast' // <--- Importar o disparador

function Login({ setToken }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    // O toast.promise é incrível: ele mostra "Carregando...", 
    // e depois muda para Sucesso ou Erro automaticamente!
    const loginPromise = axios.post('http://127.0.0.1:8000/api/token/', {
        username,
        password
    })

    toast.promise(loginPromise, {
      loading: 'Autenticando...',
      success: 'Bem-vindo de volta!',
      error: 'Usuário ou senha incorretos.',
    })

    try {
      const response = await loginPromise
      const token = response.data.access
      localStorage.setItem('trama_token', token)
      setToken(token)
    } catch (err) {
      console.error(err)
      // Não precisa fazer nada aqui, o toast.promise já mostrou o erro
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Trama ERP</h1>
          <p className="text-gray-500 mt-2">Entre para gerenciar seu negócio</p>
        </div>
        
        {/* Removemos a div de erro antiga daqui, o Toast cuida disso agora */}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuário</label>
            <input 
              type="text" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white font-bold transition ${loading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
          >
            {loading ? 'Entrando...' : 'Entrar no Sistema'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login