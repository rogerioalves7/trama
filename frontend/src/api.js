import axios from 'axios'

// Cria uma instância do Axios com o endereço base do Django
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

// INTERCEPTADOR DE REQUISIÇÃO
// Antes de sair do navegador, colamos o crachá (Token) se ele existir
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trama_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// INTERCEPTADOR DE RESPOSTA
// Se voltar com erro 401 (Não autorizado), forçamos o logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirou ou é inválido
      localStorage.removeItem('trama_token')
      
      // Se não estivermos já na tela de login, recarrega a página
      // Isso fará o App.jsx notar que não tem token e mostrar o Login
      if (window.location.pathname !== '/') {
          window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api