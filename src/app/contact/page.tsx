import { Metadata } from 'next';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, HelpCircle, MessageCircle } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: "Contact Tiffica - Tiffin Service Support in Jaipur & Ajmer",
  description: "Get in touch with Tiffica for the best tiffin service inquiries in Jaipur, Ajmer, and Beawar. Contact us for subscription plans, corporate catering, or feedback.",
  keywords: "contact tiffica, tiffin service number jaipur, tiffin support ajmer, order tiffin beawar, pink city tiffin contact",
};

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
          <ContactForm />
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
