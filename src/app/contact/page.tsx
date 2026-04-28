'use client';

import { Mail, Phone, MapPin, Send, Instagram, Twitter, Facebook, Clock, MessageCircle, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-24 text-center">
          <h1 className="text-mega uppercase tracking-tighter mb-6 italic">
            Say <span className="text-primary italic">Hello</span>.
          </h1>
          <p className="text-xl text-muted max-w-xl mx-auto font-medium leading-relaxed">
            Have questions about our meal plans or delivery? Our team is available 24/7 to help you eat better.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-20 items-start">
          {/* Contact Info */}
          <div className="space-y-16">
            <div>
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-12">Contact Information</h2>
              <div className="space-y-10">
                <div className="flex gap-8 items-start group">
                  <div className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Mail size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Email Us</p>
                    <p className="text-3xl font-black tracking-tight uppercase">hello@tiffica.com</p>
                    <p className="text-sm text-muted font-medium mt-1">We usually respond within 2 hours.</p>
                  </div>
                </div>

                <div className="flex gap-8 items-start group">
                  <div className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <Phone size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Call Us</p>
                    <p className="text-3xl font-black tracking-tight uppercase">+91 98765 43210</p>
                    <p className="text-sm text-muted font-medium mt-1">Mon - Sat, 9am to 9pm IST</p>
                  </div>
                </div>

                <div className="flex gap-8 items-start group">
                  <div className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                    <MapPin size={28} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-2">Our Base</p>
                    <p className="text-3xl font-black tracking-tight uppercase">JAIPUR, INDIA</p>
                    <p className="text-sm text-muted font-medium mt-1">Malviya Nagar, Sector 3, Rajasthan - 302017</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links / FAQ CTA */}
            <div className="grid sm:grid-cols-2 gap-6 pt-12 border-t border-gray-100">
               <div className="p-8 bg-gray-50 rounded-[40px] hover:bg-primary/5 transition-colors cursor-pointer group">
                  <HelpCircle className="text-primary mb-4" size={32} />
                  <h4 className="font-black uppercase tracking-tight text-lg mb-2">Help Center</h4>
                  <p className="text-xs text-muted font-medium">Browse our detailed FAQs and tutorials.</p>
               </div>
               <div className="p-8 bg-gray-50 rounded-[40px] hover:bg-secondary/5 transition-colors cursor-pointer group">
                  <MessageCircle className="text-secondary mb-4" size={32} />
                  <h4 className="font-black uppercase tracking-tight text-lg mb-2">Live Chat</h4>
                  <p className="text-xs text-muted font-medium">Chat with our support ninjas instantly.</p>
               </div>
            </div>

            <div className="pt-12 border-t border-gray-100">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted mb-8 italic">Follow Local Flavors</h3>
              <div className="flex gap-4">
                {[Instagram, Twitter, Facebook].map((Icon, i) => (
                  <button key={i} className="w-16 h-16 rounded-pill border border-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-sm">
                    <Icon size={24} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 p-12 sm:p-20 rounded-[80px] border-2 border-transparent hover:border-primary/20 transition-all shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-4xl font-black tracking-tighter mb-10 uppercase italic leading-none">Drop us a<br /> <span className="text-primary italic underline decoration-secondary">line</span>.</h2>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-4">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white px-8 py-5 rounded-pill border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-gray-300 shadow-sm"
                      placeholder="e.g. Rahul Sharma"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-4">Contact Number</label>
                    <input 
                      type="tel" 
                      className="w-full bg-white px-8 py-5 rounded-pill border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold placeholder:text-gray-300 shadow-sm"
                      placeholder="+91 12345 67890"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted block ml-4">Inquiry Category</label>
                  <select className="w-full bg-white px-8 py-5 rounded-pill border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold appearance-none shadow-sm">
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
                    className="w-full bg-white px-8 py-8 rounded-[48px] border-none outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold resize-none placeholder:text-gray-300 shadow-sm"
                    placeholder="How can we help your hunger?"
                  />
                </div>

                <button className="w-full bg-primary text-white py-6 rounded-pill font-black text-xl shadow-[0_20px_40px_-5px_rgba(255,107,0,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group">
                  EXPLODE THE MESSAGE <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform" />
                </button>
              </form>
            </div>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-yellow rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl opacity-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-secondary rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl opacity-20" />
          </div>
        </div>

        {/* Local Impact Stats in Contact */}
        <div className="mt-32 grid md:grid-cols-4 gap-12 text-center pb-20">
           {[
             { label: 'Happy Customers', value: '10K+' },
             { label: 'Kitchen Hubs', value: '50+' },
             { label: 'Pincodes Served', value: '15' },
             { label: 'Smile Rating', value: '4.9/5' },
           ].map((stat, i) => (
             <div key={i} className="group cursor-default">
               <p className="text-5xl font-black tracking-tighter mb-2 group-hover:text-primary transition-colors">{stat.value}</p>
               <p className="text-[10px] font-black text-muted uppercase tracking-[0.3em]">{stat.label}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
