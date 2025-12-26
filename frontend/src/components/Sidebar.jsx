import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, ShoppingCartIcon, ArchiveBoxIcon, Cog6ToothIcon, CubeIcon,
  XMarkIcon, ClipboardDocumentListIcon, BanknotesIcon,
  SunIcon, MoonIcon // <--- NOVOS ÍCONES
} from '@heroicons/react/24/outline'

import { useTheme } from '../contexts/ThemeContext' // <--- IMPORTAR CONTEXTO

function Sidebar({ handleLogout, isOpen, closeMobileMenu }) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme() // <--- USAR HOOK

  const getLinkClass = (path) => {
    const base = "flex items-center gap-3 py-3 px-4 rounded-lg transition duration-200 text-sm font-medium"
    return location.pathname.startsWith(path) && path !== '/' 
      ? `${base} bg-indigo-900 text-white shadow-md dark:bg-indigo-950`
      : (location.pathname === '/' && path === '/')
        ? `${base} bg-indigo-900 text-white dark:bg-indigo-950`
        : `${base} text-indigo-100 hover:bg-indigo-700 hover:text-white dark:hover:bg-indigo-800`
  }

  const mobileClasses = isOpen ? "translate-x-0" : "-translate-x-full"

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMobileMenu}
        ></div>
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-indigo-800 dark:bg-gray-900 text-white shadow-xl transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-auto md:flex md:flex-col
        ${mobileClasses}
      `}>
        
        <div className="p-6 border-b border-indigo-700 dark:border-gray-800 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trama ERP</h1>
            <p className="text-xs text-indigo-300">Gestão Inteligente</p>
          </div>
          <button onClick={closeMobileMenu} className="md:hidden text-indigo-300 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* ... LINKS (MANTENHA OS LINKS IGUAIS) ... */}
          <Link to="/" className={getLinkClass('/')} onClick={closeMobileMenu}><HomeIcon className="w-5 h-5" /> Dashboard</Link>
          <Link to="/pdv" className={getLinkClass('/pdv')} onClick={closeMobileMenu}><ShoppingCartIcon className="w-5 h-5" /> Vender (PDV)</Link>
          
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Gestão</div>
          
          <Link to="/products" className={getLinkClass('/products')} onClick={closeMobileMenu}><ArchiveBoxIcon className="w-5 h-5" /> Produtos Acabados</Link>
          <Link to="/inventory" className={getLinkClass('/inventory')} onClick={closeMobileMenu}><CubeIcon className="w-5 h-5" /> Insumos / Estoque</Link>
          <Link to="/purchases" className={getLinkClass('/purchases')} onClick={closeMobileMenu}><ClipboardDocumentListIcon className="w-5 h-5" /> Histórico de Compras</Link>
          <Link to="/financial" className={getLinkClass('/financial')} onClick={closeMobileMenu}><BanknotesIcon className="w-5 h-5" /> Financeiro</Link>
          
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Sistema</div>
          <Link to="/settings" className={getLinkClass('/settings')} onClick={closeMobileMenu}><Cog6ToothIcon className="w-5 h-5" /> Configurações</Link>
        </nav>

        {/* RODAPÉ DO MENU (BOTÃO DARK MODE + LOGOUT) */}
        <div className="p-4 border-t border-indigo-700 dark:border-gray-800 bg-indigo-900 dark:bg-gray-950 space-y-3">
          
          {/* Botão de Tema */}
          <button 
            onClick={toggleTheme}
            className="w-full py-2 px-4 bg-indigo-800 dark:bg-gray-800 hover:bg-indigo-700 dark:hover:bg-gray-700 rounded-md text-white font-medium text-sm transition flex items-center justify-center gap-2"
          >
            {theme === 'light' ? (
                <><MoonIcon className="w-5 h-5" /> Modo Escuro</>
            ) : (
                <><SunIcon className="w-5 h-5" /> Modo Claro</>
            )}
          </button>

          <button 
            onClick={() => { closeMobileMenu(); handleLogout(); }} 
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md text-white font-bold text-sm transition shadow-sm"
          >
            Sair do Sistema
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar