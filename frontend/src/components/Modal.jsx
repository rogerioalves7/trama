import { XMarkIcon } from '@heroicons/react/24/outline'

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity p-4">
      {/* Container do Modal com animação suave */}
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md animate-fade-in transform transition-all scale-100">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-4 border-b pb-2">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="mt-2">
            {children}
        </div>
      </div>
    </div>
  )
}