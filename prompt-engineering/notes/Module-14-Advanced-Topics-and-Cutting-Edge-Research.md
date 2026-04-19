# MODULE 14: Advanced Topics and Cutting-Edge Research

---

## 14.1 Prompt Tuning and Soft Prompts

### Hard Prompts vs. Soft Prompts
**Hard prompts**: the text prompts we've been discussing — human-readable words and sentences.
**Soft prompts**: learned continuous vectors (embeddings) that are prepended to the input. Not human-readable — they exist only in the model's embedding space.

Example:
```
Hard prompt: "Classify the sentiment of the following review as positive or negative:"
Soft prompt: [0.23, -0.87, 0.45, ...] [0.12, 0.56, -0.33, ...] ... (learned vectors)
```

### Prefix Tuning
Li & Liang (2021): adds trainable prefix vectors to each transformer layer's attention keys and values.
- The original model weights are **frozen** (not modified)
- Only the small prefix vectors are trained
- 1000× fewer parameters than full fine-tuning
- Each task gets its own prefix, but shares the same base model

### P-Tuning and P-Tuning v2
**P-Tuning** (Liu et al., 2021): inserts trainable embeddings into the input sequence, using an LSTM to generate them for better optimization.

**P-Tuning v2** (Liu et al., 2022): extends to all transformer layers (like prefix tuning) and works for smaller models too. Competitive with full fine-tuning while training only 0.1-3% of parameters.

### Prompt Tuning (Lester et al., 2021)
The simplest approach: prepend a small number of trainable tokens (typically 20-100) to the input.
- At large scale (10B+ parameters), prompt tuning matches full fine-tuning performance
- Multiple tasks can share one model — each gets its own prompt vectors
- Storage efficient: save a few kilobytes per task instead of gigabytes

### When Soft Prompts Outperform Manual Prompt Engineering
- When you have a large labeled dataset (thousands of examples)
- When the task is specific and well-defined (classification, NER)
- When you need consistent, production-level accuracy
- When you want to serve multiple tasks from one model instance

---

## 14.2 Constitutional AI and Self-Alignment

### Anthropic's Constitutional AI Approach
Instead of relying entirely on human feedback (RLHF), Constitutional AI (CAI) uses a **set of principles** to guide the model's self-improvement:

**Phase 1 — Self-Critique**:
1. Generate a response (which may be harmful)
2. Ask the model to critique its own response against a principle
3. Ask the model to revise its response to be better
4. Use the revised response as training data

**Phase 2 — RLAIF (RL from AI Feedback)**:
1. Generate pairs of responses
2. Ask the model (not humans) which response better follows the principles
3. Train a preference model on AI feedback
4. Use RL to optimize the model with the AI preference model

### The Constitution (Example Principles)
```
1. Choose the response that is most helpful while being honest and harmless.
2. Choose the response that is least likely to be used to harm others.
3. Choose the response that sounds most like it was written by a wise, caring person.
4. Choose the response that is most respectful of everyone's autonomy.
5. Choose the response that would be most approved by someone concerned with ethics.
```

### Red-Teaming with AI Models
Use AI to find vulnerabilities in AI:
```
"Your task is to find prompts that could make the target model produce 
harmful, biased, or unsafe outputs. Try different approaches:
1. Direct requests for harmful content
2. Roleplay scenarios that bypass safety
3. Multi-step conversations that gradually escalate
4. Encoding harmful requests in code/puzzles
5. Cross-lingual attacks

For each successful attack, document the technique and suggest a defense."
```

### Alignment Tax
The trade-off between safety and capability:
- Highly aligned models sometimes refuse legitimate requests (over-cautious)
- Safety training can reduce performance on some benchmarks
- The goal: minimize the alignment tax while maximizing safety
- Current research aims for models that are both more capable AND more aligned

---

## 14.3 Reasoning Models and Specialized Prompting

### OpenAI o1, o3 Models
These models have **built-in chain-of-thought** reasoning — they "think" before answering:
- Allocate "reasoning tokens" internally (you pay for them but don't see them directly in o1; visible in o3)
- Dramatically better at: math, coding, logic, science, planning
- Significantly more expensive per query
- Slower (the thinking takes time)

### How Reasoning Models Change Prompt Engineering
Traditional CoT prompting ("Let's think step by step") becomes **counterproductive** with reasoning models:
```
BAD with o1/o3: "Let's think step by step about this math problem."
(The model already thinks step by step internally — your instruction adds confusion)

GOOD with o1/o3: "Solve this math problem: [problem]"
(Let the model's built-in reasoning handle it)
```

### When NOT to Use CoT with Reasoning Models
- The model already applies CoT internally — adding it explicitly is redundant
- Extra prompting can interfere with the model's reasoning process
- Simple, direct prompts work best with reasoning models
- Focus on clearly stating the problem, not on instructing how to think

### Prompting Strategies for Reasoning Models
1. **Be direct**: state the problem clearly without reasoning instructions
2. **Provide complete information**: all data, constraints, and requirements
3. **Specify the output format**: the model reasons internally but you still control the format
4. **Avoid hand-holding**: don't break the problem into steps — let the model do it
5. **Use for hard problems**: don't waste reasoning tokens on simple tasks

### Cost Implications of Reasoning Tokens
```
Standard model (GPT-4o):
  Input: 1000 tokens, Output: 500 tokens → Cost: ~$0.007

Reasoning model (o1):
  Input: 1000 tokens, Reasoning: 5000 tokens (internal), Output: 500 tokens → Cost: ~$0.10
  
The reasoning tokens can be 5-20x the visible output, making reasoning models 
10-50x more expensive per query.
```

---

## 14.4 Long-Context Prompting

### Models with 100K–2M Token Windows
The latest models can process entire books, codebases, or document collections in a single prompt.

### "Needle in a Haystack" Retrieval
A benchmark test: hide a specific fact deep within a very long context and ask the model to find it.
- Most models score well when the "needle" is at the start or end
- Performance drops when the needle is in the middle (especially in the 50-70% position)
- Gemini 1.5 Pro shows the best needle-in-haystack performance across all positions

### Structuring Prompts for Very Long Contexts
```
"I'm providing you with a complete codebase (50,000 lines across 200 files).

INSTRUCTIONS (READ FIRST):
1. I will ask a specific question about this code at the end
2. Focus on understanding the architecture and data flow
3. Pay special attention to error handling patterns

[entire codebase here — 100K+ tokens]

QUESTION: 
Find all places where database connections are opened but never closed.
For each instance, provide: file name, line number, and the problematic code.
```

**Key pattern**: put instructions at the TOP (before the long content) AND the question at the BOTTOM (after the content). This leverages both primacy and recency effects.

### Multi-Document Analysis
```
"Below are 15 research papers on climate change mitigation strategies.

For each paper, I've included the abstract and key findings.

After reading all papers, provide:
1. A synthesis of common themes across all papers
2. Areas of disagreement or contradictory findings
3. Research gaps identified across the collection
4. A recommended research agenda based on the gaps

[Paper 1: ...]
[Paper 2: ...]
...
[Paper 15: ...]

Now provide your comprehensive analysis:"
```

---

## 14.5 Constrained Generation

### Structured Output Enforcement
Forcing models to output valid structured data:

**JSON mode** (OpenAI):
```python
response = client.chat.completions.create(
    model="gpt-4o",
    response_format={"type": "json_object"},
    messages=[{"role": "user", "content": "Extract name and age as JSON: 'John is 30'"}]
)
# Guaranteed valid JSON
```

**Structured Outputs** (OpenAI — schema enforcement):
```python
response = client.chat.completions.create(
    model="gpt-4o",
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "extraction",
            "strict": True,
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"}
                },
                "required": ["name", "age"],
                "additionalProperties": False
            }
        }
    },
    messages=[...]
)
# Output EXACTLY matches the schema — every time
```

### Instructor Library for Pydantic-Validated Outputs
```python
import instructor
from pydantic import BaseModel
from openai import OpenAI

client = instructor.from_openai(OpenAI())

class UserInfo(BaseModel):
    name: str
    age: int
    email: str | None = None

user = client.chat.completions.create(
    model="gpt-4o-mini",
    response_model=UserInfo,
    messages=[{"role": "user", "content": "John Smith is 30, email: john@example.com"}]
)
# user.name == "John Smith", user.age == 30, user.email == "john@example.com"
# Fully typed, validated Python object
```

### Outlines Library for Grammar-Guided Generation
For open-source models, Outlines constrains generation at the token level:
```python
import outlines

model = outlines.models.transformers("mistralai/Mistral-7B-v0.1")

# Regex-constrained output
generator = outlines.generate.regex(model, r"\d{3}-\d{3}-\d{4}")
result = generator("Generate a US phone number: ")
# Always matches XXX-XXX-XXXX format

# JSON schema-constrained output
generator = outlines.generate.json(model, UserInfo)
result = generator("Extract user info from: John Smith, age 30")
# Always valid JSON matching the schema
```

---

## 14.6 Federated and Privacy-Preserving Prompting

### On-Device Model Prompting
Running models locally on user devices:
- Apple Intelligence: on-device models for Siri, writing tools
- Google on-device: Gemini Nano on Pixel phones
- Qualcomm AI: models running on Snapdragon chips
- Benefits: zero data transmission, instant response, works offline

### Local LLMs for Confidential Data
When data cannot leave the organization:
```
Architecture:
[Confidential data] → [Local LLM (Ollama/vLLM)] → [Response]
                       ↑ No data sent to cloud
```

Models: LLaMA 3, Mistral, Phi-3, Qwen — all available for local deployment.

### Hybrid Architectures
```
User Query → [Intent Classification - local, fast, cheap]
  ├── Simple query → [Local small model] → Response
  ├── Complex query (no PII) → [Cloud API (GPT-4o)] → Response  
  └── Complex query (with PII) → [Sanitize PII] → [Cloud API] → [Restore PII] → Response
```

---

## 14.7 Emerging Research Directions

### Prompt Compression
LLMLingua and similar techniques compress long prompts to fewer tokens while preserving meaning:
- Can achieve 2-10x compression with minimal quality loss
- Reduces cost and latency proportionally
- Particularly useful for RAG contexts with redundant information

### Cross-Lingual Prompt Transfer
Prompts optimized in one language can be transferred to other languages:
- English CoT prompts can improve reasoning in non-English languages
- Multilingual few-shot examples can work across language boundaries
- Active research area for making prompt engineering accessible globally

### Agentic RAG
Combining agent capabilities with RAG:
- The agent decides when to retrieve, what to retrieve, and how to use it
- Adaptive retrieval: only searches when the model determines it needs external information
- Multi-step retrieval: uses results from one search to inform the next
- Self-correcting: if retrieved information seems wrong, searches again with refined queries

### Model Routing and Mixture of Experts
Intelligent routing of different parts of a task to different models:
```
Input → [Router Model (tiny, fast)]
  ├── Math reasoning → o3-mini (reasoning specialist)
  ├── Creative writing → Claude Opus (best creative output)
  ├── Code generation → GPT-4o (strong at code)
  ├── Simple Q&A → GPT-4o-mini (cheap and fast)
  └── Image analysis → Gemini Pro Vision (strong multimodal)
```

---

> **Key Takeaway for Module 14**: The frontier of prompt engineering is moving fast. Soft prompts blur the line between prompting and fine-tuning. Reasoning models change how we structure prompts. Long-context windows enable new use cases. Constrained generation solves reliability problems. Privacy-preserving approaches expand where AI can be deployed. Stay curious and keep experimenting.
