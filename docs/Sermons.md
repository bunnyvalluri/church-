# Sermon Catalog, Streaming & Semantic Search

## Purpose
This document specifies the sermon catalog architecture, multimedia streaming integration, series grouping, user engagement metrics, and Pinecone vector semantic search across the Kingdom of Christ Ministries platform.

## Scope
Covers sermon directory pages (`/sermons`), player interfaces, pastoral publishing studios, semantic search APIs, and Cloudinary media delivery.

## Status
> Status: Implemented

---

## 1. Sermon Architecture & Vector Search Pipeline

```mermaid
graph TD
    subgraph Preaching & Publishing
        Pastor[Pastoral Staff] --> SermonStudio[/pastor/sermons Studio]
        SermonStudio --> UploadMedia[Upload Audio/Video to Cloudinary]
        SermonStudio --> SavePostgres[Persist Metadata in PostgreSQL]
    end

    subgraph Background AI Vector Indexing
        SavePostgres --> GenEmbedding[Generate Text Embedding: text-embedding-3-small]
        GenEmbedding --> PineconeIndex[(Pinecone Vector DB: church-sermons)]
    end

    subgraph Listener Experience & Discovery
        Member[Church Member / Listener] --> SermonCatalog[/sermons Directory]
        SermonCatalog -->|1. Keyword / Series Filter| PGQuery[PostgreSQL Direct Query]
        SermonCatalog -->|2. Natural Language Query| PineconeQuery[Semantic Vector Search]
        
        PineconeQuery --> PineconeIndex
        PineconeIndex -->|Return Vector Nearest Neighbors| SearchAPI[Search Route Handler]
        SearchAPI --> PGQuery
        PGQuery --> StreamPlayer[Stream Audio/Video Player with Scripture Notes]
    end
```

---

## 2. Key Sermon Capabilities

### 2.1 Audio & Video Streaming
- **Video Playback**: Supports Cloudinary adaptive streaming URLs (`f_auto,q_auto`) or embedded YouTube live recordings.
- **Audio Podcasts**: Provides an inline audio player with background playback support on mobile devices.
- **Study Notes**: Displays synchronized sermon outlines, scripture references, and downloadable PDF study guides.

### 2.2 Semantic Vector Search (Pinecone)
Members can search for sermons using natural theological questions (e.g. *"how to overcome fear and trust God during trials"*):
1. Query text is converted to a 1536-dimensional vector using OpenAI `text-embedding-3-small`.
2. Pinecone matches vectors against indexed sermon transcripts and study notes.
3. Relevant sermons are returned ranked by cosine similarity score.

### 2.3 Engagement & Analytics Tracking
The platform records member engagement metrics in PostgreSQL:
- **Likes**: `SermonLike` (Enforces unique user like constraint).
- **Bookmarks**: `SermonBookmark` (Populates personal saved list in `/member/sermons`).
- **Views & Downloads**: `SermonView` and `SermonDownload` (Powers pastoral popularity analytics).

---

## 3. Associated API Endpoints

- `GET /api/sermons` — Retrieves published sermons with search, series, and speaker filters.
- `GET /api/sermons/featured` — Returns editorially featured sermons for homepage hero.
- `GET /api/sermons/[id]` — Returns detailed sermon metadata and streaming links.
- `POST /api/sermons/[id]/like` — Toggles like state for authenticated user.
- `POST /api/sermons/[id]/bookmark` — Toggles bookmark state for authenticated user.
- `POST /api/sermons/[id]/view` — Increments verified view counter.
- `POST /api/sermons/[id]/download` — Records audio/notes download event.

---

## 4. Troubleshooting & Diagnostics

| Problem | Cause | Solution |
| :--- | :--- | :--- |
| Semantic search returns empty results | Missing `PINECONE_API_KEY` or index not initialized | Ensure Pinecone environment variables are set; search gracefully falls back to PostgreSQL full-text search. |
| Audio download fails on iOS Safari | Direct link blocked by Safari security sandbox | Route download through `/api/sermons/[id]/download` with `Content-Disposition: attachment` headers. |

---

## Security Considerations
- Download counters are rate-limited to prevent artificial metric inflation.
- Video streams are served over secure HTTPS endpoints with CDN origin shielding.

## Related Documentation
- [Pastor-Portal.md](Pastor-Portal.md) — Sermon management studio.
- [Cloudinary.md](Cloudinary.md) — Media storage and streaming CDN.
- [Database-Architecture.md](Database-Architecture.md) — Relational schema.
