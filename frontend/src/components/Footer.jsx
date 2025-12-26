import { useState, useEffect } from 'react'
import { ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

function Footer() {
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Atualiza a cada 1 segundo (1000ms)
    const timer = setInterval(() => {
      setCurrentDate(new Date())
    }, 1000)

    // Limpa o timer quando o componente desmonta (boa prática)
    return () => clearInterval(timer)
  }, [])

  // Formatação: "25 de dezembro de 2025"
  const dateStr = currentDate.toLocaleDateString('pt-BR', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })

  // Formatação: "22:45:10"
  const timeStr = currentDate.toLocaleTimeString('pt-BR')

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 mt-auto transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
        
        {/* Lado Esquerdo: Copyright */}
        <div>
           &copy; {currentDate.getFullYear()} Trama ERP - Gestão Inteligente
        </div>

        {/* Lado Direito: Data e Hora */}
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span className="capitalize">{dateStr}</span>
            </div>
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 px-2 py-1 rounded shadow-sm border border-gray-200 dark:border-gray-700">
                <ClockIcon className="w-4 h-4 text-indigo-500" />
                <span className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">{timeStr}</span>
            </div>
        </div>

      </div>
    </footer>
  )
}

export default Footer