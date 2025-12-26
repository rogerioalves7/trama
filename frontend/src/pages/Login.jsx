import { useState } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { 
  UserIcon, 
  LockClosedIcon, 
  EyeIcon, 
  EyeSlashIcon,
  FingerPrintIcon
} from '@heroicons/react/24/outline'

function Login({ setToken }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await api.post('token/', { username, password })
      const token = res.data.access
      
      localStorage.setItem('trama_token', token)
      setToken(token)
      toast.success(`Bem-vindo, ${username}! 👋`)
      
    } catch (error) {
      toast.error("Usuário ou senha inválidos")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 transition-colors p-4">
      
      {/* Container Principal */}
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors">
        
        {/* Cabeçalho */}
        <div className="bg-indigo-600 dark:bg-indigo-900 p-8 text-center">
            <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
                <FingerPrintIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Trama ERP</h1>
            <p className="text-indigo-100 mt-2 text-sm">Gestão inteligente para o seu negócio</p>
        </div>

        {/* Formulário */}
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Campo Usuário */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Usuário</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type="text" 
                            required
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                            placeholder="Seu nome de usuário"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                {/* Campo Senha */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Senha</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                            type={showPassword ? "text" : "password"}
                            required
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                            placeholder="Sua senha secreta"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {/* Botão Mostrar/Esconder */}
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                        >
                            {showPassword ? (
                                <EyeSlashIcon className="h-5 w-5" />
                            ) : (
                                <EyeIcon className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Botão Entrar */}
                <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-transform transform active:scale-95"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        "Acessar Sistema"
                    )}
                </button>
            </form>
        </div>
        
        {/* Rodapé do Card */}
        <div className="bg-gray-50 dark:bg-gray-700/50 p-4 text-center border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
                &copy; {new Date().getFullYear()} Trama ERP. Todos os direitos reservados.
            </p>
        </div>
      </div>
    </div>
  )
}

export default Login