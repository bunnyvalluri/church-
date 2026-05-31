import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Music, Users, Heart, Baby, Briefcase, HandHeart } from "lucide-react";

export const metadata: Metadata = {
  title: "Ministries | Kingdom of Christ Ministries",
  description: "Discover the various ministries serving at Kingdom of Christ Ministries",
};

export default function MinistriesPage() {
  const ministries = [
    {
      title: "Worship Ministry",
      description: "Experience powerful, Spirit-led worship every service",
      details: ["Sunday Services", "Special worship nights", "Choir and music teams"],
      icon: Music,
      color: "purple",
    },
    {
      title: "Youth Ministry",
      description: "Empowering young people to live for Christ",
      details: ["Friday night youth services", "Youth camps and retreats", "Mentorship programs"],
      icon: Users,
      color: "indigo",
    },
    {
      title: "Children's Ministry",
      description: "Teaching kids about Jesus in age-appropriate ways",
      details: ["Sunday School", "VBS (Vacation Bible School)", "Kids camps"],
      icon: Baby,
      color: "pink",
    },
    {
      title: "Women's Ministry",
      description: "Building strong, faith-filled women",
      details: ["Weekly Bible studies", "Women's conferences", "Prayer groups"],
      icon: Heart,
      color: "rose",
    },
    {
      title: "Men's Ministry",
      description: "Equipping men to be spiritual leaders",
      details: ["Men's breakfast meetings", "Accountability groups", "Service projects"],
      icon: Briefcase,
      color: "blue",
    },
    {
      title: "Outreach Ministry",
      description: "Serving our community with Christ's love",
      details: ["Food distribution", "Medical camps", "Community events"],
      icon: HandHeart,
      color: "green",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; hover: string }> = {
      purple: { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-600 dark:text-purple-400", hover: "hover:bg-purple-50 dark:hover:bg-purple-800" },
      indigo: { bg: "bg-indigo-100 dark:bg-indigo-900", text: "text-indigo-600 dark:text-indigo-400", hover: "hover:bg-indigo-50 dark:hover:bg-indigo-800" },
      pink: { bg: "bg-pink-100 dark:bg-pink-900", text: "text-pink-600 dark:text-pink-400", hover: "hover:bg-pink-50 dark:hover:bg-pink-800" },
      rose: { bg: "bg-rose-100 dark:bg-rose-900", text: "text-rose-600 dark:text-rose-400", hover: "hover:bg-rose-50 dark:hover:bg-rose-800" },
      blue: { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-600 dark:text-blue-400", hover: "hover:bg-blue-50 dark:hover:bg-blue-800" },
      green: { bg: "bg-green-100 dark:bg-green-900", text: "text-green-600 dark:text-green-400", hover: "hover:bg-green-50 dark:hover:bg-green-800" },
    };
    return colors[color] || colors.purple;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 pt-20">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white text-sm mb-6 animate-bounce-in">
              <Heart className="h-4 w-4" />
              <span>Serving Together</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in-up">
              Our Ministries
            </h1>
            <p className="text-xl text-purple-100 animate-fade-in-up animate-delay-200">
              Find your place to serve and grow
            </p>
          </div>
        </div>
      </section>

      {/* Ministries Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {ministries.map((ministry, index) => {
                const colors = getColorClasses(ministry.color);
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover-lift card-flip transition-all duration-300"
                  >
                    <div className={`w-16 h-16 ${colors.bg} rounded-full flex items-center justify-center mb-6`}>
                      <ministry.icon className={`h-8 w-8 ${colors.text}`} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      {ministry.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                      {ministry.description}
                    </p>
                    <ul className="space-y-2">
                      {ministry.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                          <span className={`${colors.text} mt-1`}>•</span>
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Prayer Ministry Section */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-glow">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Prayer Ministry
            </h2>
            <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
              24/7 prayer support for our church family
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Prayer Chains</h4>
                <p className="text-gray-600 dark:text-gray-400">Immediate prayer for urgent needs</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Intercessory Teams</h4>
                <p className="text-gray-600 dark:text-gray-400">Dedicated prayer warriors</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Prayer Meetings</h4>
                <p className="text-gray-600 dark:text-gray-400">Weekly gatherings for corporate prayer</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-gradient-start via-slate-950 to-gradient-end">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 animate-fade-in-up">
              Get Involved
            </h2>
            <p className="text-xl text-purple-100 mb-8 animate-fade-in-up animate-delay-100">
              Join a ministry and make a difference
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-scale-in animate-delay-200">
              <Link
                href="/get-involved/volunteer"
                className="group px-8 py-4 bg-white text-purple-900 rounded-xl font-semibold hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 hover-lift"
              >
                Volunteer Today
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/#contact"
                className="px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 hover:scale-105 hover-lift"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
