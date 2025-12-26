import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { 
  MagnifyingGlassIcon, ShoppingCartIcon, TrashIcon, 
  BanknotesIcon, CreditCardIcon, QrCodeIcon, 
  PhoneIcon, UserIcon 
} from '@heroicons/react/24/outline'

import api from '../api'
import Modal from '../components/Modal'

function PDV() {
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  
  // Dados
  const [products, setProducts] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  
  // Filtro e Carrinho
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState([])
  
  // Modal de Pagamento
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [paymentData, setPaymentData] = useState({
    method_id: '',
    customer_name: '',
    customer_phone: ''
  })

  // --- 1. CARGA INICIAL ---
  useEffect(() => {
    Promise.all([
      api.get('products/'),
      api.get('payment-methods/')
    ]).then(([resProd, resPay]) => {
      setProducts(resProd.data)
      setPaymentMethods(resPay.data)
      setLoading(false)
    }).catch(() => {
      toast.error("Erro ao carregar dados do PDV")
      setLoading(false)
    })
  }, [])

  // --- 2. LÓGICA DO CARRINHO ---
  const addToCart = (product) => {
    if (product.stock_quantity <= 0) {
        toast.error("Produto sem estoque!")
        return
    }

    const existing = cart.find(item => item.product.id === product.id)
    
    if (existing) {
        if (existing.quantity + 1 > product.stock_quantity) {
            toast.error("Estoque máximo atingido.")
            return
        }
        setCart(cart.map(item => 
            item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ))
    } else {
        setCart([...cart, { product, quantity: 1, price: parseFloat(product.price) }])
    }
  }

  const removeFromCart = (index) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const updateQuantity = (index, delta) => {
    const item = cart[index]
    const newQty = item.quantity + delta
    
    if (newQty <= 0) {
        removeFromCart(index)
        return
    }

    if (newQty > item.product.stock_quantity) {
        toast.error("Estoque insuficiente.")
        return
    }

    const newCart = [...cart]
    newCart[index].quantity = newQty
    setCart(newCart)
  }

  // --- 3. FINALIZAR VENDA ---
  const total = cart.reduce((acc, item) => acc + (item.quantity * item.price), 0)

  const handleFinishSale = () => {
    if (!paymentData.method_id) return toast.error("Selecione a forma de pagamento")
    
    setProcessing(true)

    const payload = {
        total_amount: total,
        payment_method: paymentData.method_id,
        customer_name: paymentData.customer_name || 'Consumidor Final',
        customer_phone: paymentData.customer_phone,
        items: cart.map(item => ({
            product_id: item.product.id, // ID correto para o Backend
            quantity: item.quantity,
            unit_price: item.price
        }))
    }

    api.post('sales/', payload)
    .then(() => {
        toast.success("Venda realizada com sucesso! 🎉")
        setCart([])
        setIsCheckoutOpen(false)
        setPaymentData({ method_id: '', customer_name: '', customer_phone: '' })
        // Atualiza estoque visualmente recarregando produtos
        api.get('products/').then(res => setProducts(res.data))
    })
    .catch(err => {
        console.error(err)
        const msg = err.response?.data?.error || "Erro ao processar venda."
        toast.error(msg)
    })
    .finally(() => setProcessing(false))
  }

  // Filtragem
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.sku && p.sku.includes(searchTerm))
  )

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-gray-100 dark:bg-gray-900 transition-colors">
      
      {/* --- ESQUERDA: CATÁLOGO --- */}
      <div className="flex-1 flex flex-col border-r border-gray-200 dark:border-gray-700 h-full">
        {/* Barra de Busca */}
        <div className="p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm z-10 transition-colors">
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Buscar produto por nome ou SKU..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    autoFocus
                />
            </div>
        </div>

        {/* Grid de Produtos */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 transition-colors">
            {loading ? (
                <div className="flex justify-center mt-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map(product => (
                        <button 
                            key={product.id}
                            onClick={() => addToCart(product)}
                            disabled={product.stock_quantity <= 0}
                            className={`p-3 rounded-lg border text-left transition relative group flex flex-col justify-between h-32
                                ${product.stock_quantity > 0 
                                    ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-md' 
                                    : 'bg-gray-100 dark:bg-gray-800 opacity-60 cursor-not-allowed border-gray-200 dark:border-gray-700'}`}
                        >
                            <div className="w-full">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2 text-sm">{product.name}</h3>
                            </div>
                            
                            <div className="flex justify-between items-end mt-2">
                                <div>
                                    <p className={`text-xs ${product.stock_quantity <= 5 ? 'text-red-500 font-bold' : 'text-gray-500 dark:text-gray-400'}`}>
                                        Estoque: {product.stock_quantity}
                                    </p>
                                    <p className="font-bold text-indigo-600 dark:text-indigo-400">R$ {product.price}</p>
                                </div>
                                {product.stock_quantity > 0 && (
                                    <div className="bg-indigo-50 dark:bg-indigo-900 p-1.5 rounded-full text-indigo-600 dark:text-indigo-300 opacity-0 group-hover:opacity-100 transition">
                                        <ShoppingCartIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                    {filteredProducts.length === 0 && (
                        <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
                            Nenhum produto encontrado.
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>

      {/* --- DIREITA: CARRINHO --- */}
      <div className="w-full md:w-96 bg-white dark:bg-gray-800 flex flex-col h-[40vh] md:h-full shadow-2xl z-20 border-t md:border-t-0 dark:border-gray-700 transition-colors">
         <div className="p-4 bg-indigo-900 text-white flex justify-between items-center shadow-md">
            <h2 className="font-bold text-lg flex items-center gap-2">
                <ShoppingCartIcon className="w-6 h-6" /> Carrinho
            </h2>
            <span className="bg-indigo-700 px-2 py-1 rounded text-xs font-bold">{cart.length} itens</span>
         </div>

         {/* Lista de Itens */}
         <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-gray-800 transition-colors">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 opacity-50">
                    <ShoppingCartIcon className="w-16 h-16 mb-2" />
                    <p>Carrinho vazio</p>
                </div>
            ) : (
                cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center border-b dark:border-gray-700 pb-2">
                        <div className="flex-1">
                            <p className="font-medium text-gray-800 dark:text-gray-200 line-clamp-1">{item.product.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Unit: R$ {item.price}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
                                <button onClick={() => updateQuantity(idx, -1)} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">-</button>
                                <span className="px-2 text-sm font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                                <button onClick={() => updateQuantity(idx, 1)} className="px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200">+</button>
                            </div>
                            <p className="font-bold text-gray-800 dark:text-gray-200 w-16 text-right">
                                {(item.quantity * item.price).toFixed(2)}
                            </p>
                            <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-600">
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))
            )}
         </div>

         {/* Resumo e Botão */}
         <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 space-y-3 transition-colors">
            <div className="flex justify-between items-center text-xl font-bold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>R$ {total.toFixed(2)}</span>
            </div>
            <button 
                onClick={() => setIsCheckoutOpen(true)}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition
                    ${cart.length > 0 
                        ? 'bg-green-600 hover:bg-green-700 hover:scale-[1.02]' 
                        : 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed'}`}
            >
                Finalizar Venda
            </button>
         </div>
      </div>

      {/* --- MODAL DE PAGAMENTO --- */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Pagamento">
         <div className="space-y-4">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded text-center mb-4 transition-colors">
                <p className="text-sm text-gray-500 dark:text-gray-300">Total a Pagar</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">R$ {total.toFixed(2)}</p>
            </div>

            {/* Formas de Pagamento */}
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Forma de Pagamento</label>
                <div className="grid grid-cols-2 gap-2">
                    {paymentMethods.map(pm => (
                        <button
                            key={pm.id}
                            onClick={() => setPaymentData({...paymentData, method_id: pm.id})}
                            className={`p-3 rounded border text-sm font-medium flex items-center justify-center gap-2 transition
                                ${paymentData.method_id === pm.id 
                                    ? 'bg-indigo-600 text-white border-indigo-600' 
                                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                        >
                            {pm.name === 'Pix' && <QrCodeIcon className="w-5 h-5"/>}
                            {pm.name === 'Dinheiro' && <BanknotesIcon className="w-5 h-5"/>}
                            {['Crédito', 'Débito'].includes(pm.name) && <CreditCardIcon className="w-5 h-5"/>}
                            {pm.name}
                        </button>
                    ))}
                    {paymentMethods.length === 0 && (
                        <p className="text-red-500 text-xs col-span-2">Cadastre formas de pagamento em Configurações.</p>
                    )}
                </div>
            </div>

            {/* Dados do Cliente */}
            <div className="grid grid-cols-1 gap-3 pt-2">
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <UserIcon className="w-4 h-4"/> Cliente
                    </label>
                    <input 
                        type="text" 
                        placeholder="Nome (Opcional)"
                        className="w-full border dark:border-gray-600 p-2 rounded outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        value={paymentData.customer_name}
                        onChange={e => setPaymentData({...paymentData, customer_name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                        <PhoneIcon className="w-4 h-4"/> Telefone / WhatsApp
                    </label>
                    <input 
                        type="tel" 
                        placeholder="(00) 00000-0000"
                        className="w-full border dark:border-gray-600 p-2 rounded outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                        value={paymentData.customer_phone}
                        onChange={e => setPaymentData({...paymentData, customer_phone: e.target.value})}
                    />
                </div>
            </div>

            <div className="pt-4">
                <button 
                    onClick={handleFinishSale} 
                    disabled={processing || !paymentData.method_id}
                    className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 shadow-md"
                >
                    {processing ? 'Processando...' : 'Confirmar Venda'}
                </button>
            </div>
         </div>
      </Modal>

    </div>
  )
}

export default PDV