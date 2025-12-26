import axios from 'axios'

// --- LÓGICA DE URL ---
const isLocalhost = 
  window.location.hostname === 'localhost' || 
  window.location.hostname === '127.0.0.1';

const baseURL = isLocalhost 
  ? 'http://127.0.0.1:8000/api/' 
  : 'https://trama-backend.onrender.com/api/'; // <--- URL do Render

// --- DEBUG NO CELULAR ---
// Isso vai fazer aparecer uma janela no seu celular mostrando a URL.
// Se não aparecer janela nenhuma, seu celular está com CACHE ANTIGO.
if (!isLocalhost) {
    alert(`Estou tentando conectar em:\n${baseURL}`);
}

const api = axios.create({
  baseURL: baseURL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trama_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

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