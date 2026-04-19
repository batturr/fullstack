# MODULE 4: Core Prompting Techniques

---

## 4.1 Zero-Shot Prompting

### Definition
Zero-shot prompting is asking the model to perform a task **without providing any examples**. You rely entirely on the model's pre-trained knowledge and its ability to understand your instruction.

The term comes from "zero-shot learning" in machine learning — generalizing to tasks never explicitly seen during training.

### When Zero-Shot Works Well vs. When It Fails

**Works well when**:
- The task is common and well-represented in training data (summarization, translation, sentiment analysis)
- Instructions are clear and unambiguous
- The model is large enough (GPT-4, Claude 3 Sonnet/Opus, Gemini Pro)
- Output format is simple (yes/no, short text, single classification)

**Fails when**:
- The task is highly specialized or domain-specific
- The desired output format is complex or unconventional
- The task requires a specific style not easily described
- The model is small (7B parameters) and the task is nuanced

### Crafting Effective Zero-Shot Prompts
The key to zero-shot success is **instruction precision**. Since there are no examples to demonstrate what you want, your words must do all the heavy lifting.

**Framework for zero-shot prompts**:
1. State the task clearly (what action to perform)
2. Specify the input (what to process)
3. Define the output (format, length, style)
4. Add constraints (what to include, what to avoid)

### The Role of Instruction Clarity in Zero-Shot Performance
Research shows that even small changes in zero-shot instructions cause large performance swings:

```
Weak:   "What sentiment is this?"
Better: "Classify the sentiment of the following text as Positive, Negative, or Neutral."
Best:   "Classify the sentiment of the following text. Respond with exactly one word: 
         Positive, Negative, or Neutral. Text: {input}"
```

The best version constrains the output format, lists valid options, and makes the task unambiguous.

### Examples

**Text classification without examples**:
```
Classify the following news headline into one of these categories:
Politics, Technology, Sports, Entertainment, Business, Science.

Respond with only the category name.

Headline: "SpaceX Successfully Launches 60 More Starlink Satellites"
```
→ Output: Technology (or Science)

**Sentiment analysis with a single instruction**:
```
Analyze the sentiment of the following product review. 
Rate it on a scale of 1-5 where 1 is very negative and 5 is very positive.
Respond with only the number.

Review: "The build quality is decent but the battery dies within 3 hours. Not worth the price."
```
→ Output: 2

**Translation with zero-shot**:
```
Translate the following English text to formal Japanese. 
Maintain the polite/respectful register.

Text: "Thank you for your continued support. We look forward to our meeting next week."
```

### Strengths and Limitations Analysis

| Strengths | Limitations |
|-----------|------------|
| Simplest to implement | Lower accuracy on complex tasks |
| Minimal prompt tokens (lower cost) | Output format less predictable |
| No example selection needed | Sensitive to instruction wording |
| Works well with powerful models | May not match specific style/format requirements |
| Quick to prototype | Smaller models struggle |

---

## 4.2 One-Shot Prompting

### Definition
One-shot prompting provides **exactly one example** of the desired input-output behavior before asking the model to perform the task on new input. This single demonstration helps the model understand the expected format, style, and logic.

### Selecting the Optimal Example
Your one example carries enormous weight — it's the model's only reference point. Choose wisely:

- **Representative**: pick an example that represents the typical case, not an edge case
- **Clear**: the example should have an unambiguous input-output relationship
- **Similar complexity**: match the complexity of your actual task
- **Diverse enough**: if possible, choose an example that demonstrates the most important aspects of the task

### Formatting the Example Clearly
Use consistent formatting to separate the example from the actual task:

```
Task: Extract the company name and founding year from the text.

Example:
Text: "Google was founded by Larry Page and Sergey Brin in September 1998 while they were students at Stanford."
Output: {"company": "Google", "founding_year": 1998}

Now extract from this text:
Text: "Tesla, Inc. was incorporated in July 2003 by Martin Eberhard and Marc Tarpenning."
Output:
```

### Examples

**Entity extraction with one example**:
```
Extract all monetary amounts from the text and list them.

Example:
Text: "The project cost $1.5 million and the annual maintenance is $200,000."
Amounts: $1.5 million, $200,000

Text: "Revenue grew from €50 billion to €62 billion, while expenses were held at €45 billion."
Amounts:
```

**Code generation with one example**:
```
Convert the following English description into a Python function.

Example:
Description: "Check if a number is even"
Code:
def is_even(n):
    return n % 2 == 0

Description: "Find the largest element in a list"
Code:
```

**Style transfer with one example**:
```
Rewrite the technical text in simple language for a general audience.

Example:
Technical: "The TCP three-way handshake involves SYN, SYN-ACK, and ACK packets to establish a reliable connection."
Simple: "When two computers want to talk, they do a quick three-step greeting to make sure they're both ready and listening."

Technical: "Photosynthesis converts carbon dioxide and water into glucose using light energy, releasing oxygen as a byproduct."
Simple:
```

### When One-Shot Outperforms Zero-Shot
- When the output format is unusual or complex (JSON, specific table formats)
- When the task requires a specific style not easily described in words
- When the model needs to understand the level of detail expected
- When working with smaller models that need more guidance
- When the task involves domain-specific conventions

---

## 4.3 Few-Shot Prompting

### Definition
Few-shot prompting provides **2–10 examples** of desired input-output behavior. This is one of the most powerful and widely used prompting techniques, discovered to be remarkably effective by the GPT-3 paper (Brown et al., 2020).

The model uses the examples to perform **in-context learning** — recognizing the pattern and applying it to new inputs without any parameter updates.

### Selecting Diverse and Representative Examples
Your examples should collectively cover the space of possible inputs:

**For classification tasks**:
- Include at least one example per class
- Cover both typical and boundary cases
- Balance the number of examples per class

**For generation tasks**:
- Show different input types the model will encounter
- Demonstrate the desired output style and detail level
- Include edge cases if relevant

**Bad example selection**: All examples are positive sentiment → model biased toward positive
**Good example selection**: Mix of positive, negative, and neutral with clear variety

### Example Ordering Effects on Output Quality
Research has shown that the **order** of few-shot examples matters:

- **Recency bias**: models tend to weight the last example more heavily
- **Primacy effect**: the first example sets expectations
- **Best practice**: put your most representative example last (closest to the actual task input)
- **For classification**: avoid putting all examples of one class together — interleave them

### Formatting Guidelines for Few-Shot Prompts
```
[INSTRUCTION — what task to perform]

[EXAMPLE 1]
Input: [example input 1]
Output: [example output 1]

[EXAMPLE 2]
Input: [example input 2]
Output: [example output 2]

[EXAMPLE 3]
Input: [example input 3]
Output: [example output 3]

[ACTUAL TASK]
Input: [actual input]
Output:
```

Key formatting rules:
- Use consistent separators between examples
- Label input and output clearly
- Use the exact same format for the actual task as for examples
- Add a blank line between examples for readability

### Examples

**Multi-class classification with few-shot**:
```
Classify each customer inquiry into one of these categories:
Billing, Technical Support, Account Management, Product Inquiry, Complaint.

Inquiry: "I was charged twice for my subscription last month"
Category: Billing

Inquiry: "My app keeps crashing when I try to upload photos"
Category: Technical Support

Inquiry: "I'd like to upgrade my plan to the enterprise tier"
Category: Account Management

Inquiry: "Do you offer a 14-day free trial?"
Category: Product Inquiry

Inquiry: "Your service has been unreliable for weeks and I'm very frustrated"
Category: Complaint

Inquiry: "How do I reset my password? The reset email never arrives."
Category:
```

**Structured data extraction with few-shot**:
```
Extract structured event information from the text.

Text: "Join us for the Annual Tech Summit on March 15, 2026 at the Convention Center in San Francisco. Registration is $299."
Event: {"name": "Annual Tech Summit", "date": "2026-03-15", "location": "Convention Center, San Francisco", "price": "$299"}

Text: "Free webinar: Introduction to Machine Learning, happening December 1st, 2025 at 2pm EST. Register online."
Event: {"name": "Introduction to Machine Learning", "date": "2025-12-01", "location": "Online (Webinar)", "price": "Free"}

Text: "The Global AI Conference returns to London on July 8-10, 2026. Early bird tickets start at £450."
Event:
```

**Creative writing style matching**:
```
Write product descriptions in a playful, enthusiastic tone.

Product: Wireless earbuds with noise cancellation
Description: "Say goodbye to the outside world (when you want to)! These little audio wizards block out everything from chatty coworkers to crying babies, delivering pure sonic bliss straight to your ears. Your new favorite escape pod."

Product: Stainless steel water bottle
Description: "Meet your hydration hero! This sleek, planet-friendly bottle keeps your water ice-cold for 24 hours and your tea toasty for 12. It's basically a thermos that went to fashion school."

Product: Ergonomic standing desk
Description:
```

### Optimal Number of Examples: Diminishing Returns Analysis
Research findings:
- **1–3 examples**: largest marginal improvement over zero-shot
- **3–5 examples**: continued improvement, especially for complex tasks
- **5–10 examples**: diminishing returns — marginal gains decrease
- **10+ examples**: rarely justified — more examples consume context tokens without proportional quality improvement
- **Exception**: very complex or nuanced tasks may benefit from more examples

The optimal number depends on:
- Task complexity (complex tasks → more examples)
- Model capability (smaller models → more examples needed)
- Example quality (high-quality examples → fewer needed)
- Context window budget (more examples = fewer tokens for actual task)

### Common Pitfalls

**Example bias**: If all your examples share a common trait unrelated to the task, the model will learn that trait.
- Example: All positive examples are about food, all negative about electronics → model associates food with positive sentiment

**Overfitting to examples**: The model mimics superficial patterns from examples.
- Example: All example outputs start with "In conclusion..." → model always starts with "In conclusion..."

**Inconsistent formatting**: Different formats across examples confuse the model.
- Fix: Use identical formatting for every example

**Too many easy examples**: All examples are obvious → model can't handle hard cases.
- Fix: Include some challenging or borderline examples

---

## 4.4 Instruction-Based Prompting

### Writing Clear, Actionable Instructions
The most fundamental technique: tell the model exactly what to do.

**Principles**:
1. **Start with an action verb**: Summarize, Extract, Classify, Translate, Compare, Generate, Rewrite, List
2. **Be specific about the action**: not just "write" but "write a persuasive 3-paragraph essay"
3. **Specify the scope**: what to include and what to exclude
4. **Define done**: what does a complete response look like?

### Step-by-Step Task Decomposition in Instructions
For complex tasks, break the instruction into numbered steps:

```
Analyze the following customer feedback data:

Step 1: Identify the top 5 most frequently mentioned topics.
Step 2: For each topic, determine whether the overall sentiment is positive, negative, or mixed.
Step 3: Find 2 representative quotes for each topic.
Step 4: Suggest 3 actionable improvements based on the negative feedback.
Step 5: Present your findings in a structured table.

Feedback data:
[data here]
```

This technique dramatically improves output quality because:
- Each step is simple enough for the model to handle reliably
- The model doesn't need to figure out the workflow itself
- It reduces the chance of skipping important parts
- The output is naturally structured

### Specifying Do's and Don'ts Explicitly
Models respond well to explicit boundaries:

```
DO:
- Use specific numbers and data from the provided text
- Maintain a professional tone
- Include a brief conclusion

DO NOT:
- Make up statistics or facts not present in the text
- Use casual language or slang
- Exceed 500 words
- Include personal opinions
```

**Why don'ts matter**: Without explicit prohibitions, models may default to behaviors you didn't want (adding disclaimers, being overly verbose, speculating beyond the data).

### Using Imperative vs. Declarative Instructions

**Imperative** (commands — most effective):
```
Summarize this article in 3 bullet points.
Extract all names from the following text.
Translate to French.
```

**Declarative** (descriptions — less direct):
```
The following article should be summarized in 3 bullet points.
Names need to be extracted from the text below.
This text is to be translated to French.
```

**Research finding**: Imperative instructions generally produce more consistent and accurate results because they clearly tell the model what action to take.

### Examples of Effective Instruction Prompts

**Precision summarization**:
```
Summarize the following text in exactly 3 bullet points.
Each bullet must be a single sentence under 25 words.
Focus only on the main arguments, not supporting details.

Text: [article here]
```

**Tone-controlled rewriting**:
```
Rewrite this email in a professional tone. 
Do not change the core message or any factual information.
Keep the same paragraph structure but improve the language.

Original email: "hey, the project's gonna be late cuz the devs are stuck on a bug. 
probably need another week or so. lmk if thats cool."
```

**Structured extraction**:
```
Extract all dates mentioned in the following passage.
Return them as a JSON array of objects with the format:
[{"date": "YYYY-MM-DD", "context": "brief description of what the date refers to"}]

If a date is approximate (e.g., "early 2024"), use the first day of the period 
and add "approximate": true to the object.

Passage: [text here]
```

---

## 4.5 Role-Based Prompting (Persona Prompting)

### Assigning a Role or Identity to the Model
Role prompting sets the model's "character" — its expertise, tone, perspective, and communication style.

```
You are a senior software architect with 20 years of experience in distributed systems.
You communicate technical concepts clearly but don't oversimplify.
When reviewing code, you focus on scalability, maintainability, and security.
```

### How Personas Shape Output Tone, Depth, and Style
The same question produces very different outputs depending on the assigned role:

**Question**: "Explain why the sky is blue"

**As a physicist**: "The sky appears blue due to Rayleigh scattering, where shorter wavelength light (blue, ~450nm) is scattered more efficiently by atmospheric molecules (primarily N₂ and O₂) than longer wavelengths. The scattering intensity is proportional to 1/λ⁴..."

**As a kindergarten teacher**: "The sky is blue because sunlight is actually made up of all the colors of the rainbow! When sunlight bounces off the tiny bits of air up in the sky, the blue light bounces around the most. So when you look up, you see all that bouncy blue light!"

**As a poet**: "The sky wears blue as the ocean wears the shore — not by choice, but by the physics of light breaking against the atmosphere, scattered like memories across an endless ceiling..."

### System Prompts vs. User Prompts for Role Assignment
- **System prompt** (preferred): sets the role for the entire conversation
  ```
  System: You are a medical doctor specializing in cardiology...
  User: What are common symptoms of atrial fibrillation?
  ```
- **User prompt**: embeds the role in the message itself
  ```
  Act as a medical doctor specializing in cardiology. What are common symptoms of atrial fibrillation?
  ```

System prompts are preferred because they persist across turns and clearly separate role definition from task instructions.

### Common Personas and When to Use Them

**Subject-Matter Expert**:
```
You are a board-certified dermatologist with 15 years of clinical experience.
Provide evidence-based information and clearly state when you're uncertain.
Always recommend consulting a healthcare provider for specific medical advice.
```
Use when: you need domain-specific depth and accuracy

**Creative Professional**:
```
You are an award-winning copywriter who specializes in tech startup branding.
Your writing is punchy, modern, and avoids clichés. You use short sentences
for impact. Every word earns its place.
```
Use when: you need specific creative style and tone

**Teacher or Tutor (adjustable level)**:
```
You are a patient, encouraging tutor helping a high school student understand calculus.
Explain concepts using relatable analogies. Check for understanding after each explanation.
If the student seems confused, try a different approach. Never make the student feel stupid.
```
Use when: educational content at a specific level

**Critic or Reviewer**:
```
You are a harsh but fair code reviewer. You catch bugs, suggest improvements,
and enforce best practices. You're direct — no sugarcoating — but always explain
why something should change, not just what.
```
Use when: you want critical analysis, not agreement

**Translator or Interpreter**:
```
You are a professional literary translator specializing in Japanese-to-English translation.
You prioritize preserving the emotional tone and cultural nuances of the original text,
even if it means deviating from literal translation. Include translator's notes when
cultural context is needed.
```
Use when: nuanced translation beyond word-for-word

### Combining Roles with Task Instructions
The most effective prompts combine a role with specific task instructions:

```
[ROLE]
You are a data scientist at a healthcare company who explains complex analyses 
to non-technical stakeholders.

[TASK]
Analyze the following patient outcome data and present your findings.

[FORMAT]
1. Start with a plain-English summary (no jargon)
2. Then provide the technical details in a separate section
3. End with recommended actions

[DATA]
[data here]
```

### Multi-Persona Setups for Debate and Analysis
You can instruct the model to adopt multiple perspectives:

```
Analyze the proposal to implement a 4-day work week from three perspectives:

PERSPECTIVE 1 - HR Director: Focus on employee satisfaction, retention, and well-being.
PERSPECTIVE 2 - CFO: Focus on financial impact, productivity metrics, and cost implications.
PERSPECTIVE 3 - Operations Manager: Focus on workflow continuity, client service, and logistics.

For each perspective, provide:
- Key arguments FOR the proposal
- Key arguments AGAINST
- Recommended conditions for implementation
```

### Persona Consistency Across Long Conversations
Challenges and solutions:
- **Challenge**: model drifts from persona over many turns
- **Solution**: reinforce the role periodically ("Remember, you are responding as a senior architect...")
- **Solution**: include key persona traits in the system prompt
- **Solution**: use explicit checks: "Before responding, ensure your answer aligns with your role as..."

---

## 4.6 Contextual Prompting

### Providing Background Information Before the Task
Context transforms generic answers into specific, relevant ones.

**Without context**:
```
What should we do about the performance issue?
```
→ Generic advice about performance optimization

**With context**:
```
Context: We're running a Node.js API server on AWS ECS with 4 containers.
Response times have increased from 200ms to 2.5s over the past week.
Our PostgreSQL database is on RDS (db.r5.xlarge). CloudWatch shows CPU at 85%
on the database. We recently deployed a feature that adds a new JOIN query
running 50,000 times per hour.

Question: What should we do about the performance issue?
```
→ Specific, actionable advice about the JOIN query, database optimization, indexing, and scaling

### Document-Grounded Prompting
Provide a document (or excerpt) and ask the model to answer based **only** on that document.

```
Based ONLY on the following document, answer the question below. 
If the answer is not contained in the document, respond with 
"The document does not contain this information."

Document:
"""
[paste document here]
"""

Question: What was the company's revenue in Q3 2025?
```

This technique:
- Reduces hallucinations by grounding in specific text
- Makes the source of information explicit
- Enables the model to say "I don't know" when information is missing
- Is the foundation of RAG (Retrieval-Augmented Generation)

### Using Delimiters to Separate Context from Instructions
When prompts have both context and instructions, clear separation prevents the model from confusing them:

```
### Instructions ###
Summarize the following article for a business executive.
Focus on financial implications and strategic decisions.
Keep under 200 words.

### Article ###
[article text here]

### Summary ###
```

Without delimiters, the model might treat parts of the article as instructions, especially if the article contains imperative language.

### Context Window Management for Large Documents
When your document exceeds the context window or takes up too much of it:

**Strategy 1: Truncation** — include only the most relevant sections
**Strategy 2: Summarization** — summarize the document first, then work with the summary
**Strategy 3: Chunking** — split the document, process chunks separately, then combine results
**Strategy 4: Map-Reduce** — process each chunk independently (map), then combine results (reduce)
**Strategy 5: Hierarchical** — first pass identifies relevant sections, second pass analyzes them in detail

### Chunking Strategies for Long Inputs
When a document is too long for a single prompt:

1. **Fixed-size chunks**: split every N tokens (simple but may split mid-sentence)
2. **Paragraph-based**: split on paragraph boundaries
3. **Section-based**: split on headings or section markers
4. **Semantic**: split where the topic changes
5. **Overlap**: include 10-20% overlap between chunks to preserve context at boundaries

### Prioritizing Context: What to Include vs. What to Omit
When space is limited, include:
- Information directly relevant to the question/task
- Definitions of domain-specific terms used in the task
- Constraints and requirements
- The most recent or relevant data

Omit:
- Tangential background information
- Boilerplate text (headers, footers, legal disclaimers unless relevant)
- Redundant information (if three paragraphs say the same thing, include one)
- Historical context unless specifically needed

---

> **Key Takeaway for Module 4**: These six core techniques — zero-shot, one-shot, few-shot, instruction-based, role-based, and contextual prompting — are your everyday toolkit. Most real-world prompts combine multiple techniques (e.g., a role + instructions + few-shot examples + context). Master these foundations, and the advanced techniques in Module 5 will build naturally on top.
