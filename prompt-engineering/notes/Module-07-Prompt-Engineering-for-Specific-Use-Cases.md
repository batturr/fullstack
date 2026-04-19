# MODULE 7: Prompt Engineering for Specific Use Cases

---

## 7.1 Text Summarization

### Extractive vs. Abstractive Summarization
**Extractive**: selects and combines the most important sentences directly from the source text. No new words are generated — it's a "highlight and copy" approach.

**Abstractive**: generates new text that captures the meaning of the original. The summary may use different words and sentence structures. This is what LLMs naturally do.

Most LLM-based summarization is abstractive, but you can request extractive behavior:
```
Extractive: "Select the 5 most important sentences from this article. 
Quote them exactly as they appear."

Abstractive: "Summarize this article in your own words in 3-5 sentences."
```

### Controlling Summary Length
```
Word count:    "Summarize in exactly 50 words."
Sentence count: "Summarize in exactly 3 sentences."
Bullet points:  "Summarize as 5 bullet points, each under 15 words."
Paragraph:      "Write a one-paragraph summary (100-150 words)."
Ratio:          "Reduce this 2000-word article to approximately 10% of its length."
```

### Focus-Specific Summarization
Direct the summary toward specific aspects:
```
"Summarize this meeting transcript focusing ONLY on action items and deadlines."
"Summarize this research paper, focusing on methodology and results. Ignore the literature review."
"Summarize this financial report, highlighting revenue trends and risk factors."
```

### Multi-Document Summarization
When summarizing multiple sources:
```
"Below are 5 articles about [topic]. Read all of them and produce a single 
unified summary that:
1. Identifies points of agreement across articles
2. Highlights contradictions or differing perspectives
3. Notes any unique insights from individual articles
4. Is organized by theme, not by source"
```

### Progressive Summarization for Very Long Documents
For documents exceeding the context window:
```
Step 1: Split document into sections
Step 2: Summarize each section independently
Step 3: Combine section summaries into a master summary
Step 4: Refine the master summary for coherence
```

### Prompt Templates

**Executive summary**:
```
Write an executive summary of the following report for C-suite leadership.
Focus on: key findings, business impact, and recommended actions.
Use bullet points. Keep under 200 words. Avoid technical jargon.
```

**Technical abstract**:
```
Write a technical abstract for this research. Include: objective, methodology, 
key findings, and significance. Use formal academic tone. 150-250 words.
```

**Meeting minutes extraction**:
```
Extract meeting minutes from this transcript:
- Attendees
- Key decisions made
- Action items (with owner and deadline)
- Open questions
- Next meeting date (if mentioned)
Format as a structured document.
```

---

## 7.2 Content Writing and Copywriting

### Blog Post Generation with Outlines
```
Step 1 prompt:
"Create a detailed outline for a blog post about [topic]. 
Target audience: [audience]. Include: introduction hook, 3-5 main sections 
with sub-points, and a conclusion with CTA."

Step 2 prompt:
"Write the full blog post following this outline. Target 1500 words.
Tone: [professional/casual/conversational]. Include relevant examples and data points."
```

### SEO-Optimized Content Prompting
```
"Write a blog post about [topic] optimized for SEO.
Primary keyword: [keyword] — use it in the title, first paragraph, at least 
2 subheadings, and naturally throughout (2-3% density).
Secondary keywords: [keyword2, keyword3] — use each at least twice.
Include: meta title (under 60 characters), meta description (under 160 characters).
Use H2 and H3 subheadings. Include internal link suggestions.
Write for featured snippet potential (include a definition paragraph and a how-to list)."
```

### Tone and Voice Control
```
Formal:      "Write in a formal, authoritative tone suitable for a Harvard Business Review article."
Casual:      "Write like you're chatting with a friend over coffee. Use contractions and informal language."
Persuasive:  "Write with conviction. Use power words. Appeal to emotions and logic. Include a strong CTA."
Humorous:    "Write with wit and humor. Use clever analogies and light sarcasm. Keep it entertaining but informative."
Empathetic:  "Write with warmth and understanding. Acknowledge the reader's challenges. Be supportive."
```

### Brand Voice Consistency
```
"You are writing as [Brand Name]. Our brand voice is:
- Confident but not arrogant
- Simple but not simplistic
- Warm but professional
- We use 'you' and 'we' (never 'one' or 'the user')
- We avoid: jargon, buzzwords, passive voice, exclamation marks
- Our tagline energy: [tagline example]
Reference brand voice guide: [key phrases and examples]"
```

### Email Writing Templates
```
Professional: "Write a professional email to [recipient] regarding [topic]. 
Be concise, clear, and actionable. Include a specific ask and suggested next step."

Sales: "Write a cold outreach email for [product] targeting [persona]. 
Hook with a pain point, present the value proposition in 2 sentences, 
include social proof, and end with a low-friction CTA."

Support: "Write a customer support response to: '[complaint]'. 
Acknowledge the issue, apologize, explain the solution, and offer compensation if appropriate."
```

### Social Media Content Generation
```
"Create a Twitter/X thread (5-7 tweets) about [topic].
- First tweet: hook that stops the scroll (question or bold statement)
- Middle tweets: key insights with specific data or examples
- Last tweet: summary + CTA
- Use short sentences. One idea per tweet. No hashtags in the first tweet."

"Write an Instagram caption for [image description].
- Hook in first line (appears before 'more')
- Body: storytelling or value
- CTA: question or action
- 5-10 relevant hashtags at the end"

"Write a LinkedIn post about [topic] for a [professional role].
- Open with a personal story or counterintuitive insight
- Break into short paragraphs (1-2 sentences each)
- End with a thought-provoking question
- Professional but personable tone"
```

---

## 7.3 Code Generation and Software Development

### Writing Code from Natural Language Descriptions
```
"Write a Python function that takes a list of dictionaries containing 'name' 
and 'score' keys, filters out entries with scores below 70, sorts the remaining 
by score in descending order, and returns the top 5 names.

Requirements:
- Use type hints
- Handle empty lists gracefully
- Include a docstring
- Time complexity should be O(n log n) or better"
```

### Code Explanation and Documentation Generation
```
"Explain what this code does, line by line, for a junior developer:
[code block]

Then write:
1. A docstring for the function
2. Inline comments for complex logic
3. A usage example with expected output"
```

### Debugging Assistance Prompts
```
"I'm getting this error:
[error message]

Here's the relevant code:
[code block]

Here's what I've already tried:
[attempted solutions]

Please:
1. Explain what's causing the error
2. Provide the fixed code
3. Explain why the fix works
4. Suggest how to prevent similar bugs"
```

### Code Review and Refactoring
```
"Review this code for:
1. Bugs and logic errors
2. Security vulnerabilities (SQL injection, XSS, etc.)
3. Performance issues
4. Code style and readability
5. Missing error handling

For each issue found, explain the problem and provide the corrected code.
Prioritize issues by severity (Critical, High, Medium, Low).

[code block]"
```

### Test Case Generation
```
"Generate comprehensive unit tests for this function using pytest:
[function code]

Include:
- Happy path tests (normal inputs)
- Edge cases (empty input, single element, very large input)
- Error cases (invalid types, None, out of range)
- Boundary conditions
- Use parametrize for multiple test cases where appropriate"
```

### Prompt Patterns for Pair Programming
```
"Act as my pair programming partner. I'm working on [feature].
- When I share code, suggest improvements but don't rewrite everything
- Ask clarifying questions about requirements when uncertain
- Point out potential edge cases I might miss
- Suggest design patterns when appropriate
- Keep explanations brief unless I ask for detail"
```

---

## 7.4 Data Analysis and Extraction

### Structured Data Extraction from Unstructured Text
```
"Extract the following information from each resume below.
Return as a JSON array of objects.

Fields to extract:
- name (string)
- email (string)
- phone (string, format: +1-XXX-XXX-XXXX)
- years_of_experience (integer)
- skills (array of strings)
- education (array of objects: {degree, institution, year})
- current_role (string)

If a field is not found, use null. Do not guess or infer missing data.

Resumes:
[text]"
```

### JSON/CSV/XML Output Formatting
```
JSON: "Return the data as a valid JSON object. Ensure all strings are properly 
escaped and the JSON is parseable by standard JSON parsers."

CSV: "Return the data as CSV with headers in the first row. Use commas as delimiters. 
Escape any commas within fields using double quotes."

XML: "Return the data as well-formed XML with the root element <records> 
and each item as a <record> element."
```

### SQL Query Generation from Natural Language
```
"Given this database schema:
- users (id, name, email, created_at, plan_type)
- orders (id, user_id, amount, status, created_at)
- products (id, name, category, price)
- order_items (order_id, product_id, quantity)

Write a SQL query to: Find the top 10 customers by total spend in the last 
90 days who are on the 'premium' plan, along with their most purchased product category.

Use PostgreSQL syntax. Include appropriate JOINs and GROUP BY clauses."
```

### Regex Pattern Generation
```
"Generate a regular expression that matches:
- US phone numbers in formats: (555) 123-4567, 555-123-4567, 5551234567, +1-555-123-4567
- Should capture area code, exchange, and subscriber number as separate groups
- Should NOT match numbers with invalid area codes (starting with 0 or 1)

Provide: the regex, an explanation of each part, and 5 test cases (3 matches, 2 non-matches)."
```

---

## 7.5 Translation and Localization

### Language Translation with Nuance Preservation
```
"Translate the following from English to Spanish (Latin American).
Preserve the emotional tone, humor, and cultural references.
If a phrase has no direct equivalent, provide the closest cultural equivalent 
and add a translator's note in [brackets].

Text: [content]"
```

### Cultural Adaptation and Localization
```
"Localize this marketing copy for the Japanese market:
- Adapt cultural references to Japanese equivalents
- Adjust formality level (use keigo/polite form)
- Convert measurements to metric
- Adapt date formats to YYYY/MM/DD
- Consider Japanese reading patterns (may need shorter paragraphs)
- Flag any content that might be culturally inappropriate

Original: [content]"
```

### Idiomatic Expression Handling
```
"Translate these English idioms into natural French equivalents.
Do NOT translate literally — provide the French idiom that conveys the same meaning.
Include: literal translation, French equivalent, and explanation.

1. 'Break a leg'
2. 'It's raining cats and dogs'
3. 'The ball is in your court'"
```

---

## 7.6 Education and Tutoring

### Socratic Method Prompting
```
"You are a Socratic tutor. NEVER give the student the answer directly.
Instead:
1. Ask probing questions that guide them to discover the answer
2. If they're stuck, give a hint (not the answer)
3. If they give a wrong answer, ask them to reconsider a specific part
4. Celebrate when they arrive at the correct understanding
5. After they solve it, ask them to explain why it works

Student's question: [question]"
```

### Adaptive Difficulty Levels
```
"Explain [concept] at the following levels:

Level 1 - ELI5 (Explain Like I'm 5):
[Use simple words, everyday analogies, no technical terms]

Level 2 - High School:
[Include basic technical terms, relatable examples, some detail]

Level 3 - Undergraduate:
[Proper terminology, mathematical formulas where needed, theoretical context]

Level 4 - Graduate/Expert:
[Full technical depth, edge cases, research implications, formal notation]"
```

### Quiz and Assessment Generation
```
"Create a comprehensive quiz on [topic] for [level] students.

Include:
- 5 multiple-choice questions (with 4 options each, one correct)
- 3 true/false questions
- 2 short-answer questions
- 1 essay question

For each question, provide:
- The correct answer
- An explanation of why it's correct
- Common misconceptions students might have
- The learning objective it tests

Difficulty distribution: 30% easy, 50% medium, 20% hard"
```

---

## 7.7 Research and Analysis

### Literature Review Assistance
```
"I'm researching [topic]. Based on the abstracts/summaries below, create a 
literature review section that:
1. Groups papers by sub-theme
2. Identifies areas of consensus and disagreement
3. Highlights methodological approaches used
4. Identifies gaps in existing research
5. Uses proper academic citation style (Author, Year)

Papers: [abstracts]"
```

### SWOT Analysis Generation
```
"Conduct a SWOT analysis for [company/product/strategy]:

Strengths: internal positive factors
Weaknesses: internal negative factors  
Opportunities: external positive factors
Threats: external negative factors

For each category, list 4-6 specific, actionable points.
Support each point with a brief rationale.
Conclude with strategic recommendations based on the analysis."
```

### Market Research and Competitor Analysis
```
"Analyze the competitive landscape for [product category].
Based on your knowledge, provide:
1. Top 5 competitors with brief descriptions
2. Feature comparison table
3. Pricing comparison
4. Market positioning map (describe axes and placements)
5. Competitive advantages and vulnerabilities for each
6. White space opportunities"
```

---

## 7.8 Creative Applications

### Fiction Writing
```
"Write a short story (1000 words) with these parameters:
- Genre: [science fiction / mystery / literary fiction]
- Setting: [description]
- Main character: [brief description]
- Central conflict: [description]
- Tone: [dark / humorous / contemplative]
- Narrative style: [first person / third person limited / omniscient]
- Ending: [resolved / ambiguous / twist]

Show, don't tell. Use sensory details. Include dialogue."
```

### Poetry Generation
```
"Write a sonnet (Shakespearean form) about [topic].
Requirements:
- 14 lines in iambic pentameter
- Rhyme scheme: ABAB CDCD EFEF GG
- Volta (thematic shift) at line 9
- Use at least one extended metaphor
- Avoid clichés"
```

### Worldbuilding and Character Development
```
"Create a detailed character profile:
- Full name, age, background
- Physical description (distinctive features, mannerisms)
- Personality (strengths, flaws, contradictions)
- Motivation (what they want, what they need, what they fear)
- Voice (how they speak — vocabulary, cadence, catchphrases)
- Backstory (formative events)
- Character arc (how they change through the story)
- Relationships with other characters"
```

---

## 7.9 Legal and Compliance

### Contract Analysis and Summarization
```
"Analyze this contract and provide:
1. Plain-language summary of key terms
2. Obligations for each party
3. Payment terms and conditions
4. Termination clauses and penalties
5. Liability and indemnification provisions
6. Potential risks or unfavorable terms (flagged in bold)
7. Missing standard clauses that should be present

DISCLAIMER: This is for informational purposes only and does not constitute legal advice.

Contract text: [contract]"
```

### Compliance Checking Prompts
```
"Review this [document type] against [regulation name] requirements.
For each requirement:
- Status: Compliant / Non-Compliant / Partially Compliant / Not Applicable
- Evidence: quote the relevant section
- Gap: describe what's missing (if non-compliant)
- Recommendation: specific action to achieve compliance"
```

---

## 7.10 Healthcare and Medical

### Medical Information Summarization
```
"Summarize this medical research paper for a patient-friendly audience.

Rules:
- Use plain language (8th-grade reading level)
- Define all medical terms when first used
- Focus on what it means for patients
- Include a 'Key Takeaways' section with 3-5 bullet points
- Add disclaimer: 'This summary is for educational purposes only. 
  Consult your healthcare provider for medical advice.'

Paper: [text]"
```

### Clinical Note Structuring
```
"Structure this unstructured clinical note into SOAP format:

S (Subjective): Patient's reported symptoms and history
O (Objective): Measurable findings, test results, vitals
A (Assessment): Diagnosis or clinical impression
P (Plan): Treatment plan, medications, follow-up

Unstructured note: [text]"
```

### HIPAA-Aware Prompt Design
```
System prompt for healthcare AI:
"CRITICAL PRIVACY RULES:
- Never store, repeat, or reference patient identifiers (names, DOBs, SSNs, MRNs)
- If a user provides PHI, remind them not to share protected health information
- All medical information is general — never provide personalized medical advice
- Always recommend consulting a healthcare provider
- Do not attempt diagnosis
- Comply with HIPAA minimum necessary standard"
```

---

> **Key Takeaway for Module 7**: Different use cases require different prompting strategies. Summarization needs length and focus control. Code generation needs specification precision. Creative tasks need constraints that inspire rather than limit. Legal and medical use cases demand disclaimers and safety guardrails. Master the patterns for your domain, and always test with real-world examples.
