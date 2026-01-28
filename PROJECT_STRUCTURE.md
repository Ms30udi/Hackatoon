┌────────────────────────────────────────────────────────────────────────┐
│                    WEB FORM (Entry Point)                              │
│  Client selects service: New contract  | Modify | Inquiry | Reclamation│
└────────────────────┬───────────────────────────────────────────────────┘
                     │
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼─────┐  ┌─────▼──────┐  ┌────▼──────┐
│   NEW    │  │   MODIFY   │  │  INQUIRY  │  ┌──────────────┐
│ CONTRACT │  │  CONTRACT  │  │           │  │ RECLAMATION  │
└────┬─────┘  └─────┬──────┘  └────┬──────┘  └──────┬───────┘
     │              │               │                 │
     │              │               │                 │
┌────▼──────────────▼───────────────▼─────────────────▼───────┐
│                     BACKEND API (FastAPI)                    │
│                   + Database (MySQL / Aiven)                 │
└────┬──────────────┬───────────────┬─────────────────┬───────┘
     │              │               │                 │
     │              │               │                 │
┌────▼──────────────▼───────┐       │                 │
│  ID Upload + OCR Extract   │      │                 │
│  (MIstral OCR) 
/or manual filling by client │      │                 │
└────────────┬───────────────┘      │                 │
             │                      │                 │
┌────────────▼───────────────┐      │                 │
│  Auto-fill + Validation    │      │                 │
│  (Rule-based Logic)        │      │                 │
└────────────┬───────────────┘      │                 │
             │                      │                 │
┌────────────▼───────────────┐      │                 │
│  Template Selection        │      │                 │
│  (2-3 Standard Templates)  │      │                 │
└────────────┬───────────────┘      │                 │
             │                      │                 │
┌────────────▼───────────────┐      │                 │
│  Contract Generation       │      │                 │
│  (Template Engine)         │      │                 │
└────────────┬───────────────┘      │                 │
             │                      │                 │
             │  Contract Sent       │                 │
             │  via Email           │                 │
             │                      │                 │
═════════════▼══════════════════════▼═════════════════▼═══════
             │      AI AGENTS START HERE              │
═════════════════════════════════════════════════════════════

┌────────────▼───────────────┐  ┌───▼────────────────┐  ┌────▼──────────┐
│ Email Dialogue Manager     │  │ Inquiry RAG Agent  │  │ Reclamation   │
│                            │  │                    │  │ Classifier    │
│ • Explains clauses         │  │ • Vector DB search │  │               │
│ • Answers questions        │  │ • FAQ retrieval    │  │ • Severity    │
│                            │  │ • Auto-response    │  │ • Routing     │
│ • ask for online signature 
 via a call to action button
 in the mail                 │  │ • Confidence check │  │ • Resolution  │
└────────────┬───────────────┘  └───┬────────────────┘  └────┬──────────┘
             │                      │                         │
             │  Signed Contract     │  Answer Sent            │  Response Sent
             │  sent to client      │                         │
             │                      │                         │
             │                      │                         │
             │                      │                         │
             │                      │                         │
┌────────────▼──────────────────────▼─────────────────────────▼───┐
│                      ARCHIVE SYSTEM                              │
│            (Contracts + Resolutions + Conversation Logs)         │
└──────────────────────────────────────────────────────────────────┘