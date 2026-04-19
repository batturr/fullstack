# MODULE 9: Working with AI APIs and Platforms

---

## 9.1 OpenAI API Deep Dive

### Account Setup and API Key Management
1. Create an account at platform.openai.com
2. Navigate to API Keys section
3. Generate a new secret key — **copy it immediately** (it's shown only once)
4. Store securely: environment variable, secrets manager, or `.env` file (never hardcode in source code)

```bash
# .env file (add to .gitignore!)
OPENAI_API_KEY=sk-proj-abc123...
```

```python
import os
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

**Security best practices**:
- Never commit API keys to version control
- Use different keys for development and production
- Set usage limits and billing alerts
- Rotate keys periodically
- Use organization-level keys for team projects

### Chat Completions API: Messages Array Structure
The core API endpoint. Every request is a conversation represented as an array of messages:

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Explain quantum computing in simple terms."},
        {"role": "assistant", "content": "Quantum computing uses..."},  # previous response
        {"role": "user", "content": "Can you give me an example?"}     # new question
    ],
    temperature=0.7,
    max_tokens=500
)

print(response.choices[0].message.content)
```

**Message roles**:
- `system`: sets behavior (one at the start)
- `user`: human messages
- `assistant`: AI responses (include previous turns for context)

### Models Available
| Model | Best For | Context Window | Relative Cost |
|-------|----------|---------------|---------------|
| `gpt-4o` | Best all-around performance | 128K | $$ |
| `gpt-4o-mini` | Fast, cheap, good enough for most tasks | 128K | $ |
| `gpt-4-turbo` | Legacy high-capability | 128K | $$$ |
| `o1` | Complex reasoning, math, coding | 200K | $$$$ |
| `o1-mini` | Reasoning at lower cost | 128K | $$ |
| `o3` | Most advanced reasoning | 200K | $$$$$ |
| `o3-mini` | Efficient reasoning | 128K | $$ |

### Streaming Responses
For real-time display (like ChatGPT's typing effect):

```python
stream = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Write a poem about the sea"}],
    stream=True
)

for chunk in stream:
    if chunk.choices[0].delta.content is not None:
        print(chunk.choices[0].delta.content, end="", flush=True)
```

### Function Calling / Tool Use
Allow the model to call functions you define:

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "get_weather",
            "description": "Get the current weather for a location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "City and state, e.g., San Francisco, CA"
                    },
                    "unit": {
                        "type": "string",
                        "enum": ["celsius", "fahrenheit"]
                    }
                },
                "required": ["location"]
            }
        }
    }
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=[{"role": "user", "content": "What's the weather in Tokyo?"}],
    tools=tools
)

# Model returns a tool call, you execute it, then send results back
tool_call = response.choices[0].message.tool_calls[0]
# Execute get_weather("Tokyo") → result
# Send result back as a tool message
```

### JSON Mode and Structured Outputs
Force the model to return valid JSON:

```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "system", "content": "Extract data as JSON."},
        {"role": "user", "content": "John Smith, age 30, engineer at Google"}
    ],
    response_format={"type": "json_object"}
)
# Guaranteed valid JSON output
```

**Structured Outputs** (stricter — enforces a specific JSON schema):
```python
response = client.chat.completions.create(
    model="gpt-4o",
    messages=[...],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "person",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "company": {"type": "string"}
                },
                "required": ["name", "age", "company"]
            }
        }
    }
)
```

### Batch API for High-Volume Processing
Process thousands of requests at 50% cost:

```python
# 1. Create a JSONL file with requests
# 2. Upload to OpenAI
# 3. Create a batch
# 4. Poll for completion
# 5. Download results

batch = client.batches.create(
    input_file_id="file-abc123",
    endpoint="/v1/chat/completions",
    completion_window="24h"
)
```

### Rate Limits, Quotas, and Cost Optimization
- **Rate limits**: tokens per minute (TPM) and requests per minute (RPM) — vary by tier
- **Tier system**: usage-based tiers (Tier 1–5) with increasing limits
- **Cost optimization strategies**:
  - Use `gpt-4o-mini` for simple tasks (10× cheaper than `gpt-4o`)
  - Minimize prompt tokens (shorter system prompts, less context)
  - Cache frequent responses
  - Use batch API for non-real-time processing
  - Set `max_tokens` to avoid unnecessarily long responses

### Error Handling and Retry Strategies
```python
import time
from openai import RateLimitError, APIError

def call_with_retry(messages, max_retries=3):
    for attempt in range(max_retries):
        try:
            return client.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages
            )
        except RateLimitError:
            wait_time = 2 ** attempt  # Exponential backoff: 1s, 2s, 4s
            time.sleep(wait_time)
        except APIError as e:
            if attempt == max_retries - 1:
                raise e
            time.sleep(1)
```

---

## 9.2 Anthropic Claude API

### Messages API Structure
```python
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system="You are a helpful coding assistant.",  # System prompt is separate
    messages=[
        {"role": "user", "content": "Write a Python function to merge two sorted lists."}
    ]
)

print(message.content[0].text)
```

Key difference from OpenAI: system prompt is a **top-level parameter**, not a message in the array.

### System Prompt Handling in Claude
Claude responds particularly well to structured system prompts with XML tags:

```python
system_prompt = """
<role>You are an expert data analyst.</role>
<rules>
- Always show your work and methodology
- Use precise numbers, not approximations
- Present findings in tables when appropriate
- Include confidence levels for estimates
</rules>
<output_format>
Start with a summary, then provide detailed analysis.
</output_format>
"""
```

### Extended Thinking (Claude's Reasoning Mode)
Claude can show its internal reasoning process:

```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 10000  # Tokens allocated for thinking
    },
    messages=[{"role": "user", "content": "Solve this complex math problem..."}]
)

# Access thinking and response separately
for block in message.content:
    if block.type == "thinking":
        print("Thinking:", block.thinking)
    elif block.type == "text":
        print("Answer:", block.text)
```

### Prompt Caching for Cost Reduction
Cache static parts of the prompt (system prompt, few-shot examples) to reduce costs:

```python
message = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=[
        {
            "type": "text",
            "text": "You are an expert assistant with extensive knowledge...",
            "cache_control": {"type": "ephemeral"}  # Cache this part
        }
    ],
    messages=[{"role": "user", "content": "New question here"}]
)
# Cached tokens cost 90% less on subsequent calls
```

### Claude Model Tiers
| Model | Characteristics | Best For |
|-------|----------------|----------|
| **Haiku** | Fastest, cheapest, lightest | Simple tasks, high-volume processing, classification |
| **Sonnet** | Balanced performance/cost | Most tasks, coding, analysis, writing |
| **Opus** | Most capable, most expensive | Complex reasoning, nuanced writing, research |

---

## 9.3 Google Gemini API

### Google AI Studio Setup
1. Visit aistudio.google.com
2. Sign in with Google account
3. Get API key from the API keys section

```python
import google.generativeai as genai

genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel("gemini-1.5-pro")

response = model.generate_content("Explain machine learning")
print(response.text)
```

### Multimodal Input Handling
Gemini natively accepts mixed inputs:

```python
import PIL.Image

model = genai.GenerativeModel("gemini-1.5-pro")

image = PIL.Image.open("chart.png")
response = model.generate_content([
    "Analyze this chart and provide key insights:",
    image
])
print(response.text)
```

### Grounding with Google Search
Connect Gemini to live web data:

```python
model = genai.GenerativeModel(
    "gemini-1.5-pro",
    tools=[genai.Tool(google_search=genai.GoogleSearch())]
)

response = model.generate_content("What are today's top tech news stories?")
# Response includes citations from live search results
```

### Safety Settings Configuration
```python
safety_settings = {
    "HARM_CATEGORY_HARASSMENT": "BLOCK_MEDIUM_AND_ABOVE",
    "HARM_CATEGORY_HATE_SPEECH": "BLOCK_MEDIUM_AND_ABOVE",
    "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_MEDIUM_AND_ABOVE",
    "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_MEDIUM_AND_ABOVE",
}

response = model.generate_content(
    "Your prompt here",
    safety_settings=safety_settings
)
```

---

## 9.4 Open-Source Model APIs

### Hugging Face Inference API and Transformers Library
```python
# Using the API
from huggingface_hub import InferenceClient

client = InferenceClient(model="meta-llama/Llama-3-70b-chat-hf")
response = client.chat_completion(
    messages=[{"role": "user", "content": "Hello!"}],
    max_tokens=500
)

# Using Transformers locally
from transformers import pipeline
generator = pipeline("text-generation", model="meta-llama/Llama-3-8b-chat-hf")
output = generator("Explain neural networks:", max_length=200)
```

### Ollama for Local Model Hosting
```bash
# Install and run
ollama pull llama3.1
ollama run llama3.1

# Or use as API (OpenAI-compatible)
curl http://localhost:11434/v1/chat/completions \
  -d '{"model": "llama3.1", "messages": [{"role": "user", "content": "Hello"}]}'
```

```python
# Works with OpenAI Python client!
from openai import OpenAI
client = OpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
response = client.chat.completions.create(
    model="llama3.1",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### Quantization and Its Impact on Quality
Quantization reduces model precision to save memory:

| Format | Bits | Memory (7B model) | Quality Impact |
|--------|------|-------------------|----------------|
| FP16 | 16-bit | ~14 GB | Baseline |
| Q8_0 | 8-bit | ~7 GB | Negligible loss |
| Q5_K_M | 5-bit | ~5 GB | Minimal loss |
| Q4_K_M | 4-bit | ~4 GB | Slight loss |
| Q3_K_M | 3-bit | ~3 GB | Noticeable loss |
| Q2_K | 2-bit | ~2.5 GB | Significant loss |

**GGUF**: the standard format for quantized models (used by Ollama, LM Studio).
**GPTQ**: GPU-optimized quantization format.
**AWQ**: Activation-aware quantization — newer, often better quality at same compression.

---

## 9.5 Assistants API and GPT Builder

### OpenAI Assistants API Architecture
The Assistants API manages stateful conversations with built-in tools:

```python
# 1. Create an assistant
assistant = client.beta.assistants.create(
    name="Data Analyst",
    instructions="You are a data analyst. Use code interpreter to analyze data.",
    model="gpt-4o",
    tools=[
        {"type": "code_interpreter"},
        {"type": "file_search"}
    ]
)

# 2. Create a thread (conversation)
thread = client.beta.threads.create()

# 3. Add a message
message = client.beta.threads.messages.create(
    thread_id=thread.id,
    role="user",
    content="Analyze the sales data in the attached file"
)

# 4. Run the assistant
run = client.beta.threads.runs.create(
    thread_id=thread.id,
    assistant_id=assistant.id
)

# 5. Poll for completion and retrieve response
```

### Creating Custom GPTs (ChatGPT Plus)
Custom GPTs are built through the ChatGPT interface:
1. **Name and description**: what the GPT does
2. **Instructions**: the system prompt (persona, rules, capabilities)
3. **Conversation starters**: suggested first messages
4. **Knowledge**: upload files the GPT can reference
5. **Capabilities**: enable code interpreter, DALL-E, web browsing
6. **Actions**: connect to external APIs via OpenAPI schemas

### Knowledge Retrieval (File Search)
Upload documents that the assistant can search:

```python
# Upload a file
file = client.files.create(
    file=open("knowledge_base.pdf", "rb"),
    purpose="assistants"
)

# Create a vector store
vector_store = client.beta.vector_stores.create(name="Product Docs")
client.beta.vector_stores.files.create(
    vector_store_id=vector_store.id,
    file_id=file.id
)

# Attach to assistant
assistant = client.beta.assistants.update(
    assistant_id=assistant.id,
    tool_resources={"file_search": {"vector_store_ids": [vector_store.id]}}
)
```

### Code Interpreter Integration
The code interpreter tool lets the assistant write and execute Python code:
- Data analysis with pandas, numpy
- Visualization with matplotlib
- File processing (CSV, Excel, images)
- Mathematical calculations
- All in a sandboxed environment

---

> **Key Takeaway for Module 9**: APIs are how prompt engineering moves from experimentation to production. Each provider has unique strengths — OpenAI for breadth of features, Claude for safety and long context, Gemini for multimodal and Google integration, open-source for privacy and control. Understanding the API patterns, cost structures, and capabilities of each platform lets you choose the right tool for every task.
