# Internal Implementation Plan (2-Day MVP)

**Timeline**: Now → Friday
**Stack**: React/FastAPI + Anthropic Claude + Mistral (optional) + Email configured

---

## Day 1: Contract Generation & Email Delivery

### Morning (4 hours): PDF Contract Generation

**Task 1.1: Create Contract Templates**
- Location: `Backend/templates/contracts/`
- Files to create:
  - `individual_contract.html` - Residential individual
  - `household_contract.html` - Family/household
  - `company_contract.html` - Business/commercial
- Include: Header, customer info placeholders, clauses from `clauses.json`, signature area

**Task 1.2: PDF Generation Service**
- File: `Backend/app/services/pdf_generator.py`
- Dependencies: `weasyprint` or `reportlab`
- Function: `generate_contract_pdf(contract_data, template_type) -> bytes`

**Task 1.3: Add API Endpoint**
- File: `Backend/app/routes.py`
- Endpoint: `GET /api/contracts/{contract_id}/pdf`
- Returns: PDF file download

### Afternoon (4 hours): Email Delivery System

**Task 1.4: Email Service**
- File: `Backend/app/services/email_service.py`
- Functions:
  - `send_contract_email(customer_email, contract_pdf, contract_number)`
  - Include "Sign Contract" CTA button in email body

**Task 1.5: Email Templates**
- Location: `Backend/templates/emails/`
- Files:
  - `contract_delivery.html` - Main contract email
  - Include: Greeting, contract summary, PDF attachment, signature button

**Task 1.6: Add API Endpoint**
- File: `Backend/app/routes.py`
- Endpoint: `POST /api/contracts/{contract_id}/send`
- Action: Generate PDF + Send email

---

## Day 2: AI Features (RAG + Classification + Clause Explanation)

### Morning (4 hours): RAG Inquiry Agent

**Task 2.1: Knowledge Base Indexer**
- File: `Backend/app/services/knowledge_base.py`
- Load and index JSON files:
  - `faqs.json`, `faqs_etendu.json`
  - `procedures.json`
  - `tarification.json`
  - `documents_requis.json`
- Create simple search index (keyword + structure)

**Task 2.2: RAG Service with Claude**
- File: `Backend/app/services/rag_agent.py`
- Dependencies: `anthropic` Python SDK
- Flow:
  1. Receive user question
  2. Search knowledge base for relevant context
  3. Send to Claude with context + question
  4. Return answer with confidence indicator

**Task 2.3: Add API Endpoint**
- File: `Backend/app/routes.py`
- Endpoint: `POST /api/inquiry/ask`
- Body: `{ "question": "...", "language": "fr" }`
- Response: `{ "answer": "...", "confidence": 0.85, "sources": [...] }`

### Afternoon (4 hours): Classification + Clause Explainer

**Task 2.4: Reclamation Classifier**
- File: `Backend/app/services/classifier.py`
- Logic: Keyword-based + Claude fallback
- Categories: billing, technical, connection, service_quality
- Severity: low, normal, high, urgent
- Function: `classify_complaint(subject, description) -> (category, severity)`

**Task 2.5: Clause Explanation Service**
- File: `Backend/app/services/clause_explainer.py`
- Load clauses from `clauses.json`
- Use Claude to explain in plain language
- Function: `explain_clause(clause_id, question?) -> explanation`

**Task 2.6: Add API Endpoints**
- `POST /api/complaints/classify` - Returns category + severity
- `POST /api/contracts/explain-clause` - Returns plain language explanation

---

## Frontend Updates (Parallel or Day 2 Evening)

**Task F1: Inquiry Chat Interface**
- File: `Frontend/src/components/InquiryChat.tsx`
- Simple chat UI for RAG queries
- Display answers with confidence badge

**Task F2: Contract Actions**
- Update confirmation screen to show:
  - "Download Contract PDF" button
  - "Contract sent to email" status

**Task F3: Clause Help**
- Add "?" icons next to contract terms
- On click: Show explanation modal

---

## Dependencies to Install

**Backend (requirements.txt)**:
```
anthropic>=0.18.0
weasyprint>=60.0  # or reportlab
```

---

## Environment Variables Needed

```env
# Backend/.env additions
ANTHROPIC_API_KEY=sk-ant-...
MISTRAL_API_KEY=...  # If using OCR

# Email should already be configured
EMAIL_HOST=...
EMAIL_PORT=...
EMAIL_USER=...
EMAIL_PASSWORD=...
```

---

## Testing Checklist

### Contract Flow
- [ ] Submit new contract form
- [ ] Verify contract saved in DB
- [ ] Download PDF - check formatting
- [ ] Receive email with PDF attached
- [ ] CTA button works in email

### RAG Agent
- [ ] Ask: "Comment souscrire un nouveau contrat?"
- [ ] Verify answer matches FAQs
- [ ] Ask: "Quels sont les tarifs résidentiels?"
- [ ] Verify pricing info returned

### Reclamation
- [ ] Submit billing complaint
- [ ] Verify: category=billing, severity=normal
- [ ] Submit power outage complaint
- [ ] Verify: category=technical, severity=high/urgent

### Clause Explanation
- [ ] Request explanation of termination clause
- [ ] Verify plain-language response
- [ ] Request explanation of pricing clause
- [ ] Verify tariff details included

---

## Demo Script (For Friday)

1. **New Contract Flow** (2 min)
   - Fill form → Submit → Show PDF generated → Email received

2. **Inquiry RAG Demo** (1 min)
   - Ask questions → AI answers from knowledge base

3. **Reclamation Demo** (1 min)
   - Submit complaint → Auto-classified → Routed

4. **Clause Explanation** (30 sec)
   - Click clause → Plain language explanation

---

## Files Summary

| File | Status | Purpose |
|------|--------|---------|
| `Backend/app/services/pdf_generator.py` | Create | PDF generation |
| `Backend/app/services/email_service.py` | Create | Email sending |
| `Backend/app/services/knowledge_base.py` | Create | JSON indexer |
| `Backend/app/services/rag_agent.py` | Create | Claude RAG |
| `Backend/app/services/classifier.py` | Create | Complaint classification |
| `Backend/app/services/clause_explainer.py` | Create | Clause explanation |
| `Backend/app/routes.py` | Modify | Add new endpoints |
| `Backend/templates/` | Create | Email + PDF templates |
| `Frontend/src/components/InquiryChat.tsx` | Create | Chat UI |
