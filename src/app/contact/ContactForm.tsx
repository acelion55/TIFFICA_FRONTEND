'use client';

import { Send } from 'lucide-react';

export default function ContactForm() {
  return (
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
  );
}
