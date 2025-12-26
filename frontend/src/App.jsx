import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Bars3Icon } from '@heroicons/react/24/outline'

// Contexto de Tema
import { ThemeProvider } from './contexts/ThemeContext'

// Componentes de Layout
import Sidebar from './components/Sidebar'
import Footer from './components/Footer' // <--- IMPORTADO AQUI

// Páginas
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PDV from './pages/PDV'
import Products from './pages/Products'
import ProductForm from './pages/ProductForm'
import Inventory from './pages/Inventory'
import MaterialForm from './pages/MaterialForm'
import Purchases from './pages/Purchases'
import PurchaseForm from './pages/PurchaseForm'
import Financial from './pages/Financial'
import Settings from './pages/Settings'

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('trama_token'))
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => { 
    localStorage.removeItem('trama_token')
    setToken(null) 
  }

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
      
      <div className="flex flex-col md:flex-row bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
        
        {/* HEADER MOBILE */}
        <div className="md:hidden bg-indigo-800 dark:bg-gray-950 text-white p-4 flex justify-between items-center shadow-md z-20 sticky top-0 transition-colors">
           <span className="font-bold text-lg">Trama ERP</span>
           <button 
             onClick={() => setMobileMenuOpen(true)} 
             className="p-1 rounded hover:bg-indigo-700 dark:hover:bg-gray-800 focus:outline-none transition-colors"
           >
             <Bars3Icon className="w-7 h-7" />
           </button>
        </div>

        {/* SIDEBAR */}
        <Sidebar 
          handleLogout={handleLogout} 
          isOpen={mobileMenuOpen} 
          closeMobileMenu={() => setMobileMenuOpen(false)} 
        />

        {/* ÁREA PRINCIPAL */}
        {/* Alteração: Adicionado 'flex flex-col' para gerenciar o layout vertical */}
        <div className="flex-1 flex flex-col h-[calc(100vh-60px)] md:h-screen w-full relative overflow-hidden">
           
           {/* Área de Rotas (Scrollável e Expansível) */}
           <div className="flex-1 overflow-y-auto">
               <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/pdv" element={<PDV token={token} handleLogout={handleLogout} />} />
                  <Route path="/products" element={<Products token={token} />} />
                  <Route path="/products/new" element={<ProductForm token={token} />} />
                  <Route path="/products/edit/:id" element={<ProductForm token={token} />} />
                  <Route path="/inventory" element={<Inventory token={token} />} />
                  <Route path="/inventory/new" element={<MaterialForm token={token} />} />
                  <Route path="/inventory/edit/:id" element={<MaterialForm token={token} />} />
                  <Route path="/purchases" element={<Purchases token={token} />} />
                  <Route path="/purchases/new" element={<PurchaseForm token={token} />} />
                  <Route path="/financial" element={<Financial token={token} />} />
                  <Route path="/settings" element={<Settings token={token} />} />
                  <Route path="*" element={<Navigate to="/" />} />
               </Routes>
               
               {/* RODAPÉ (Inserido aqui para rolar junto com a página) */}
               <Footer />
           </div>

        </div>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}