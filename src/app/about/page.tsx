import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "About Tiffica - Best Tiffin Service with Home Chefs in Jaipur & Ajmer",
  description: "Learn about Tiffica's mission to provide healthy, home-cooked food in Jaipur, Ajmer, and Beawar. Our certified home chefs prepare fresh meals for students and professionals.",
  keywords: "about tiffica, home chefs jaipur, healthy tiffin service, tiffin story, homemade food ajmer, tiffin delivery beawar",
};

import Link from 'next/link';
import { ArrowRight, Heart, Users, ShieldCheck, Zap, Leaf, Coffee, Globe, Smile } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-32 text-center">
          <h1 className="text-mega uppercase tracking-tighter mb-8 italic">
            Mission <span className="text-primary italic">Nutritious</span>.
          </h1>
          <p className="text-2xl text-muted max-w-2xl mx-auto font-medium leading-relaxed">
            We started Tiffica with a simple dream: to ensure that every student and professional in Jaipur gets access to a meal that tastes like it came from their own home.
          </p>
        </div>

        {/* Story Section */}
        <div className="grid lg:grid-cols-2 gap-20 items-center mb-40">
          <div className="rounded-[64px] overflow-hidden shadow-2xl relative group">
            <img 
              src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=1000&auto=format&fit=crop" 
              alt="Kitchen Story" 
              className="w-full aspect-[4/5] object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-10 left-10 right-10">
              <p className="text-white text-3xl font-black italic uppercase leading-none mb-2">The Jaipur Roots.</p>
              <p className="text-white/80 font-bold uppercase tracking-widest text-[10px]">ESTABLISHED 2024</p>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-6">Our Journey</h2>
            <h3 className="text-6xl font-black tracking-tighter mb-8 uppercase leading-[0.9]">
              IT ALL STARTED IN A <span className="text-primary underline decoration-secondary underline-offset-8">SMALL KITCHEN</span>.
            </h3>
            <div className="space-y-6 text-xl text-muted font-medium leading-loose">
              <p>
                Founded in the heart of Jaipur, Tiffica was born out of the frustration of missing home-cooked food while working late nights. We realized thousands of students in Malviya Nagar and professionals in Sitapura felt the same way.
              </p>
              <p>
                Today, we have partnered with dozens of traditional home-chefs across the city, providing them a platform while serving you health and hygiene in every tiffin.
              </p>
              <p className="border-l-4 border-primary pl-8 italic">
                "Our goal isn't just to fill stomachs, but to nourish souls with the familiar comfort of a mother's recipes."
              </p>
            </div>
          </div>
        </div>

        {/* Our Process - Vertical Timeline inspired */}
        <div className="mb-40">
          <div className="text-center mb-24">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">Behind the Scenes</h2>
            <h3 className="text-6xl font-black tracking-tighter uppercase">THE TIFFICA <span className="text-primary italic">STANDARD</span>.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { icon: Leaf, title: 'SOURCING', desc: 'We only use seasonal, local produce from Jaipur’s organic markets. No frozen vegetables, no artificial preservatives.' },
              { icon: Coffee, title: 'PREPARATION', desc: 'Meals are cooked in small batches to maintain that authentic "home" taste. Our chefs follow family recipes passed down generations.' },
              { icon: ShieldCheck, title: 'QUALITY CHECK', desc: 'Every tiffin undergoes a 5-point hygiene check before it leaves the kitchen. We monitor temperature and packaging integrity.' }
            ].map((p, i) => (
              <div key={i} className="group">
                <div className="w-24 h-24 bg-gray-50 rounded-[32px] flex items-center justify-center mx-auto mb-10 group-hover:bg-primary group-hover:text-white transition-all group-hover:-translate-y-2">
                  <p.icon size={40} />
                </div>
                <h4 className="text-3xl font-black mb-6 uppercase tracking-tight">{p.title}</h4>
                <p className="text-muted text-lg font-medium leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values - Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-40">
          {[
            { icon: Heart, title: 'PURE LOVE', desc: 'Love is our secret ingredient. Every meal is cooked with care.' },
            { icon: Users, title: 'COMMUNITY', desc: 'Empowering local home-chefs and supporting Jaipur locals.' },
            { icon: ShieldCheck, title: 'MAX HYGIENE', desc: 'Uncompromising standards of cleanliness and food safety.' },
            { icon: Zap, title: 'TECH DRIVEN', desc: 'Real-time tracking and seamless ordering experience.' },
          ].map((v, i) => (
            <div key={i} className="bg-gray-50 p-12 rounded-[48px] text-center hover:bg-black hover:text-white transition-all group border border-transparent hover:border-white/10">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:bg-primary transition-colors">
                <v.icon className="group-hover:text-white transition-colors" />
              </div>
              <h4 className="font-black mb-4 uppercase tracking-tight">{v.title}</h4>
              <p className="text-sm font-medium leading-relaxed opacity-70">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Impact & Social Responsibility */}
        <div className="bg-primary/5 rounded-[80px] p-20 mb-40 flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">More than food</h2>
            <h3 className="text-5xl font-black tracking-tighter uppercase mb-8">FEEDING JAIPUR'S <span className="italic">FUTURE</span>.</h3>
            <p className="text-xl text-muted font-medium leading-relaxed mb-8">
              For every 10 tiffins sold, we donate a fresh meal to underprivileged children in shelter homes across Jaipur. We believe that no one should sleep hungry in our beautiful Pink City.
            </p>
            <div className="flex gap-12 justify-center lg:justify-start">
              <div>
                <p className="text-4xl font-black text-primary">5000+</p>
                <p className="text-xs font-black uppercase tracking-widest mt-1">Meals Donated</p>
              </div>
              <div>
                <p className="text-4xl font-black text-primary">20+</p>
                <p className="text-xs font-black uppercase tracking-widest mt-1">NGO Partners</p>
              </div>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
             <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop" className="rounded-[40px] aspect-square object-cover" />
                <img src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?q=80&w=600&auto=format&fit=crop" className="rounded-[40px] aspect-video object-cover" />
             </div>
             <div className="space-y-4 pt-12">
                <img src="https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600&auto=format&fit=crop" className="rounded-[40px] aspect-video object-cover" />
                <img src="https://images.unsplash.com/photo-1524062770542-a169dc17855b?q=80&w=600&auto=format&fit=crop" className="rounded-[40px] aspect-square object-cover" />
             </div>
          </div>
        </div>

        {/* Team Members Mockup */}
        <div className="mb-40">
           <div className="text-center mb-24">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">The Visionaries</h2>
              <h3 className="text-6xl font-black tracking-tighter uppercase">MEET THE <span className="text-primary italic">LEADERS</span>.</h3>
           </div>
           <div className="grid md:grid-cols-3 gap-12">
              {[
                { name: 'Arjun Meena', role: 'Founder & CEO', img: 'https://i.pravatar.cc/300?u=a' },
                { name: 'Sana Khan', role: 'Head of Kitchen Operations', img: 'https://i.pravatar.cc/300?u=b' },
                { name: 'Vikram Joshi', role: 'Chief Tech Officer', img: 'https://i.pravatar.cc/300?u=c' },
              ].map((m, i) => (
                <div key={i} className="group text-center">
                  <div className="relative mb-8 overflow-hidden rounded-[48px] aspect-[4/5]">
                     <img src={m.img} alt={m.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                  </div>
                  <h5 className="text-2xl font-black uppercase tracking-tight">{m.name}</h5>
                  <p className="text-sm font-black text-primary uppercase tracking-[0.2em]">{m.role}</p>
                </div>
              ))}
           </div>
        </div>

        {/* Join CTA */}
        <div className="bg-black rounded-[64px] p-20 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-5xl font-black text-white mb-8 uppercase tracking-tighter">Support the Tiffin revolution.</h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/signup" className="bg-primary text-white px-10 py-5 rounded-pill font-black text-lg transition-transform hover:scale-105 inline-flex items-center gap-3">
                ORDER NOW <ArrowRight />
              </Link>
              <Link href="/contact" className="bg-white text-black px-10 py-5 rounded-pill font-black text-lg transition-transform hover:scale-105">
                CONTACT US
              </Link>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-pill -translate-x-1/2 -translate-y-1/2 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 rounded-pill translate-x-1/2 translate-y-1/2 blur-[100px]" />
        </div>
      </div>
    </div>
  );
}
