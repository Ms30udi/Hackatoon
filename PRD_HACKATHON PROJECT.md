# Product Requirements Document (PRD): Intelligent Customer Request Processing - Contractualization

---

# 1. Introduction

## 1.1 Document Purpose

This Product Requirements Document (PRD) defines the features, behaviors, scope, and constraints of the AI-Powered Electricity Contract Management System. The system leverages artificial intelligence to automatically process customer prospect requests received through digital channels (web form), focusing on electricity contract generation. This document serves as the primary reference for product, design, development, and testing teams.

## 1.2 Executive Summary

This AI-powered platform revolutionizes electricity service management in Morocco by automating contract generation, intelligent inquiry handling, and complaint resolution. Leveraging advanced NLP and document processing, the system reduces processing time from days to minutes while improving customer satisfaction.

**Key Value Propositions:**
- 60% reduction in manual processing through intelligent automation
- Sub-2-minute contract generation and delivery
- 24/7 AI-powered customer inquiry handling
- Automated complaint classification and routing

---

# 2. Background and Business Goals

## 2.1 Background

Organizations managing high volumes of digital customer requests face operational delays and increased costs due to manual processing. Electricity contract subscription workflows require structured validation, eligibility checks, and explicit consent verification. This product introduces an AI-driven pipeline to automate the request analysis and contractualization process.

## 2.2 Business Goals

| Business Goal          | Description                                                | Success Metric (Success Criteria) |
|------------------------|------------------------------------------------------------|-----------------------------------|
| Operational Efficiency | Reduce manual processing of electricity contract requests. | 60% reduction in manual handling  |
| Processing Speed       | Shorten request-to-contract cycle time.                    | Processing time under 2 minutes   |
| Automation Rate        | Automate standard electricity contract requests.           | 70% automation coverage           |
| Data Accuracy          | Improve consistency of customer data validation.           | Error rate below 5%               |
| Customer Experience    | Deliver faster responses to customers.                     | Improved satisfaction indicators  |

## 2.3 Regional Context: Moroccan Electricity Market

**Target Market:**
- Primary providers: ONEE (6M+ customers), LYDEC, REDAL, AMENDIS
- Document standard: Carte d'Identité Nationale (CIN)
- Currency: Moroccan Dirham (MAD)
- Languages: French (primary), Arabic, English
- Voltage classifications: BT (Basse Tension), MT (Moyenne Tension), HT (Haute Tension)
- Regulatory body: ANRE (Autorité Nationale de Régulation de l'Électricité)

**Market Opportunity:**
- Growing digital adoption among Moroccan consumers
- Government push for e-services modernization
- Need for streamlined utility service management

---

# 3. Scope of the Release

## 3.1 In Scope

- Analysis of digital electricity contract requests
- Automatic request classification
- Extraction and validation of customer information
- Consent verification prior to contractualization
- Generation of electricity contract proposals
- AI-powered inquiry handling (RAG system)
- Complaint classification and routing
- Contract clause explanation
- API exposure for request processing
- Documentation and demo assets

## 3.2 Out of Scope

- Processing of non-electricity contracts
- Use of real customer personal data
- Integration with production billing or payment systems
- Long-term analytics dashboards
- Advanced exception handling
- E-signature integration (future phase)

---

# 4. Users and Personas

## 4.1 Target Users

| Role                  | Description                                          | Key Needs                 |
|-----------------------|------------------------------------------------------|---------------------------|
| Prospective Customers | Individuals requesting electricity contracts online. | Fast and clear processing |
| Back-Office Agents    | Teams validating and activating contracts.           | Reduced manual workload   |
| Customer Service      | Support teams handling inquiries.                    | Request visibility        |
| IT Integrators        | Teams integrating APIs.                              | Stable structured outputs |
| Business Managers     | Stakeholders monitoring performance.                 | Automation KPIs           |

---

# 5. Functional Requirements

## FR-1: Multi-Channel Service Request Processing
- FR-1.1: The system shall accept requests via web portal for 4 service types
- FR-1.2: The system shall process new contract subscription with customer validation
- FR-1.3: The system shall handle contract modification requests
- FR-1.4: The system shall respond to general information inquiries
- FR-1.5: The system shall manage complaint/reclamation submissions

## FR-2: Intelligent Document Processing
- FR-2.1: The system shall extract customer data from CIN documents via OCR (Mistral Vision)
- FR-2.2: The system shall auto-populate customer forms with extracted data
- FR-2.3: The system shall validate extracted data against regulatory patterns
- FR-2.4: The system shall allow manual correction of OCR results

## FR-3: AI-Powered Contract Management
- FR-3.1: The system shall generate contracts from templates (individual, household, commercial)
- FR-3.2: The system shall create PDF contracts with professional formatting
- FR-3.3: The system shall deliver contracts via email with signature workflow
- FR-3.4: The system shall explain contract clauses in plain language on request
- FR-3.5: The system shall track contract status (draft, sent, signed, active)

## FR-4: Intelligent Inquiry Handling (RAG System)
- FR-4.1: The system shall perform semantic search across the knowledge base
- FR-4.2: The system shall generate context-aware responses using Claude API
- FR-4.3: The system shall provide confidence scores for generated responses
- FR-4.4: The system shall escalate low-confidence queries for human review
- FR-4.5: The system shall support bilingual responses (French/English)

## FR-5: Reclamation Processing
- FR-5.1: The system shall automatically classify complaints by category
  - Categories: billing, technical, connection, service_quality
- FR-5.2: The system shall assign severity levels to complaints
  - Levels: low, normal, high, urgent
- FR-5.3: The system shall route complaints to appropriate handling queues
- FR-5.4: The system shall track SLA compliance for complaint resolution
- FR-5.5: The system shall suggest resolution paths based on historical data

---

# 6. Non-Functional Requirements

## 6.1 Performance
- Near real-time processing (< 2 minutes for contract generation)
- API response time < 500ms for standard requests
- Support for concurrent users during demo

## 6.2 Reliability
- Deterministic behavior for identical inputs
- Graceful error handling with user-friendly messages
- System availability > 99% during demo period

## 6.3 Security
- No long-term storage of sensitive personal data
- HTTPS for all API communications
- Input validation and sanitization

## 6.4 Usability
- Clear error messages in French and English
- Intuitive form design with validation feedback
- Mobile-responsive interface

## 6.5 Cost
- Leverage free-tier and open-source tools where possible
- Optimize API calls to minimize LLM costs

---

# 7. Assumptions, Constraints, Dependencies

## 7.1 Assumptions

- Request scenarios are predefined and representative
- Simplified electricity contract rules are acceptable for demo
- Synthetic data reflects real use cases
- Users have basic digital literacy

## 7.2 Constraints

- Hackathon timeframe (limited development time)
- Limited infrastructure (cloud-hosted database)
- No access to production systems
- Budget constraints for external APIs

## 7.3 Dependencies

- Availability of sample requests and test data
- Anthropic Claude API connectivity
- Mistral API connectivity (for OCR)
- Email service availability
- Aiven MySQL database uptime

---

# 8. Success & Delivery Criteria

## 8.1 Key Performance Indicators

| KPI | Target | Measurement Method | Priority |
|-----|--------|-------------------|----------|
| Request-to-Contract Time | < 2 minutes | Automated flow completion | Critical |
| Inquiry Resolution Rate | > 80% | RAG auto-response success | High |
| OCR Extraction Accuracy | > 90% | Field validation rate | Medium |
| Complaint Classification | > 85% | Correct category/severity | High |
| Customer Satisfaction | > 4.0/5.0 | Post-interaction survey | High |
| System Availability | > 99% | Uptime monitoring | Critical |
| Error Rate | < 5% | Validation failure tracking | Medium |

## 8.2 Delivery Criteria

- [ ] End-to-end contract flow demonstration
- [ ] RAG inquiry system responding to common questions
- [ ] Complaint classification and routing functional
- [ ] Stable API endpoints during demo
- [ ] Professional UI with bilingual support
- [ ] Documentation complete

## 8.3 Demo Acceptance Criteria

1. **Contract Flow**: User can submit form → receive PDF via email within 2 minutes
2. **Inquiry System**: AI correctly answers 8/10 test questions from FAQ
3. **Reclamation**: Complaints are correctly classified by category and severity
4. **Clause Explanation**: Contract terms are explained in plain language

---

# 9. Technical Architecture

## 9.1 System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  React 18 + TypeScript │ Tailwind CSS │ Shadcn UI │ Vite 5     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼───────────────────────────────────┐
│                        API LAYER                                 │
│  FastAPI │ Pydantic Validation │ Uvicorn ASGI │ CORS           │
└─────────────────────────────┬───────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   DATA LAYER  │    │   AI LAYER    │    │   SERVICES    │
│               │    │               │    │               │
│ MySQL (Aiven) │    │ Claude API    │    │ Email SMTP    │
│ JSON KnowBase │    │ Mistral OCR   │    │ PDF Generator │
└───────────────┘    └───────────────┘    └───────────────┘
```

## 9.2 Frontend Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | React 18 + TypeScript | UI development |
| Build Tool | Vite 5 | Fast development and bundling |
| Styling | Tailwind CSS 3 | Utility-first CSS |
| Components | Shadcn/Radix UI | Accessible component library |
| State | React Query | Async state management |
| Routing | React Router DOM | Client-side navigation |
| i18n | Custom Context | French/English support |

## 9.3 Backend Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Framework | FastAPI | High-performance API |
| ORM | SQLAlchemy 2.0 | Database abstraction |
| Validation | Pydantic v2 | Request/response validation |
| Server | Uvicorn | ASGI server |

## 9.4 Data Layer

| Component | Technology | Purpose |
|-----------|------------|---------|
| Primary DB | MySQL 8.0 (Aiven) | Relational data storage |
| Knowledge Base | JSON files (14) | FAQ, procedures, tariffs |

## 9.5 AI/ML Services

| Service | Provider | Purpose |
|---------|----------|---------|
| LLM | Anthropic Claude | Inquiry handling, clause explanation |
| OCR | Mistral Vision | Document text extraction |
| Classification | Hybrid | Rule-based + LLM fallback |

## 9.6 External Services

| Service | Purpose |
|---------|---------|
| Email (SMTP) | Contract delivery |
| PDF Generator | Contract document creation |

---

# 10. Data Model

## 10.1 Entity Relationship Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Customer   │────<│   Meter     │────<│  Contract   │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id_customer │PK   │ id_meter    │PK   │ id_contract │PK
│ full_name   │     │ id_customer │FK   │ id_customer │FK
│ national_id │UK   │ meter_number│UK   │ id_meter    │FK
│ email       │     │ meter_type  │     │ contract_no │UK
│ phone       │     │ phase_config│     │ customer_type│
│ address     │     │ current_idx │     │ provider    │
│ status      │     │ status      │     │ voltage_level│
│ created_at  │     │ install_date│     │ start_date  │
│ updated_at  │     └─────────────┘     │ status      │
└─────────────┘                         │ contract_data│JSON
       │                                └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│  Complaint  │     │   Tariff    │
├─────────────┤     ├─────────────┤
│ id_complaint│PK   │ id_tariff   │PK
│ complaint_no│UK   │ tariff_name │
│ id_customer │FK   │ customer_type│
│ category    │     │ price_kwh   │
│ severity    │     │ subscription│
│ subject     │     │ start_date  │
│ description │     │ end_date    │
│ status      │     └─────────────┘
│ assigned_to │
│ solutions   │JSON
└─────────────┘
```

## 10.2 Key Relationships

- **Customer (1) → Meter (N)**: One customer can have multiple meters
- **Meter (1) → Contract (N)**: One meter can have multiple contracts over time
- **Customer (1) → Complaint (N)**: One customer can file multiple complaints

## 10.3 Status Enumerations

| Entity | Statuses |
|--------|----------|
| Customer | active, suspended, terminated |
| Meter | active, out_of_service, replaced |
| Contract | active, suspended, terminated |
| Complaint | open, in_progress, resolved, rejected |
| Severity | low, normal, high, urgent |

---

# 11. Knowledge Base

The system maintains a comprehensive knowledge base consisting of 14 structured JSON files:

| File | Content | Purpose |
|------|---------|---------|
| faqs.json | Frequently asked questions | Customer self-service |
| faqs_etendu.json | Extended FAQ coverage | Detailed inquiries |
| tarification.json | Pricing and tariffs | Rate information |
| procedures.json | Service procedures | Process guidance |
| documents_requis.json | Required documents | Submission requirements |
| clauses.json | Contract clauses | Legal terms |
| reglementation.json | Regulations | Compliance info |
| reclamations.json | Complaint handling | Issue resolution |
| fournisseurs.json | Provider information | Contact details |
| conseils_energie.json | Energy tips | Conservation advice |
| modes_paiement.json | Payment methods | Transaction options |
| qualite_service.json | Service quality | SLA standards |
| types_compteurs.json | Meter types | Technical specs |
| contrats_templates.json | Contract templates | Document generation |

---

# 12. Appendix

## 12.1 Glossary

| Term | Definition |
|------|------------|
| CIN | Carte d'Identité Nationale (National ID Card) |
| ONEE | Office National de l'Électricité et de l'Eau Potable |
| RAG | Retrieval-Augmented Generation |
| BT | Basse Tension (Low Voltage) |
| MT | Moyenne Tension (Medium Voltage) |
| HT | Haute Tension (High Voltage) |
| ANRE | Autorité Nationale de Régulation de l'Électricité |
| MAD | Moroccan Dirham |

## 12.2 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Initial | Team | Original PRD |
| 2.0 | Updated | Team | Added technical architecture, AI features, data model |
