import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Bars3Icon } from '@heroicons/react/24/outline'

// Contexto de Tema (Dark Mode)
import { ThemeProvider } from './contexts/ThemeContext'

// Componentes de Layout
import Sidebar from './components/Sidebar'

// Páginas - Autenticação & Dashboard
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Páginas - Vendas
import PDV from './pages/PDV'

// Páginas - Gestão de Produtos
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'

// Páginas - Gestão de Estoque
import Inventory from './pages/Inventory'
import MaterialForm from './pages/MaterialForm'

// Páginas - Compras
import Purchases from './pages/Purchases'
import PurchaseForm from './pages/PurchaseForm'

// Páginas - Financeiro
import Financial from './pages/Financial'

// Páginas - Configurações
import Settings from './pages/Settings'

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('trama_token'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => { 
    localStorage.removeItem('trama_token')
    setToken(null) 
  }

  // Se não houver token, exibe apenas a tela de Login
  if (!token) {
    return (
      <>
        <Toaster position="top-center" />
        <Login setToken={setToken} />
      </>
    )
  }

  return (
    <BrowserRouter>
      {/* Notificações Toast globais */}
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      {/* CONTAINER PRINCIPAL (Com suporte a Dark Mode) */}
      <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        
        {/* HEADER MOBILE (Apenas visível em telas pequenas) */}
        <div className="md:hidden bg-indigo-800 dark:bg-gray-950 text-white p-4 flex justify-between items-center shadow-md z-20 sticky top-0 transition-colors">
           <span className="font-bold text-lg">Trama ERP</span>
           <button 
             onClick={() => setMobileMenuOpen(true)} 
             className="p-1 rounded hover:bg-indigo-700 dark:hover:bg-gray-800 focus:outline-none transition-colors"
           >
             <Bars3Icon className="w-7 h-7" />
           </button>
        </div>

        {/* SIDEBAR (Menu Lateral) */}
        <Sidebar 
          handleLogout={handleLogout} 
          isOpen={mobileMenuOpen} 
          closeMobileMenu={() => setMobileMenuOpen(false)} 
        />

        {/* ÁREA DE CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen w-full relative">
           <Routes>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Ponto de Venda */}
              <Route path="/pdv" element={<PDV token={token} handleLogout={handleLogout} />} />
              
              {/* Produtos */}
              <Route path="/products" element={<Products token={token} />} />
              <Route path="/products/new" element={<ProductForm token={token} />} />
              <Route path="/products/edit/:id" element={<ProductForm token={token} />} />
              
              {/* Estoque / Insumos */}
              <Route path="/inventory" element={<Inventory token={token} />} />
              <Route path="/inventory/new" element={<MaterialForm token={token} />} />
              <Route path="/inventory/edit/:id" element={<MaterialForm token={token} />} />

              {/* Compras */}
              <Route path="/purchases" element={<Purchases token={token} />} />
              <Route path="/purchases/new" element={<PurchaseForm token={token} />} />

              {/* Financeiro */}
              <Route path="/financial" element={<Financial token={token} />} />

              {/* Configurações */}
              <Route path="/settings" element={<Settings token={token} />} />
              
              {/* Redirecionamento padrão para Dashboard */}
              <Route path="*" element={<Navigate to="/" />} />
           </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

// O App principal exporta o Provider envolvendo a aplicação
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}