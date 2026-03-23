'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function MealItemsSelector({ visible, onClose, mealType, date, onAddToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      const fetchMenuItems = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/menu-items');
          if (response.ok) {
            const data = await response.json();
            setMenuItems(data.items.filter(item => item.category === mealType));
          } else {
            console.error('Failed to fetch menu items');
          }
        } catch (error) {
          console.error('Error fetching menu items:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchMenuItems();
    }
  }, [visible, mealType]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Add to {mealType} on {date}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 h-96 overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : menuItems.length > 0 ? (
            <div className="space-y-4">
              {menuItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                        <h4 className="font-semibold">{item.name}</h4>
                        <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
                    </div>
                    <button 
                        onClick={() => onAddToCart(item)}
                        className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 text-sm">
                        Add
                    </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No items available for this meal type.</p>
          )}
        </div>
      </div>
    </div>
  );
}
