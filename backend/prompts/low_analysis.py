LOW_ANALYSIS_PROMPT = """
You are a senior software engineer writing a regression test plan for a localized code change.

Change summary:
{change_summary}

Changed files:
{changed_files}

Return a detailed list of what needs to be tested so this change does not regress existing behavior.
Each item should name the risk, why it matters, the affected area, and a severity of low, medium, or high.

Return valid JSON in this format:

{
    "regression_risks": [
        {
            "risk": "Description",
            "reason": "Explanation",
            "affected_area": "Component or functionality",
            "severity": "low | medium | high"
        }
    ]
}
"""
