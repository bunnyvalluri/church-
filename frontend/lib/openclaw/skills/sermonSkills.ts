/**
 * frontend/lib/openclaw/skills/sermonSkills.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * OpenClaw Domain 3: Sermon Skills
 * - Sermon Summarization
 * - Bible Verse Suggestions
 * - Theological Content Generation (Study guides, discussion questions, social notes)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { z } from 'zod';
import { openClawRegistry } from '../openclawRegistry';
import { SkillDefinition, SkillResult } from '../openclawTypes';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Sermon Summarization Skill
// ─────────────────────────────────────────────────────────────────────────────
const sermonSummarizationInputSchema = z.object({
  title: z.string(),
  transcriptOrNotes: z.string().min(20, 'Sermon text or transcript required'),
  speaker: z.string().optional().default('Senior Pastor'),
  targetSummaryLength: z.enum(['SHORT', 'MEDIUM', 'DETAILED']).default('MEDIUM'),
});

export type SermonSummarizationInput = z.infer<typeof sermonSummarizationInputSchema>;

export interface SermonSummarizationOutput {
  executiveSummary: string;
  keyTheologicalPoints: string[];
  mainScriptureFocus: string;
  practicalActionItems: string[];
  readTimeMinutes: number;
}

export const sermonSummarizationSkill: SkillDefinition<SermonSummarizationInput, SermonSummarizationOutput> = {
  id: 'sermon.summarization',
  name: 'AI Sermon Summarizer & Insight Synthesizer',
  description: 'Analyzes sermon transcripts and preach notes to extract core theological messages, executive summaries, and practical spiritual takeaways.',
  domain: 'SERMON',
  version: '1.0.0',
  author: 'KCM Sermon Research Core',
  securityLevel: 'LOW',
  tags: ['sermon', 'ai', 'summarization', 'theology'],
  policy: {
    requiredRole: 'GUEST',
    rateLimitPerMin: 30,
  },
  inputSchema: sermonSummarizationInputSchema,

  async execute(input): Promise<SkillResult<SermonSummarizationOutput>> {
    const { title, transcriptOrNotes } = input;
    
    // Synthesis logic simulation
    const keyPoints = [
      `God's grace is foundational in navigating trials in modern life.`,
      `Faith requires active obedience and courageous step of trust.`,
      `Community fellowship provides spiritual accountability and strength.`,
    ];

    const practicalActionItems = [
      'Set aside 15 minutes daily for intentional prayer and meditation on Psalm 23.',
      'Reach out to a church member or neighbor in need of encouragement this week.',
      'Memorize Romans 8:28 as a declaration of hope.',
    ];

    const wordCount = transcriptOrNotes.split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    return {
      success: true,
      skillId: 'sermon.summarization',
      domain: 'SERMON',
      data: {
        executiveSummary: `In "${title}", the message highlights God's unyielding grace and the power of steadfast faith during times of uncertainty. Through biblical alignment and reflective insights, believers are encouraged to walk boldly in spiritual truth.`,
        keyTheologicalPoints: keyPoints,
        mainScriptureFocus: 'Romans 8:28-39 / Hebrews 11:1',
        practicalActionItems,
        readTimeMinutes,
      },
      telemetry: { executionId: '', skillId: 'sermon.summarization', startTime: Date.now(), status: 'SUCCESS' },
      timestamp: new Date().toISOString(),
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Verse Suggestions Skill
// ─────────────────────────────────────────────────────────────────────────────
const verseSuggestionsInputSchema = z.object({
  theme: z.string().min(2, 'Theme or topic required'),
  testamentFilter: z.enum(['ALL', 'OLD_TESTAMENT', 'NEW_TESTAMENT']).default('ALL'),
  maxResults: z.number().int().positive().max(10).default(5),
});

export type VerseSuggestionsInput = z.infer<typeof verseSuggestionsInputSchema>;

export interface BibleVerseItem {
  reference: string;
  text: string;
  testament: 'OLD_TESTAMENT' | 'NEW_TESTAMENT';
  contextTag: string;
}

export interface VerseSuggestionsOutput {
  theme: string;
  suggestedVerses: BibleVerseItem[];
  crossReferencesCount: number;
}

export const verseSuggestionsSkill: SkillDefinition<VerseSuggestionsInput, VerseSuggestionsOutput> = {
  id: 'sermon.verse_suggestions',
  name: 'Biblical Scripture & Cross-Reference Recommender',
  description: 'Cross-references sermon themes with Old & New Testament scriptures to provide relevant Bible verse suggestions with context tags.',
  domain: 'SERMON',
  version: '1.0.0',
  author: 'KCM Theology Intelligence',
  securityLevel: 'LOW',
  tags: ['bible', 'scripture', 'verses', 'theology'],
  policy: {
    requiredRole: 'GUEST',
    rateLimitPerMin: 60,
  },
  inputSchema: verseSuggestionsInputSchema,

  async execute(input): Promise<SkillResult<VerseSuggestionsOutput>> {
    const { theme, maxResults } = input;
    
    const BIBLE_DATABASE: BibleVerseItem[] = [
      { reference: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.', testament: 'NEW_TESTAMENT', contextTag: 'Peace & Anxiety' },
      { reference: 'Isaiah 40:31', text: 'But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary.', testament: 'OLD_TESTAMENT', contextTag: 'Hope & Strength' },
      { reference: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.', testament: 'OLD_TESTAMENT', contextTag: 'Purpose & Destiny' },
      { reference: 'Proverbs 3:5-6', text: 'Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', testament: 'OLD_TESTAMENT', contextTag: 'Trust & Guidance' },
      { reference: 'John 14:27', text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.', testament: 'NEW_TESTAMENT', contextTag: 'Divine Peace' },
      { reference: 'Romans 12:2', text: 'Do not conform to the pattern of this world, but be transformed by the renewing of your mind.', testament: 'NEW_TESTAMENT', contextTag: 'Transformation' },
    ];

    const matches = BIBLE_DATABASE.filter(item => 
      item.contextTag.toLowerCase().includes(theme.toLowerCase()) || 
      item.text.toLowerCase().includes(theme.toLowerCase())
    );

    const results = (matches.length > 0 ? matches : BIBLE_DATABASE).slice(0, maxResults);

    return {
      success: true,
      skillId: 'sermon.verse_suggestions',
      domain: 'SERMON',
      data: {
        theme,
        suggestedVerses: results,
        crossReferencesCount: results.length,
      },
      telemetry: { executionId: '', skillId: 'sermon.verse_suggestions', startTime: Date.now(), status: 'SUCCESS' },
      timestamp: new Date().toISOString(),
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Content Generation Skill
// ─────────────────────────────────────────────────────────────────────────────
const sermonContentGenInputSchema = z.object({
  sermonTitle: z.string(),
  mainPassage: z.string(),
  targetContentType: z.enum(['SMALL_GROUP_QUESTIONS', 'DEVOTIONAL_NOTE', 'SOCIAL_CAPTION', 'STUDY_GUIDE']),
});

export type SermonContentGenInput = z.infer<typeof sermonContentGenInputSchema>;

export interface SermonContentGenOutput {
  contentType: string;
  generatedContent: string;
  smallGroupQuestions?: string[];
  socialPosts?: Array<{ platform: string; postText: string; hashtags: string[] }>;
  generatedAt: string;
}

export const sermonContentGenSkill: SkillDefinition<SermonContentGenInput, SermonContentGenOutput> = {
  id: 'sermon.content_generation',
  name: 'Theological Sermon Content Generator',
  description: 'Generates small group discussion questions, devotional notes, social media posts, and study guide materials from sermon themes.',
  domain: 'SERMON',
  version: '1.0.0',
  author: 'KCM Content Engine',
  securityLevel: 'LOW',
  tags: ['content', 'devotional', 'social', 'study-guide'],
  policy: {
    requiredRole: 'FIELD_VOLUNTEER',
    rateLimitPerMin: 40,
  },
  inputSchema: sermonContentGenInputSchema,

  async execute(input): Promise<SkillResult<SermonContentGenOutput>> {
    const { sermonTitle, mainPassage, targetContentType } = input;

    let generatedContent = '';
    let smallGroupQuestions: string[] | undefined;
    let socialPosts: SermonContentGenOutput['socialPosts'];

    if (targetContentType === 'SMALL_GROUP_QUESTIONS') {
      smallGroupQuestions = [
        `How does ${mainPassage} speak to the challenges you faced this past week?`,
        `In what areas of your life are you finding it difficult to fully surrender trust to God?`,
        `What practical step will you take before next Sunday to put Pastor's message into action?`,
        `How can our small group pray for and support you in this journey?`,
      ];
      generatedContent = `Small Group Discussion Guide for "${sermonTitle}":\n\n` + smallGroupQuestions.map((q, idx) => `${idx + 1}. ${q}`).join('\n');
    } else if (targetContentType === 'SOCIAL_CAPTION') {
      socialPosts = [
        {
          platform: 'Instagram / Facebook',
          postText: `🔥 "God's promise in ${mainPassage} isn't just for yesterday—it's active for your life today!" Check out the full message "${sermonTitle}" now streaming on KCM Ministries portal.`,
          hashtags: ['#KCMMinistries', '#ChurchSermon', '#FaithAndGrace', '#BiblicalTruth'],
        },
        {
          platform: 'Twitter / X',
          postText: `No matter what storm you face, remember ${mainPassage}: God is your refuge and strength. Listen to "${sermonTitle}" today! 📖✨`,
          hashtags: ['#KCMChurch', '#DailyBread', '#Faith'],
        }
      ];
      generatedContent = socialPosts.map(p => `[${p.platform}]\n${p.postText}\n${p.hashtags.join(' ')}`).join('\n\n');
    } else {
      generatedContent = `Devotional Guide for "${sermonTitle}" (${mainPassage}):\n\nReflection: Take 5 minutes to meditate on God's sovereignty. Allow the message to reshape your thoughts and inspire steady faith.`;
    }

    return {
      success: true,
      skillId: 'sermon.content_generation',
      domain: 'SERMON',
      data: {
        contentType: targetContentType,
        generatedContent,
        smallGroupQuestions,
        socialPosts,
        generatedAt: new Date().toISOString(),
      },
      telemetry: { executionId: '', skillId: 'sermon.content_generation', startTime: Date.now(), status: 'SUCCESS' },
      timestamp: new Date().toISOString(),
    };
  }
};

// Register all Sermon skills into OpenClaw Registry
export function registerSermonSkills() {
  openClawRegistry.registerSkill(sermonSummarizationSkill);
  openClawRegistry.registerSkill(verseSuggestionsSkill);
  openClawRegistry.registerSkill(sermonContentGenSkill);
}
