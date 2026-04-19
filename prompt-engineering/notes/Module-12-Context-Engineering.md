# MODULE 12: Context Engineering

---

## 12.1 What is Context Engineering?

### Context Engineering vs. Prompt Engineering
**Prompt engineering** focuses on crafting the instruction — the "what to do" part.
**Context engineering** focuses on managing the entire information environment the LLM sees — the "what to know" part.

As AI applications mature, the bottleneck shifts from "how do I ask the question" to "what information do I include with the question."

A prompt engineer writes: *"Summarize this article in 3 bullet points."*
A context engineer decides: *Which article sections to include, what metadata to attach, what prior conversation to keep, what user preferences to inject, and how to fit all of this within the token budget.*

### The Shift from Crafting Prompts to Managing Context
In simple chatbot interactions, prompt engineering suffices. In production AI systems, you're managing:
- System prompts (persona, rules, capabilities)
- User preferences and profile data
- Retrieved documents (RAG)
- Conversation history (potentially thousands of messages)
- Tool definitions and schemas
- Environmental context (time, location, device)
- Task-specific instructions that change per request

**Context engineering is the discipline of assembling, prioritizing, and compressing all of this information into a coherent context that maximizes output quality within token limits.**

### Why Context Engineering Matters for Production AI Systems
1. **Token limits are real**: even 128K context windows fill up quickly in production
2. **Garbage context = garbage output**: irrelevant context actively degrades performance
3. **Cost scales with context**: every extra token in the prompt costs money at scale
4. **Latency increases with length**: longer prompts take longer to process
5. **"Lost in the middle"**: models don't use all context equally — position matters

### The Context Window as a Scarce Resource
Think of the context window as a **budget**. Every piece of information competes for space:

```
128K context window budget:
├── System prompt:           2,000 tokens (1.5%)
├── Tool definitions:        3,000 tokens (2.3%)
├── User profile:              500 tokens (0.4%)
├── Retrieved documents:    20,000 tokens (15.6%)
├── Conversation history:   50,000 tokens (39.1%)
├── Current user message:    1,000 tokens (0.8%)
├── Reserved for output:    10,000 tokens (7.8%)
└── Buffer:                 41,500 tokens (32.4%)
```

Context engineering is the art of making optimal allocation decisions.

---

## 12.2 Context Window Management

### Understanding Token Limits
| Model | Context Window | Approximate Word Equivalent |
|-------|---------------|---------------------------|
| GPT-3.5 Turbo | 16K tokens | ~12,000 words |
| GPT-4o | 128K tokens | ~96,000 words |
| GPT-4o-mini | 128K tokens | ~96,000 words |
| Claude 3 Sonnet | 200K tokens | ~150,000 words |
| Gemini 1.5 Pro | 1M tokens | ~750,000 words |
| Gemini 2.0 | 2M tokens | ~1,500,000 words |

**Important**: context window = input + output tokens. If your context uses 100K, you only have 28K left for the response (on a 128K model).

### Token Counting Tools and Strategies
```python
import tiktoken

# Count tokens for OpenAI models
encoder = tiktoken.encoding_for_model("gpt-4o")
tokens = encoder.encode("Your text here")
print(f"Token count: {len(tokens)}")

# Rule of thumb: 1 token ≈ 4 characters ≈ 0.75 words (English)
```

Always count tokens before sending requests. Exceeding the limit causes API errors.

### Prioritizing Information Within the Context Window
When space is limited, prioritize:
1. **System prompt** (always include — defines behavior)
2. **Current user message** (the actual request)
3. **Directly relevant context** (RAG results, specific data)
4. **Recent conversation history** (last 5-10 turns)
5. **User profile/preferences** (if they affect the response)
6. **Tool definitions** (only tools relevant to current task)
7. **Older conversation history** (summarized)
8. **Background context** (general reference material)

### The "Lost in the Middle" Problem and Mitigations
Research shows models attend most to content at the **beginning** and **end** of the context, paying less attention to the **middle**.

**Mitigations**:
- Place the most important information at the beginning (system prompt + key context)
- Place the user's question at the end (closest to where generation starts)
- Put less critical reference material in the middle
- For RAG: order retrieved documents by relevance (most relevant first)
- Consider splitting very long contexts into separate calls

### Sliding Window Approaches
For ongoing conversations that exceed the context window:
```
Turn 1-5:   [System] [Turn 1] [Turn 2] [Turn 3] [Turn 4] [Turn 5]
Turn 6:     [System] [Turn 2] [Turn 3] [Turn 4] [Turn 5] [Turn 6]  ← Drop Turn 1
Turn 7:     [System] [Turn 3] [Turn 4] [Turn 5] [Turn 6] [Turn 7]  ← Drop Turn 2
```

### Summarization-Based Context Compression
Instead of dropping old messages, summarize them:
```
[System prompt]
[Summary of turns 1-20: "The user asked about pricing for enterprise plan. 
Key decisions: chose annual billing, 50 seats, needs SSO integration."]
[Turn 21]
[Turn 22]
[Current turn]
```

---

## 12.3 Dynamic Context Assembly

### Building Context Pipelines
A context pipeline dynamically assembles the prompt based on the current request:

```python
def assemble_context(user_message, user_id, conversation_id):
    context = {}
    
    # 1. System prompt (static)
    context["system"] = load_system_prompt()
    
    # 2. User profile (from database)
    context["user_profile"] = get_user_profile(user_id)
    
    # 3. Conversation history (recent + summarized old)
    context["history"] = get_conversation_history(conversation_id, max_turns=10)
    
    # 4. RAG retrieval (based on current message)
    context["documents"] = retrieve_relevant_docs(user_message, top_k=5)
    
    # 5. Tool definitions (based on intent classification)
    intent = classify_intent(user_message)
    context["tools"] = get_relevant_tools(intent)
    
    # 6. Environmental context
    context["env"] = {"timestamp": now(), "user_timezone": get_timezone(user_id)}
    
    # 7. Token budget management
    context = fit_within_budget(context, max_tokens=100000)
    
    return build_prompt(context)
```

### Just-in-Time Context Retrieval
Don't load everything upfront — fetch context only when needed:
- Retrieve documents only when the user asks a knowledge question
- Load tool definitions only when the user's intent requires tools
- Fetch user history only when the conversation references past interactions

### A/B Testing Context Configurations
Test different context strategies:
- Version A: 3 RAG documents, 10 conversation turns
- Version B: 5 RAG documents, 5 conversation turns
- Measure: response quality, accuracy, user satisfaction, cost

---

## 12.4 Knowledge Grounding

### Grounding AI Outputs in Verified Sources
Grounding means tying the model's output to specific, verifiable sources:

```
"Answer based ONLY on the following verified sources. 
After each claim, cite the source: [Source 1], [Source 2], etc.
If no source supports a claim, do not include it."
```

### Fact Injection into Prompts
Proactively inject facts the model might get wrong:
```
"IMPORTANT CONTEXT:
- Our fiscal year ends on March 31 (not December 31)
- 'Premium' plan was renamed to 'Professional' in June 2025
- The CEO's name is Sarah Chen (not the previous CEO, James Liu)

Now answer the user's question with this context in mind."
```

### Real-Time Data Integration
For applications needing current data:
```python
# Inject live data into the prompt
weather = get_weather_api(location)
stock_price = get_stock_api(symbol)
news = get_news_api(topic, limit=3)

context = f"""
Current conditions:
- Weather in {location}: {weather}
- {symbol} stock price: ${stock_price}
- Latest news about {topic}: {news}

Using this current information, answer: {user_question}
"""
```

---

## 12.5 Structured Context Formats

### XML-Tagged Context Blocks
Particularly effective with Claude:
```xml
<system_instructions>
You are a customer support agent for TechCorp.
</system_instructions>

<user_profile>
Name: John Smith
Plan: Enterprise
Account age: 3 years
Previous issues: 2 (both resolved)
</user_profile>

<knowledge_base>
<document source="FAQ v4.2" relevance="0.95">
Enterprise customers receive 24/7 phone support and a dedicated account manager.
</document>
</knowledge_base>

<conversation_history>
<turn role="user">I need help with my account settings.</turn>
<turn role="assistant">I'd be happy to help! What specific settings do you need to change?</turn>
</conversation_history>

<current_message>
I want to add more seats to my plan.
</current_message>
```

### JSON-Structured Context
Good for API-driven applications:
```json
{
  "context": {
    "user": {"name": "John", "plan": "enterprise", "seats": 50},
    "task": "answer billing question",
    "documents": [
      {"title": "Pricing Guide", "content": "...", "relevance": 0.95}
    ],
    "constraints": {
      "max_response_length": 200,
      "tone": "professional",
      "cite_sources": true
    }
  },
  "question": "How much to add 10 more seats?"
}
```

### When to Use Which Format
- **XML tags**: best for Claude, great for clear section separation
- **JSON**: best for programmatic context assembly, easy to parse
- **Markdown**: best for human readability, works well with most models
- **YAML**: good for configuration-style context, very readable
- **Plain delimiters (---, ###)**: simplest, lightweight, universally supported

---

> **Key Takeaway for Module 12**: Context engineering is where prompt engineering meets systems design. In production, the quality of your AI application depends more on what information you include (and how you structure it) than on the exact wording of your instructions. Master context assembly, prioritization, and compression to build AI systems that are accurate, efficient, and cost-effective.
