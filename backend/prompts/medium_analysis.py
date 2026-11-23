MEDIUM_ANALYSIS_PROMPT = """
You are an expert software engineer performing regression impact analysis.

Analyze the following change and available repository context.

<context>
{context}
</context>

Your task is to identify potential regression risks.

Focus on:

- Functions, classes, components, and interfaces affected
- Potential dependencies between changed code and other components
- Behavioral changes
- Breaking changes
- Potential regressions
- Areas that may require further investigation

Do not invent dependencies or functionality.

If the available context is insufficient to establish a relationship,
indicate that further investigation is required.

Return valid JSON in the following format:

{{
    "regression_risks": [
        {{
            "risk": "Description",
            "reason": "Explanation",
            "affected_area": "Component or functionality",
            "severity": "low | medium | high"
        }}
    ],
}}
"""