'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddressSelector({ visible, onClose, onSelectAddress }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      const fetchAddresses = async () => {
        try {
          setLoading(true);
          const response = await fetch('/api/addresses');
          if (response.ok) {
            const data = await response.json();
            setAddresses(data.addresses);
          } else {
            console.error('Failed to fetch addresses');
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAddresses();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Select Delivery Address</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4 h-96 overflow-y-auto">
          {loading ? (
            <p>Loading...</p>
          ) : addresses.length > 0 ? (
            <div className="space-y-4">
              {addresses.map((address) => (
                <div 
                    key={address.id} 
                    onClick={() => onSelectAddress(address)}
                    className="flex justify-between items-center bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100">
                    <div>
                        <h4 className="font-semibold">{address.fullAddress}</h4>
                        <p className="text-sm text-gray-600">{address.street}, {address.city}</p>
                        {address.isDefault && <span className="text-xs text-green-600 font-semibold">Default</span>}
                    </div>
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 text-sm">
                        Select
                    </button>
                </div>
              ))}
            </div>
          ) : (
            <p>No addresses found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
