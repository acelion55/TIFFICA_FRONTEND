'use client';

import { Mail, Phone, MapPin, Send, Instagram, Twitter, Facebook, Clock, MessageCircle, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-white pt-20 sm:pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 sm:mb-24 text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-mega uppercase tracking-tighter mb-4 sm:mb-6 italic">
            Say <span className="text-primary italic">Hello</span>.
          </h1>
          <p className="text-base sm:text-xl text-muted max-w-xl mx-auto font-medium leading-relaxed px-4">
            Have questions about our meal plans or delivery? Our team is available 24/7 to help you eat better.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Contact Info */}
          <div className="space-y-12 sm:space-y-16">
            <div>
              <h2 className="text-xs sm:text-sm font-black text-primary uppercase tracking-[0.3em] mb-8 sm:mb-12">Contact Information</h2>
              <div className="space-y-8 sm:space-y-10">
                <div className="flex gap-4 sm:gap-8 items-start group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-[20px] sm:rounded-[28px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm flex-shrink-0">
                    <Mail size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Email Us</p>
                    <p className="text-xl sm:text-3xl font-black tracking-tight uppercase break-words">hello@tiffica.com</p>
                    <p className="text-xs sm:text-sm text-muted font-medium mt-1">We usually respond within 2 hours.</p>
                  </div>
                </div>

                <div className="flex gap-4 sm:gap-8 items-start group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-[20px] sm:rounded-[28px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm flex-shrink-0">
                    <Phone size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Call Us</p>
                    <p className="text-xl sm:text-3xl font-black tracking-tight uppercase">+91 98765 43210</p>
                    <p className="text-xs sm:text-sm text-muted font-medium mt-1">Mon - Sat, 9am to 9pm IST</p>
                  </div>
                </div>

                <div className="flex gap-4 sm:gap-8 items-start group">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 rounded-[20px] sm:rounded-[28px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm flex-shrink-0">
                    <MapPin size={24} className="sm:w-7 sm:h-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Our Base</p>
                    <p className="text-xl sm:text-3xl font-black tracking-tight uppercase">JAIPUR, INDIA</p>
                    <p className="text-xs sm:text-sm text-muted font-medium mt-1">Malviya Nagar, Sector 3, Rajasthan - 302017</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links / FAQ CTA */}
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 pt-8 sm:pt-12 border-t border-gray-100">
               <div className="p-6 sm:p-8 bg-gray-50 rounded-[32px] sm:rounded-[40px] hover:bg-primary/5 transition-colors cursor-pointer group">
                  <HelpCircle className="text-primary mb-3 sm:mb-4" size={28} />
                  <h4 className="font-black uppercase tracking-tight text-base sm:text-lg mb-2">Help Center</h4>
                  <p className="text-xs text-muted font-medium">Browse our detailed FAQs and tutorials.</p>
               </div>
               <div className="p-6 sm:p-8 bg-gray-50 rounded-[32px] sm:rounded-[40px] hover:bg-secondary/5 transition-colors cursor-pointer group">
                  <MessageCircle className="text-secondary mb-3 sm:mb-4" size={28} />
                  <h4 className="font-black uppercase tracking-tight text-base sm:text-lg mb-2">Live Chat</h4>
                  <p className="text-xs text-muted font-medium">Chat with our support ninjas instantly.</p>
               </div>
            </div>

            <div className="pt-8 sm:pt-12 border-t border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-6 sm:mb-8 italic">Follow Local Flavors</h3>
              <div className="flex gap-3 sm:gap-4">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <button key={i} className="w-14 h-14 sm:w-16 sm:h-16 rounded-pill border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                    <Icon size={20} className="sm:w-6 sm:h-6" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-8 sm:p-12 lg:p-20 rounded-[48px] sm:rounded-[80px] border-2 border-transparent hover:border-primary/20 transition-all shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tighter mb-8 sm:mb-10 uppercase italic leading-none">Drop us a<br /> <span className="text-primary italic underline decoration-secondary">line</span>.</h2>
              <form className="space-y-6 sm:space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-4">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white px-6 sm:px-8 py-4 sm:py-5 rounded-pill border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-gray-300 shadow-sm text-sm sm:text-base"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-4">Contact Number</label>
                    <input 
                      type="tel" 
                      className="w-full bg-white px-6 sm:px-8 py-4 sm:py-5 rounded-pill border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-gray-300 shadow-sm text-sm sm:text-base"
                      placeholder="+91 12345 67890"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-4">Inquiry Category</label>
                  <select className="w-full bg-white px-6 sm:px-8 py-4 sm:py-5 rounded-pill border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none shadow-sm text-sm sm:text-base">
                    <option>Subscription Questions</option>
                    <option>Corporate Catering</option>
                    <option>Chef Application</option>
                    <option>Feedback & Suggestions</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-4">Your Message</label>
                  <textarea 
                    rows={5}
                    className="w-full bg-white px-6 sm:px-8 py-6 sm:py-8 rounded-[32px] sm:rounded-[48px] border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold resize-none placeholder:text-gray-300 shadow-sm text-sm sm:text-base"
                    placeholder="How can we help your hunger?"
                  />
                </div>

                <button className="w-full bg-primary text-white py-5 sm:py-6 rounded-pill font-black text-lg sm:text-xl shadow-[0_20px_40px_-5px_rgba(255,107,0,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 sm:gap-4 group">
                  EXPLODE THE MESSAGE <Send size={20} className="sm:w-6 sm:h-6 group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                </button>
              </form>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-24 h-24 sm:w-32 sm:h-32 bg-orange-yellow rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-secondary rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-20" />
          </div>
        </div>

        {/* Local Impact Stats in Contact */}
        <div className="mt-20 sm:mt-32 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center pb-12 sm:pb-20">
           {[
             { label: 'Happy Customers', value: '10K+' },
             { label: 'Kitchen Hubs', value: '50+' },
             { label: 'Pincodes Served', value: '15' },
             { label: 'Smile Rating', value: '4.9/5' },
           ].map((stat, i) => (
             <div key={i} className="group cursor-default">
               <p className="text-3xl sm:text-5xl font-black tracking-tighter mb-2 group-hover:text-primary transition-colors">{stat.value}</p>
               <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">{stat.label}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
