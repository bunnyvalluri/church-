'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  BookOpen,
  Newspaper,
  Library,
  Calendar,
  HeartHandshake,
  Activity,
  Search,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Plus,
  CheckCircle2,
  AlertCircle,
  Share2,
  Layers,
  Globe,
  Bell
} from 'lucide-react';
import {
  runSermonResearch,
  fetchChurchNews,
  triggerChurchNewsScrape,
  fetchBibleStudyResources,
  triggerBibleStudyAggregate,
  generateEventContent,
  fetchNgoOpportunities,
  triggerNgoScrape,
  fetchWebsiteTargets,
  addWebsiteTarget,
  triggerWebsiteCheck,
  SermonSummary,
  ChurchNews,
  BibleStudyItem,
  EventGenResult,
  NgoOpp,
  MonitorTarget
} from '@/lib/firecrawlClient';

export default function FirecrawlIntelligencePage() {
  const [activeTab, setActiveTab] = useState<'sermon' | 'news' | 'biblestudy' | 'event' | 'ngo' | 'monitor'>('sermon');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // 1. Sermon Research State
  const [sermonTopic, setSermonTopic] = useState('Faith & Grace in Hard Times');
  const [scriptureRef, setScriptureRef] = useState('Romans 8:28');
  const [sermonResult, setSermonResult] = useState<SermonSummary | null>(null);

  // 2. Church News State
  const [newsCategory, setNewsCategory] = useState<string>('');
  const [newsList, setNewsList] = useState<ChurchNews[]>([]);

  // 3. Bible Study Aggregator State
  const [studyList, setStudyList] = useState<BibleStudyItem[]>([]);

  // 4. Event Content Generator State
  const [eventTopic, setEventTopic] = useState('Youth Leadership Summit 2026');
  const [eventResult, setEventResult] = useState<EventGenResult | null>(null);

  // 5. NGO Research State
  const [ngoList, setNgoList] = useState<NgoOpp[]>([]);

  // 6. Website Monitor State
  const [targets, setTargets] = useState<MonitorTarget[]>([]);
  const [newSiteName, setNewSiteName] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');

  // Initial Loaders
  useEffect(() => {
    if (activeTab === 'news') loadNews();
    if (activeTab === 'biblestudy') loadBibleStudy();
    if (activeTab === 'ngo') loadNgo();
    if (activeTab === 'monitor') loadTargets();
  }, [activeTab]);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchChurchNews(newsCategory);
      if (data.articles) setNewsList(data.articles);
    } catch (e) {}
    setLoading(false);
  };

  const loadBibleStudy = async () => {
    setLoading(true);
    try {
      const data = await fetchBibleStudyResources();
      if (data.resources) setStudyList(data.resources);
    } catch (e) {}
    setLoading(false);
  };

  const loadNgo = async () => {
    setLoading(true);
    try {
      const data = await fetchNgoOpportunities();
      if (data.opportunities) setNgoList(data.opportunities);
    } catch (e) {}
    setLoading(false);
  };

  const loadTargets = async () => {
    setLoading(true);
    try {
      const data = await fetchWebsiteTargets();
      if (data.targets) setTargets(data.targets);
    } catch (e) {}
    setLoading(false);
  };

  // Handlers
  const handleSermonResearch = async () => {
    if (!sermonTopic) return;
    setLoading(true);
    setStatusMsg('Scraping Christian blogs & synthesizing pastor brief via Firecrawl...');
    try {
      const data = await runSermonResearch(sermonTopic, scriptureRef);
      if (data.summary) {
        setSermonResult(data.summary);
        setStatusMsg('Sermon research successfully created & stored in Neon Postgres.');
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleRefreshNews = async () => {
    setLoading(true);
    setStatusMsg('Scraping global Christian news & ministry feeds via Firecrawl...');
    try {
      const data = await triggerChurchNewsScrape();
      if (data.articles) setNewsList(data.articles);
      setStatusMsg('News feed updated & broadcasted live via Socket.io.');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleAggregateBibleStudy = async () => {
    setLoading(true);
    setStatusMsg('Collecting devotionals & articles via Firecrawl web scraper...');
    try {
      const data = await triggerBibleStudyAggregate();
      if (data.resources) setStudyList(data.resources);
      setStatusMsg('Bible study resources stored for public resources page.');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleGenerateEventContent = async () => {
    if (!eventTopic) return;
    setLoading(true);
    setStatusMsg('Analyzing event topic & generating social media captions...');
    try {
      const data = await generateEventContent(eventTopic);
      if (data.result) {
        setEventResult(data.result);
        setStatusMsg('Multi-platform captions & promotional blog generated.');
      }
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleRefreshNgo = async () => {
    setLoading(true);
    setStatusMsg('Scraping global NGO opportunities & grant databases...');
    try {
      const data = await triggerNgoScrape();
      if (data.opportunities) setNgoList(data.opportunities);
      setStatusMsg('NGO opportunities stored in database.');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const handleAddTarget = async () => {
    if (!newSiteName || !newTargetUrl) return;
    setLoading(true);
    try {
      const data = await addWebsiteTarget(newSiteName, newTargetUrl);
      if (data.target) {
        setNewSiteName('');
        setNewTargetUrl('');
        loadTargets();
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleCheckMonitors = async () => {
    setLoading(true);
    setStatusMsg('Running SHA256 content hash check across monitored websites...');
    try {
      await triggerWebsiteCheck();
      loadTargets();
      setStatusMsg('Website monitoring check completed.');
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message}`);
    }
    setLoading(false);
  };

  const tabs = [
    { id: 'sermon', name: 'Sermon Research', icon: BookOpen, color: 'text-amber-400' },
    { id: 'news', name: 'Church News Feed', icon: Newspaper, color: 'text-emerald-400' },
    { id: 'biblestudy', name: 'Bible Study Aggregator', icon: Library, color: 'text-indigo-400' },
    { id: 'event', name: 'Event Content Gen', icon: Calendar, color: 'text-pink-400' },
    { id: 'ngo', name: 'NGO Research', icon: HeartHandshake, color: 'text-cyan-400' },
    { id: 'monitor', name: 'Website Monitoring', icon: Activity, color: 'text-rose-400' }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950/40 to-slate-900 border border-orange-500/20 p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 uppercase tracking-widest mb-2">
              <Flame className="w-4 h-4 text-orange-500 animate-pulse" /> Firecrawl Content Intelligence Platform
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-orange-200 to-amber-400">
              KCM Web Intelligence Engine
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-3xl">
              Powered by Firecrawl architecture, Neon PostgreSQL, Socket.io realtime streams, and Gemini AI synthesis for external ministry intelligence.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs px-3 py-1.5 rounded-full font-mono">
              Firecrawl API Engine Active
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-semibold text-sm transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-white shadow-lg border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${t.color}`} />
              {t.name}
            </button>
          );
        })}
      </div>

      {/* Notification Toast */}
      {statusMsg && (
        <div className="bg-slate-900/90 border border-orange-500/30 text-orange-200 text-xs md:text-sm p-4 rounded-xl flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400" /> {statusMsg}
          </span>
          <button onClick={() => setStatusMsg('')} className="text-slate-500 hover:text-white">✕</button>
        </div>
      )}

      {/* TAB 1: SERMON RESEARCH ENGINE */}
      {activeTab === 'sermon' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" /> Sermon Research Engine (For Pastors)
            </h2>
            <p className="text-slate-400 text-sm">
              Enter a sermon topic or scripture reference. Firecrawl will search Christian blogs & study resources, then summarize insights into a structured outline.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="md:col-span-2">
                <label className="text-xs font-mono text-slate-400 block mb-1">Sermon Topic / Focus</label>
                <input
                  type="text"
                  value={sermonTopic}
                  onChange={(e) => setSermonTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Grace and Redemption in Times of Trial"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Scripture Reference (Optional)</label>
                <input
                  type="text"
                  value={scriptureRef}
                  onChange={(e) => setScriptureRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                  placeholder="e.g. Romans 8:28"
                />
              </div>
            </div>

            <button
              onClick={handleSermonResearch}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 text-sm shadow-lg disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Execute Firecrawl Sermon Scrape & Synthesis
            </button>
          </div>

          {sermonResult && (
            <div className="bg-slate-900 border border-amber-500/20 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Pastor Briefing Summary</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">{sermonResult.topic}</h3>
                {sermonResult.scriptureRef && (
                  <span className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full inline-block mt-2 font-mono">
                    Scripture: {sermonResult.scriptureRef}
                  </span>
                )}
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 text-sm whitespace-pre-line leading-relaxed">
                {sermonResult.summaryText}
              </div>

              {/* Key Takeaways */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Key Pastoral Takeaways</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {sermonResult.keyTakeaways?.map((kt, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-start gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{kt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sermon Outline */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-amber-300 uppercase tracking-wider">Sermon Outline Structure</h4>
                <div className="space-y-2">
                  {sermonResult.sermonOutline?.map((sec, idx) => (
                    <div key={idx} className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-1">
                      <div className="flex items-center justify-between text-xs text-amber-400 font-mono">
                        <span>{sec.section}</span>
                        <span className="font-bold text-white">{sec.point}</span>
                      </div>
                      <p className="text-xs text-slate-400">{sec.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scraped Sources */}
              {sermonResult.scrapedSources?.length > 0 && (
                <div className="pt-4 border-t border-slate-800">
                  <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">Firecrawl Web Sources</h4>
                  <div className="space-y-2">
                    {sermonResult.scrapedSources.map((src, i) => (
                      <a key={i} href={src.url} target="_blank" rel="noreferrer" className="block bg-slate-950 hover:bg-slate-800 border border-slate-800 p-3 rounded-xl text-xs text-slate-300 flex items-center justify-between group transition">
                        <span className="truncate">{src.title}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CHURCH NEWS FEED */}
      {activeTab === 'news' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-emerald-400" /> Christian News & Ministry Feed
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Realtime scraped Christian news articles and ministry updates broadcast via Socket.io.
              </p>
            </div>

            <button
              onClick={handleRefreshNews}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm shrink-0 shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Scrape & Update News Feed
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {newsList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                No news articles cached yet. Click "Scrape & Update News Feed" to fetch global Christian news.
              </div>
            ) : (
              newsList.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between hover:border-emerald-500/40 transition">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full inline-block">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-100 line-clamp-2">{item.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.summary}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>{item.sourceName}</span>
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1">
                      Source <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BIBLE STUDY AGGREGATOR */}
      {activeTab === 'biblestudy' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <Library className="w-5 h-5 text-indigo-400" /> Bible Study & Devotional Aggregator
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Collect devotionals and theological articles via Firecrawl to populate the public Resources page.
              </p>
            </div>

            <button
              onClick={handleAggregateBibleStudy}
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm shrink-0 shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Run Devotional Scrape Sweep
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                No devotionals aggregated yet. Run a scrape sweep to collect resources.
              </div>
            ) : (
              studyList.map((item) => (
                <div key={item.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-3 py-0.5 rounded-full">
                      {item.resourceType}
                    </span>
                    {item.scriptureRef && <span className="text-xs text-amber-400 font-mono">{item.scriptureRef}</span>}
                  </div>

                  <h3 className="text-lg font-bold text-slate-100">{item.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{item.summary}</p>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.author || 'KCM Research'}</span>
                    <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline flex items-center gap-1">
                      Read Full Scrape <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EVENT CONTENT GENERATOR */}
      {activeTab === 'event' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-pink-400" /> Event Content & Caption Generator
            </h2>
            <p className="text-slate-400 text-sm">
              Input an event topic. Firecrawl will analyze market trends and generate multi-platform social media captions & promotional blog articles.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-400 block">Event Topic / Title</label>
              <input
                type="text"
                value={eventTopic}
                onChange={(e) => setEventTopic(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-pink-500"
                placeholder="e.g. Annual Gospel Outreach Conference 2026"
              />
            </div>

            <button
              onClick={handleGenerateEventContent}
              disabled={loading}
              className="bg-pink-500 hover:bg-pink-600 text-white font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 text-sm shadow-lg disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
              Generate Social Captions & Blog Post
            </button>
          </div>

          {eventResult && (
            <div className="bg-slate-900 border border-pink-500/20 p-6 md:p-8 rounded-3xl space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-pink-400 uppercase tracking-widest">Generated Campaign</span>
                <h3 className="text-2xl font-extrabold text-white mt-1">{eventResult.blogTitle}</h3>
              </div>

              {/* Social Media Captions */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-pink-300 uppercase tracking-wider">Multi-Channel Social Captions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(eventResult.socialCaptions || {}).map(([platform, caption]) => (
                    <div key={platform} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono uppercase bg-pink-500/10 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">
                        {platform}
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">{caption}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Blog Post Preview */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-sm font-bold text-pink-300 uppercase tracking-wider">Promotional Blog Article</h4>
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {eventResult.blogMarkdown}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: NGO RESEARCH MODULE */}
      {activeTab === 'ngo' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-cyan-400" /> NGO & Community Grant Research Module
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Scrape NGO grants, community welfare opportunities, and global outreach partnerships via Firecrawl.
              </p>
            </div>

            <button
              onClick={handleRefreshNgo}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm shrink-0 shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Scrape NGO Opportunities
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ngoList.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 text-sm">
                No NGO opportunities cached yet. Click "Scrape NGO Opportunities" to fetch data.
              </div>
            ) : (
              ngoList.map((opp) => (
                <div key={opp.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full inline-block">
                      {opp.opportunityType}
                    </span>
                    <h3 className="text-base font-bold text-slate-100">{opp.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{opp.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
                    <span>{opp.organization}</span>
                    <a href={opp.linkUrl} target="_blank" rel="noreferrer" className="text-cyan-400 hover:underline flex items-center gap-1">
                      Apply / View <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 6: WEBSITE MONITORING */}
      {activeTab === 'monitor' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Activity className="w-5 h-5 text-rose-400" /> Website Content Change Monitoring
            </h2>
            <p className="text-slate-400 text-sm">
              Register external websites to monitor. Firecrawl computes SHA256 content hashes and triggers FCM push notifications and Socket.io broadcasts when updates occur.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Site Name</label>
                <input
                  type="text"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                  placeholder="e.g. Vatican News Press"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-mono text-slate-400 block mb-1">Target URL</label>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={newTargetUrl}
                    onChange={(e) => setNewTargetUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-rose-500"
                    placeholder="https://example.org/news"
                  />
                  <button
                    onClick={handleAddTarget}
                    disabled={loading}
                    className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2 rounded-xl text-sm shrink-0 transition flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Add Target
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCheckMonitors}
                disabled={loading}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-bold px-5 py-2.5 rounded-xl transition flex items-center gap-2 text-sm shadow-md"
              >
                <RefreshCw className={`w-4 h-4 text-rose-400 ${loading ? 'animate-spin' : ''}`} />
                Run Instant SHA256 Hash Check Sweep
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Monitored Web Targets ({targets.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {targets.map((t) => (
                <div key={t.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-slate-100">{t.siteName}</span>
                    <span className="text-[10px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded-full">
                      {t.checkFrequency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 truncate font-mono">{t.targetUrl}</p>

                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-xs font-mono text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Last Hash:</span>
                      <span className="text-slate-200">{t.lastHash ? `${t.lastHash.slice(0, 16)}...` : 'Not checked yet'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last Checked:</span>
                      <span className="text-slate-400">{t.lastCheckedAt ? new Date(t.lastCheckedAt).toLocaleTimeString() : 'Never'}</span>
                    </div>
                  </div>

                  {t.logs && t.logs.length > 0 && (
                    <div className="text-[11px] text-slate-400 space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Recent Check Log:</span>
                      {t.logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between bg-slate-950/60 p-2 rounded-lg">
                          <span className={log.changeDetected ? 'text-amber-400 font-bold' : 'text-slate-400'}>
                            {log.changeDetected ? '⚠️ Change Detected' : '✓ Content Unchanged'}
                          </span>
                          <span className="text-slate-500 font-mono text-[10px]">{new Date(log.checkedAt).toLocaleTimeString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
