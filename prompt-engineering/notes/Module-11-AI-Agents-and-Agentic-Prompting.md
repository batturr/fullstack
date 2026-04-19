# MODULE 11: AI Agents and Agentic Prompting

---

## 11.1 What Are AI Agents?

### Definition
An AI agent is an autonomous system that uses an LLM as its "brain" to **perceive its environment, make decisions, take actions, and learn from the results** — all to accomplish a goal specified by the user.

Unlike a chatbot (which responds to one message at a time), an agent can:
- Break a complex goal into sub-tasks
- Decide which tools to use and when
- Execute multi-step plans
- Handle errors and adapt its approach
- Maintain state across many actions

### Agents vs. Chatbots vs. Assistants

| Feature | Chatbot | Assistant | Agent |
|---------|---------|-----------|-------|
| **Interaction** | Single turn Q&A | Multi-turn conversation | Autonomous multi-step execution |
| **Tools** | None | Some (search, calculator) | Many (APIs, code, files, databases) |
| **Planning** | None | Minimal | Full planning and re-planning |
| **Autonomy** | None — waits for user | Low — follows user direction | High — acts independently toward goals |
| **State** | Stateless or conversation memory | Conversation memory | Rich state (memory, tools, environment) |
| **Example** | FAQ bot | ChatGPT with plugins | AutoGPT, Devin, research agents |

### The Agent Loop: Perceive → Think → Act → Observe
Every agent follows this fundamental cycle:

```
1. PERCEIVE: receive the task/goal and current state
2. THINK: reason about what to do next (using the LLM)
3. ACT: take an action (call a tool, write code, search the web)
4. OBSERVE: process the result of the action
5. REPEAT: go back to THINK with new information until the goal is achieved
```

### Single-Agent vs. Multi-Agent Systems
**Single-agent**: one LLM handles all reasoning and actions. Simpler but limited.
**Multi-agent**: multiple specialized LLM "agents" collaborate. Each has a specific role (researcher, writer, reviewer). More capable but more complex.

### Current Agent Frameworks
- **LangChain / LangGraph**: most popular, Python/JS, flexible
- **CrewAI**: role-based multi-agent collaboration
- **AutoGen (Microsoft)**: conversational multi-agent framework
- **Semantic Kernel (Microsoft)**: enterprise-focused
- **OpenAI Assistants API**: managed agent infrastructure
- **Anthropic tool use**: Claude-native function calling
- **Haystack**: modular, production-focused

---

## 11.2 Agent Architecture Patterns

### ReAct Agents
Interleave reasoning (Thought) with actions:
```
Thought: I need to find the current stock price of Apple.
Action: search("Apple AAPL current stock price")
Observation: AAPL is trading at $198.50 as of 3:00 PM EST.
Thought: Now I need to calculate the market cap.
Action: calculator("198.50 * 15400000000")
Observation: 3,056,900,000,000
Thought: Apple's market cap is approximately $3.06 trillion. I can now answer.
Final Answer: Apple's current market cap is approximately $3.06 trillion.
```

### Plan-and-Execute Agents
First create a complete plan, then execute each step:
```
Goal: "Write a comprehensive market analysis report for the electric vehicle industry"

PLANNING PHASE:
Step 1: Research current EV market size and growth rate
Step 2: Identify top 5 EV manufacturers and their market share
Step 3: Analyze regulatory environment (government incentives, emissions standards)
Step 4: Research technological trends (battery, charging, autonomous)
Step 5: Assess competitive dynamics and new entrants
Step 6: Compile findings into a structured report
Step 7: Review and refine the report

EXECUTION PHASE:
[Executes each step, potentially re-planning if new information changes the approach]
```

### Reflexion Agents
Add a self-reflection loop after execution:
```
1. Execute task
2. Evaluate result: "Did I achieve the goal? What went wrong?"
3. Reflect: "How can I improve my approach?"
4. Retry with improved strategy
```

### LATS (Language Agent Tree Search)
Combines Tree of Thoughts with agent actions:
- At each step, generate multiple possible actions
- Evaluate which action is most likely to succeed
- Execute the best action
- If it fails, backtrack and try the next best option
- Like a chess engine but for real-world problem-solving

### Memory Systems

**Short-term memory**: the conversation history (context window)
- Automatically maintained by including previous messages
- Limited by context window size

**Long-term memory**: persistent storage across sessions
- Vector database storing past interactions, facts, preferences
- Retrieved when relevant to current task

**Episodic memory**: specific past experiences
- "Last time the user asked about X, they wanted Y format"
- Helps personalize and improve over time

---

## 11.3 Tool Use and Function Calling

### Defining Tools for AI Agents
Tools are external capabilities the agent can invoke. Each tool needs:
- **Name**: clear, descriptive identifier
- **Description**: what the tool does (the LLM uses this to decide when to use it)
- **Parameters**: what inputs the tool accepts (JSON Schema)
- **Return type**: what the tool returns

```python
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_database",
            "description": "Search the product database by name, category, or price range. Use this when the user asks about specific products or wants to browse inventory.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "category": {"type": "string", "enum": ["electronics", "clothing", "books"]},
                    "max_price": {"type": "number", "description": "Maximum price in USD"}
                },
                "required": ["query"]
            }
        }
    }
]
```

**Key insight**: the tool **description** is critical — it's how the LLM decides when to use the tool. A poor description leads to the wrong tool being called (or no tool at all).

### Parallel Tool Calling
Modern models can call multiple tools simultaneously:
```
User: "What's the weather in New York and the stock price of AAPL?"

Model response:
Tool call 1: get_weather(location="New York")
Tool call 2: get_stock_price(symbol="AAPL")
[Both execute in parallel]
```

### Error Handling in Tool Execution
```python
def execute_tool(tool_name, params):
    try:
        result = tools[tool_name](**params)
        return {"status": "success", "data": result}
    except Exception as e:
        return {
            "status": "error", 
            "error": str(e),
            "suggestion": "Try a different approach or parameters"
        }
```

The error message is sent back to the LLM, which can then decide to retry with different parameters, use a different tool, or ask the user for clarification.

### MCP (Model Context Protocol)
MCP is an emerging standard (by Anthropic) for standardized tool integration:
- Defines a universal protocol for connecting AI models to tools
- Any MCP-compatible tool works with any MCP-compatible model
- Similar to how USB standardized peripheral connections
- Reduces the need for custom integrations per tool per model

---

## 11.4 LangChain for Agents

### LangChain Architecture
LangChain provides building blocks for LLM applications:

- **Models**: wrappers around LLM APIs (OpenAI, Anthropic, etc.)
- **Prompts**: template management and composition
- **Chains**: sequences of LLM calls and processing steps
- **Agents**: LLMs that decide which tools to use
- **Memory**: conversation and long-term memory management
- **Tools**: interfaces to external capabilities

### LangChain Expression Language (LCEL)
A declarative way to compose chains:

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful translator."),
    ("user", "Translate to {language}: {text}")
])

chain = prompt | ChatOpenAI(model="gpt-4o-mini") | StrOutputParser()
result = chain.invoke({"language": "French", "text": "Hello, world!"})
```

### Building a ReAct Agent with LangChain
```python
from langchain_openai import ChatOpenAI
from langchain.agents import create_react_agent, AgentExecutor
from langchain.tools import Tool
from langchain import hub

# Define tools
tools = [
    Tool(name="Search", func=search_function, description="Search the web for information"),
    Tool(name="Calculator", func=calc_function, description="Perform math calculations"),
]

# Get the ReAct prompt template
prompt = hub.pull("hwchase17/react")

# Create the agent
llm = ChatOpenAI(model="gpt-4o", temperature=0)
agent = create_react_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, verbose=True)

# Run
result = executor.invoke({"input": "What is the population of France divided by 1000?"})
```

### LangGraph for Stateful Workflows
LangGraph extends LangChain for complex, stateful agent workflows:

```python
from langgraph.graph import StateGraph, END

# Define the state
class AgentState(TypedDict):
    messages: list
    next_step: str

# Define nodes (each is a function)
def research_node(state): ...
def analyze_node(state): ...
def write_node(state): ...

# Build the graph
workflow = StateGraph(AgentState)
workflow.add_node("research", research_node)
workflow.add_node("analyze", analyze_node)
workflow.add_node("write", write_node)

# Define edges (transitions)
workflow.add_edge("research", "analyze")
workflow.add_edge("analyze", "write")
workflow.add_edge("write", END)

# Compile and run
app = workflow.compile()
result = app.invoke({"messages": [initial_message]})
```

### LangSmith for Tracing and Debugging
LangSmith provides observability for LLM applications:
- **Tracing**: see every LLM call, tool invocation, and intermediate step
- **Debugging**: identify where chains fail and why
- **Evaluation**: test prompts against datasets with automated scoring
- **Monitoring**: track latency, cost, and error rates in production

---

## 11.5 Multi-Agent Systems

### CrewAI: Role-Based Multi-Agent Collaboration
```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Senior Research Analyst",
    goal="Find comprehensive information about {topic}",
    backstory="You're an experienced researcher with expertise in data analysis.",
    tools=[search_tool, web_scraper]
)

writer = Agent(
    role="Technical Writer",
    goal="Write a clear, engaging report based on research findings",
    backstory="You're a skilled writer who makes complex topics accessible."
)

research_task = Task(
    description="Research the current state of quantum computing",
    agent=researcher,
    expected_output="Detailed research findings with sources"
)

writing_task = Task(
    description="Write a report based on the research findings",
    agent=writer,
    expected_output="A 1000-word report suitable for a tech blog",
    context=[research_task]  # Uses output from research_task
)

crew = Crew(agents=[researcher, writer], tasks=[research_task, writing_task])
result = crew.kickoff()
```

### AutoGen (Microsoft)
Conversational multi-agent framework:
```python
import autogen

assistant = autogen.AssistantAgent("assistant", llm_config=llm_config)
user_proxy = autogen.UserProxyAgent("user", code_execution_config={"work_dir": "output"})

user_proxy.initiate_chat(
    assistant,
    message="Create a visualization of global temperature data"
)
# Agents converse, write code, execute it, and refine until task is complete
```

### Hierarchical vs. Flat Agent Structures
**Flat**: all agents are peers, communicate directly with each other.
**Hierarchical**: a "manager" agent delegates tasks to specialist agents and synthesizes results.

Hierarchical is better for complex tasks with clear sub-responsibilities. Flat is better for collaborative brainstorming or debate.

---

## 11.6 Prompt Patterns for Agents

### System Prompts for Agent Behavior
```
"You are an autonomous research agent. Your goal is to thoroughly answer 
the user's question using available tools.

BEHAVIOR RULES:
1. Always plan before acting — state your approach first
2. Use tools to verify facts — don't rely on memory alone
3. If a tool call fails, try an alternative approach
4. If stuck after 3 attempts, explain what you've tried and ask for guidance
5. Cite all sources in your final answer
6. Stop when you have a complete, verified answer — don't over-research"
```

### Tool Description Best Practices
```
GOOD: "search_web: Search the internet for current information. Use this when you 
need facts, recent news, or data not in your training. Returns top 5 search results 
with titles and snippets."

BAD: "search: search stuff on the internet"
```

Detailed descriptions help the model:
- Know when to use the tool
- Know when NOT to use the tool
- Understand what to expect from the results

### Planning Prompts
```
"Before taking any action, create a brief plan:
1. What information do I need?
2. Which tools should I use and in what order?
3. What could go wrong and how will I handle it?
4. What does a successful outcome look like?

Then execute your plan step by step."
```

### Guardrails for Agents
```
"SAFETY LIMITS:
- Maximum 10 tool calls per task
- Do not make any destructive actions (delete, modify, send) without explicit user confirmation
- Do not access or process files outside the designated workspace
- If total cost would exceed $1, pause and inform the user
- Never execute code that accesses the network or filesystem beyond the sandbox
- If the task seems harmful or unethical, refuse and explain why"
```

---

> **Key Takeaway for Module 11**: AI agents represent the next evolution of prompt engineering — from crafting single prompts to designing systems where LLMs autonomously reason, plan, and act. The key challenges are reliability (agents can go off-track), cost (many LLM calls), and safety (agents take real actions). Strong system prompts, well-defined tools, and robust guardrails are essential.
