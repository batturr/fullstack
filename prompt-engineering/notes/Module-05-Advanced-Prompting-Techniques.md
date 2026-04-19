# MODULE 5: Advanced Prompting Techniques

---

## 5.1 Chain-of-Thought (CoT) Prompting

### Original Paper
Wei et al. (2022) — *"Chain-of-Thought Prompting Elicits Reasoning in Large Language Models"* demonstrated that including intermediate reasoning steps in prompts dramatically improves LLM performance on reasoning tasks.

### How CoT Works
Instead of asking the model to jump directly from question to answer, you guide it to **show its reasoning step by step**. This mimics how humans solve complex problems — breaking them into smaller, manageable steps.

**Without CoT**:
```
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 balls. How many tennis balls does he have now?
A: 11
```

**With CoT**:
```
Q: Roger has 5 tennis balls. He buys 2 more cans of tennis balls. Each can has 3 balls. How many tennis balls does he have now?
A: Roger started with 5 balls. He bought 2 cans, and each can has 3 balls, so he bought 2 × 3 = 6 balls. Now he has 5 + 6 = 11 balls. The answer is 11.
```

The reasoning trace forces the model to compute intermediate values rather than guessing the final answer.

### Zero-Shot CoT: "Let's Think Step by Step"
The simplest form — append a single phrase to your prompt:

```
Q: A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?

Let's think step by step.
```

This single phrase ("Let's think step by step") was shown by Kojima et al. (2022) to improve zero-shot reasoning by 40-70% on some benchmarks. The phrase triggers the model to generate an explicit reasoning chain.

Other effective trigger phrases:
- "Let's work through this step by step."
- "Let's break this down."
- "Let me think about this carefully."
- "First, let's identify what we know, then solve."

### Few-Shot CoT: Providing Examples with Reasoning Traces
Provide examples that include the reasoning process, not just the final answer:

```
Q: If a train travels at 60 mph for 2.5 hours, how far does it travel?
A: Distance = speed × time. Distance = 60 mph × 2.5 hours = 150 miles. The answer is 150 miles.

Q: A store has a 20% off sale. If a jacket costs $80, what is the sale price?
A: The discount is 20% of $80 = 0.20 × $80 = $16. The sale price is $80 - $16 = $64. The answer is $64.

Q: A rectangle has a length of 12 cm and a width of 8 cm. What is the perimeter?
A:
```

### When to Use CoT

**Mathematical word problems**: CoT prevents the model from pattern-matching to wrong answers. The bat-and-ball problem above is a classic example — without CoT, most models say "$0.10" (wrong); with CoT, they correctly compute "$0.05".

**Logical reasoning tasks**:
```
All roses are flowers. Some flowers fade quickly. Can we conclude that some roses fade quickly?

Let's think step by step.
1. We know all roses are flowers.
2. We know some flowers fade quickly.
3. However, the flowers that fade quickly might not include any roses.
4. So we cannot conclude that some roses fade quickly.
The answer is: No, we cannot draw that conclusion.
```

**Multi-step analytical questions**:
```
Should our company expand into the European market?

Let's analyze this step by step:
1. Current market position: [analysis]
2. European market opportunity: [analysis]
3. Regulatory requirements: [analysis]
4. Resource requirements: [analysis]
5. Risk assessment: [analysis]
6. Conclusion: [recommendation]
```

**Decision-making scenarios**: CoT forces the model to weigh multiple factors explicitly rather than jumping to a conclusion.

### Automatic Chain-of-Thought (Auto-CoT)
Zhang et al. (2022) proposed Auto-CoT, which automatically generates CoT demonstrations:

1. Cluster the questions by similarity
2. Select a representative question from each cluster
3. Use zero-shot CoT ("Let's think step by step") to generate reasoning chains for those questions
4. Use the auto-generated demonstrations as few-shot examples

This eliminates the need for manually writing CoT examples while maintaining most of the quality.

### CoT with Self-Verification
An enhanced technique where the model:
1. Generates a reasoning chain and answer
2. Checks its own work by verifying each step
3. If it finds an error, corrects and regenerates

```
Q: [question]

Step 1: Solve the problem step by step.
Step 2: Now verify each step of your solution.
Step 3: If you found any errors, provide the corrected solution.
```

### Limitations
- **Verbosity**: CoT outputs are much longer (more tokens = more cost)
- **Error propagation**: if an early reasoning step is wrong, subsequent steps build on the error
- **Not always needed**: for simple tasks, CoT adds cost without benefit
- **Faithful reasoning**: the displayed reasoning may not reflect the model's actual computation — it might generate the answer first and rationalize backward

---

## 5.2 Self-Consistency Prompting

### Original Paper
Wang et al. (2022) — *"Self-Consistency Improves Chain of Thought Reasoning in Language Models"*

### Core Idea
Instead of generating a single reasoning path (as in standard CoT), generate **multiple independent reasoning paths** for the same question, then select the **most common answer** (majority vote).

The insight: different reasoning paths might make different errors, but the correct answer will tend to appear most frequently.

### How Self-Consistency Improves Over Greedy CoT Decoding
Standard CoT uses **greedy decoding** (temperature ~0) — one deterministic reasoning path. If that path contains an error, you get a wrong answer.

Self-consistency uses **diverse sampling** (temperature ~0.5–0.7) — multiple different reasoning chains. Even if some chains have errors, the majority converges on the correct answer.

### Implementation
```
1. Take your CoT prompt
2. Set temperature = 0.7 (or similar — enough for diversity)
3. Generate N responses (typically N = 5 to 40)
4. Extract the final answer from each response
5. Return the answer that appears most frequently (majority vote)
```

**Example with N=5**:
```
Path 1: ... The answer is 42. ✓
Path 2: ... The answer is 38. ✗
Path 3: ... The answer is 42. ✓
Path 4: ... The answer is 42. ✓
Path 5: ... The answer is 40. ✗

Majority vote → 42 (3/5 paths agree)
```

### Temperature Settings for Diverse Reasoning Paths
- Too low (0.0–0.2): all paths are nearly identical → no benefit from multiple samples
- Too high (1.0+): paths become incoherent → too many errors
- Sweet spot (0.5–0.7): enough diversity to explore different approaches while maintaining quality

### Cost-Benefit Analysis
| N (samples) | Accuracy Improvement | Cost Multiplier |
|-------------|---------------------|-----------------|
| 1 (baseline CoT) | 0% | 1× |
| 5 | +5-10% | 5× |
| 10 | +8-15% | 10× |
| 20 | +10-18% | 20× |
| 40 | +12-20% | 40× |

Diminishing returns after ~10–20 samples. The optimal N depends on your accuracy requirements and budget.

### Use Cases
- **Math problems**: different approaches to the same problem converge on the right answer
- **Commonsense reasoning**: reducing the impact of random reasoning errors
- **Ambiguous questions**: the majority answer represents the most reasonable interpretation
- **High-stakes decisions**: when one wrong answer is costly, the extra API cost is worth it

---

## 5.3 Tree of Thoughts (ToT)

### Original Paper
Yao et al. (2023) — *"Tree of Thoughts: Deliberate Problem Solving with Large Language Models"*

### Concept
While CoT produces a single linear chain of reasoning, ToT explores **multiple reasoning branches** at each step, evaluates them, and prunes unpromising paths — like a decision tree.

```
         [Problem]
        /    |    \
    [Thought A] [Thought B] [Thought C]     ← Generate multiple options
       |          |           |
    [Eval: 8/10] [Eval: 3/10] [Eval: 7/10]  ← Evaluate each
       |                       |
    [Continue A]            [Continue C]      ← Prune bad branches
      / \                    / \
   [A1] [A2]             [C1] [C2]           ← Expand promising ones
```

### Difference from CoT: Branching vs. Linear Reasoning
- **CoT**: one path from start to finish — if you go wrong, you're stuck
- **ToT**: explore multiple paths — if one is bad, try another
- **Self-Consistency**: multiple complete paths, vote at the end
- **ToT**: evaluate and prune at each intermediate step (more efficient)

### BFS vs. DFS Exploration Strategies

**Breadth-First Search (BFS)**:
- Explore all branches at the current depth before going deeper
- Better for: problems where early steps matter most, when you need to compare options side by side
- More memory intensive but more thorough

**Depth-First Search (DFS)**:
- Explore one branch fully before backtracking
- Better for: problems with clear dead-end indicators, sequential puzzles
- More memory efficient, may find solutions faster

### Self-Evaluation at Each Node
At each intermediate step, the model evaluates whether the current thought is promising:

```
Given the current state of the problem, evaluate this partial solution.
Rate it from 1-10 on how likely it is to lead to the correct answer.
Explain your reasoning.
```

This self-evaluation allows pruning — abandoning unpromising branches early.

### Use Cases

**Creative writing**:
```
Write a mystery story. At each plot point, generate 3 possible directions.
Evaluate each for narrative tension, logical consistency, and reader engagement.
Select the best and continue.
```

**Game of 24**: Given four numbers, use +, -, ×, ÷ to make 24.
```
Numbers: 4, 5, 6, 10

Branch 1: 10 - 4 = 6 → now have 5, 6, 6 → 5 × 6 - 6 = 24 ✓
Branch 2: 6 - 5 = 1 → now have 1, 4, 10 → dead end
Branch 3: 4 × 5 = 20 → now have 6, 10, 20 → dead end
```

**Strategic planning**: evaluate multiple strategic options before committing
**Complex debugging**: explore different hypotheses for a bug

### Implementation Walkthrough
A practical ToT implementation:

```
Step 1: "Given this problem, generate 3 different initial approaches."
Step 2: "For each approach, evaluate its promise (1-10) and explain why."
Step 3: "Take the top 2 approaches and develop each one step further."
Step 4: "Evaluate the new states. Prune any that score below 5."
Step 5: "Continue expanding the best branch until you reach a solution."
```

### Computational Cost Considerations
- ToT requires **many more LLM calls** than CoT (one per node evaluation)
- A tree with branching factor 3 and depth 4 = up to 120 LLM calls for one problem
- Best reserved for high-value problems where the extra cost is justified
- Can be optimized by aggressive pruning and lower branching factor

---

## 5.4 ReAct (Reasoning + Acting) Prompting

### Original Paper
Yao et al. (2022) — *"ReAct: Synergizing Reasoning and Acting in Language Models"*

### Combining Reasoning Traces with Action Steps
ReAct interleaves two types of outputs:
- **Thought**: the model's internal reasoning ("I need to find out when this person was born...")
- **Action**: an external action to take (search, calculate, look up)
- **Observation**: the result of the action (search results, calculation output)

### The Thought → Action → Observation Loop

```
Question: What is the age difference between the founder of Tesla and the founder of Amazon?

Thought 1: I need to find who founded Tesla and Amazon, and their birth dates.
Action 1: Search["founder of Tesla"]
Observation 1: Tesla was founded by Martin Eberhard and Marc Tarpenning in 2003. Elon Musk joined later as chairman and became CEO.

Thought 2: The question likely refers to Elon Musk as the popular founder. Let me find his birth date.
Action 2: Search["Elon Musk birth date"]
Observation 2: Elon Musk was born on June 28, 1971.

Thought 3: Now I need Jeff Bezos's birth date (founder of Amazon).
Action 3: Search["Jeff Bezos birth date"]
Observation 3: Jeff Bezos was born on January 12, 1964.

Thought 4: Elon Musk (1971) and Jeff Bezos (1964). The age difference is 1971 - 1964 = 7 years.
Action 4: Finish["Jeff Bezos is approximately 7 years older than Elon Musk."]
```

### Integration with External Tools
ReAct's power comes from connecting the model to real-world tools:
- **Web search**: look up facts, current information
- **Calculator**: perform precise arithmetic
- **Code interpreter**: run code, analyze data
- **Database queries**: look up structured data
- **APIs**: get weather, stock prices, translations, etc.

### Use Cases

**Question answering with fact-checking**:
The model doesn't have to rely on its training data — it can verify facts in real-time.

**Interactive problem-solving**:
```
Task: Debug why the API is returning 500 errors.

Thought: Let me check the server logs first.
Action: ReadLogs["/var/log/api/error.log", last=50]
Observation: [log output showing database connection timeout]

Thought: It's a database connection issue. Let me check if the database is running.
Action: CheckService["postgresql"]
Observation: PostgreSQL is running but at 98% memory usage.

Thought: The database is running out of memory. Let me check active connections.
Action: RunQuery["SELECT count(*) FROM pg_stat_activity"]
Observation: 487 active connections (max_connections = 500)

Thought: Almost at max connections. There's likely a connection leak. 
Action: Finish["Root cause: connection leak causing near-max DB connections and timeouts. Recommend: check for unclosed connections in recent code changes."]
```

### ReAct vs. Pure CoT Performance Comparison
- **Factual questions**: ReAct significantly outperforms CoT (can verify facts instead of guessing)
- **Reasoning-only tasks**: CoT is comparable or better (no need for external tools)
- **Tasks requiring current information**: ReAct wins decisively
- **Multi-step real-world tasks**: ReAct excels (can take real actions)

### Error Recovery in ReAct Chains
If an action returns unexpected results, the model can adapt:
```
Thought: The search didn't return useful results. Let me try a different query.
Action: Search["alternative query"]
```

This adaptive behavior makes ReAct more robust than static CoT chains.

### Building a Simple ReAct Agent from Scratch
Pseudocode framework:
```
tools = {search, calculator, wikipedia, finish}

prompt = """
You have access to the following tools: {tools}
Use the format: Thought/Action/Observation

Question: {user_question}
"""

while not finished:
    response = llm.generate(prompt + conversation_history)
    thought, action = parse(response)
    observation = execute_tool(action)
    conversation_history += thought + action + observation
```

---

## 5.5 Meta Prompting

### Asking the LLM to Generate or Improve Prompts
Meta prompting uses the model's language understanding to create better prompts — essentially using AI to improve AI.

**Prompt generation**:
```
I need to classify customer support tickets into categories.
The categories are: Billing, Technical, Account, Shipping, Returns.

Generate an optimal prompt for this classification task that would work 
well with GPT-4. Include 2 few-shot examples per category.
```

### Self-Refining Prompts Through Iterative Feedback
```
Step 1: Here's my prompt: "[original prompt]"
Step 2: "What are the weaknesses of this prompt? How could it be misinterpreted?"
Step 3: "Rewrite the prompt to address those weaknesses."
Step 4: "Test the new prompt with these edge cases: [examples]"
Step 5: "Refine further based on the test results."
```

### Prompt Optimization Loops
Automated meta-prompting loop:
```
1. Start with initial prompt P₀
2. Run P₀ on test dataset → measure performance
3. Ask LLM: "This prompt scored 72%. Here are the failures: [examples]. How should I modify the prompt?"
4. LLM generates improved prompt P₁
5. Run P₁ on test dataset → measure performance
6. Repeat until performance plateau
```

### Using One Model to Write Prompts for Another
Sometimes a larger model (GPT-4) can craft better prompts for a smaller model (GPT-3.5-turbo):

```
System: You are an expert prompt engineer.
User: Write an optimized prompt for GPT-3.5-turbo to perform sentiment analysis 
on product reviews. The prompt should work reliably even with a smaller model.
Include explicit output format instructions and 3 diverse examples.
```

### Key Meta-Prompting Techniques

**Self-critique prompt**:
```
Here is my response to the question "[question]":
[response]

Critique this response. Identify any errors, missing information, unclear 
explanations, or areas for improvement. Then provide an improved version.
```

**Information gap detection**:
```
I'm trying to answer this question: "[question]"
Here's what I know so far: "[context]"
What additional information would you need to provide a complete and accurate answer?
```

**Prompt rewriting**:
```
Original prompt: "Write about dogs"
Rewrite this prompt to be more specific and likely to produce a high-quality response.
Consider: target audience, desired format, length, tone, and specific aspects to cover.
```

---

## 5.6 Generated Knowledge Prompting

### Overview
Ask the model to **generate relevant knowledge first**, then use that knowledge to answer the question. This two-step process improves accuracy on knowledge-intensive tasks.

### Two-Step Process

**Step 1 — Generate knowledge**:
```
Generate 5 facts about how photovoltaic cells convert sunlight into electricity.
```

**Step 2 — Answer using generated knowledge**:
```
Using the facts above, explain to a homeowner why solar panel efficiency 
varies throughout the day and across seasons.
```

### Why It Works
- Activates relevant information in the model's "memory" before answering
- Forces the model to recall specific facts rather than generating a vague answer
- The generated facts serve as a grounding context for the final answer
- Similar to how a student might review notes before writing an essay

### Comparison with Retrieval-Augmented Approaches
| Aspect | Generated Knowledge | RAG (Retrieval-Augmented) |
|--------|-------------------|--------------------------|
| **Source** | Model's training data | External documents/database |
| **Accuracy** | Limited to training data (may hallucinate) | Grounded in real documents |
| **Freshness** | Limited by knowledge cutoff | Can use current data |
| **Cost** | Extra generation tokens | Retrieval infrastructure + tokens |
| **Best for** | General knowledge tasks | Domain-specific, current data tasks |

### Examples

**Commonsense QA**:
```
Step 1: "Generate 3 relevant facts about how penguins survive in Antarctica."
→ "1. Penguins huddle together for warmth. 2. Their feathers trap air for insulation. 3. They have countercurrent heat exchange in their flippers."

Step 2: "Using these facts, answer: Why don't penguins freeze in Antarctica?"
→ [comprehensive, grounded answer]
```

**Domain-specific question**:
```
Step 1: "List the key principles of database normalization up to Third Normal Form."
Step 2: "Using these principles, analyze whether this table design is properly normalized: [table schema]"
```

---

## 5.7 Prompt Chaining

### Breaking Complex Tasks into a Sequence of Simpler Prompts
Instead of one mega-prompt, use a pipeline where each prompt handles one subtask and passes its output to the next.

### Output of One Prompt Becomes Input to the Next

```
Chain for writing a research article:

Prompt 1 (Research): "List the 5 most important recent findings about [topic]"
    → Output: list of findings

Prompt 2 (Outline): "Using these findings, create a detailed article outline with 
   introduction, 3 body sections, and conclusion"
    → Output: article outline

Prompt 3 (Draft): "Write the full article following this outline. Each section 
   should be 200-300 words."
    → Output: full draft

Prompt 4 (Edit): "Review this draft for accuracy, clarity, and flow. 
   Fix any issues and improve the writing."
    → Output: polished article

Prompt 5 (SEO): "Add an SEO-optimized title, meta description, and suggest 
   5 relevant tags for this article."
    → Output: final article with metadata
```

### Designing Effective Prompt Chains
**Principles**:
1. Each link should have a single, clear responsibility
2. Output format of step N should match expected input of step N+1
3. Include validation/quality checks between steps
4. Allow for branching (if step 2 fails quality check → retry step 2)
5. Keep each step simple enough to be reliable

### Error Handling Between Chain Links
```
Step 1 output → Validation check:
  - Is the output in the expected format?
  - Does it contain the required information?
  - Is it within acceptable quality bounds?
  
If validation fails:
  - Retry the step (up to 3 times)
  - Modify the prompt with feedback about the failure
  - Fall back to a simpler approach
  - Alert a human for review
```

### Use Cases

**Research → Outline → Draft → Edit → Polish**:
Content creation pipeline (described above)

**Extract → Transform → Load (ETL)**:
```
Step 1 (Extract): "Extract all product mentions from these customer reviews: [reviews]"
Step 2 (Transform): "Normalize product names and count mentions: [extracted data]"
Step 3 (Load): "Format as a CSV with columns: product_name, mention_count, avg_sentiment"
```

**Analyze → Recommend → Justify**:
```
Step 1: "Analyze these three investment options: [data]"
Step 2: "Based on your analysis, recommend the best option for a conservative investor"
Step 3: "Justify your recommendation with specific data points and risk considerations"
```

---

## 5.8 Directional Stimulus Prompting

### Providing Small Hints or Cues to Guide Output Direction
Instead of fully specifying the desired output, provide subtle hints that steer the model in the right direction.

### Keyword-Based Steering
```
Write a product description for a luxury watch.
Keywords to incorporate: craftsmanship, heritage, precision, timeless

[The model naturally weaves these keywords into a cohesive description]
```

### Partial Answer Seeding
Start the model's response to guide its direction:

```
Q: What are the pros and cons of remote work?

A: Remote work has fundamentally transformed the modern workplace. 

On the positive side,
```

By starting the answer, you control:
- The tone (analytical, not casual)
- The structure (will discuss pros first)
- The level of formality

### When Directional Stimulus Outperforms Direct Instruction
- **Creative tasks**: hints inspire without constraining too much
- **Nuanced tone control**: keywords capture tone better than lengthy descriptions
- **Avoiding over-specification**: sometimes detailed instructions make output feel forced
- **Brainstorming**: seed words open up creative directions

---

## 5.9 Least-to-Most Prompting

### Decomposing Complex Problems into Sub-Problems
Least-to-most prompting (Zhou et al., 2022) explicitly decomposes a complex problem into simpler sub-problems, then solves them in order from simplest to most complex.

### Solving from Simplest to Most Complex

**Step 1 — Decomposition**:
```
Question: "If Amy can read 50 pages per hour and a book has 300 pages, and she reads 
for 2 hours each day, how many days will she take to finish 3 books?"

Break this problem into simpler sub-questions that, when answered in order, 
will lead to the final answer.
```
→ Sub-questions:
1. How many pages can Amy read per day?
2. How many days to finish one book?
3. How many days to finish 3 books?

**Step 2 — Sequential solving**:
```
Q1: Amy reads 50 pages/hour × 2 hours/day = 100 pages per day.
Q2: 300 pages ÷ 100 pages/day = 3 days per book.
Q3: 3 days/book × 3 books = 9 days.
```

### Each Solution Feeds into the Next
The answer to each sub-question provides context for the next one, building up to the full solution.

### Superior to CoT for Compositional Generalization
Least-to-most works better than CoT when:
- The problem can be cleanly decomposed into independent sub-problems
- The sub-problems involve similar reasoning patterns at different scales
- The task requires compositional generalization (applying known rules in new combinations)

### Examples
**Multi-step math**: as shown above
**Symbolic reasoning**: "If A implies B, and B implies C, and C implies D, does A imply D?"
→ Sub-questions: Does A imply B? Does A imply C (via B)? Does A imply D (via C)?

---

## 5.10 Automatic Prompt Engineer (APE)

### Original Paper
Zhou et al. (2022) — *"Large Language Models Are Human-Level Prompt Engineers"*

### LLMs Generating and Selecting Optimal Prompts
APE uses LLMs to:
1. **Generate** candidate instructions for a task
2. **Evaluate** each candidate on a test dataset
3. **Select** the best-performing instruction

### Instruction Induction
Given input-output pairs, the model generates the instruction that would produce those outputs:

```
Input: "happy" → Output: "sad"
Input: "hot" → Output: "cold"
Input: "big" → Output: "small"

What instruction would produce these input-output pairs?
→ "Generate the antonym of the given word."
```

### Scoring Candidate Prompts
1. Generate 20-50 candidate prompts
2. Run each on a validation set (50-100 examples)
3. Score by accuracy (or other metric)
4. Select the top performer
5. Optionally: generate variations of the top performer and re-evaluate

### Practical Workflow for APE
```
1. Collect 10-20 input-output examples of your desired task
2. Ask GPT-4: "What instruction would produce these outputs from these inputs? Generate 10 different phrasings."
3. Test each instruction on 50 held-out examples
4. Pick the top 3 performers
5. Ask GPT-4: "Generate 5 variations of each of these instructions"
6. Test the 15 variations
7. Deploy the winner
```

---

## 5.11 Active Prompting

### Identifying the Most Uncertain Examples for Annotation
Active prompting (Diao et al., 2023) selects the most informative few-shot examples by measuring the model's uncertainty.

### Using Uncertainty Metrics
1. Run the model on a set of candidate examples multiple times (different temperatures)
2. Measure disagreement across runs (high disagreement = high uncertainty)
3. Select the examples with the highest uncertainty for human annotation
4. Use these annotated examples as few-shot demonstrations

### Adaptive Example Selection Based on Task Difficulty
The insight: not all examples are equally useful. Examples where the model is most uncertain provide the most learning signal.

**Standard few-shot**: randomly select examples → may pick easy ones that don't help
**Active prompting**: select examples the model struggles with → maximally informative

### Pool-Based Active Learning for Prompts
```
1. Start with a pool of unlabeled examples
2. Run zero-shot or basic few-shot on all examples
3. Identify examples where the model is least confident
4. Annotate those specific examples (human labels the correct answer)
5. Add annotated examples to the few-shot prompt
6. Re-evaluate — repeat if needed
```

---

## 5.12 Multimodal CoT Prompting

### Combining Text and Image Reasoning
Multimodal CoT extends chain-of-thought to include visual information alongside text.

### Vision-Language Models and CoT
Models like GPT-4V, Gemini, and Claude 3 can process images. Multimodal CoT guides them to reason about visual content step by step:

```
[Image of a bar chart showing quarterly sales]

Let's analyze this chart step by step:
1. First, identify the chart type and axes.
2. Read the values for each quarter.
3. Calculate the year-over-year growth rate.
4. Identify the trend.
5. Provide a business interpretation.
```

### Describing Visual Elements as Reasoning Steps
For complex visual reasoning, explicitly ask the model to describe what it sees before drawing conclusions:

```
[Image of a complex circuit diagram]

Step 1: Describe the components visible in this circuit diagram.
Step 2: Trace the current flow from the power source.
Step 3: Identify any parallel or series connections.
Step 4: Calculate the total resistance.
```

### Applications
- **Document understanding**: reading forms, invoices, contracts with mixed text and visuals
- **Chart analysis**: interpreting graphs, dashboards, and data visualizations
- **Scientific diagrams**: analyzing molecular structures, anatomical diagrams, engineering blueprints
- **Spatial reasoning**: understanding maps, floor plans, architectural drawings
- **Math problems with figures**: geometry problems that include diagrams

---

> **Key Takeaway for Module 5**: Advanced techniques transform LLMs from simple question-answering machines into sophisticated reasoning engines. CoT, Self-Consistency, ToT, and ReAct each address different aspects of reasoning — linear, ensemble, branching, and interactive. Meta prompting and APE let AI improve its own prompts. The right technique depends on the task complexity, accuracy requirements, and budget.
