"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { KCM_BRANCHES } from "@/lib/locationsData";
import { useLanguage } from "@/components/providers/LanguageProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Navigation,
  ArrowLeft,
  Church,
  Calendar,
  Share2,
  CheckCircle2,
} from "lucide-react";

export default function BranchLocationPage({
  params,
}: {
  params: { slug: string };
}) {
  const branch = KCM_BRANCHES[params.slug];
  if (!branch) notFound();

  const { language } = useLanguage();
  const isTelugu = language === "te";
  const isHindi = language === "hi";

  const branchName = isTelugu ? branch.nameTe : isHindi ? branch.nameHi : branch.name;
  const branchAddress = isTelugu ? branch.addressTe : isHindi ? branch.addressHi : branch.address;
  const branchDescription = isTelugu
    ? branch.descriptionTe
    : isHindi
    ? branch.descriptionHi
    : branch.description;
  const branchDirections = isTelugu
    ? branch.directionsTe
    : isHindi
    ? branch.directionsHi
    : branch.directions;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-slate-950 text-white overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-15 pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-6">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all backdrop-blur-md border border-white/10"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isTelugu ? "అన్ని ప్రాంతాలు" : isHindi ? "सभी शाखाएं" : "All Locations"}</span>
            </Link>
          </div>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-900/70 border border-purple-400/50 text-xs font-extrabold uppercase tracking-wider text-amber-300 mb-4 backdrop-blur-md">
              <Church className="w-4 h-4" />
              <span>
                {branch.isMain
                  ? isTelugu
                    ? "ప్రధాన మందిరం"
                    : isHindi
                    ? "मुख्य धाम"
                    : "Primary Sanctuary"
                  : isTelugu
                  ? "ఆరాధన శాఖ"
                  : isHindi
                  ? "पूजा स्थल"
                  : "Sanctuary Branch"}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4 font-serif text-white">
              {branchName}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-300 font-light leading-relaxed max-w-3xl">
              {branchDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <main className="container mx-auto px-4 py-12 md:py-16 max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left / Main Column: Schedule & Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Timings Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                    {isTelugu ? "ఆరాధన సమయాలు & ప్రార్థనలు" : isHindi ? "आराधना समय एवं प्रार्थनाएं" : "Worship & Service Schedule"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isTelugu ? "వారపు సేవలు మరియు ప్రత్యక్ష ప్రార్థనలు" : isHindi ? "साप्ताहिक सेवाएं एवं प्रार्थनाएं" : "Weekly worship gatherings and fellowship"}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {branch.services.map((srv, idx) => {
                  const dayName = isTelugu ? srv.dayTe || srv.day : isHindi ? srv.dayHi || srv.day : srv.day;
                  const typeName = isTelugu ? srv.typeTe || srv.type : isHindi ? srv.typeHi || srv.type : srv.type;
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-3.5 py-1.5 rounded-xl font-black text-xs text-white bg-purple-600 shadow-sm shrink-0">
                          {dayName}
                        </span>
                        <div>
                          <div className="text-base font-bold text-slate-900 dark:text-white">
                            {typeName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-purple-500" />
                            <span>{srv.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold self-end sm:self-center">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isTelugu ? "అందరికీ ఆహ్వానం" : isHindi ? "सभी का स्वागत है" : "All Welcome"}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Directions & Travel Guide Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Navigation className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white font-serif">
                    {isTelugu ? "ఎలా చేరుకోవాలి (దిశలు)" : isHindi ? "कैसे पहुंचे (दिशा-निर्देश)" : "Directions & Getting Here"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isTelugu ? "రవాణా మరియు లొకేషన్ వివరాలు" : isHindi ? "स्थान एवं मार्ग विवरण" : "Transportation and landmark details"}
                  </p>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed mb-6">
                {branchDirections}
              </p>

              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                  <strong>{isTelugu ? "పూర్తి చిరునామా:" : isHindi ? "पूरा पता:" : "Full Address:"}</strong> {branchAddress}, {branch.locality}, {branch.region} – {branch.postalCode}, {branch.country}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact & Google Maps CTA */}
          <div className="space-y-6">
            {/* Quick Action Box */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-500/20">
              <h3 className="text-xl font-bold mb-4 font-serif text-white">
                {isTelugu ? "మమ్మల్ని సంప్రదించండి" : isHindi ? "संपर्क करें" : "Contact & Visit"}
              </h3>
              <p className="text-xs text-purple-200 leading-relaxed mb-6">
                {isTelugu
                  ? "ఆరాధన సేవలు లేదా ప్రార్థన మద్దతు కోసం ఏ సమయంలోనైనా కాల్ చేయండి."
                  : isHindi
                  ? "आराधना सेवाओं या प्रार्थना समर्थन के लिए किसी भी समय संपर्क करें।"
                  : "Reach out for prayer support, pastoral counseling, or visiting information."}
              </p>

              <div className="space-y-4 text-xs sm:text-sm mb-6">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                  <a
                    href="tel:+919704090069"
                    className="hover:text-amber-300 font-bold transition-colors"
                  >
                    +91 97040 90069 (Senior Pastor)
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-purple-300 shrink-0" />
                  <a
                    href="tel:+919640943777"
                    className="hover:text-amber-300 font-bold transition-colors"
                  >
                    +91 96409 43777 (Church Office)
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-purple-300 shrink-0" />
                  <a
                    href={`mailto:${branch.email}`}
                    className="hover:text-amber-300 transition-colors break-all"
                  >
                    {branch.email}
                  </a>
                </div>
              </div>

              <a
                href={branch.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98"
              >
                <Navigation className="w-4 h-4" />
                <span>{isTelugu ? "గూగుల్ మ్యాప్స్ లో తెరవండి" : isHindi ? "गूगल मैप्स पर खोलें" : "Get Directions on Google Maps"}</span>
              </a>
            </div>

            {/* Other Branches Quick Navigation */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">
                {isTelugu ? "ఇతర బ్రాంచ్ ప్రాంతాలు" : isHindi ? "अन्य शाखाएं" : "Other KCM Branches"}
              </h4>
              <div className="space-y-3">
                {Object.values(KCM_BRANCHES)
                  .filter((b) => b.slug !== branch.slug)
                  .map((other) => (
                    <Link
                      key={other.slug}
                      href={`/locations/${other.slug}`}
                      className="block p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700/80 transition-all text-xs"
                    >
                      <div className="font-bold text-slate-900 dark:text-white">
                        {isTelugu ? other.nameTe : isHindi ? other.nameHi : other.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {other.address}
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
