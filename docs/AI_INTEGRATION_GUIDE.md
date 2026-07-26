# 🤖 AI Integration Roadmap: Normal -> AI Upgrade

We are transforming **Kingdom of Christ Ministries** from a standard website into an Intelligent AI Platform.

## 🛠️ Tech Stack & Implementation

| Tool | Purpose in Project | Feature Implementation |
|------|-------------------|------------------------|
| **LangChain** | The "Brain" Logic | Connects user queries to our data and the LLM. |
| **RAG** | Context Awareness | "Reads" your sermons/events to answer specific questions accurately. |
| **Vector DB** | Long-term Memory | Stores sermon transcripts and bible verses for instant retrieval. |
| **Hugging Face** | Open Source Models | (Optional) specialized religious/theological models. |
| **LangGraph** | Complex Workflows | Handles multi-step needs (e.g., "Find a sermon about Hope AND add the event to my calendar"). |

---

## 🚀 Phase 1: "Ask the Church" AI Assistant (Building Now)

We will build a floating Chat Object that helps visitors:
1.  **Find Sermons**: "Do you have any sermons about anxiety?" (Uses Vector DB search)
2.  **Get Prayer Help**: "I need a prayer for healing." (Uses LLM generation)
3.  **Church Info**: "What time is the Subhash Nagar service?" (Uses RAG context)

## 🔮 Phase 2: Sermon Intelligence
- **Auto-Summarization**: Upload a video, get a summary + bible verses used.
- **Sentiment Analysis**: Understand the emotional tone of member feedback/prayer requests.

---

### 📂 File Structure for AI

```
components/
  ai/
    AIChat.tsx       <-- The UI Component
    Thinking.tsx     <-- "Thinking" animation state
lib/
    ai/
      rag-chain.ts   <-- LangChain Logic
      vector-store.ts <-- Vector DB Connection
app/
  api/
    chat/
      route.ts       <-- Text Streaming API
```
