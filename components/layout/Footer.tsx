"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Youtube, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function Footer() {
  const { t, language } = useLanguage();

  const footerLinks = {
    about: [
      { name: t.links.story, href: "/about/story" },
      { name: t.links.leadership, href: "/about/leadership" },
      { name: t.links.beliefs, href: "/about/beliefs" },
      { name: t.links.ministries, href: "/about/ministries" },
      { name: t.links.mission, href: "/about/mission" },
    ],
    resources: [
      { name: t.links.sermons, href: "/sermons" },
      { name: t.links.events, href: "/events" },
      { name: t.links.blog, href: "/blog" },
      { name: t.links.prayer, href: "/prayer" },
      { name: t.links.bibleStudy, href: "/resources/bible-study" },
      { name: t.links.media, href: "/resources/media" },
    ],
    getInvolved: [
      { name: t.links.smallGroups, href: "/get-involved/small-groups" },
      { name: t.links.volunteer, href: "/get-involved/volunteer" },
      { name: t.links.serve, href: "/get-involved/serve" },
      { name: t.links.give, href: "/give" },
      { name: t.links.member, href: "/membership" },
    ],
    connect: [
      { name: t.links.contact, href: "#contact" },
      { name: t.links.visit, href: "#about" },
      { name: t.links.services, href: "#services" },
      { name: t.links.locations, href: "#about" },
    ],
  };

  return (
    <footer className="relative bg-slate-950 dark:bg-black/40 dark:backdrop-blur-2xl text-slate-300 border-t border-white/10 dark:border-white/5">
      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500" />
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-3 mb-6">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/30 bg-white flex-shrink-0">
                <Image 
                  src="/logo.png" 
                  alt="Kingdom of Christ Ministries Logo" 
                  fill 
                  className="object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg leading-tight text-white">
                  {t.nav.churchName}
                </span>
                <span className="text-xs text-gray-400">
                  {t.nav.ministries}
                </span>
              </div>
            </Link>
            <p className="text-gray-400 mb-2">
              {language === 'te' ? "కాలము సంభవమైయున్నది, దేవునిరాజ్యము సమీపించియున్నది, మారుమనస్సు పొంది సువార్త నమ్ముడి. — మార్కు 1:15" : "“Time is fulfilled, and the Kingdom of God is at hand; repent and believe in the Gospel.” — Mark 1:15"}
            </p>
            <a
              href="https://maps.google.com/?q=Kingdom+of+Christ+Ministries,+15-201,+Vivekananda+Nagar,+Srinivas+Nagar,+Jeedimetla,+Hyderabad,+Telangana+500055"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-400 mb-6 flex items-start gap-2 hover:text-purple-300 transition-colors"
            >
              <MapPin className="h-5 w-5 flex-shrink-0" />
              <span>Kingdom of Christ Ministries, 15-201, Vivekananda Nagar, Srinivas Nagar, Jeedimetla, Hyderabad – 500055</span>
            </a>
            {/* Social Links */}
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#1877F2]/40 hover:brightness-110 group"
              >
                <Facebook className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[360deg]" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/40 hover:brightness-110 group"
              >
                <Instagram className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[360deg]" />
              </a>
              <a
                href="https://youtube.com/@kcmchurchshapur7107?si=NbnoJjdl5lqt7fkO"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#FF0000] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#FF0000]/40 hover:brightness-110 group"
              >
                <Youtube className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[360deg]" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-[#1DA1F2] text-white flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#1DA1F2]/40 hover:brightness-110 group"
              >
                <Twitter className="h-5 w-5 transition-transform duration-500 group-hover:rotate-[360deg]" />
              </a>
            </div>
          </div>

          {/* About Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{t.links.about}</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{t.links.resources}</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Get Involved Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{t.links.getInvolved}</h3>
            <ul className="space-y-3">
              {footerLinks.getInvolved.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="text-white font-bold text-lg mb-6">{t.links.connect}</h3>
            <ul className="space-y-4">
              {footerLinks.connect.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-purple-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 pt-6 border-t border-gray-800">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Phone className="h-4 w-4 text-purple-400" />
                <a href="tel:+919704090069" className="hover:text-purple-400 transition-colors block">
                  +91 97040 90069
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Phone className="h-4 w-4 opacity-0" />
                <a href="tel:+919640943777" className="hover:text-purple-400 transition-colors block">
                  +91 96409 43777
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Phone className="h-4 w-4 opacity-0" />
                <a href="tel:+919505202748" className="hover:text-purple-400 transition-colors block">
                  +91 95052 02748 (Senior Pastor)
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="h-4 w-4 text-purple-400" />
                <a href="mailto:kingofchristministries23@gmail.com" className="hover:text-purple-400 transition-colors">
                  kingofchristministries23@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 text-center md:text-left" suppressHydrationWarning>
              © {new Date().getFullYear()}{" "}
              {language === "te"
                ? "కింగ్డమ్ ఆఫ్ క్రైస్ట్ మినిస్ట్రీస్. అన్ని హక్కులు ప్రత్యేకించబడినవి."
                : language === "hi"
                ? "किंगडम ऑफ क्राइस्ट मिनिस्ट्रीज। सर्वाधिकार सुरक्षित।"
                : "Kingdom of Christ Ministries. All rights reserved."}{" "}
              <br className="md:hidden" />
              <a 
                href="https://valluri-rahul-portfolio.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-purple-400/80 hover:text-purple-300 hover:underline transition-all"
              >
                Developed by VALLURI RAHUL.
              </a>
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-purple-400 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
