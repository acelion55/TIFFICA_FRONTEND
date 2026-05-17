import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata({
  title: 'About Tiffica — Cloud Kitchen & Best Tiffin Service Jaipur',
  description:
    'Learn about Tiffica — Jaipur\'s own cloud kitchen delivering affordable home-style tiffin with clean packaging. Best meal service for students, professionals & office-goers across Vaishali Nagar, Malviya Nagar & Mansarovar.',
  path: '/about',
  extraKeywords: 'about tiffica jaipur, cloud kitchen jaipur, Deepak gehlot founder, Harshvardhan Rankawat co-founder, affordable tiffin service, clean kitchen jaipur',
});

import Link from 'next/link';
import { ArrowRight, Heart, Users, ShieldCheck, Zap, Leaf, Coffee, Globe, Smile } from 'lucide-react';
import AboutCTA from '@/components/AboutCTA';
import FounderProfile from '@/components/FounderProfile';

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
            We started Tiffica with a simple dream: to ensure that every student, professional, and office-goer in Jaipur gets access to affordable, home-style meals prepared in our own clean cloud kitchen.
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
              FROM OUR OWN <span className="text-primary underline decoration-secondary underline-offset-8">CLOUD KITCHEN</span>.
            </h3>
            <div className="space-y-6 text-xl text-muted font-medium leading-loose">
              <p>
                Founded in the heart of Jaipur, Tiffica was born out of the frustration of missing home-cooked food while working late nights. We realized thousands of students in Malviya Nagar and professionals in Sitapura felt the same way.
              </p>
              <p>
                Today, we operate our own state-of-the-art cloud kitchen with the highest standards of cleanliness and hygiene. Every meal is prepared fresh with home-style recipes, packed in clean packaging, and delivered at the best affordable prices in Jaipur.
              </p>
              <p className="border-l-4 border-primary pl-8 italic">
                "Our goal isn't just to fill stomachs, but to nourish souls with the familiar comfort of home-cooked meals at prices students and professionals can afford."
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
              { icon: Leaf, title: 'FRESH SOURCING', desc: 'We only use seasonal, local produce from Jaipur\'s organic markets. No frozen vegetables, no artificial preservatives.' },
              { icon: Coffee, title: 'HOME-STYLE COOKING', desc: 'Meals are cooked fresh in our cloud kitchen to maintain that authentic home-cooked taste. Traditional recipes with modern hygiene standards.' },
              { icon: ShieldCheck, title: 'CLEAN PACKAGING', desc: 'Every tiffin is packed in hygienic, food-grade containers. We maintain strict cleanliness protocols and temperature control throughout.' }
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
            { icon: Heart, title: 'HOME-STYLE FOOD', desc: 'Authentic home-cooked taste in every meal. Made with love and traditional recipes.' },
            { icon: Users, title: 'BEST FOR STUDENTS', desc: 'Affordable, nutritious meals perfect for students and young professionals in Jaipur.' },
            { icon: ShieldCheck, title: 'CLEAN KITCHEN', desc: 'State-of-the-art cloud kitchen with uncompromising hygiene and food safety standards.' },
            { icon: Zap, title: 'OFFICE TIFFIN', desc: 'Perfect tiffin service for office-goers. Fresh, on-time delivery every day.' },
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
            <h3 className="text-5xl font-black tracking-tighter uppercase mb-8">our mission to feed</h3>
            <p className="text-xl text-muted font-medium leading-relaxed mb-8">
              Our mission is to donate 5000 meals to underprivileged children in shelter homes across Jaipur. We believe that no one should sleep hungry in our beautiful Pink City, and we're committed to making this vision a reality.
            </p>
            <div className="flex gap-12 justify-center lg:justify-start">
              <div>
                <p className="text-4xl font-black text-primary">5000</p>
                <p className="text-xs font-black uppercase tracking-widest mt-1">Meal Donation Goal</p>
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

        {/* Founders */}
        <div className="mb-40">
           <div className="text-center mb-24">
              <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-4">The Visionaries</h2>
              <h3 className="text-6xl font-black tracking-tighter uppercase">MEET OUR <span className="text-primary italic">FOUNDERS</span>.</h3>
              <p className="text-xl text-muted font-medium max-w-2xl mx-auto mt-8 leading-relaxed">
                Tiffica was built in Jaipur by Deepak gehlot and Harshvardhan Rankawat — bringing real ghar ka khana to students and professionals across the city.
              </p>
           </div>
           <div className="space-y-24 lg:space-y-32 max-w-6xl mx-auto">
              <FounderProfile
                name="Deepak gehlot"
                role="Founder"
                initials="DV"
                imageSrc="/founders/deepak-gehlot-founder-of-tiffica-at-jaipur.jpeg"
                imageAlt="Deepak gehlot — Founder of Tiffica"
                imagePosition="left"
                description="Deepak gehlot is the founder of Tiffica and a dedicated entrepreneur with deep business knowledge and hands-on experience in food startups. He leads the vision of bringing authentic home-style tiffin to Jaipur while building a brand customers trust."
                highlights={[
                  'Dedicated entrepreneur focused on growing Tiffica with long-term vision',
                  'Strong business knowledge — operations, strategy, and customer growth',
                  'Food startup expertise — understanding kitchens, quality, and delivery at scale',
                  'Skilled at partnerships, vendor management, and building a sustainable food business',
                ]}
              />
              <FounderProfile
                name="Harshvardhan Rankawat"
                role="Co-Founder"
                initials="HR"
                imageSrc="/founders/harshvardhan-rankawat-cofounder-of-tiffica-at-jaipur.jpeg"
                imageAlt="Harshvardhan Rankawat — Co-Founder of Tiffica"
                imagePosition="right"
                description="Harshvardhan Rankawat is the co-founder of Tiffica and a developer who builds the technology behind the platform. He designs and ships scalable digital products that power ordering, subscriptions, and smooth day-to-day operations."
                highlights={[
                  'Full-stack developer with experience building scalable websites and web apps',
                  'Builds custom software, dashboards, and CRM-style tools for business operations',
                  'Focus on performance, reliability, and a seamless ordering experience for users',
                  'Turns product ideas into production-ready systems that grow with Tiffica',
                ]}
              />
           </div>
        </div>

        {/* Join CTA */}
        <AboutCTA />
      </div>
    </div>
  );
}
