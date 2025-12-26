import axios from 'axios'

// --- DEFINIÇÃO INTELIGENTE DA URL ---
// Verifica se o site está rodando no seu computador (localhost ou 127.0.0.1)
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

// Se for localhost, usa a porta 8000. Se não, usa o Render.
const baseURL = isLocalhost 
  ? 'http://127.0.0.1:8000/api/' 
  : 'https://trama-wxgr.onrender.com/api/'; // <--- Sua URL do Render aqui

console.log(`Ambiente detectado: ${isLocalhost ? 'LOCAL' : 'PRODUÇÃO'}`);
console.log(`Conectando em: ${baseURL}`);

const api = axios.create({
  baseURL: baseURL,
})

// INTERCEPTADOR DE REQUISIÇÃO (Mantido igual)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trama_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// INTERCEPTADOR DE RESPOSTA (Mantido igual)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('trama_token')
      if (window.location.pathname !== '/') {
          window.location.href = '/'
      }
    }
    return Promise.reject(error)
  }
)

export default api