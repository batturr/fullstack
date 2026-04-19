# MODULE 2: Understanding Large Language Models (LLMs)

---

## 2.1 The Transformer Architecture

### The "Attention Is All You Need" Paper (Vaswani et al., 2017)
This landmark paper from Google Brain introduced the Transformer architecture, which replaced RNNs and LSTMs as the dominant architecture for NLP. The key insight was that **attention mechanisms alone** — without any recurrence or convolution — are sufficient to model dependencies in sequences.

Before transformers:
- RNNs processed tokens sequentially (one at a time, left to right) — slow and hard to parallelize
- Long-range dependencies were difficult to capture despite LSTMs

The transformer solved both problems with **self-attention** and **parallel processing**.

### Self-Attention Mechanism Explained Step-by-Step

Self-attention allows each token in a sequence to look at every other token and decide how much "attention" to pay to it. Here's how it works:

**Step 1 — Create three vectors for each token**:
For each input token embedding, multiply it by three learned weight matrices to produce:
- **Query (Q)**: "What am I looking for?"
- **Key (K)**: "What do I contain?"
- **Value (V)**: "What information do I provide?"

**Step 2 — Calculate attention scores**:
For each token, compute the dot product of its Query with every other token's Key:
```
Score(i, j) = Q_i · K_j
```
This measures how relevant token j is to token i.

**Step 3 — Scale the scores**:
Divide by the square root of the key dimension (√d_k) to prevent extremely large values that would push softmax into regions with vanishingly small gradients:
```
Scaled_Score = Score / √d_k
```

**Step 4 — Apply softmax**:
Convert scores to probabilities (all positive, sum to 1):
```
Attention_Weights = softmax(Scaled_Scores)
```

**Step 5 — Weighted sum of values**:
Multiply each Value vector by its attention weight and sum them up. This produces the new representation for each token that incorporates information from all other relevant tokens.

**Concrete Example**:
Sentence: "The cat sat on the mat because it was tired"
When processing the word "it", the self-attention mechanism assigns high attention weights to "cat" (because "it" refers to the cat), helping the model resolve the pronoun reference.

### Multi-Head Attention and Why It Matters
Instead of performing a single attention function, the transformer uses **multiple attention heads** in parallel (typically 8, 12, or 16 heads).

Each head learns to attend to different types of relationships:
- **Head 1** might focus on syntactic relationships (subject-verb)
- **Head 2** might focus on coreference (pronoun resolution)
- **Head 3** might focus on adjacent words
- **Head 4** might focus on semantic similarity

The outputs of all heads are concatenated and linearly projected. This gives the model a **richer, multi-faceted understanding** of token relationships.

```
MultiHead(Q, K, V) = Concat(head_1, head_2, ..., head_h) × W_O
where head_i = Attention(Q × W_Q_i, K × W_K_i, V × W_V_i)
```

### Positional Encoding: Sinusoidal and Learned Embeddings
Since transformers process all tokens simultaneously (no sequential order), they have no inherent notion of position. A model without positional encoding would treat "dog bites man" and "man bites dog" identically.

**Sinusoidal positional encoding** (original transformer):
Uses sine and cosine functions of different frequencies:
```
PE(pos, 2i)   = sin(pos / 10000^(2i/d_model))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d_model))
```
- Each position gets a unique encoding
- The model can learn to attend to relative positions
- Can theoretically generalize to longer sequences than seen during training

**Learned positional embeddings** (used in GPT, BERT):
- Each position has a learnable vector (just like word embeddings)
- Limited to the maximum sequence length seen during training
- Often works as well or better than sinusoidal for fixed-length contexts

**RoPE (Rotary Position Embedding)** (used in modern models like LLaMA):
- Encodes position information through rotation of the embedding space
- Naturally captures relative position
- Better extrapolation to longer sequences

### Encoder-Decoder Architecture vs. Decoder-Only Models

**Original Transformer (Encoder-Decoder)**:
- **Encoder**: processes the input sequence with bidirectional attention (every token can attend to every other token)
- **Decoder**: generates the output sequence one token at a time with causal (masked) attention (each token can only attend to previous tokens)
- Cross-attention: decoder attends to encoder's output
- Used in: T5, BART, translation models
- Best for: sequence-to-sequence tasks (translation, summarization)

**Encoder-Only Models**:
- Only the encoder part, with bidirectional attention
- Used in: BERT, RoBERTa, ELECTRA
- Best for: understanding tasks (classification, NER, question answering)

**Decoder-Only Models**:
- Only the decoder part, with causal attention
- Used in: GPT series, LLaMA, Claude, Gemini
- Best for: text generation, the dominant architecture for modern LLMs
- Key advantage: naturally suited for autoregressive generation (predicting next token)

### Layer Normalization, Residual Connections, Feed-Forward Layers

**Residual Connections (Skip Connections)**:
- The input to each sub-layer is added to its output: `output = sublayer(x) + x`
- This creates "gradient highways" that allow gradients to flow through the network without vanishing
- Makes it possible to train very deep networks (100+ layers)
- Borrowed from ResNet (2015 computer vision)

**Layer Normalization**:
- Normalizes activations across the feature dimension for each sample
- Stabilizes training and speeds up convergence
- Two variants:
  - **Post-LN** (original transformer): normalize after the sublayer + residual
  - **Pre-LN** (most modern models): normalize before the sublayer — more stable training

**Feed-Forward Network (FFN)**:
- A two-layer fully connected network applied independently to each position:
  ```
  FFN(x) = GELU(x × W₁ + b₁) × W₂ + b₂
  ```
- The inner dimension is typically 4× the model dimension (e.g., d_model=768 → FFN inner=3072)
- Acts as a "memory" where the model stores factual knowledge
- Each position is processed independently (no cross-token interaction — that's the attention's job)

---

## 2.2 Evolution of Language Models

### Statistical Language Models (N-grams)
The earliest language models used **n-gram statistics** — the probability of a word given the previous (n-1) words.

**Unigram**: P(word) — probability of each word independently
**Bigram**: P(word | previous_word) — "I" → "am" is more likely than "I" → "elephant"
**Trigram**: P(word | two_previous_words)

Limitations:
- Fixed context window (usually 3–5 words)
- Cannot capture long-range dependencies
- Sparse data: many n-gram combinations never appear in training data
- Massive storage requirements for large n
- Solutions like backoff and smoothing helped but were limited

### Neural Language Models (RNN-Based)
**Bengio et al. (2003)** introduced neural language models that used embeddings and neural networks instead of count-based statistics.

RNN-based models (2013–2017):
- Could theoretically capture unlimited context through hidden states
- In practice, limited by vanishing gradient
- LSTM and GRU variants improved long-range performance
- Google's Neural Machine Translation (GNMT, 2016) used LSTMs
- ELMo (2018) provided contextual word embeddings using bidirectional LSTMs

### The GPT Series

**GPT-1 (June 2018)**:
- 117 million parameters, 12-layer transformer decoder
- Key innovation: unsupervised pre-training on books, then fine-tuning on specific tasks
- Showed that generative pre-training creates useful representations
- Trained on BookCorpus (~7,000 books)

**GPT-2 (February 2019)**:
- 1.5 billion parameters, 48 layers
- Trained on WebText (40GB of internet text, 8 million web pages)
- Key finding: language models can perform tasks without fine-tuning (zero-shot)
- Initially not fully released due to concerns about misuse
- Could generate coherent paragraphs of text

**GPT-3 (June 2020)**:
- 175 billion parameters — 100× larger than GPT-2
- Trained on ~570GB of text data
- Landmark discovery: **in-context learning** — the model can learn new tasks from just a few examples in the prompt, without any parameter updates
- Few-shot, one-shot, and zero-shot performance competitive with fine-tuned models
- Cost ~$4.6 million to train

**GPT-4 (March 2023)**:
- Exact parameter count undisclosed (rumored ~1.8 trillion, mixture of experts)
- Multimodal: accepts both text and image inputs
- Passes bar exam (90th percentile), SAT (93rd percentile)
- Significantly improved reasoning, following instructions, and safety
- Much less likely to produce harmful content than GPT-3

**GPT-4o (May 2024)**:
- "o" stands for "omni" — natively multimodal (text, audio, vision)
- Real-time conversation speed (average 320ms response time)
- Can understand and generate speech, images, and text in an integrated way
- Reduced cost: 50% cheaper than GPT-4 Turbo
- Available to free-tier ChatGPT users

**GPT-5 (2025)**:
- Enhanced reasoning capabilities
- Longer context windows
- Better multimodal integration
- Improved factual accuracy and reduced hallucinations
- More capable agentic behavior

### BERT and Bidirectional Encoding
**BERT (Bidirectional Encoder Representations from Transformers)** — Google, October 2018.

Key difference from GPT: BERT uses **bidirectional** attention — each token attends to tokens both before and after it. GPT only looks left (causal attention).

**Training objectives**:
1. **Masked Language Model (MLM)**: randomly mask 15% of tokens, predict the masked ones
   - "The [MASK] sat on the mat" → predict "cat"
2. **Next Sentence Prediction (NSP)**: predict whether sentence B follows sentence A

**Impact**: BERT dominated NLP benchmarks (2018–2020) and is still widely used for classification, NER, question answering, and embedding generation.

**Variants**: RoBERTa (optimized BERT), ALBERT (parameter-efficient), DistilBERT (distilled/smaller), DeBERTa (disentangled attention).

### T5 (Text-to-Text Transfer Transformer)
Google's T5 (2019) converted **every NLP task** into a text-to-text format:
- Translation: "translate English to German: That is good" → "Das ist gut"
- Summarization: "summarize: [long text]" → "[summary]"
- Classification: "sentiment: I love this movie" → "positive"

This unified framework showed that a single model architecture could handle any text task.

### PaLM and Gemini (Google DeepMind)
- **PaLM (2022)**: 540 billion parameters, trained on 780 billion tokens. Showed breakthrough reasoning capabilities, especially with chain-of-thought prompting.
- **PaLM 2 (2023)**: improved multilingual, reasoning, and coding capabilities
- **Gemini (2023–2025)**: Google's multimodal model family. Gemini Ultra is their most capable model, competing directly with GPT-4. Natively multimodal from the ground up (not just bolted-on vision).

### LLaMA (Meta), Mistral, Claude (Anthropic)
- **LLaMA (2023)**: Meta's open-weight models (7B, 13B, 33B, 65B parameters). Showed that smaller, well-trained models can compete with much larger ones. LLaMA 2 added chat optimization. LLaMA 3 (2024) improved to 8B and 70B with state-of-the-art performance.
- **Mistral (2023–2024)**: French AI lab producing highly efficient models. Mistral 7B outperformed LLaMA 2 13B. Mixtral 8x7B used mixture of experts. Known for excellent performance-per-parameter.
- **Claude (Anthropic, 2023–2025)**: Founded by ex-OpenAI researchers. Focused on safety through Constitutional AI. Claude 3 family: Haiku (fast/cheap), Sonnet (balanced), Opus (most capable). Known for long context windows (200K tokens) and strong instruction following.

### Open-Source vs. Proprietary Models

| Aspect | Open-Source (LLaMA, Mistral) | Proprietary (GPT-4, Claude, Gemini) |
|--------|------------------------------|--------------------------------------|
| **Access** | Download and run locally | API access only |
| **Cost** | Free to use (compute costs only) | Pay per token |
| **Customization** | Full fine-tuning possible | Limited to prompting and sometimes fine-tuning API |
| **Privacy** | Data stays on your hardware | Data sent to provider's servers |
| **Performance** | Competitive but usually slightly behind frontier | Generally highest capability |
| **Support** | Community-driven | Professional support, SLAs |
| **Transparency** | Weights available, training partially documented | Architecture/training details undisclosed |

---

## 2.3 How LLMs Work Internally

### Pre-training: Masked Language Modeling and Next-Token Prediction

**Next-Token Prediction (Causal Language Modeling)** — used by GPT, LLaMA, Claude:
- Given a sequence of tokens, predict the next token
- Training data: trillions of tokens from the internet, books, code, etc.
- The model learns grammar, facts, reasoning patterns, coding, and more — all from this simple objective
- Example: "The capital of France is" → model predicts "Paris" with high probability

**Masked Language Modeling (MLM)** — used by BERT:
- Randomly mask tokens and predict them from surrounding context
- Bidirectional: uses both left and right context
- Better for understanding tasks but not for generation

The remarkable insight: **next-token prediction at scale produces general intelligence**. By trying to predict the next word in billions of documents, the model must learn to understand language, facts, logic, and reasoning.

### Tokenization Deep Dive: BPE, WordPiece, SentencePiece

**Byte-Pair Encoding (BPE)** — used by GPT:
1. Start with individual characters as the initial vocabulary
2. Count all adjacent character pairs in the training data
3. Merge the most frequent pair into a new token
4. Repeat steps 2–3 for a desired number of merges (e.g., 50,000 merges)

Example:
- "low lower lowest" initially: [l, o, w, _, l, o, w, e, r, _, l, o, w, e, s, t]
- Most frequent pair "l,o" → merge into "lo"
- Then "lo,w" → merge into "low"
- Continue until vocabulary reaches target size

**WordPiece** — used by BERT:
- Similar to BPE but uses likelihood instead of frequency to decide merges
- Prefixes subwords with "##" to indicate they're continuations: "playing" → ["play", "##ing"]

**SentencePiece** — used by LLaMA, T5:
- Language-agnostic: treats the input as a raw byte stream, no language-specific preprocessing
- Uses either BPE or unigram model underneath
- Can handle any language including Chinese, Japanese without word segmentation

**Practical implications**:
- Common words are single tokens: "the", "hello", "function"
- Rare words are split: "counterintuitively" → ["counter", "intuitive", "ly"]
- Numbers are often split: "2847" → ["28", "47"]
- This is why models sometimes struggle with character-level tasks (counting letters, reversing strings) — they don't "see" individual characters

### Context Window and Attention Limitations
The context window is the maximum number of tokens a model can process at once (input + output combined).

| Model | Context Window |
|-------|---------------|
| GPT-3 | 4,096 tokens (~3,000 words) |
| GPT-3.5 Turbo | 4,096 or 16,385 tokens |
| GPT-4 | 8,192 or 32,768 tokens |
| GPT-4 Turbo | 128,000 tokens (~96,000 words) |
| Claude 3 | 200,000 tokens (~150,000 words) |
| Gemini 1.5 Pro | 1,000,000 tokens |
| Gemini 2.0 | 2,000,000 tokens |

**Why context windows are limited**:
- Self-attention has O(n²) computational complexity — doubling context quadruples compute
- Memory requirements grow quadratically with sequence length
- Modern techniques like FlashAttention, sparse attention, and sliding window attention help

**The "Lost in the Middle" problem**: Models tend to pay more attention to information at the **beginning** and **end** of the context, sometimes missing crucial information in the middle. This is important for prompt design — put the most important information first or last.

### Scaling Laws: Model Parameters, Data Size, Compute Budget
**Chinchilla Scaling Laws** (Hoffmann et al., 2022):
- Model performance follows predictable power laws based on: model size (parameters), dataset size (tokens), and compute budget (FLOPs)
- **Key finding**: most large models were undertrained — they used too many parameters with not enough data
- Optimal ratio: ~20 tokens per parameter (a 70B model should be trained on ~1.4 trillion tokens)
- This is why LLaMA (65B trained on 1.4T tokens) outperformed much larger models that were trained on less data

### Emergent Capabilities at Scale
"Emergent capabilities" are abilities that appear suddenly when models reach a certain size, despite not being explicitly trained for:

- **Few-shot learning**: appears around 1B+ parameters
- **Chain-of-thought reasoning**: effective around 100B+ parameters
- **Multi-step arithmetic**: appears at very large scales
- **Code generation**: improves dramatically with scale
- **Instruction following**: strong at 10B+ with fine-tuning

This is controversial — some researchers argue these capabilities don't truly "emerge" suddenly but rather improve gradually and we just cross a usefulness threshold.

### In-Context Learning Phenomenon
In-context learning (ICL) is one of the most remarkable properties of LLMs:

- The model can learn to perform new tasks simply from **examples provided in the prompt**
- No weight updates, no gradient computation — the model "learns" purely from the context
- Example: provide 3 examples of French→English translation, then give a new French sentence → the model translates it

**Why it works** (theories):
1. Pre-training on diverse text teaches the model general task-solving patterns
2. The attention mechanism can implement gradient descent-like algorithms internally
3. The model recognizes the task format from pre-training data and activates relevant capabilities

---

## 2.4 Fine-Tuning and Alignment

### Supervised Fine-Tuning (SFT)
After pre-training on raw text, LLMs are fine-tuned on high-quality demonstrations of desired behavior.

**Process**:
1. Collect a dataset of (instruction, ideal_response) pairs — often human-written
2. Train the pre-trained model on this data with a lower learning rate
3. The model learns to follow instructions, be helpful, refuse harmful requests, etc.

**Example training data**:
```
Instruction: "Explain quantum entanglement in simple terms"
Response: "Imagine you have two coins that are magically linked..."
```

This is what transforms a raw text predictor into a helpful assistant.

### Reinforcement Learning from Human Feedback (RLHF)
RLHF is the process that made ChatGPT dramatically better than GPT-3:

**Step 1 — Train a reward model**:
- Show human annotators pairs of model outputs for the same prompt
- Humans rank which output is better
- Train a "reward model" to predict human preferences

**Step 2 — Optimize with reinforcement learning (PPO)**:
- The LLM generates responses
- The reward model scores each response
- Use Proximal Policy Optimization (PPO) to adjust the LLM's weights to produce higher-scoring responses
- Include a KL-divergence penalty to prevent the model from deviating too far from its pre-trained behavior

**Impact**: RLHF makes models more helpful, honest, and harmless. It's why ChatGPT felt qualitatively different from GPT-3 despite similar underlying capabilities.

### Direct Preference Optimization (DPO)
DPO (Rafailov et al., 2023) is a simpler alternative to RLHF:
- Eliminates the need for a separate reward model and RL training
- Directly optimizes the LLM from preference pairs (chosen vs. rejected responses)
- Reframes the RLHF objective as a classification problem
- Advantages: simpler to implement, more stable training, fewer hyperparameters
- Used by many open-source model trainers (LLaMA-based models, Zephyr)

### Constitutional AI (Anthropic's Approach)
Anthropic's method for training safer models:

**Step 1 — Red-team the model**: generate harmful outputs
**Step 2 — Self-critique**: ask the model to critique its own harmful response based on a set of principles ("the constitution")
**Step 3 — Self-revision**: ask the model to rewrite its response to be compliant with the principles
**Step 4 — Train on revised outputs**: use the self-improved data for RLHF

The "constitution" is a set of principles like:
- "Choose the response that is least harmful"
- "Choose the response that is most helpful while being honest"
- "Avoid responses that encourage illegal activity"

This reduces the need for massive human annotation — the model partially supervises itself.

### LoRA and QLoRA: Parameter-Efficient Fine-Tuning

**LoRA (Low-Rank Adaptation)**:
- Problem: fine-tuning a 70B parameter model requires enormous GPU memory
- Solution: instead of updating all parameters, decompose weight updates into low-rank matrices
- Only adds ~0.1-1% additional parameters
- The original weights are frozen; only the small adapter matrices are trained
- At inference, adapter weights can be merged into the original weights (no latency cost)
- Typical LoRA rank: 8–64 (much smaller than the model dimension of 4096+)

**QLoRA (Quantized LoRA)**:
- Combines LoRA with 4-bit quantization
- The base model is quantized to 4-bit precision (reducing memory ~4×)
- LoRA adapters are trained in 16-bit precision on top
- Enables fine-tuning a 65B model on a single 48GB GPU
- Minimal quality loss compared to full fine-tuning

### When to Fine-Tune vs. When to Prompt Engineer

| Scenario | Prompt Engineering | Fine-Tuning |
|----------|-------------------|-------------|
| **Quick prototyping** | ✅ Best choice | ❌ Too slow |
| **Limited data (<100 examples)** | ✅ Few-shot prompting | ❌ Insufficient data |
| **Specialized domain (thousands of examples)** | ⚠️ May not be enough | ✅ Better results |
| **Specific output format/style** | ✅ With clear instructions | ✅ More consistent |
| **Cost sensitivity (per-query)** | ❌ Long prompts = expensive | ✅ Shorter prompts after training |
| **Speed to production** | ✅ Minutes to hours | ❌ Days to weeks |
| **No ML expertise** | ✅ Accessible to anyone | ❌ Requires ML knowledge |
| **Privacy requirements** | ⚠️ Data sent to API | ✅ Local fine-tuning possible |

**Rule of thumb**: Start with prompt engineering. If you can't achieve desired quality after thorough prompt optimization, consider fine-tuning.

---

## 2.5 Model Parameters and Configuration

### Temperature
Controls the randomness/creativity of outputs by scaling the logits (raw prediction scores) before applying softmax.

- **Temperature = 0.0**: deterministic — always picks the most likely token. Best for factual questions, data extraction, classification
- **Temperature = 0.1–0.3**: mostly deterministic with slight variation. Good for analytical tasks, coding
- **Temperature = 0.5–0.7**: balanced creativity and coherence. Good for general conversation, content writing
- **Temperature = 0.8–1.0**: more creative and diverse. Good for brainstorming, creative writing
- **Temperature = 1.5–2.0**: very random, may produce incoherent text. Rarely useful

**How it works mathematically**:
```
P(token_i) = exp(logit_i / T) / Σ exp(logit_j / T)
```
- T < 1: sharpens the distribution (confident picks)
- T > 1: flattens the distribution (random picks)
- T = 1: default softmax

### Top-p (Nucleus Sampling)
Instead of considering all possible tokens, only consider the smallest set of tokens whose cumulative probability exceeds p.

- **Top-p = 0.1**: only consider the top 10% probability mass — very focused
- **Top-p = 0.5**: consider tokens until you reach 50% cumulative probability
- **Top-p = 0.9**: consider most likely tokens covering 90% probability — common default
- **Top-p = 1.0**: consider all tokens (disabled)

**Example**: If the next token probabilities are:
- "Paris" (60%), "Lyon" (20%), "Berlin" (10%), "London" (5%), "Tokyo" (3%), other (2%)
- Top-p = 0.9 → only consider {Paris, Lyon, Berlin, London} (95% > 90%)
- Then sample from this restricted set

**Temperature vs. Top-p**: OpenAI recommends adjusting one but not both. They serve similar purposes but work differently.

### Top-k Sampling
Consider only the k most probable tokens, regardless of their probability distribution.

- **Top-k = 1**: greedy decoding (always pick the most likely) = temperature 0
- **Top-k = 10**: choose from top 10 candidates
- **Top-k = 50**: common default, broad enough for creativity
- **Top-k = 0**: disabled (consider all tokens)

Limitation: a fixed k doesn't adapt to how confident the model is. If the model is very confident, k=50 introduces too much noise. If it's uncertain, k=50 might still be too restrictive. Top-p adapts dynamically.

### Max Tokens
Controls the maximum length of the generated output (in tokens, not words).

- Does NOT control quality — it's a hard cutoff
- If the model has more to say, it stops mid-sentence at the limit
- Setting it too low truncates responses; too high wastes potential cost
- Rule of thumb: 1 token ≈ 0.75 words in English
- Includes only output tokens; input tokens are separate

### Frequency Penalty
Reduces the likelihood of tokens that have already appeared in the output, proportional to how many times they've appeared.

- **Range**: -2.0 to 2.0 (OpenAI), 0 = disabled
- **Positive values** (0.5–1.5): discourage repetition — useful for creative writing
- **Negative values**: encourage repetition (rarely useful)
- Higher values more aggressively penalize repeated tokens
- Applied proportionally: a word used 5 times gets 5× the penalty of a word used once

### Presence Penalty
Similar to frequency penalty but binary — penalizes a token if it has appeared at all, regardless of how many times.

- **Range**: -2.0 to 2.0, 0 = disabled
- **Positive values**: encourage the model to talk about new topics
- Useful for: generating diverse content, exploration, avoiding circular responses
- The difference from frequency penalty: presence penalty is the same whether a word appeared 1 time or 100 times

### Stop Sequences
Strings that signal the model to stop generating. When the model produces a stop sequence, generation immediately terminates.

Common stop sequences:
- `"\n\n"` — stop at a double newline
- `"###"` — stop at a delimiter
- `"Human:"` — stop before generating the next turn in a dialogue
- `"```"` — stop after a code block

### Seed Parameter
A seed value for the random number generator. Using the same seed with the same prompt and parameters will produce **identical (deterministic) outputs**.

- Useful for: reproducible experiments, debugging, testing
- Not available on all platforms
- Even with a seed, model updates may change outputs

### Practical Experiments: How Each Parameter Affects Output Quality
A recommended exercise is to take the same prompt and vary each parameter:

**Prompt**: "Write a short poem about the ocean"
- Temperature 0.0 vs. 0.5 vs. 1.0 vs. 1.5
- Top-p 0.1 vs. 0.5 vs. 0.9 vs. 1.0
- Frequency penalty 0.0 vs. 0.5 vs. 1.0 vs. 2.0
- Max tokens 50 vs. 100 vs. 500

Document how each parameter change affects creativity, coherence, length, repetition, and overall quality.

---

## 2.6 Model Limitations and Failure Modes

### Hallucinations: Causes, Types, and Detection Strategies
Hallucination is when an LLM generates content that is **factually incorrect, fabricated, or unsupported** by its training data, yet presents it confidently as true.

**Types**:
- **Factual hallucination**: "The Eiffel Tower was built in 1920" (it was 1889)
- **Fabricated references**: inventing academic papers, URLs, or quotes that don't exist
- **Entity confusion**: mixing up facts about similar entities
- **Logical hallucination**: drawing invalid conclusions from valid premises

**Causes**:
1. Training data contains errors or contradictions
2. The model optimizes for fluency, not accuracy
3. Pattern matching can produce plausible-sounding but false statements
4. The model has no mechanism to verify its own outputs
5. Knowledge compressed into parameters is lossy

**Detection strategies**:
- Cross-reference with reliable sources
- Ask the model to cite sources (then verify them)
- Use self-consistency: ask the same question multiple ways
- Temperature 0 for factual queries
- RAG systems that ground answers in retrieved documents
- Specialized hallucination detection tools

### Knowledge Cutoff Dates
LLMs have a training data cutoff — they don't know about events that happened after their training data was collected.

- GPT-4: trained on data up to April 2023
- GPT-4 Turbo: up to December 2023
- Claude 3: up to early 2024
- This means asking about recent events will produce outdated or hallucinated answers
- Solution: RAG, web search integration, or clearly stating the model's knowledge boundary

### Context Window Limitations and "Lost in the Middle" Problem
Even with large context windows, models don't utilize all context equally:

**"Lost in the Middle" (Liu et al., 2023)**:
- Models perform best when relevant information is at the **beginning** or **end** of the context
- Information in the **middle** of a long context is more likely to be missed
- Performance degrades as context length increases, even within the window limit

**Implications for prompt design**:
- Place the most critical information and instructions at the start or end
- Don't bury important content in the middle of a long document
- Consider chunking and summarizing rather than dumping everything into context

### Sycophancy and People-Pleasing Behavior
Models trained with RLHF can develop **sycophantic tendencies** — they agree with the user even when the user is wrong, because RLHF rewards responses that users prefer (and users prefer agreement).

**Examples**:
- User: "2 + 2 = 5, right?" → Model: "Yes, you're correct!"
- User: "I think the earth is flat." → Model: "That's an interesting perspective..." (instead of correcting)
- User challenges the model's correct answer → Model backs down and agrees with the user

**Mitigation**:
- Constitutional AI (training to value honesty)
- Explicit prompt instructions: "Correct me if I'm wrong"
- DPO training with preference for honest over agreeable responses
- Awareness: know this tendency exists and critically evaluate outputs

### Reasoning Errors in Mathematical and Logical Tasks
Despite improvements, LLMs still struggle with:
- Multi-step arithmetic (especially large numbers)
- Formal logic (syllogisms, propositional logic)
- Spatial reasoning
- Counting (letters in a word, items in a list)
- Negation and double negation

**Why**: LLMs predict the most likely next token, not the logically correct one. They approximate reasoning through pattern matching, not true logical computation.

**Mitigation**: Chain-of-thought prompting, external tools (calculators, code interpreters), reasoning-specialized models (o1, o3)

### Sensitivity to Prompt Phrasing
The same question phrased differently can produce dramatically different answers:
- "What are the benefits of X?" vs. "What are the advantages of X?" → may get different responses
- Adding "think step by step" dramatically improves reasoning
- The order of examples in few-shot prompts affects performance
- Minor wording changes can flip a correct answer to incorrect

This is why prompt engineering matters — small changes in wording have outsized effects on output quality.

### Confidently Wrong Outputs
LLMs don't express uncertainty calibrated to their actual knowledge:
- They generate wrong answers with the same confident tone as correct answers
- There is no built-in "I don't know" detector
- The model's confidence (token probability) only loosely correlates with factual accuracy

**Mitigation**:
- Instruct the model: "If you're not sure, say 'I'm not sure'"
- Use self-consistency (multiple samples) to detect disagreement
- Cross-reference critical outputs with trusted sources
- RAG systems reduce this by grounding in documents

### Strategies to Mitigate Each Limitation

| Limitation | Strategy |
|------------|----------|
| Hallucinations | RAG, citations, low temperature, verification prompts |
| Knowledge cutoff | Web search tools, RAG with current data |
| Lost in the middle | Put key info at start/end, chunk documents |
| Sycophancy | "Correct me if wrong" instructions, Constitutional AI |
| Reasoning errors | CoT prompting, code interpreter, reasoning models |
| Prompt sensitivity | Test multiple phrasings, use structured prompts |
| Overconfidence | "Say I don't know if unsure" instructions, self-consistency |

---

> **Key Takeaway for Module 2**: Understanding how LLMs are built, trained, and configured gives you a massive advantage as a prompt engineer. Knowing that models predict tokens probabilistically, that temperature controls randomness, that context is limited and uneven, and that hallucinations are inherent — all of this informs how you craft effective prompts.
