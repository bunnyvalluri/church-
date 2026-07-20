import Hero from "@/components/sections/Hero";
import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import About from "@/components/sections/About";
import Services from "@/components/sections/Services";
import Events from "@/components/sections/Events";
import Sermons from "@/components/sections/Sermons";
import Contact from "@/components/sections/Contact";
import ScrollReveal from "@/components/ui/ScrollReveal";
import NgoShowcase from "@/components/sections/NgoShowcase";

import {
  getHeroContent,
  getStatistics,
  getAboutContent,
  getContacts,
  getPastors,
  getServices,
  getEvents,
} from "@/lib/server/cms";
import { getLatestSermons } from "@/app/actions/sermons";

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&q=80";

export default async function Home() {
  // Parallelize data fetching for instant rendering
  const [
    heroData,
    statsData,
    aboutData,
    contactsData,
    pastorsData,
    servicesData,
    eventsData,
    dbSermons,
  ] = await Promise.all([
    getHeroContent(),
    getStatistics(),
    getAboutContent(),
    getContacts(),
    getPastors(),
    getServices(),
    getEvents(),
    getLatestSermons().catch(() => []),
  ]);

  // Format sermons for the component
  const formattedSermons = (dbSermons || []).map((s: any) => {
    let videoId = s.videoUrl || "";
    if (s.videoUrl && s.videoUrl.includes('v=')) {
      videoId = s.videoUrl.split('v=')[1].split('&')[0];
    } else if (s.videoUrl && s.videoUrl.includes('youtu.be/')) {
      videoId = s.videoUrl.split('youtu.be/')[1].split('?')[0];
    }
    return {
      id: s.id,
      title: s.title,
      pastor: s.pastor,
      date: new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      views: s.views >= 1000 ? (s.views / 1000).toFixed(1) + 'K' : s.views.toString(),
      thumbnail: s.thumbnail || DEFAULT_THUMBNAIL, 
      duration: "45:00", 
      category: s.category,
      videoId,
      videoUrl: s.videoUrl,
    };
  });

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen overflow-x-hidden">
        <Hero initialHeroData={heroData} initialStatsData={statsData} />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.15)] to-transparent" />

        <NgoShowcase />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.3)] to-transparent" />

        <About initialAboutData={aboutData} initialContactsData={contactsData} initialPastorsData={pastorsData} />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />

        <Services initialServices={servicesData} />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.2)] to-transparent" />

        <Events initialEvents={eventsData} />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.3)] to-transparent" />

        <Sermons initialSermons={formattedSermons} />

        {/* Section divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary)/0.15)] to-transparent" />

        <ScrollReveal delay={0.1}><Contact /></ScrollReveal>
        <Footer />
      </main>
    </>
  );
}
