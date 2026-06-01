'use client';

import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';

const API_URL = 'https://tifficaapp-1.onrender.com/api';

export default function ContactLeadsForm() {
  const [isClient, setIsClient] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    email: '',
    address: '',
    city: '',
    mealType: 'Lunch',
    customerType: 'Student'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setFormData({
          name: '',
          number: '',
          email: '',
          address: '',
          city: '',
          mealType: 'Lunch',
          customerType: 'Student'
        });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.error || data.message || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit form. Please check your connection and try again.');
      console.error('Form submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-orange-50 to-white p-4 sm:p-8 lg:p-12 rounded-3xl sm:rounded-[48px] border border-primary/10 shadow-lg">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tighter mb-2 text-center italic">
          Join Our <span className="text-primary">Community</span>
        </h2>
        <p className="text-center text-gray-600 text-sm mb-8 font-medium">
          Tell us about your meal preferences
        </p>

        {!isClient ? (
          <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
        ) : (
          <>
            {success && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-300 rounded-xl text-green-700 text-sm font-bold text-center">
                ✅ Thank you! We'll contact you soon.
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-red-700 text-sm font-bold text-center">
                ❌ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Name & Number */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                    className="w-full bg-white px-4 py-3 rounded-lg border-2 border-gray-300 outline-none focus:border-primary transition-colors duration-300 font-medium text-sm pt-6"
                  />
                  <label
                    className={`absolute left-4 bg-white px-1 pointer-events-none transition-all duration-300 ease-out ${
                      focusedField === 'name' || formData.name.length > 0
                        ? 'top-0 text-primary text-[10px] font-bold uppercase tracking-wider'
                        : 'top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium'
                    }`}
                  >
                    Name
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('number')}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                    className="w-full bg-white px-4 py-3 rounded-lg border-2 border-gray-300 outline-none focus:border-primary transition-colors duration-300 font-medium text-sm pt-6"
                  />
                  <label
                    className={`absolute left-4 bg-white px-1 pointer-events-none transition-all duration-300 ease-out ${
                      focusedField === 'number' || formData.number.length > 0
                        ? 'top-0 text-primary text-[10px] font-bold uppercase tracking-wider'
                        : 'top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium'
                    }`}
                  >
                    Number
                  </label>
                </div>
              </div>

              {/* Row 2: Email & City */}
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                    className="w-full bg-white px-4 py-3 rounded-lg border-2 border-gray-300 outline-none focus:border-primary transition-colors duration-300 font-medium text-sm pt-6"
                  />
                  <label
                    className={`absolute left-4 bg-white px-1 pointer-events-none transition-all duration-300 ease-out ${
                      focusedField === 'email' || formData.email.length > 0
                        ? 'top-0 text-primary text-[10px] font-bold uppercase tracking-wider'
                        : 'top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium'
                    }`}
                  >
                    Email
                  </label>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('city')}
                    onBlur={() => setFocusedField(null)}
                    placeholder=" "
                    className="w-full bg-white px-4 py-3 rounded-lg border-2 border-gray-300 outline-none focus:border-primary transition-colors duration-300 font-medium text-sm pt-6"
                  />
                  <label
                    className={`absolute left-4 bg-white px-1 pointer-events-none transition-all duration-300 ease-out ${
                      focusedField === 'city' || formData.city.length > 0
                        ? 'top-0 text-primary text-[10px] font-bold uppercase tracking-wider'
                        : 'top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium'
                    }`}
                  >
                    City
                  </label>
                </div>
              </div>

              {/* Row 3: Address (Full Width) */}
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('address')}
                  onBlur={() => setFocusedField(null)}
                  placeholder=" "
                  className="w-full bg-white px-4 py-3 rounded-lg border-2 border-gray-300 outline-none focus:border-primary transition-colors duration-300 font-medium text-sm pt-6"
                />
                <label
                  className={`absolute left-4 bg-white px-1 pointer-events-none transition-all duration-300 ease-out ${
                    focusedField === 'address' || formData.address.length > 0
                      ? 'top-0 text-primary text-[10px] font-bold uppercase tracking-wider'
                      : 'top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium'
                  }`}
                >
                  Address
                </label>
              </div>

              {/* Row 4: Meal Type Options (3 in a row) */}
              <div className="grid grid-cols-3 gap-3">
                {['Lunch', 'Dinner', 'Both'].map((meal) => (
                  <label key={meal} className="relative cursor-pointer group">
                    <input
                      type="radio"
                      name="mealType"
                      value={meal}
                      checked={formData.mealType === meal}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`text-center py-3 px-2 rounded-lg font-bold text-sm transition-all border-2 
                      ${formData.mealType === meal 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                      }`}>
                      {meal}
                    </div>
                  </label>
                ))}
              </div>

              {/* Row 5: Customer Type Dropdown */}
              <div className="relative">
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('customerType')}
                  onBlur={() => setFocusedField(null)}
                  className="w-full bg-white px-4 py-3 rounded-lg border-2 border-gray-300 outline-none focus:border-primary transition-all font-medium text-sm appearance-none pr-10 pt-6"
                >
                  <option value="Student">Student</option>
                  <option value="Corporate">Corporate</option>
                  <option value="Employee">Employee</option>
                  <option value="Employee">Hostel</option>
                  <option value="Employee">Bachelor</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
                <label className={`absolute left-4 bg-white px-1 pointer-events-none transition-all duration-300 ease-out ${
                  focusedField === 'customerType' || formData.customerType ? 'top-0 text-primary text-[10px] font-bold uppercase tracking-wider' : 'top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium'
                }`}>
                  Type
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl font-black text-base shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {loading ? 'SUBMITTING...' : 'SUBMIT INTEREST'}
                <Send size={18} className={loading ? '' : 'group-hover:translate-x-1 transition-transform'} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

