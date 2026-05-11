import React, { useState, useEffect } from 'react';
import { collection, doc, getDoc, setDoc, onSnapshot, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ShieldAlert, CheckCircle2, Clock, Trash2 } from 'lucide-react';

interface OrderItem {
  name: string;
  size: string;
  ice: string;
  sweetness: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: number;
}

export default function Admin() {
  const [isAdminSetup, setIsAdminSetup] = useState<boolean | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);

  // Check if admin is setup
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const docRef = doc(db, 'settings', 'admin');
        const docSnap = await getDoc(docRef);
        setIsAdminSetup(docSnap.exists());
        
        // Auto login if we have password in sessionStorage
        const savedPass = sessionStorage.getItem('adminPass');
        if (savedPass && docSnap.exists() && docSnap.data().password === savedPass) {
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("Failed to check admin setup", err);
      }
    };
    checkSetup();
  }, []);

  // Fetch orders if logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
    });

    return () => unsubscribe();
  }, [isLoggedIn]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim() || passwordInput.length < 4) {
      setErrorMsg('密碼不能小於 4 個字元');
      return;
    }

    try {
      await setDoc(doc(db, 'settings', 'admin'), {
        password: passwordInput
      });
      sessionStorage.setItem('adminPass', passwordInput);
      setIsAdminSetup(true);
      setIsLoggedIn(true);
      setErrorMsg('');
    } catch (err) {
      console.error(err);
      setErrorMsg('設定失敗');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;

    try {
      const docRef = doc(db, 'settings', 'admin');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().password === passwordInput) {
        sessionStorage.setItem('adminPass', passwordInput);
        setIsLoggedIn(true);
        setErrorMsg('');
      } else {
        setErrorMsg('密碼錯誤');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('登入失敗');
    }
  };

  const updateOrderStatus = async (id: string, status: 'completed' | 'cancelled') => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch (error) {
      console.error('Failed to update status', error);
      alert('更新失敗');
    }
  };

  const logout = () => {
    sessionStorage.removeItem('adminPass');
    setIsLoggedIn(false);
    setPasswordInput('');
  };

  if (isAdminSetup === null) return <div className="text-center p-10">載入中...</div>;

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-amber-50 rounded-full text-amber-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
          {isAdminSetup ? '後台登入' : '第一次進入 - 設定密碼'}
        </h1>
        <p className="text-center text-gray-500 mb-8">
          {isAdminSetup ? '請輸入您的管理者密碼以繼續' : '請設定您的後台管理者密碼'}
        </p>
        
        <form onSubmit={isAdminSetup ? handleLogin : handleSetup}>
          <div className="mb-4">
            <input
              type="password"
              placeholder="密碼"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all outline-none"
            />
          </div>
          {errorMsg && <p className="text-red-500 text-sm mb-4 text-center">{errorMsg}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
          >
            {isAdminSetup ? '登入' : '確認設定'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">後台訂單管理</h1>
        <button onClick={logout} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
          登出
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 mt-4">
          <p className="text-gray-500">目前沒有訂單</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-xl font-bold text-gray-900">{order.customerName}</h3>
                  <span className="text-sm text-gray-400">
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {order.status === 'pending' && <span className="flex items-center gap-1 text-sm font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><Clock className="w-4 h-4"/> 待處理</span>}
                  {order.status === 'completed' && <span className="flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full"><CheckCircle2 className="w-4 h-4"/> 已完成</span>}
                  {order.status === 'cancelled' && <span className="flex items-center gap-1 text-sm font-medium text-gray-600 bg-gray-50 px-2.5 py-1 rounded-full"><Trash2 className="w-4 h-4"/> 已取消</span>}
                </div>
                
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <div className="font-bold flex items-center gap-2">
                          {item.name} 
                          <span className="text-sm font-normal text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">x{item.quantity}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {item.size === 'M' ? '中' : item.size === 'L' ? '大' : '瓶'} · {item.ice} · {item.sweetness}
                        </div>
                      </div>
                      <div className="font-medium text-gray-900 border-l border-gray-200 pl-4">
                        ${item.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col justify-between shrink-0 md:w-48 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 text-right">
                <div>
                  <p className="text-sm text-gray-500 mb-1">總金額</p>
                  <p className="text-3xl font-bold text-amber-700">${order.total}</p>
                </div>
                
                {order.status === 'pending' && (
                  <div className="flex gap-2 mt-6">
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      className="flex-1 px-3 py-2 border border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      取消
                    </button>
                    <button 
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors"
                    >
                      完成
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
