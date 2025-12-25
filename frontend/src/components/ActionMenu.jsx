import { useState, useEffect, useRef } from 'react'
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline'

const ActionMenu = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none p-2"
      >
        <EllipsisVerticalIcon className="w-6 h-6" />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 z-50 animate-fade-in origin-top-right"
          onClick={() => setIsOpen(false)} // Fecha ao clicar em uma opção
        >
          <div className="py-1 flex flex-col">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// Sub-componente para os itens do menu ficarem padronizados
export const ActionItem = ({ onClick, icon: Icon, label, colorClass = "text-gray-700 hover:bg-gray-50" }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    className={`flex items-center gap-2 px-4 py-3 text-sm w-full text-left transition-colors ${colorClass}`}
  >
    {Icon && <Icon className="w-4 h-4" />}
    {label}
  </button>
)

export default ActionMenu