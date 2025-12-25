import React from 'react'
import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline'

const NumberInput = ({ label, value, onChange, name, min = 0, step = 1, required = false }) => {
  
  const handleIncrement = () => {
    const current = parseFloat(value) || 0
    onChange({ target: { name, value: current + step } })
  }

  const handleDecrement = () => {
    const current = parseFloat(value) || 0
    if (current - step >= min) {
      onChange({ target: { name, value: current - step } })
    }
  }

  return (
    <div className="flex flex-col">
      {label && <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="flex items-center">
        {/* Botão Menos */}
        <button
          type="button"
          onClick={handleDecrement}
          className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-l-md border border-r-0 border-gray-300 h-[42px] flex items-center justify-center transition"
        >
          <MinusIcon className="w-4 h-4" />
        </button>

        {/* Input Central */}
        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          step={step}
          required={required}
          className="w-full h-[42px] text-center border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10" // z-10 para a borda do focus ficar por cima
        />

        {/* Botão Mais */}
        <button
          type="button"
          onClick={handleIncrement}
          className="bg-gray-200 hover:bg-gray-300 text-gray-600 p-2 rounded-r-md border border-l-0 border-gray-300 h-[42px] flex items-center justify-center transition"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default NumberInput