'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, X, Star, CheckCircle, Calendar, Shield } from 'lucide-react';

const DEFAULT_PLANS = [
  { id: 1, name: "Daily Delight", mealsPerDay: 14, mealTimes: ["lunch"], pricePerDay: 1400, savings: "10%", description: "Perfect for lunch lovers", popular: false },
  { id: 2, name: "Power Combo", mealsPerDay: 40, mealTimes: ["lunch", "dinner"], pricePerDay: 3000, savings: "15%", description: "Lunch & Dinner covered", popular: false },
  { id: 3, name: "Full Day Feast", mealsPerDay: 60, mealTimes: ["breakfast", "lunch", "dinner"], pricePerDay: 5500, savings: "20%", description: "All meals, all day", popular: true },
];

export default function SubscriptionScreen() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await fetch('/api/subscriptions/plans');
        if (response.ok) {
          const data = await response.json();
          setPlans(data.plans);
        } else {
          setPlans(DEFAULT_PLANS);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        setPlans(DEFAULT_PLANS);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  const handlePayment = (plan) => {
    // In a real app, you would make an API call to your backend to create a payment link.
    // For this example, we'll use a placeholder URL.
    setPaymentUrl('https://www.example.com/payment');
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="animate-spin text-orange-500" size={48} />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Subscription Plans</h1>
          <p className="text-lg text-gray-600 mt-4">Choose the perfect plan to fit your lifestyle and budget.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ${plan.popular ? 'border-4 border-orange-500' : ''}`}>
              {plan.popular && (
                <div className="bg-orange-500 text-white text-sm font-bold text-center py-2 relative">
                  <Star className="inline-block w-4 h-4 mr-2" />
                  MOST POPULAR
                </div>
              )}
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h2>
                <p className="text-gray-500 mb-6">{plan.description}</p>
                
                <div className="text-4xl font-extrabold text-gray-900 mb-4">
                  ₹{plan.pricePerDay}<span className="text-lg font-medium text-gray-500">/day</span>
                </div>

                <ul className="text-gray-600 space-y-4 mb-8">
                    <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        {plan.mealsPerDay} meals delivered daily
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Savings of {plan.savings}
                    </li>
                    <li className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        Includes: {plan.mealTimes.join(', ')}
                    </li>
                </ul>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePayment(plan)}
                  className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${plan.popular ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}>
                  Choose Plan
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-12 bg-white p-8 rounded-2xl shadow-lg">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Guarantee</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                    <Calendar className="w-10 h-10 text-orange-500 mb-2"/>
                    <p className="text-gray-600">Cancel or pause anytime</p>
                </div>
                <div className="flex flex-col items-center">
                    <Shield className="w-10 h-10 text-orange-500 mb-2"/>
                    <p className="text-gray-600">Secure online payments</p>
                </div>
                <div className="flex flex-col items-center">
                    <CheckCircle className="w-10 h-10 text-orange-500 mb-2"/>
                    <p className="text-gray-600">Fresh and delicious meals</p>
                </div>
            </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg shadow-2xl w-full max-w-lg mx-4">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Complete Your Payment</h2>
              <button onClick={() => setShowPaymentModal(false)} className="p-2 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <iframe
                src={paymentUrl}
                className="w-full h-96 border-none"
                title="Payment Gateway"
              ></iframe>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
