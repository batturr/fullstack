# MODULE 15: Hands-On Projects and Portfolio Building

---

## 15.1 Project 1: AI-Powered Content Generator

### Overview
Build a multi-format content generation system that takes a topic and produces complete, publish-ready content in multiple formats using prompt chaining.

### Architecture
```
User Input (topic, audience, tone, format)
    ↓
[Stage 1: Research] — Generate key points and facts about the topic
    ↓
[Stage 2: Outline] — Create structured outlines for each format
    ↓
[Stage 3: Draft] — Generate full content for each format
    ↓
[Stage 4: Edit] — Review, refine, and polish each piece
    ↓
[Stage 5: SEO/Optimize] — Add metadata, keywords, formatting
    ↓
Output: Blog post, Twitter thread, LinkedIn post, email newsletter, Instagram caption
```

### Implementation Details

**Stage 1 — Research Prompt**:
```
"You are a research analyst. Given the topic '{topic}', identify:
1. The 5 most important aspects or subtopics
2. Key statistics or data points (note: these will need verification)
3. Common misconceptions to address
4. Target audience pain points related to this topic
5. Unique angles that aren't commonly covered

Topic: {topic}
Target audience: {audience}
Output as structured JSON."
```

**Stage 2 — Outline Prompt (per format)**:
```
"Using the research below, create an outline for a {format_type}.

Research: {stage_1_output}

Format specifications:
- Blog post: Introduction with hook, 3-5 sections with H2 headers, conclusion with CTA
- Twitter thread: 7-10 tweets, hook first tweet, value tweets, summary + CTA last
- LinkedIn post: personal hook, 3 insight paragraphs, engagement question
- Email newsletter: subject line, preview text, intro, 3 sections, CTA
- Instagram caption: hook line, body (storytelling), CTA, hashtags"
```

**Stage 3 — Draft Generation**:
```
"Write the full {format_type} following this outline. 
Tone: {tone}. Audience: {audience}.

Outline: {stage_2_output}

Requirements:
- Blog: 1200-1500 words, conversational yet authoritative
- Twitter: each tweet under 280 characters, standalone value per tweet
- LinkedIn: 150-300 words, professional but personable
- Email: 500-700 words, scannable with bold key points
- Instagram: under 2200 characters, emoji-appropriate"
```

**Stage 4 — Edit Prompt**:
```
"Review and improve this {format_type} draft:

{stage_3_output}

Check for:
1. Factual accuracy (flag anything uncertain)
2. Grammar and style
3. Flow and readability (Flesch-Kincaid score target: {level})
4. Engagement hooks
5. Clear call-to-action
6. Appropriate length

Provide the edited version with tracked changes (strikethrough old, bold new)."
```

### Deliverable
A working Python script or Jupyter notebook that takes a topic as input and produces 5+ formatted content pieces, with a simple web interface (Streamlit or Gradio).

---

## 15.2 Project 2: Customer Support Chatbot

### Overview
Design and build a complete customer support chatbot for a fictional product, with RAG-powered knowledge base, sentiment detection, and escalation logic.

### System Prompt Design
```
"You are Alex, a friendly and knowledgeable support agent for CloudSync, 
a cloud storage product.

PERSONALITY:
- Warm and empathetic, but efficient
- Use the customer's name when known
- Match the customer's communication style (formal↔casual)

CAPABILITIES:
- Answer product questions using the knowledge base
- Troubleshoot common issues with step-by-step guides
- Process basic account changes (plan changes, billing inquiries)
- Escalate complex issues to human agents

WORKFLOW:
1. Greet and identify the issue category
2. Search knowledge base for relevant information
3. Provide solution with clear steps
4. If unresolved after 2 attempts, offer escalation
5. Confirm resolution and ask for feedback

RULES:
- Never make up features or pricing not in the knowledge base
- If unsure, say so and offer to connect to a specialist
- Handle angry customers with: acknowledge → empathize → solve → follow up
- Never share internal tools, processes, or other customers' information"
```

### RAG Implementation
```python
# Knowledge base structure
documents = [
    "docs/product_features.md",
    "docs/pricing_plans.md",
    "docs/troubleshooting_guide.md",
    "docs/faq.md",
    "docs/known_issues.md"
]

# Chunk, embed, and store in vector database
# On each user message: retrieve top 3 relevant chunks
# Inject into prompt as context
```

### Sentiment Detection and Response Adaptation
```
"Before responding, assess the customer's emotional state:
- Happy/Satisfied → maintain positive, efficient tone
- Neutral → standard professional tone
- Frustrated → acknowledge frustration first, then solve
- Angry → strong empathy statement, prioritize resolution, offer escalation

Current customer sentiment: [analyze from message]"
```

### Escalation Logic
```
"ESCALATION TRIGGERS:
- Customer explicitly requests a human agent
- Issue cannot be resolved with available knowledge base
- Customer sentiment is 'angry' for 2+ consecutive messages
- Billing dispute over $100
- Technical issue involving data loss

ESCALATION PROCESS:
1. Acknowledge: 'I understand this needs specialized attention.'
2. Summarize: provide a summary of the issue and steps tried
3. Handoff: 'I'm connecting you with [team]. They'll have the full context.'
4. Transfer: include conversation summary for the human agent"
```

### Evaluation Metrics
Build an evaluation suite:
- **Accuracy**: correct answers from knowledge base (target: >90%)
- **Sentiment handling**: appropriate tone adaptation (human-rated)
- **Escalation precision**: correct escalation decisions
- **Conversation length**: average turns to resolution (target: <5)
- **User satisfaction**: simulated CSAT survey

---

## 15.3 Project 3: Document Analysis Pipeline

### Overview
Build an automated system that processes unstructured documents (invoices, contracts, reports) and extracts structured data.

### Pipeline Architecture
```
Document Input (PDF/Image)
    ↓
[Stage 1: Classification]
    "Classify this document as: invoice, contract, report, letter, or other"
    ↓
[Stage 2: Extraction] (template per document type)
    Invoice → extract vendor, items, amounts, dates
    Contract → extract parties, terms, obligations, dates
    Report → extract title, author, key findings, recommendations
    ↓
[Stage 3: Validation]
    Check extracted data for completeness and consistency
    Flag: missing required fields, amount mismatches, date inconsistencies
    ↓
[Stage 4: Output]
    Generate structured JSON/CSV output
    Create human-readable summary
```

### Extraction Prompts (by document type)

**Invoice extraction**:
```
"Extract the following from this invoice image/text:

{
  'vendor': {
    'name': '',
    'address': '',
    'tax_id': ''
  },
  'invoice_number': '',
  'invoice_date': 'YYYY-MM-DD',
  'due_date': 'YYYY-MM-DD',
  'line_items': [
    {'description': '', 'quantity': 0, 'unit_price': 0.00, 'total': 0.00}
  ],
  'subtotal': 0.00,
  'tax': 0.00,
  'total': 0.00,
  'payment_terms': '',
  'currency': 'USD'
}

Rules:
- Use null for fields not found in the document
- All monetary values as numbers with 2 decimal places
- Dates in ISO 8601 format
- Verify: sum of line_item totals should equal subtotal"
```

### Deliverable
A Streamlit/Gradio app where users upload documents and receive structured extractions with confidence scores.

---

## 15.4 Project 4: Multi-Agent Research Assistant

### Overview
Design a team of AI agents that collaboratively research a topic and produce a comprehensive report.

### Agent Roles
```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Lead Researcher",
    goal="Gather comprehensive, accurate information from multiple sources",
    tools=[web_search, arxiv_search, wikipedia],
    backstory="PhD researcher with expertise in synthesizing complex information"
)

analyst = Agent(
    role="Data Analyst", 
    goal="Analyze data, identify patterns, and draw evidence-based conclusions",
    tools=[calculator, code_interpreter],
    backstory="Senior analyst skilled at finding insights in complex datasets"
)

writer = Agent(
    role="Technical Writer",
    goal="Write clear, engaging, well-structured reports",
    tools=[],
    backstory="Award-winning science writer who makes complex topics accessible"
)

editor = Agent(
    role="Editor & Fact-Checker",
    goal="Ensure accuracy, clarity, and completeness of the final report",
    tools=[web_search],
    backstory="Meticulous editor who catches errors and strengthens arguments"
)
```

### Task Flow
```
1. Researcher: "Research the current state of {topic}. Find key developments, 
   statistics, expert opinions, and recent papers."
   → Output: raw research with sources

2. Analyst: "Analyze the research findings. Identify trends, compare viewpoints, 
   and assess the strength of evidence."
   → Output: analytical summary with insights

3. Writer: "Write a comprehensive 2000-word report based on the research and analysis.
   Structure: Executive Summary, Background, Key Findings, Analysis, Implications, 
   Conclusion. Include citations."
   → Output: draft report

4. Editor: "Review and improve the report. Check facts against original sources, 
   improve clarity, fix errors, strengthen weak arguments."
   → Output: final polished report with citations
```

---

## 15.5 Project 5: Multimodal Creative Studio

### Overview
Build a creative content pipeline that generates consistent visual and textual content for a fictional brand.

### Tasks
1. **Brand identity**: create a brand description that guides all generation
2. **Image generation**: create a series of brand-consistent images using DALL-E 3
3. **Image analysis**: analyze generated images and suggest improvements
4. **Content pairing**: write copy that matches each generated image
5. **Style guide**: document the prompt patterns that produce consistent results

### Prompt for Brand Consistency
```
"Brand: EcoBloom — a sustainable home gardening company.

Visual style guide:
- Color palette: sage green, warm cream, terracotta, soft gold
- Photography style: natural light, soft focus, warm tones
- Composition: clean, minimal, with lots of negative space
- Mood: calm, nurturing, aspirational but achievable
- Always include: plants/greenery, natural materials, human hands (when relevant)
- Never include: plastic, artificial lighting, cluttered spaces

Generate an image of: {specific_scene}"
```

---

## 15.6 Project 6: Enterprise Prompt Library

### Overview
Design a comprehensive prompt management system for a fictional company with 10+ documented business use cases.

### Structure
```
prompt-library/
├── README.md                    # Overview, how to use, contribution guidelines
├── templates/
│   ├── customer-support/
│   │   ├── general-inquiry.md   # Template + metadata + examples
│   │   ├── billing-issue.md
│   │   ├── technical-support.md
│   │   └── escalation.md
│   ├── content-creation/
│   │   ├── blog-post.md
│   │   ├── social-media.md
│   │   └── email-campaign.md
│   ├── data-processing/
│   │   ├── invoice-extraction.md
│   │   ├── report-summary.md
│   │   └── data-classification.md
│   └── internal-tools/
│       ├── meeting-notes.md
│       ├── code-review.md
│       └── onboarding-guide.md
├── evaluation/
│   ├── test-datasets/           # Golden datasets per template
│   ├── rubrics/                 # Evaluation criteria per template
│   └── results/                 # Historical evaluation results
├── docs/
│   ├── prompt-writing-guide.md  # Internal best practices
│   ├── model-selection.md       # When to use which model
│   └── cost-optimization.md     # Cost management guidelines
└── scripts/
    ├── evaluate.py              # Automated evaluation
    ├── cost_estimate.py         # Cost estimation tool
    └── template_validator.py    # Schema validation
```

### Template Documentation Standard
Each template includes:
```markdown
---
name: Customer Support - Billing Issue
version: 2.1
model: gpt-4o-mini
temperature: 0.3
max_tokens: 500
estimated_cost_per_call: $0.0004
author: AI Team
last_tested: 2025-06-01
accuracy: 93.5%
---

## Purpose
Handle customer billing inquiries including refunds, charges, and plan changes.

## Template
[full prompt template with variables]

## Variables
| Variable | Type | Required | Description |
|----------|------|----------|-------------|
| customer_name | string | yes | Customer's first name |
| plan_type | enum | yes | free, pro, enterprise |
| issue_description | string | yes | Customer's reported issue |

## Examples
### Example 1: Refund Request
Input: [example input]
Expected Output: [example output]

### Example 2: Billing Error
Input: [example input]
Expected Output: [example output]

## Known Limitations
- Cannot process refunds over $500 without human approval
- May not handle multi-currency scenarios correctly

## Changelog
- v2.1 (2025-06-01): Added escalation logic for disputes over $500
- v2.0 (2025-04-15): Integrated RAG for knowledge base lookup
- v1.0 (2025-01-10): Initial version
```

---

> **Key Takeaway for Module 15**: Projects transform knowledge into skill. Each project exercises different prompt engineering muscles — chaining, RAG, agents, multimodal, and enterprise operations. The deliverables double as portfolio pieces that demonstrate real-world capability to employers or clients. Document everything — the prompts, the iterations, the evaluation results, and the lessons learned.
