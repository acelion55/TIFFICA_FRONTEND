'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Clock, Shield, Star } from 'lucide-react';

export default function LandingPage() {
  const { token, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && token) {
      if (user?.role === 'admin' || user?.role === 'kitchen-owner') {
        router.push('/admin');
      } else {
        router.push('/home');
      }
    }
  }, [loading, token, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-orange-50 to-transparent opacity-60" />
        <div className="relative max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-3xl">🍱</span>
              </div>
              <h1 className="text-5xl font-black text-gray-900">Tiffica</h1>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              Best Tiffin Service in Jaipur
            </h2>
            
            <p className="text-xl text-gray-600 mb-4 max-w-3xl mx-auto">
              Order the <strong>best affordable tiffin in Jaipur</strong> - Fresh, homemade meals delivered daily to your doorstep
            </p>
            
            <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">
              Healthy, hygienic, and delicious home-cooked food. Perfect for students, working professionals, and families in Jaipur.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/signup" className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg flex items-center gap-2 transition">
                Order Best Tiffin Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/login" className="px-8 py-4 bg-white border-2 border-gray-200 hover:border-orange-500 text-gray-900 font-bold rounded-2xl transition">
                Login
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Tiffica for Tiffin Service in Jaipur?
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: CheckCircle, title: 'Fresh & Hygienic', desc: 'Daily fresh home-cooked meals prepared with quality ingredients' },
              { icon: Clock, title: 'On-Time Delivery', desc: 'Timely delivery across all areas of Jaipur' },
              { icon: Shield, title: 'Affordable Pricing', desc: 'Best affordable tiffin service starting from ₹79' },
              { icon: Star, title: 'Variety of Meals', desc: 'Breakfast, lunch, dinner with multiple menu options' },
            ].map((feature, i) => (
              <div key={i} className="bg-orange-50 rounded-2xl p-6 text-center">
                <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose prose-lg max-w-none">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Order Best Tiffin in Jaipur - Tiffica
            </h3>
            <p className="text-gray-700 mb-4">
              Looking for the <strong>best tiffin service in Jaipur</strong>? Tiffica brings you fresh, homemade meals delivered right to your doorstep. 
              We understand the importance of healthy, home-cooked food, especially for students and working professionals who miss home food.
            </p>
            
            <h4 className="text-xl font-bold text-gray-900 mb-3 mt-6">
              Best Affordable Tiffin in Jaipur
            </h4>
            <p className="text-gray-700 mb-4">
              Our tiffin service offers the most affordable meal plans in Jaipur without compromising on quality. Starting from just ₹79, 
              you can enjoy nutritious breakfast, lunch, and dinner options. We serve all major areas of Jaipur including Malviya Nagar, 
              Vaishali Nagar, Mansarovar, C-Scheme, and more.
            </p>

            <h4 className="text-xl font-bold text-gray-900 mb-3 mt-6">
              Why Tiffica is the Best Tiffin Service in Jaipur
            </h4>
            <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
              <li>Fresh meals prepared daily with quality ingredients</li>
              <li>Hygienic kitchen and packaging standards</li>
              <li>Customizable meal plans for breakfast, lunch, and dinner</li>
              <li>On-time delivery across Jaipur</li>
              <li>Affordable pricing with no hidden charges</li>
              <li>Easy online ordering and payment</li>
              <li>Flexible subscription plans</li>
            </ul>

            <div className="bg-orange-100 border-l-4 border-orange-500 p-4 my-6">
              <p className="text-gray-800 font-semibold">
                🍱 Order the best tiffin in Jaipur today and enjoy delicious home-cooked meals delivered to your door!
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Order Best Tiffin in Jaipur?
          </h3>
          <p className="text-orange-100 mb-8 text-lg">
            Join thousands of happy customers enjoying fresh, affordable tiffin service in Jaipur
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition">
            Get Started Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-sm">
            © 2024 Tiffica - Best Tiffin Service in Jaipur. All rights reserved.
          </p>
          <p className="text-gray-500 text-xs mt-2">
            Keywords: best tiffin service in jaipur, best affordable tiffin in jaipur, order best tiffin in jaipur, 
            tiffin delivery jaipur, home cooked meals jaipur
          </p>
        </div>
      </footer>
    </div>
  );
}
