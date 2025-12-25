import React from 'react'

const CurrencyInput = ({ label, value, onChange, name, required = false, disabled = false }) => {
  
  // Função que transforma o valor numérico em string formatada (ex: 10.5 -> R$ 10,50)
  const formatCurrency = (val) => {
    if (!val) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(val)
  }

  // Função que trata a digitação
  const handleChange = (e) => {
    let inputValue = e.target.value
    
    // Remove tudo que não for dígito
    const onlyDigits = inputValue.replace(/\D/g, "")
    
    // Divide por 100 para considerar os centavos (Lógica ATM)
    const realValue = Number(onlyDigits) / 100
    
    // Manda para o componente pai o valor numérico puro (float)
    // O evento simulado mantém a estrutura padrão { target: { name, value } }
    onChange({
      target: {
        name: name,
        value: realValue
      }
    })
  }

  return (
    <div className="flex flex-col">
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        type="text"
        disabled={disabled}
        value={formatCurrency(value)}
        onChange={handleChange}
        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 ${disabled ? 'bg-gray-100 text-gray-500' : 'bg-white border-gray-300'}`}
      />
    </div>
  )
}

export default CurrencyInput