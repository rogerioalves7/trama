import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  ShoppingCartIcon, 
  ArchiveBoxIcon, 
  Cog6ToothIcon, 
  CubeIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon // Novo ícone
} from '@heroicons/react/24/outline'

function Sidebar({ handleLogout, isOpen, closeMobileMenu }) {
  const location = useLocation()

  // Função para estilizar o link ativo
  const getLinkClass = (path) => {
    const base = "flex items-center gap-3 py-3 px-4 rounded-lg transition duration-200 text-sm font-medium"
    // Verifica se a rota atual começa com o path (para manter ativo em sub-rotas)
    // Exceção: A raiz '/' só deve estar ativa se for exatamente '/'
    return location.pathname.startsWith(path) && path !== '/' 
      ? `${base} bg-indigo-900 text-white shadow-md`
      : (location.pathname === '/' && path === '/')
        ? `${base} bg-indigo-900 text-white`
        : `${base} text-indigo-100 hover:bg-indigo-700 hover:text-white`
  }

  // Classes de transição para o mobile (abre/fecha gaveta)
  const mobileClasses = isOpen ? "translate-x-0" : "-translate-x-full"

  return (
    <>
      {/* OVERLAY ESCURO (Mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* SIDEBAR CONTAINER */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-indigo-800 text-white shadow-xl transform transition-transform duration-300 ease-in-out
        md:translate-x-0 md:static md:inset-auto md:flex md:flex-col
        ${mobileClasses}
      `}>
        
        {/* Cabeçalho do Menu */}
        <div className="p-6 border-b border-indigo-700 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trama ERP</h1>
            <p className="text-xs text-indigo-300 mt-1">Gestão Inteligente</p>
          </div>
          {/* Botão de Fechar (Só Mobile) */}
          <button onClick={closeMobileMenu} className="md:hidden text-indigo-300 hover:text-white">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link to="/" className={getLinkClass('/')} onClick={closeMobileMenu}>
            <HomeIcon className="w-5 h-5" /> Dashboard
          </Link>
          
          <Link to="/pdv" className={getLinkClass('/pdv')} onClick={closeMobileMenu}>
            <ShoppingCartIcon className="w-5 h-5" /> Vender (PDV)
          </Link>
          
          {/* Seção Gestão */}
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Gestão</div>
          
          <Link to="/products" className={getLinkClass('/products')} onClick={closeMobileMenu}>
            <ArchiveBoxIcon className="w-5 h-5" /> Produtos Acabados
          </Link>

          <Link to="/inventory" className={getLinkClass('/inventory')} onClick={closeMobileMenu}>
            <CubeIcon className="w-5 h-5" /> Insumos / Estoque
          </Link>

          <Link to="/purchases" className={getLinkClass('/purchases')} onClick={closeMobileMenu}>
            <ClipboardDocumentListIcon className="w-5 h-5" /> Histórico de Compras
          </Link>

          {/* Seção Financeiro (NOVO) */}
          <Link to="/financial" className={getLinkClass('/financial')} onClick={closeMobileMenu}>
            <BanknotesIcon className="w-5 h-5" /> Financeiro
          </Link>

          {/* Seção Sistema */}
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-indigo-400 uppercase tracking-wider">Sistema</div>

          <Link to="/settings" className={getLinkClass('/settings')} onClick={closeMobileMenu}>
            <Cog6ToothIcon className="w-5 h-5" /> Configurações
          </Link>
        </nav>

        {/* Rodapé do Menu */}
        <div className="p-4 border-t border-indigo-700 bg-indigo-900">
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