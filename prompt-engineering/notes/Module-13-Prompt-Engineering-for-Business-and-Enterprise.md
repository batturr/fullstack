# MODULE 13: Prompt Engineering for Business and Enterprise

---

## 13.1 Enterprise Use Cases

### Customer Support Automation
```
System prompt for support agent:
"You are a Tier 1 support agent for [Company]. 
- First, classify the issue (billing, technical, account, general)
- Check the knowledge base for a solution
- If found, provide step-by-step instructions
- If not found, collect relevant details and escalate to Tier 2
- Always confirm resolution before closing
- CSAT target: ask 'Did this resolve your issue?' at the end"
```

**Metrics to track**: resolution rate, average handle time, CSAT score, escalation rate.

### Internal Knowledge Base Querying
RAG-powered system for employees to query company knowledge:
```
"Search our internal documentation to answer the employee's question.
Sources: HR policies, IT guides, company handbook, project documentation.
Always cite the specific document and section.
If the policy has changed recently, note the effective date."
```

### Document Processing and Workflow Automation
```
Pipeline: Invoice Processing
1. Receive invoice (PDF/image)
2. Extract: vendor name, invoice number, date, line items, total, tax
3. Validate: check against purchase orders in the system
4. Flag discrepancies: amount mismatches, unknown vendors, duplicate invoices
5. Route: to appropriate approver based on amount and department
6. Output: structured data for ERP system import
```

### Sales Enablement and CRM Integration
```
"Based on this prospect's profile and interaction history:
- Company: [name], Industry: [industry], Size: [employees]
- Previous interactions: [summary]
- Current pain points: [from CRM notes]

Generate:
1. Personalized email outreach (reference their specific challenges)
2. Three discovery questions tailored to their industry
3. Competitive positioning against [likely competitors]
4. ROI estimate based on similar customers in their industry"
```

### HR and Recruitment Assistance
```
"Analyze this resume against the job description:
- Match score (0-100%) with breakdown by skill category
- Matching qualifications (with evidence from resume)
- Missing qualifications
- Potential red flags (gaps, short tenures)
- Suggested interview questions targeting gaps
- Bias check: base assessment ONLY on qualifications, not demographics"
```

### Financial Analysis and Reporting
```
"Analyze this quarterly financial data and generate:
1. Variance analysis (actual vs. budget, actual vs. prior year)
2. Key financial ratios (liquidity, profitability, efficiency)
3. Trend analysis with commentary
4. Risk indicators
5. Executive summary (3-5 sentences)

Rules:
- Use GAAP/IFRS terminology
- All numbers must come from the provided data
- Flag any anomalies or unusual patterns
- Do not make forward-looking statements without labeling them as projections"
```

---

## 13.2 Prompt Templates and Libraries

### Building Reusable Prompt Templates
```python
# Template with variables
SUPPORT_TEMPLATE = """
You are a {brand_name} support agent specializing in {product_line}.

Customer Profile:
- Name: {customer_name}
- Plan: {plan_type}
- Account since: {account_date}

Previous Interactions Summary:
{interaction_history}

Current Issue:
{current_issue}

Instructions:
1. Acknowledge the customer by name
2. Reference relevant account details
3. Provide a solution based on the knowledge base
4. Confirm the issue is resolved

Response:
"""

# Usage
prompt = SUPPORT_TEMPLATE.format(
    brand_name="TechCorp",
    product_line="Cloud Platform",
    customer_name="Sarah",
    plan_type="Enterprise",
    account_date="2023-01-15",
    interaction_history="2 previous tickets, both about billing",
    current_issue="Cannot access admin dashboard after password reset"
)
```

### Variable Substitution and Dynamic Prompts
Go beyond simple string formatting:
```python
def build_prompt(user_query, context):
    # Dynamic sections based on context
    sections = [SYSTEM_PROMPT]
    
    if context.get("user_profile"):
        sections.append(format_user_profile(context["user_profile"]))
    
    if context.get("rag_documents"):
        sections.append(format_documents(context["rag_documents"]))
    
    if context.get("requires_tools"):
        sections.append(format_tool_definitions(context["tools"]))
    
    sections.append(f"User question: {user_query}")
    
    return "\n\n".join(sections)
```

### Template Versioning and Management
```
prompts/
├── customer_support/
│   ├── v1.0_initial.md
│   ├── v1.1_added_escalation.md
│   ├── v2.0_rag_integration.md        ← current production
│   └── v2.1_multi_language.md          ← in testing
├── content_generation/
│   ├── v1.0_blog_post.md
│   └── v1.1_seo_optimized.md
└── data_extraction/
    ├── v1.0_invoice.md
    └── v1.0_resume.md
```

Each template file includes:
```markdown
---
name: Customer Support Agent
version: 2.0
model: gpt-4o-mini
temperature: 0.3
max_tokens: 500
last_updated: 2025-06-15
author: AI Team
status: production
metrics: {accuracy: 94%, csat: 4.2/5}
---

[prompt text here]
```

---

## 13.3 Prompt Operations (PromptOps)

### Prompt Lifecycle Management
```
DEVELOPMENT → TESTING → STAGING → PRODUCTION → MONITORING → RETIREMENT

Development: prompt engineer crafts and tests locally
Testing: automated evaluation against test datasets
Staging: deployed to staging environment with real-like traffic
Production: gradual rollout (canary deployment — 5% → 25% → 50% → 100%)
Monitoring: continuous performance tracking
Retirement: deprecated when replaced by better version
```

### Version Control for Prompts (Git-Based)
```bash
git commit -m "feat(support-prompt): add multi-language support"
git commit -m "fix(extraction-prompt): handle edge case with empty fields"
git commit -m "perf(summary-prompt): reduce token count by 30%"

# Tag stable versions
git tag -a v2.0.0 -m "Production-ready support prompt with RAG"
```

### CI/CD for Prompt Changes
```yaml
# .github/workflows/prompt-ci.yml
name: Prompt Quality Check
on:
  pull_request:
    paths: ['prompts/**']

jobs:
  evaluate:
    steps:
      - name: Run prompt evaluation suite
        run: python evaluate_prompts.py --changed-only
      
      - name: Check accuracy threshold
        run: python check_threshold.py --min-accuracy 0.90
      
      - name: Estimate cost impact
        run: python estimate_cost.py --compare-to production
      
      - name: Post results to PR
        run: python post_results.py
```

### A/B Testing Prompts in Production
```python
def get_prompt_version(user_id):
    # Deterministic assignment based on user ID
    if hash(user_id) % 100 < 50:
        return load_prompt("support_v2.0")  # Control
    else:
        return load_prompt("support_v2.1")  # Treatment

# Track metrics per version
log_metric(prompt_version, "accuracy", response_accuracy)
log_metric(prompt_version, "latency", response_time)
log_metric(prompt_version, "cost", token_cost)
log_metric(prompt_version, "user_satisfaction", csat_score)
```

---

## 13.4 Evaluation and Quality Assurance

### LLM-as-a-Judge
Use a powerful model to evaluate outputs from a production model:

```python
evaluation_prompt = """
Rate the following AI response on a scale of 1-5 for each criterion:

Question: {question}
AI Response: {response}
Reference Answer: {reference}

Criteria:
1. Accuracy (1=completely wrong, 5=perfectly correct)
2. Completeness (1=missing key info, 5=comprehensive)
3. Clarity (1=confusing, 5=crystal clear)
4. Relevance (1=off-topic, 5=directly addresses question)
5. Tone (1=inappropriate, 5=perfectly appropriate)

For each criterion, provide the score and a brief justification.
Then provide an overall score (1-5).

Output as JSON.
"""
```

### Reference-Based Metrics

**BLEU (Bilingual Evaluation Understudy)**: measures n-gram overlap between generated and reference text. Originally for translation. Score 0–1 (higher = more similar to reference).

**ROUGE (Recall-Oriented Understudy for Gisting Evaluation)**: measures recall of n-grams from reference text. Commonly used for summarization. Variants: ROUGE-1 (unigrams), ROUGE-2 (bigrams), ROUGE-L (longest common subsequence).

**BERTScore**: uses BERT embeddings to measure semantic similarity. More nuanced than BLEU/ROUGE — captures meaning beyond exact word overlap.

### Golden Dataset Creation
A golden dataset contains curated question-answer pairs used for evaluation:

```python
golden_dataset = [
    {
        "id": "001",
        "question": "What is our refund policy for enterprise customers?",
        "reference_answer": "Enterprise customers can request a full refund within 30 days...",
        "category": "billing",
        "difficulty": "easy",
        "source_document": "refund_policy_v3.pdf"
    },
    # ... 100-500 examples covering diverse scenarios
]
```

**Best practices**:
- Include easy, medium, and hard examples
- Cover all categories/topics your system handles
- Include edge cases and adversarial examples
- Have domain experts validate reference answers
- Update regularly as products/policies change

### Regression Testing
Before deploying any prompt change, run it against the golden dataset:
```python
def regression_test(new_prompt, golden_dataset, threshold=0.90):
    scores = []
    for example in golden_dataset:
        response = generate(new_prompt, example["question"])
        score = evaluate(response, example["reference_answer"])
        scores.append(score)
    
    avg_score = mean(scores)
    if avg_score < threshold:
        raise Exception(f"Regression! Score {avg_score} below threshold {threshold}")
    return avg_score
```

---

## 13.5 Cost Optimization Strategies

### Model Selection: Balancing Quality vs. Cost
```
GPT-4o:      $2.50/1M input, $10/1M output   — complex reasoning, nuanced tasks
GPT-4o-mini: $0.15/1M input, $0.60/1M output  — most tasks, 15-20x cheaper
Claude Haiku: $0.25/1M input, $1.25/1M output  — fast, simple tasks

Strategy: Route tasks to the cheapest model that meets quality requirements
```

### Tiered Model Routing
```python
def route_to_model(query, complexity_score):
    if complexity_score < 0.3:
        return "gpt-4o-mini"      # Simple: FAQs, classification, formatting
    elif complexity_score < 0.7:
        return "gpt-4o-mini"      # Medium: most tasks
    else:
        return "gpt-4o"           # Complex: reasoning, analysis, creative

# Or use a small classifier to determine complexity
complexity = classify_complexity(query)  # Fast, cheap classification
model = route_to_model(query, complexity)
```

### Caching Strategies
```python
import hashlib

def get_cached_or_generate(prompt, params):
    cache_key = hashlib.md5(f"{prompt}{params}".encode()).hexdigest()
    
    # Check cache
    cached = cache.get(cache_key)
    if cached:
        return cached  # Free!
    
    # Generate and cache
    response = llm.generate(prompt, **params)
    cache.set(cache_key, response, ttl=3600)  # Cache for 1 hour
    return response
```

### Prompt Length Optimization
Every token costs money. Optimize prompts:
```
Before (150 tokens):
"I would really like you to take the following text and create a summary 
of it that captures the main points and key takeaways. The summary should 
be concise and well-organized. Please make it about 3 bullet points long."

After (30 tokens):
"Summarize in 3 bullet points capturing main points and key takeaways:"
```
At scale (1M requests/day), this saves 120M tokens/day = significant cost reduction.

---

## 13.6 Compliance and Governance

### Data Privacy (GDPR, CCPA, HIPAA)
```
GDPR requirements for AI systems:
- Right to explanation: users can ask why an AI made a specific decision
- Data minimization: only send necessary data to the LLM
- Purpose limitation: data used only for the stated purpose
- Storage limitation: don't retain conversation data longer than necessary
- Right to deletion: must be able to delete user's AI interaction data

Implementation:
- Anonymize PII before sending to LLM APIs
- Log prompt/response metadata without content (or with encryption)
- Implement data retention policies for conversation history
- Provide user opt-out mechanisms
```

### PII Handling in Prompts and Outputs
```python
def sanitize_pii(text):
    """Remove PII before sending to LLM"""
    text = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[SSN_REDACTED]', text)  # SSN
    text = re.sub(r'\b\d{16}\b', '[CC_REDACTED]', text)               # Credit card
    text = re.sub(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', 
                  '[EMAIL_REDACTED]', text)                             # Email
    return text

def restore_pii(response, original_text):
    """Restore PII in output if needed (carefully)"""
    # Only restore for authorized internal use
    ...
```

### Audit Trails
Log every AI interaction for compliance:
```python
audit_log = {
    "timestamp": "2025-06-15T14:30:00Z",
    "user_id": "user_123",
    "model": "gpt-4o-mini",
    "prompt_version": "support_v2.0",
    "input_token_count": 450,
    "output_token_count": 200,
    "cost": 0.0003,
    "content_hash": "sha256:abc123...",  # Hash, not content (privacy)
    "safety_flags": [],
    "response_latency_ms": 850,
    "user_feedback": null
}
```

### Prompt Review and Approval Workflows
```
Prompt change lifecycle:
1. Engineer creates/modifies prompt → Pull Request
2. Peer review by another prompt engineer
3. Legal/compliance review (if touching sensitive domains)
4. Automated evaluation against test suite
5. Security review (prompt injection testing)
6. Approval by team lead
7. Staged rollout with monitoring
```

---

> **Key Takeaway for Module 13**: Enterprise prompt engineering is a team sport. It requires version control, testing, monitoring, cost management, and compliance — the same rigor as software engineering. The prompts are your product's intelligence layer, and they deserve the same operational excellence as your code.
