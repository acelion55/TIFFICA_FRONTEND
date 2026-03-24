'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocation } from '@/context/LocationContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function MenuClient() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const { locationSet } = useLocation();

  const date = searchParams.get('date');
  const mealType = searchParams.get('mealType');

  useEffect(() => {
    const storedCart = localStorage.getItem('scheduleCart');
    if (storedCart) setCart(JSON.parse(storedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('scheduleCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (!token) return;
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        // Use location-based endpoint if location is set
        const url = locationSet
          ? `${API_URL}/menu/by-location`
          : `${API_URL}/menu/mealtype/${mealType}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const all = data.items || [];
          // Filter by mealType client-side when using by-location
          setMenuItems(locationSet ? all.filter(i => i.mealType === mealType) : all);
        }
      } catch {}
      finally { setLoading(false); }
    };
    fetchMenuItems();
  }, [mealType, token, locationSet]);

  const handleAddToCart = (item) => {
    setCart(prevCart => {
        const newCart = {...prevCart};
        if (!newCart[date]) {
            newCart[date] = {};
        }
        if (!newCart[date][mealType]) {
            newCart[date][mealType] = [];
        }

        const existingItem = newCart[date][mealType].find(cartItem => cartItem.id === item.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            newCart[date][mealType].push({ ...item, quantity: 1 });
        }

        return newCart;
    });
  }

  const getCartCount = () => {
    return cart[date]?.[mealType]?.reduce((total, item) => total + item.quantity, 0) || 0;
  }

  return (
    <div className="min-h-screen bg-gray-50">
        <header className="p-4 flex justify-between items-center bg-white shadow-sm sticky top-0 z-10">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
                <h1 className="text-xl font-bold">{mealType} Menu</h1>
            </button>
            <div className="relative">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                {getCartCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{getCartCount()}</span>
                )}
            </div>
        </header>

        <main className="p-4">
          {loading ? (
            <p>Loading...</p>
          ) : menuItems.length > 0 ? (
            <div className="space-y-4">
              {menuItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div>
                        <h4 className="font-semibold text-lg">{item.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
                    </div>
                    <button 
                        onClick={() => handleAddToCart(item)}
                        className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 text-sm">
                        Add
                    </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">No items available for this meal type.</p>
          )}
        </main>

        {getCartCount() > 0 && (
            <footer className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-t-lg border-t">
                <button 
                    onClick={() => router.push('/schedule')}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 flex justify-center items-center gap-2">
                    <span>View Schedule ({getCartCount()} items)</span>
                </button>
            </footer>
        )}
    </div>
  );
}
