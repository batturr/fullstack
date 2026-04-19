# MODULE 10: Retrieval-Augmented Generation (RAG)

---

## 10.1 RAG Fundamentals

### Why LLMs Need External Knowledge
LLMs have three fundamental knowledge limitations:
1. **Knowledge cutoff**: they only know what was in their training data (e.g., GPT-4's cutoff is April 2023)
2. **Hallucinations**: they confidently fabricate information when unsure
3. **No private data**: they don't know your company's internal documents, products, or processes

RAG solves all three by **retrieving relevant information from external sources and injecting it into the prompt** before generation.

### The RAG Architecture: Retrieve → Augment → Generate

```
User Query → [1. RETRIEVE] → [2. AUGMENT] → [3. GENERATE] → Response

1. RETRIEVE: Search a knowledge base for documents relevant to the query
2. AUGMENT: Insert retrieved documents into the prompt as context
3. GENERATE: LLM generates a response grounded in the retrieved context
```

**Concrete example**:
```
User: "What's our company's refund policy for enterprise customers?"

1. RETRIEVE: Search company docs → finds "Enterprise Refund Policy v3.2"
2. AUGMENT: 
   "Based on the following company policy document, answer the user's question.
    
    Document: [Enterprise Refund Policy v3.2 content...]
    
    Question: What's our company's refund policy for enterprise customers?"
3. GENERATE: LLM produces an accurate answer grounded in the actual policy
```

### RAG vs. Fine-Tuning: When to Use Which

| Criterion | RAG | Fine-Tuning |
|-----------|-----|-------------|
| **Knowledge updates** | Easy — update documents, no retraining | Hard — must retrain |
| **Source attribution** | Can cite specific documents | Cannot cite sources |
| **Cost** | Retrieval infrastructure + longer prompts | Training compute + shorter prompts at inference |
| **Setup time** | Hours to days | Days to weeks |
| **Accuracy** | Very high when documents are good | Risk of catastrophic forgetting |
| **Custom behavior/style** | Limited — mainly knowledge injection | Strong — changes model behavior |
| **Best for** | Knowledge-intensive, factual, up-to-date answers | Consistent style, format, or specialized behavior |

**Rule of thumb**: Use RAG for knowledge, fine-tuning for behavior.

### Types of RAG

**Naive RAG**: basic retrieve-and-generate — embed query, find similar chunks, stuff into prompt. Simple but has issues with retrieval quality and relevance.

**Advanced RAG**: adds pre-retrieval and post-retrieval optimizations:
- Pre-retrieval: query rewriting, expansion, decomposition
- Post-retrieval: re-ranking, filtering, compression

**Modular RAG**: composable architecture where each component (retrieval, augmentation, generation) can be independently swapped, combined, or extended.

---

## 10.2 Document Processing for RAG

### Document Loaders
Different document types require different parsers:
- **PDF**: PyPDF, pdfplumber, Unstructured, LlamaParse (handles complex layouts, tables)
- **DOCX**: python-docx, Unstructured
- **HTML**: BeautifulSoup, Unstructured (strips tags, preserves structure)
- **Markdown**: direct parsing (well-structured for splitting)
- **CSV/Excel**: pandas (load as structured data)
- **PowerPoint**: python-pptx
- **Confluence/Notion**: API-based loaders

### Text Splitting Strategies
After loading, documents must be split into smaller **chunks** for embedding and retrieval.

**Character-based splitting**:
Split every N characters. Simple but may cut mid-word or mid-sentence.
```python
chunks = [text[i:i+1000] for i in range(0, len(text), 1000)]
```

**Token-based splitting**:
Split by token count (aligned with model tokenization). More accurate for context window management.

**Recursive character splitting** (most popular):
Split on a hierarchy of separators — try paragraph breaks first, then sentences, then words:
```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    separators=["\n\n", "\n", ". ", " ", ""]
)
chunks = splitter.split_text(document)
```

**Semantic splitting**:
Use embeddings to detect where the topic changes, and split at topic boundaries. Produces more coherent chunks but is computationally expensive.

**Markdown/HTML-aware splitting**:
Split on headers and structural elements, preserving document hierarchy:
```python
from langchain.text_splitter import MarkdownHeaderTextSplitter

splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=[("#", "H1"), ("##", "H2"), ("###", "H3")]
)
```

### Chunk Size Optimization
| Chunk Size | Pros | Cons |
|-----------|------|------|
| Small (100–200 tokens) | Precise retrieval | May lack context, many chunks needed |
| Medium (300–500 tokens) | Good balance | Most common sweet spot |
| Large (500–1000 tokens) | Rich context per chunk | May include irrelevant info, fewer fit in prompt |

**Best practice**: experiment with your specific data. Start with 500 tokens and adjust based on retrieval quality.

### Chunk Overlap
Overlap prevents important information from being split across chunks:
- **0% overlap**: faster, less storage, but boundary information is lost
- **10–20% overlap**: standard — recovers most boundary context
- **Example**: chunk_size=500, overlap=100 means each chunk shares 100 tokens with its neighbors

### Metadata Extraction and Enrichment
Attach metadata to each chunk for filtering and context:
```python
chunk = {
    "text": "The enterprise plan includes...",
    "metadata": {
        "source": "pricing_guide_v3.pdf",
        "page": 12,
        "section": "Enterprise Pricing",
        "last_updated": "2025-01-15",
        "department": "Sales",
        "document_type": "policy"
    }
}
```
Metadata enables filtered retrieval: "Only search documents from the Sales department updated after 2024."

---

## 10.3 Embeddings and Vector Stores

### What Are Embeddings?
Embeddings are **dense vector representations** of text where semantically similar texts have similar vectors. They map text into a high-dimensional space where distance corresponds to meaning.

```
"How do I return a product?" → [0.12, -0.34, 0.56, ..., 0.78]  (1536 dimensions)
"What's the refund process?" → [0.11, -0.32, 0.55, ..., 0.77]  (very similar vector!)
"Tell me about quantum physics" → [0.89, 0.23, -0.45, ..., -0.12]  (very different vector)
```

### Embedding Models

| Model | Dimensions | Provider | Notes |
|-------|-----------|----------|-------|
| text-embedding-3-small | 1536 | OpenAI | Best cost/performance ratio |
| text-embedding-3-large | 3072 | OpenAI | Highest quality from OpenAI |
| text-embedding-ada-002 | 1536 | OpenAI | Legacy, still widely used |
| embed-v3 | 1024 | Cohere | Strong multilingual support |
| BGE-large-en-v1.5 | 1024 | BAAI | Best open-source option |
| E5-large-v2 | 1024 | Microsoft | Strong on retrieval benchmarks |
| all-MiniLM-L6-v2 | 384 | Sentence-Transformers | Fast, lightweight, free |

### Vector Databases

| Database | Type | Best For |
|----------|------|----------|
| **Pinecone** | Managed cloud | Production at scale, easy to use |
| **Weaviate** | Open-source / cloud | Hybrid search, GraphQL API |
| **Qdrant** | Open-source / cloud | High performance, filtering |
| **Chroma** | Open-source (embedded) | Prototyping, local development |
| **Milvus** | Open-source | Large-scale, enterprise |
| **pgvector** | PostgreSQL extension | If you're already using PostgreSQL |

### Indexing Strategies
- **Flat**: exact nearest neighbor search — 100% accurate but O(n) per query. Only for small datasets.
- **IVF (Inverted File Index)**: clusters vectors, searches only relevant clusters. Faster but approximate.
- **HNSW (Hierarchical Navigable Small World)**: graph-based — fast and accurate. Most popular choice.

### Hybrid Search
Combine vector (semantic) search with keyword (BM25) search:

```
Query: "HIPAA compliance requirements"

Vector search: finds semantically similar content (may find docs about "healthcare data regulations")
BM25 search: finds exact keyword matches ("HIPAA", "compliance")
Hybrid: combines both scores → best of both worlds
```

Hybrid search is especially important for queries with specific technical terms, names, or acronyms.

---

## 10.4 Retrieval Strategies

### Semantic Similarity Search
The basic approach — find chunks with the highest cosine similarity to the query embedding:
```python
# Pseudo-code
query_embedding = embed("user's question")
results = vector_store.similarity_search(query_embedding, top_k=5)
```

### Maximum Marginal Relevance (MMR)
Problem with pure similarity: the top 5 results might all say the same thing.
MMR balances **relevance** and **diversity**:
```python
results = vector_store.max_marginal_relevance_search(
    query_embedding, 
    k=5,           # Return 5 results
    lambda_mult=0.7  # 0=max diversity, 1=max relevance
)
```

### Multi-Query Retrieval
Generate multiple variations of the user's query to catch different angles:
```
Original: "How to improve website performance?"
Generated variations:
1. "What are best practices for web page speed optimization?"
2. "How to reduce website load time?"
3. "Website performance tuning techniques"
```
Search with all variations, merge and deduplicate results.

### Contextual Compression
Retrieved chunks may contain irrelevant information. Compress them to keep only what's relevant:
```
Retrieved chunk (500 tokens): [entire paragraph about product features, pricing, and support]
Compressed (100 tokens): [only the pricing information relevant to the query]
```

### Parent-Child Document Retrieval
Index small chunks (for precise retrieval) but return the larger parent document (for context):
```
Parent document: entire section (2000 tokens)
├── Child chunk 1 (200 tokens) ← matched by query
├── Child chunk 2 (200 tokens)
└── Child chunk 3 (200 tokens)

Query matches child chunk 1 → return the entire parent document
```

### Hypothetical Document Embeddings (HyDE)
Instead of embedding the query directly, ask the LLM to generate a hypothetical answer, then embed that:
```
Query: "What causes diabetes?"
Hypothetical answer: "Diabetes is primarily caused by insulin resistance (Type 2) 
or autoimmune destruction of beta cells (Type 1)..."
→ Embed the hypothetical answer (more similar to actual documents than the short query)
```

### Re-Ranking
After initial retrieval, use a cross-encoder model to re-rank results by relevance:
```python
# Step 1: Retrieve top 20 candidates (fast, approximate)
candidates = vector_store.search(query, top_k=20)

# Step 2: Re-rank with cross-encoder (slower, more accurate)
reranked = reranker.rank(query, candidates)

# Step 3: Take top 5 after re-ranking
final_results = reranked[:5]
```

Cross-encoders (Cohere Rerank, sentence-transformers cross-encoders) process query+document pairs jointly, giving much more accurate relevance scores than embedding similarity.

---

## 10.5 Prompt Engineering for RAG

### Structuring Prompts with Retrieved Context
```
System: "You are a helpful assistant that answers questions based on the provided context.
Only use information from the context. If the answer isn't in the context, say so."

User: """
Context:
---
[Document 1: Enterprise Pricing Guide, Page 5]
The enterprise plan costs $500/month per seat with a minimum of 10 seats...

[Document 2: Enterprise Pricing Guide, Page 8]
Annual billing provides a 20% discount on the per-seat price...
---

Question: How much does the enterprise plan cost with annual billing for 15 seats?
"""
```

### Citation and Source Attribution
```
"Answer the question using the provided documents. For each claim in your answer, 
cite the source document in [brackets].

Example format: 'The enterprise plan starts at $500/seat [Doc 1, Page 5], 
with a 20% annual billing discount [Doc 2, Page 8].'

If multiple documents support the same claim, cite all of them."
```

### Handling Contradictory Retrieved Information
```
"If the retrieved documents contain contradictory information:
1. Acknowledge the contradiction
2. Present both viewpoints with their sources
3. Note which document is more recent (if dates are available)
4. Do not resolve the contradiction — let the user decide"
```

### Reducing Hallucinations in RAG
```
"STRICT RULES:
- Only answer based on the provided context documents
- If the context doesn't contain enough information to fully answer, say: 
  'Based on the available documents, I can partially answer: [partial answer]. 
  However, the documents don't cover [missing aspect].'
- Never make up information, statistics, or quotes not in the documents
- Never extrapolate beyond what the documents explicitly state
- Distinguish between direct quotes and paraphrasing"
```

### RAG Prompt Template
```python
RAG_PROMPT = """You are a knowledgeable assistant. Answer the user's question 
using ONLY the information provided in the context below. 

Context:
{context}

Rules:
- If the answer is not in the context, say "I don't have enough information to answer this."
- Cite your sources using [Source: document_name, page/section]
- Be concise and direct
- If the context contains conflicting information, mention both viewpoints

Question: {question}

Answer:"""
```

---

## 10.6 Evaluating RAG Systems

### Retrieval Metrics
- **Precision@k**: of the top k retrieved documents, how many are relevant?
- **Recall@k**: of all relevant documents, how many are in the top k?
- **MRR (Mean Reciprocal Rank)**: average of 1/rank of the first relevant result
- **NDCG (Normalized Discounted Cumulative Gain)**: accounts for relevance grading and position

### Generation Metrics
- **Faithfulness**: does the answer only contain information from the context? (no hallucinations)
- **Answer relevancy**: does the answer actually address the question?
- **Context relevancy**: are the retrieved documents relevant to the question?
- **Answer correctness**: is the answer factually correct?

### RAGAS Framework
RAGAS (Retrieval Augmented Generation Assessment) provides automated evaluation:
```python
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision

result = evaluate(
    dataset=eval_dataset,  # Contains: question, answer, contexts, ground_truth
    metrics=[faithfulness, answer_relevancy, context_precision]
)
print(result)  # Scores per metric
```

### Continuous Monitoring
In production, continuously monitor:
- Retrieval hit rate (are queries finding relevant documents?)
- User satisfaction signals (thumbs up/down, follow-up questions)
- Latency (retrieval time + generation time)
- Cost per query (embedding + retrieval + generation tokens)
- Hallucination rate (spot-check outputs against source documents)

---

> **Key Takeaway for Module 10**: RAG is the bridge between LLMs and real-world knowledge. It solves hallucination, knowledge cutoff, and private data access problems. The quality of a RAG system depends on every component — document processing, chunking, embeddings, retrieval strategy, and prompt design. Invest in each layer, and always evaluate end-to-end.
