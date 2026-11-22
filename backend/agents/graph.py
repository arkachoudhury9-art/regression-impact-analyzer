import json

from langgraph.graph import END, START, StateGraph
from prompts.prompt import LOW_ANALYSIS_PROMPT

from agents.nodes import _client, analyze_changed_files
from agents.state import RegressionState


def route_analysis(state: RegressionState) -> str:
    if state["analysis_level"] == "low":
        return "low"
    elif state["analysis_level"] == "medium":
        return "medium"
    else:
        return "high"

async def low_analysis(state: RegressionState) -> dict:
    changes = [
        {
            "file_path": file["file_path"],
            "diff_content": file["diff_content"],
        }
        for file in state["changed_files"]
    ]
    prompt = LOW_ANALYSIS_PROMPT.replace("{change_summary}", state["change_summary"]).replace(
        "{changed_files}", str(changes)
    )
    response = await _client.chat.completions.create(
        model="openai/gpt-6-luna",
        messages=[
            {"role": "system", "content": prompt},
        ],
    )
    result = json.loads(response.choices[0].message.content)
    return {
        "regression_risks": result["regression_risks"],
    }

async def medium_analysis(state: RegressionState) -> dict:
    return {}

async def high_analysis(state: RegressionState) -> dict:
    return {}

graph_builder = StateGraph[RegressionState, None, RegressionState, RegressionState](RegressionState)

graph_builder.add_node("analyze_changed_files", analyze_changed_files)
graph_builder.add_node("low_analysis", low_analysis)
graph_builder.add_node("medium_analysis", medium_analysis)
graph_builder.add_node("high_analysis", high_analysis)
graph_builder.add_edge(START, "analyze_changed_files")

graph_builder.add_conditional_edges(
    "analyze_changed_files",
    route_analysis,
    {
        "low": "low_analysis",
        "medium": "medium_analysis",
        "high": "high_analysis",
    }
)

graph_builder.add_edge("low_analysis", END)
graph_builder.add_edge("medium_analysis", END)
graph_builder.add_edge("high_analysis", END)

graph = graph_builder.compile()