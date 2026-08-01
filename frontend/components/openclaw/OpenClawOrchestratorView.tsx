'use client';

/**
 * frontend/components/openclaw/OpenClawOrchestratorView.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Multi-Language OpenClaw Orchestrator Workspace View (EN / TE / HI)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/components/providers/LanguageProvider';
import { 
  ShieldCheck, 
  Zap, 
  BookOpen, 
  Bell, 
  Heart, 
  Activity, 
  Play, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Code, 
  Cpu, 
  Layers,
  Terminal,
  Server,
  Search
} from 'lucide-react';

interface SkillMeta {
  id: string;
  name: string;
  description: string;
  domain: string;
  version: string;
  author: string;
  securityLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  tags: string[];
  policy: {
    requiredRole: string;
    rateLimitPerMin?: number;
    requiresAuditLog?: boolean;
  };
}

const SKILL_TRANSLATIONS: Record<string, Record<string, string>> = {
  'security.jwt_validation': {
    te: 'JWT టోకెన్ సెక్యూరిటీ సరిచూడడం',
    hi: 'JWT टोकन सुरक्षा सत्यापन',
  },
  'security.rbac_audit': {
    te: 'RBAC అనుమతుల ఆడిట్',
    hi: 'RBAC अनुमतियां ऑडिट',
  },
  'security.upload_validation': {
    te: 'సురక్షిత ఫైల్ అప్‌లోడ్ తనిఖీ',
    hi: 'सुरक्षित फ़ाइल अपलोड निरीक्षक',
  },
  'security.api_abuse_detection': {
    te: 'API దుర్వినియోగం & గుర్తింపు',
    hi: 'API दुरुपयोग और विसंगति पहचान',
  },
  'event.upload_automation': {
    te: 'ఆటోమేటెడ్ ఈవెంట్ అప్‌లోడ్ ఇంజిన్',
    hi: 'स्वचालित ईवेंट अपलोड इंजन',
  },
  'event.media_optimization': {
    te: 'క్లౌడినరీ మీడియా ఆప్టిమైజేషన్',
    hi: 'क्लॉडिनरी मीडिया अनुकूलन',
  },
  'event.homepage_publishing': {
    te: 'హోమ్‌పేజీ లైవ్ ఈవెంట్ పబ్లిషర్',
    hi: 'होमपेज लाइव ईवेंट प्रकाशक',
  },
  'sermon.summarization': {
    te: 'AI ప్రసంగం సారాంశం & సమాచారం',
    hi: 'AI उपदेश सारांश और अंतर्दृष्टि',
  },
  'sermon.verse_suggestions': {
    te: 'బైబిల్ వాక్యాల సిఫార్సు ఇంజిన్',
    hi: 'बाइबिल शास्त्र और संदर्भ अनुशंसक',
  },
  'sermon.content_generation': {
    te: 'ప్రసంగం స్టడీ గైడ్ మరియు కంటెంట్ జనరేటర్',
    hi: 'उपदेश अध्ययन सामग्री जनरेटर',
  },
  'notification.fcm_push': {
    te: 'ఫైర్‌బేస్ మొబైల్ పుష్ నోటిఫికేషన్',
    hi: 'फ़ायरबेस मोबाइल पुश अधिसूचना',
  },
  'notification.socket_popup': {
    te: 'లైవ్ సాకెట్ పాపప్ అలర్ట్',
    hi: 'लाइव सॉकेट पॉपअप अलर्ट',
  },
  'notification.retry_failed': {
    te: 'విఫలమైన నోటిఫికేషన్ల రీట్రై వర్కర్',
    hi: 'विफल सूचना पुनः प्रयास कार्यकर्ता',
  },
  'prayer.categorize': {
    te: 'ప్రార్థన విన్నపాల ఆటోమేటిక్ వర్గీకరణ',
    hi: 'प्रार्थना अनुरोध स्वचालित वर्गीकरण',
  },
  'prayer.priority_detection': {
    te: 'అత్యవసర ప్రార్థన & ప్రాధాన్యతా గుర్తింపు',
    hi: 'आपातकालीन प्रार्थना और प्राथमिकता पहचान',
  },
  'prayer.pastor_assignment': {
    te: 'పాస్టర్ కేటాయింపు ఇంజిన్',
    hi: 'पास्टर असाइनमेंट इंजन',
  },
  'deployment.cicd_monitoring': {
    te: 'CI/CD డిప్లాయ్‌మెంట్ మానిటర్',
    hi: 'CI/CD परिनियोजन मॉनिटर',
  },
  'deployment.rollback': {
    te: 'ఆటోమేటెడ్ రోల్‌బ్యాక్ ఇంజిన్',
    hi: 'स्वचालित रोलबैक इंजन',
  },
  'deployment.health_check': {
    te: 'ప్లాట్‌ఫారమ్ ఆరోగ్య తనిఖీ',
    hi: 'प्लेटफॉर्म स्वास्थ्य निरीक्षण',
  },
};

const UI_TRANSLATIONS: Record<'en' | 'te' | 'hi', any> = {
  en: {
    pageTitle: 'OpenClaw AI Skill Orchestrator',
    pageDesc: 'Production-grade AI workflow automation engine across Security, Event, Sermon, Notification, Prayer, and Deployment domains.',
    runPipeline: 'Run Composite AI Pipeline',
    runningPipeline: 'Running Pipeline...',
    registeredSkills: 'Registered Skills',
    searchPlaceholder: 'Search AI skills by name, tag, or domain...',
    inputParameters: 'Input Parameters (JSON)',
    resetSample: 'Reset Sample',
    executeSkill: 'Execute Skill',
    executing: 'Executing...',
    telemetryTitle: 'Execution Telemetry & Output',
    clickToExecute: 'Click "Execute Skill" to trigger OpenClaw policy validation & telemetry metrics.',
    domainAll: 'All Skill Domains',
    domainSecurity: '1. Security Skills',
    domainEvent: '2. Event Skills',
    domainSermon: '3. Sermon Skills',
    domainNotification: '4. Notification Skills',
    domainPrayer: '5. Prayer Skills',
    domainDeployment: '6. Deployment Skills',
    statusSuccess: 'SUCCESS',
    statusFailed: 'FAILED',
    pipelineLogsTitle: 'Composite Workflow Pipeline Execution Logs',
  },
  te: {
    pageTitle: 'OpenClaw AI స్కిల్ ఆర్కెస్ట్రేటర్',
    pageDesc: 'సెక్యూరిటీ, ఈవెంట్, ప్రసంగం, నోటిఫికేషన్, ప్రార్థన మరియు విస్తరణ డొమైన్లలో ప్రొడక్షన్-గ్రేడ్ AI వర్క్‌ఫ్లో ఆటోమేషన్ ఇంజిన్.',
    runPipeline: 'AI వర్క్‌ఫ్లో పైప్‌లైన్‌ను నరపండి',
    runningPipeline: 'పైప్‌లైన్ నడుస్తోంది...',
    registeredSkills: 'నమోదైన AI స్కిల్స్',
    searchPlaceholder: 'స్కిల్స్ పేరు, ట్యాగ్ లేదా డొమైన్ ద్వారా వెతకండి...',
    inputParameters: 'ఇన్‌పుట్ పారామితులు (JSON)',
    resetSample: 'రీసెట్ నమూనా',
    executeSkill: 'స్కిల్‌ను అమలు చేయండి',
    executing: 'అమలు అవుతోంది...',
    telemetryTitle: 'ఎగ్జిక్యూషన్ టెలిమెట్రీ & అవుట్‌పుట్',
    clickToExecute: 'ఓపెన్‌క్లా పాలసీ ధృవీకరణను ప్రారంభించడానికి "స్కిల్‌ను అమలు చేయండి" క్లిక్ చేయండి.',
    domainAll: 'అన్ని స్కిల్ డొమైన్లు',
    domainSecurity: '1. సెక్యూరిటీ స్కిల్స్',
    domainEvent: '2. ఈవెంట్ స్కిల్స్',
    domainSermon: '3. ప్రసంగం స్కిల్స్',
    domainNotification: '4. నోటిఫికేషన్ స్కిల్స్',
    domainPrayer: '5. ప్రార్థన స్కిల్స్',
    domainDeployment: '6. విస్తరణ స్కిల్స్',
    statusSuccess: 'విజయం',
    statusFailed: 'విఫలమైంది',
    pipelineLogsTitle: 'వర్క్‌ఫ్లో పైప్‌లైన్ అమలు లాగ్‌లు',
  },
  hi: {
    pageTitle: 'OpenClaw AI कौशल आर्केस्ट्रेटर',
    pageDesc: 'सुरक्षा, ईवेंट, उपदेश, अधिसूचना, प्रार्थना और परिनियोजन डोमेन में उत्पादन-स्तरीय AI वर्कफ़्लो स्वचालन इंजन।',
    runPipeline: 'AI पाइपलाइन निष्पादित करें',
    runningPipeline: 'पाइपलाइन चल रही है...',
    registeredSkills: 'पंजीकृत AI कौशल',
    searchPlaceholder: 'नाम, टैग या डोमेन द्वारा कौशल खोजें...',
    inputParameters: 'इनपुट पैरामीटर (JSON)',
    resetSample: 'नमूना रीसेट करें',
    executeSkill: 'कौशल चलाएं',
    executing: 'चलाया जा रहा है...',
    telemetryTitle: 'निष्पादन टेलीमेट्री और आउटपुट',
    clickToExecute: 'ओपनक्लॉ नीति सत्यापन शुरू करने के लिए "कौशल चलाएं" पर क्लिक करें।',
    domainAll: 'सभी कौशल डोमेन',
    domainSecurity: '1. सुरक्षा कौशल',
    domainEvent: '2. ईवेंट कौशल',
    domainSermon: '3. उपदेश कौशल',
    domainNotification: '4. अधिसूचना कौशल',
    domainPrayer: '5. प्रार्थना कौशल',
    domainDeployment: '6. परिनियोजन कौशल',
    statusSuccess: 'सफलता',
    statusFailed: 'विफल',
    pipelineLogsTitle: 'वर्कफ़्लो पाइपलाइन निष्पादन लॉग',
  }
};

const DEFAULT_SAMPLE_INPUTS: Record<string, any> = {
  'security.jwt_validation': {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfazNtXzA0MiIsImVtYWlsIjoicGFzdG9yQGtjbS5vcmciLCJyb2xlIjoiUEFTVE9SIiwiaXNzIjoia2NtLW1pbmlzdHJpZXMtYXV0aCIsImlhdCI6MTc1NDA2NzIwMCwiZXhwIjoxNzU0MTUzNjAwfQ.sample_signature_hash',
    expectedIssuer: 'kcm-ministries-auth',
  },
  'security.rbac_audit': {
    resource: 'events',
    action: 'DELETE',
    targetUserRole: 'PASTOR',
  },
  'security.upload_validation': {
    fileName: 'sunday_service_banner.png',
    mimeType: 'image/png',
    fileSizeBytes: 4200000,
    base64HeadSnippet: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  },
  'security.api_abuse_detection': {
    ipAddress: '192.168.1.105',
    endpoint: '/api/events',
    requestCountLastMinute: 45,
    payloadSize: 1024,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) KCM-PWA/2.0',
  },
  'event.upload_automation': {
    title: 'Grace & Truth Annual Gospel Conference 2026',
    description: 'Join us for a transformative 3-day anointed worship and word convention with international speakers.',
    date: '2026-09-15T09:00:00Z',
    location: 'Main Sanctuary, KCM Ministries Campus',
    capacity: 2500,
  },
  'event.media_optimization': {
    mediaUrl: 'https://res.cloudinary.com/kcm-church/image/upload/v1/event_posters/conference_banner.jpg',
    mediaType: 'POSTER',
    targetWidth: 1200,
    targetHeight: 630,
  },
  'event.homepage_publishing': {
    eventId: 'evt_conference_2026',
    eventTitle: 'Grace & Truth Annual Gospel Conference 2026',
    isFeatured: true,
    displayOrder: 1,
    publishInstantBroadcast: true,
  },
  'sermon.summarization': {
    title: 'Walking by Unshakable Faith in Times of Storms',
    transcriptOrNotes: 'Today we open our Bibles to Mark 4:35-41. Jesus calls us to step out onto the waters of faith even when wind and wave billow around us. God is never surprised by your trials. His grace is sufficient and His presence is near.',
    targetSummaryLength: 'MEDIUM',
  },
  'sermon.verse_suggestions': {
    theme: 'Peace & Hope',
    testamentFilter: 'ALL',
    maxResults: 4,
  },
  'sermon.content_generation': {
    sermonTitle: 'Walking by Unshakable Faith in Times of Storms',
    mainPassage: 'Mark 4:35-41',
    targetContentType: 'SMALL_GROUP_QUESTIONS',
  },
  'notification.fcm_push': {
    title: '🔥 Live Worship Service Starting Now!',
    body: 'Join Senior Pastor Valluri live on stream or at the main sanctuary for today\'s message.',
    targetTopic: 'all-members',
  },
  'notification.socket_popup': {
    message: '🙏 Urgent Prayer Request: Please join in prayer for Brother John in ICU.',
    type: 'URGENT_PRAYER',
    targetRoom: 'global',
  },
  'notification.retry_failed': {
    maxRetries: 3,
    channelFilter: 'ALL',
    batchSize: 10,
  },
  'prayer.categorize': {
    title: 'Pray for complete healing for my mother',
    description: 'My mother was admitted to the hospital today with chest pain. Requesting church elders to pray for divine healing.',
  },
  'prayer.priority_detection': {
    title: 'Urgent ICU emergency prayer needed',
    description: 'Immediate crisis prayer for Brother Samuel following a critical accident in ICU.',
  },
  'prayer.pastor_assignment': {
    prayerId: 'pry_9921',
    category: 'HEAL_HEALTH',
    priority: 'URGENT',
  },
  'deployment.cicd_monitoring': {
    pipelineId: 'kcm-main-deploy',
    targetEnvironment: 'PRODUCTION',
  },
  'deployment.rollback': {
    reason: 'Preventative test trigger for OpenClaw SRE automated safety rollback sequence.',
    forceRollback: false,
  },
  'deployment.health_check': {
    checkDatabase: true,
    checkCloudinary: true,
    checkSocketIo: true,
    checkFcm: true,
  },
};

export default function OpenClawOrchestratorView() {
  const { language } = useLanguage();
  const langKey = (language === 'te' || language === 'hi' ? language : 'en') as 'en' | 'te' | 'hi';
  const labels = UI_TRANSLATIONS[langKey] || UI_TRANSLATIONS.en;

  const DOMAINS = [
    { id: 'ALL', label: labels.domainAll, icon: Layers, activeColor: 'bg-indigo-600 text-white border-indigo-600' },
    { id: 'SECURITY', label: labels.domainSecurity, icon: ShieldCheck, activeColor: 'bg-emerald-600 text-white border-emerald-600' },
    { id: 'EVENT', label: labels.domainEvent, icon: Zap, activeColor: 'bg-amber-600 text-white border-amber-600' },
    { id: 'SERMON', label: labels.domainSermon, icon: BookOpen, activeColor: 'bg-purple-600 text-white border-purple-600' },
    { id: 'NOTIFICATION', label: labels.domainNotification, icon: Bell, activeColor: 'bg-blue-600 text-white border-blue-600' },
    { id: 'PRAYER', label: labels.domainPrayer, icon: Heart, activeColor: 'bg-rose-600 text-white border-rose-600' },
    { id: 'DEPLOYMENT', label: labels.domainDeployment, icon: Activity, activeColor: 'bg-cyan-600 text-white border-cyan-600' },
  ];

  const [skills, setSkills] = useState<SkillMeta[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [activeSkill, setActiveSkill] = useState<SkillMeta | null>(null);
  const [inputJson, setInputJson] = useState<string>('{}');
  const [executing, setExecuting] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pipelineRunning, setPipelineRunning] = useState<boolean>(false);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/openclaw/skills');
      const data = await res.json();
      if (data.success) {
        setSkills(data.skills);
        if (data.skills.length > 0) {
          selectSkill(data.skills[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load OpenClaw skills:', e);
    } finally {
      setLoading(false);
    }
  };

  const selectSkill = (skill: SkillMeta) => {
    setActiveSkill(skill);
    const sampleInput = DEFAULT_SAMPLE_INPUTS[skill.id] || {};
    setInputJson(JSON.stringify(sampleInput, null, 2));
    setExecutionResult(null);
  };

  const getTranslatedSkillName = (skill: SkillMeta) => {
    const custom = SKILL_TRANSLATIONS[skill.id]?.[langKey];
    return custom || skill.name;
  };

  const runSkillExecution = async () => {
    if (!activeSkill) return;
    setExecuting(true);
    setExecutionResult(null);

    try {
      let parsedInput = {};
      try {
        parsedInput = JSON.parse(inputJson);
      } catch (err) {
        alert('Invalid JSON input format');
        setExecuting(false);
        return;
      }

      const res = await fetch('/api/openclaw/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skillId: activeSkill.id,
          input: parsedInput,
          userRole: 'ADMIN',
        }),
      });

      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({ success: false, error: err.message });
    } finally {
      setExecuting(false);
    }
  };

  const runFullDomainPipeline = async () => {
    setPipelineRunning(true);
    setPipelineLogs([`🚀 ${labels.runningPipeline}`]);

    const sampleFlow = [
      { id: 'security.jwt_validation', desc: '1/6 Validating JWT Token & Claims...' },
      { id: 'event.upload_automation', desc: '2/6 Automating Event Upload Record...' },
      { id: 'sermon.summarization', desc: '3/6 Synthesizing Sermon Insights & Verse Suggestions...' },
      { id: 'notification.fcm_push', desc: '4/6 Dispatching FCM Mobile Push Notification...' },
      { id: 'prayer.priority_detection', desc: '5/6 Detecting Crisis Sentiments & Assigning Pastor...' },
      { id: 'deployment.health_check', desc: '6/6 Running Multi-Point Platform Health Inspection...' },
    ];

    for (const step of sampleFlow) {
      setPipelineLogs(prev => [...prev, `[STEP] ${step.desc}`]);
      const sampleInput = DEFAULT_SAMPLE_INPUTS[step.id] || {};
      
      try {
        const res = await fetch('/api/openclaw/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillId: step.id, input: sampleInput, userRole: 'ADMIN' }),
        });
        const data = await res.json();
        if (data.success) {
          setPipelineLogs(prev => [...prev, `   ✅ ${step.id} completed in ${data.telemetry?.durationMs || 12}ms`]);
        } else {
          setPipelineLogs(prev => [...prev, `   ❌ ${step.id} failed: ${data.error?.message}`]);
        }
      } catch (err: any) {
        setPipelineLogs(prev => [...prev, `   ⚠️ Step exception: ${err.message}`]);
      }
      await new Promise(r => setTimeout(r, 600));
    }

    setPipelineLogs(prev => [...prev, '🎉 Composite AI Skill Pipeline Execution Completed Successfully!']);
    setPipelineRunning(false);
  };

  const filteredSkills = skills.filter(s => {
    const matchesDomain = selectedDomain === 'ALL' || s.domain === selectedDomain;
    const translatedName = getTranslatedSkillName(s);
    const matchesSearch = searchQuery === '' || 
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translatedName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDomain && matchesSearch;
  });

  return (
    <div className="space-y-6 text-slate-900 dark:text-white">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/10 p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-100 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {labels.pageTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
              {labels.pageDesc}
            </p>
          </div>
        </div>

        <button
          onClick={runFullDomainPipeline}
          disabled={pipelineRunning}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md border border-indigo-400/30 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap self-start md:self-center"
        >
          <Play className={`w-4 h-4 ${pipelineRunning ? 'animate-spin' : ''}`} />
          {pipelineRunning ? labels.runningPipeline : labels.runPipeline}
        </button>
      </div>

      {/* Domain Selection Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {DOMAINS.map(d => {
          const Icon = d.icon;
          const isSelected = selectedDomain === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setSelectedDomain(d.id)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                isSelected
                  ? `${d.activeColor} shadow-md scale-105`
                  : 'bg-white dark:bg-[#121428] border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {d.label}
            </button>
          );
        })}
      </div>

      {/* Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Registered Skills Explorer */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              {labels.registeredSkills} ({filteredSkills.length})
            </h2>

            <div className="relative w-40 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={labels.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[680px] overflow-y-auto pr-1">
            {filteredSkills.map(skill => {
              const isSelected = activeSkill?.id === skill.id;
              const displayName = getTranslatedSkillName(skill);
              
              const securityColor = 
                skill.securityLevel === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800' :
                skill.securityLevel === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-300 dark:border-amber-800' :
                skill.securityLevel === 'MEDIUM' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-300 dark:border-blue-800' :
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';

              return (
                <div
                  key={skill.id}
                  onClick={() => selectSkill(skill)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/90 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-[#121428] border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-500/30">
                      {skill.id}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${securityColor}`}>
                      {skill.securityLevel}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white mb-1">{displayName}</h3>
                  <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-2.5 leading-relaxed">{skill.description}</p>

                  <div className="flex flex-wrap items-center gap-1">
                    {skill.tags.map(t => (
                      <span key={t} className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-medium px-1.5 py-0.5 rounded">
                        #{t}
                      </span>
                    ))}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold ml-auto">
                      Role: {skill.policy.requiredRole}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Execution Workspace */}
        <div className="lg:col-span-7 space-y-5">
          {activeSkill ? (
            <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm dark:shadow-none space-y-5">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">{activeSkill.id}</span>
                    <span className="text-xs text-slate-500">• v{activeSkill.version}</span>
                  </div>
                  <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white">
                    {getTranslatedSkillName(activeSkill)}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{activeSkill.description}</p>
                </div>

                <button
                  onClick={runSkillExecution}
                  disabled={executing}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-sm border border-emerald-500/30 flex items-center justify-center gap-2 text-xs sm:text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 whitespace-nowrap self-start sm:self-center"
                >
                  <Play className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : ''}`} />
                  {executing ? labels.executing : labels.executeSkill}
                </button>
              </div>

              {/* Input Editor */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    {labels.inputParameters}
                  </label>
                  <button
                    onClick={() => setInputJson(JSON.stringify(DEFAULT_SAMPLE_INPUTS[activeSkill.id] || {}, null, 2))}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> {labels.resetSample}
                  </button>
                </div>

                <textarea
                  value={inputJson}
                  onChange={e => setInputJson(e.target.value)}
                  rows={7}
                  className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner scrollbar-thin"
                />
              </div>

              {/* Telemetry Output */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  {labels.telemetryTitle}
                </label>

                {executionResult ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 font-mono text-xs space-y-3 shadow-inner">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        {executionResult.success ? (
                          <span className="flex items-center gap-1 text-emerald-400 font-extrabold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> {labels.statusSuccess}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-400 font-extrabold bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/30">
                            <AlertTriangle className="w-3 h-3" /> {labels.statusFailed}
                          </span>
                        )}
                        <span className="text-slate-300 font-semibold">Domain: {executionResult.domain}</span>
                      </div>

                      {executionResult.telemetry && (
                        <div className="flex items-center gap-2.5 text-[11px] text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-indigo-300">
                            <Clock className="w-3 h-3 text-indigo-400" />
                            {executionResult.telemetry.durationMs} ms
                          </span>
                          <span>•</span>
                          <span>ID: {executionResult.telemetry.executionId}</span>
                        </div>
                      )}
                    </div>

                    <pre className="text-emerald-300 overflow-x-auto max-h-64 scrollbar-thin leading-relaxed">
                      {JSON.stringify(executionResult, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-300 dark:border-white/10 rounded-xl p-6 text-center text-slate-500 text-xs">
                    {labels.clickToExecute}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="bg-white dark:bg-[#121428] border border-slate-200 dark:border-white/10 rounded-2xl p-10 text-center text-slate-500">
              Select a skill from the left list to open the execution panel.
            </div>
          )}

          {/* Pipeline Logs */}
          {pipelineLogs.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2 text-slate-100 shadow-lg">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-400" />
                {labels.pipelineLogsTitle}
              </h3>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                {pipelineLogs.map((log, idx) => (
                  <div key={idx} className="text-slate-200">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
