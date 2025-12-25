import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Bars3Icon } from '@heroicons/react/24/outline'

// Páginas de Autenticação e Dashboard
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

// Vendas (PDV)
import PDV from './pages/PDV'

// Produtos
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'

// Estoque / Insumos
import Inventory from './pages/Inventory'
import MaterialForm from './pages/MaterialForm'

// Compras
import Purchases from './pages/Purchases'
import PurchaseForm from './pages/PurchaseForm'

// Financeiro (NOVO)
import Financial from './pages/Financial'

// Configurações
import Settings from './pages/Settings'

// Componente de Menu
import Sidebar from './components/Sidebar'

function App() {
  const [token, setToken] = useState(localStorage.getItem('trama_token'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => { 
    localStorage.removeItem('trama_token')
    setToken(null) 
  }

  // Se não estiver logado, mostra Login
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
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen">
        
        {/* Header Mobile */}
        <div className="md:hidden bg-indigo-800 text-white p-4 flex justify-between items-center shadow-md z-20 sticky top-0">
           <span className="font-bold text-lg">Trama ERP</span>
           <button onClick={() => setMobileMenuOpen(true)} className="p-1 rounded hover:bg-indigo-700 focus:outline-none">
             <Bars3Icon className="w-7 h-7" />
           </button>
        </div>

        {/* Menu Lateral */}
        <Sidebar 
          handleLogout={handleLogout} 
          isOpen={mobileMenuOpen} 
          closeMobileMenu={() => setMobileMenuOpen(false)} 
        />

        {/* Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto h-[calc(100vh-60px)] md:h-screen w-full">
          <Routes>
            {/* Home */}
            <Route path="/" element={<Dashboard />} />
            
            {/* Vendas */}
            <Route path="/pdv" element={<PDV token={token} handleLogout={handleLogout} />} />
            
            {/* Produtos */}
            <Route path="/products" element={<Products token={token} />} />
            <Route path="/products/new" element={<ProductForm token={token} />} />
            <Route path="/products/edit/:id" element={<ProductForm token={token} />} />
            
            {/* Insumos */}
            <Route path="/inventory" element={<Inventory token={token} />} />
            <Route path="/inventory/new" element={<MaterialForm token={token} />} />
            <Route path="/inventory/edit/:id" element={<MaterialForm token={token} />} />

            {/* Compras */}
            <Route path="/purchases" element={<Purchases token={token} />} />
            <Route path="/purchases/new" element={<PurchaseForm token={token} />} />

            {/* Financeiro (NOVO) */}
            <Route path="/financial" element={<Financial token={token} />} />

            {/* Configurações */}
            <Route path="/settings" element={<Settings token={token} />} />
            
            {/* Rota Coringa */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App