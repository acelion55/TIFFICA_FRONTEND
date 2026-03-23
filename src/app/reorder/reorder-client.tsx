'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop';

const OrderCard = ({ order }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleReorder = (items) => {
    // In a real app, this would dispatch an action to add items to the cart
    console.log('Reordering items:', items);
    alert(`Reordering ${items.length} item(s)! Check the console for details.`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg">
        <div className="p-4">
            <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                    <img 
                        src={order.restaurant.image || FALLBACK_IMAGE} 
                        alt={order.restaurant.name} 
                        className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div>
                        <p className="text-lg font-bold text-gray-800">{order.restaurant.name}</p>
                        <p className="text-sm text-gray-500">{format(new Date(order.date), 'MMMM d, yyyy')}</p>
                        <p className="text-sm font-semibold text-gray-700 mt-1">Total: ₹{order.totalAmount.toFixed(2)}</p>
                    </div>
                </div>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 text-gray-500 hover:text-orange-500">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>
            </div>

            {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-md text-gray-700 mb-2">Order Details</h4>
                    <div className="space-y-2">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                                <p className="text-gray-600">{item.name} x {item.quantity}</p>
                                <p className="font-medium text-gray-700">₹{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-4 flex justify-end">
                <button 
                    onClick={() => handleReorder(order.items)}
                    className="flex items-center justify-center gap-2 bg-orange-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-orange-600 transition-transform transform hover:scale-105">
                    <RefreshCw size={16} />
                    <span>Reorder</span>
                </button>
            </div>
        </div>
    </div>
  )
}

const ReorderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4">
                <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-200"></div>
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-3/5 bg-gray-200 rounded"></div>
                        <div className="h-4 w-2/5 bg-gray-200 rounded"></div>
                        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="mt-4 flex justify-end">
                    <div className="h-10 w-28 bg-gray-200 rounded-lg"></div>
                </div>
            </div>
        ))}
    </div>
);

export default function ReorderClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/past-orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
        } else {
          console.error('Failed to fetch past orders');
        }
      } catch (error) {
        console.error('Error fetching past orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">Reorder</h1>
            <button className="relative p-2 text-gray-600 hover:text-orange-500">
                <ShoppingCart size={24} />
                {/* Optional: Add a badge for cart items */}
                {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-orange-500 ring-2 ring-white"></span> */}
            </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700">Your Past Orders</h2>
            <p className="text-sm text-gray-500">Quickly reorder items from your previous purchases.</p>
        </div>

        {loading ? (
          <ReorderSkeleton />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                <ShoppingCart size={48} className="mx-auto text-gray-300" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Past Orders</h3>
                <p className="mt-2 text-sm text-gray-500">You haven't placed any orders yet. Let's change that!</p>
                {/* Optional: Add a button to navigate to the main menu */}
            </div>
        )}
      </main>
    </div>
  );
}
