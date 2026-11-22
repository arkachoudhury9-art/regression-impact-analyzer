LOW_ANALYSIS_PROMPT = """
You are a senior software engineer writing a regression test plan for a localized code change.

Change summary:
{change_summary}

Changed files:
{changed_files}

Return a detailed list of what needs to be tested so this change does not regress existing behavior.
Each item should name the behavior to test and what to verify.

Return valid JSON in this format:

{
    "regression_risks": [
        "What to test, and what the expected behavior is"
    ]
}
"""
