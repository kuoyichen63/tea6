import React, { useState, useMemo } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { MENU, Drink, ICE_LEVELS, SWEETNESS_LEVELS } from '../data/menu';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';

interface CartItem {
  drink: Drink;
  size: 'M' | 'L' | 'B';
  ice: string;
  sweetness: string;
  quantity: number;
  price: number;
}

export default function Frontend() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Modal State
  const [size, setSize] = useState<'M' | 'L' | 'B'>('M');
  const [ice, setIce] = useState('正常冰');
  const [sweetness, setSweetness] = useState('正常糖');
  const [quantity, setQuantity] = useState(1);

  const openModal = (drink: Drink) => {
    setSelectedDrink(drink);
    setSize(drink.prices.M ? 'M' : drink.prices.L ? 'L' : 'B');
    setIce('正常冰');
    setSweetness('正常糖');
    setQuantity(1);
  };

  const closeModal = () => setSelectedDrink(null);

  const addToCart = () => {
    if (!selectedDrink) return;
    const price = selectedDrink.prices[size] || 0;
    setCart([...cart, { drink: selectedDrink, size, ice, sweetness, quantity, price }]);
    closeModal();
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const total = useMemo(() => cart.reduce((acc, item) => acc + item.price * item.quantity, 0), [cart]);

  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || cart.length === 0) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'orders'), {
        customerName,
        items: cart.map(item => ({
          name: item.drink.name,
          size: item.size,
          ice: item.ice,
          sweetness: item.drink.fixedSweetness ? '固定甜度' : item.sweetness,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        status: 'pending',
        createdAt: Date.now()
      });
      setCart([]);
      setCustomerName('');
      setOrderComplete(true);
      setTimeout(() => setOrderComplete(false), 3000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('訂購失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Menu Section */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">飲品選單</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MENU.map(drink => (
            <div key={drink.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col hover:shadow-md transition-shadow cursor-pointer" onClick={() => openModal(drink)}>
              <div className="mb-2">
                <span className="text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded-full">{drink.category}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{drink.name}</h3>
              {drink.details && <p className="text-sm text-gray-500 mt-1">{drink.details}</p>}
              <div className="mt-4 flex gap-2 text-sm text-gray-600 font-medium">
                {drink.prices.M && <span>中 ${drink.prices.M}</span>}
                {drink.prices.L && <span>大 ${drink.prices.L}</span>}
                {drink.prices.B && <span>瓶 ${drink.prices.B}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-md border border-gray-100 p-6 h-fit shrink-0">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-gray-700" />
          <span>購物車</span>
        </h2>
        
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-8">購物車是空的</p>
        ) : (
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-start border-b pb-3 border-gray-50">
                <div>
                  <div className="font-bold text-gray-800">{item.drink.name} <span className="text-sm font-normal text-gray-500">x{item.quantity}</span></div>
                  <div className="text-sm text-gray-500">
                    {item.size === 'M' ? '中' : item.size === 'L' ? '大' : '瓶'} 
                    · {item.ice} 
                    · {item.drink.fixedSweetness ? '固定甜度' : item.sweetness}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-medium">${item.price * item.quantity}</span>
                  <button onClick={() => removeFromCart(index)} className="text-red-400 hover:text-red-500 text-sm">移除</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <form onSubmit={submitOrder} className="pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center font-bold text-lg mb-4">
              <span>總計</span>
              <span className="text-amber-700">${total}</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">取餐人姓名/暱稱</label>
              <input
                required
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                placeholder="請輸入姓名"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${isSubmitting ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
            >
              {isSubmitting ? '送出中...' : '送出訂單'}
            </button>
          </form>
        )}

        {orderComplete && (
          <div className="mt-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg text-center font-medium">
            訂單已成功送出！
          </div>
        )}
      </div>

      {/* Customize Modal */}
      {selectedDrink && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative">
            <button onClick={closeModal} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{selectedDrink.name}</h3>
            {selectedDrink.details && <p className="text-gray-500 text-sm mb-4">{selectedDrink.details}</p>}

            <div className="space-y-5 my-6">
              {/* Size */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">容量</label>
                <div className="flex gap-2">
                  {(['M', 'L', 'B'] as const).map(s => {
                    const price = selectedDrink.prices[s];
                    if (!price) return null;
                    return (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className={`flex-1 py-2 px-3 border rounded-lg text-sm font-medium transition-all ${
                          size === s ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {s === 'M' ? '中杯' : s === 'L' ? '大杯' : '瓶裝'} (${price})
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Ice */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">冰塊</label>
                <div className="flex flex-wrap gap-2">
                  {ICE_LEVELS.map(level => (
                    <button
                      key={level}
                      onClick={() => setIce(level)}
                      className={`py-1.5 px-3 border rounded-md text-sm transition-all ${
                        ice === level ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sweetness */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">甜度</label>
                {selectedDrink.fixedSweetness ? (
                  <div className="py-2 px-3 bg-gray-100 rounded-md text-sm text-gray-500 border border-gray-200">
                    此飲品甜度固定
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {SWEETNESS_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setSweetness(level)}
                        className={`py-1.5 px-3 border rounded-md text-sm transition-all ${
                          sweetness === level ? 'border-pink-500 bg-pink-50 text-pink-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">數量</label>
                <div className="flex items-center gap-4">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={addToCart}
              className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-md"
            >
              加入購物車 - ${(selectedDrink.prices[size] || 0) * quantity}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
