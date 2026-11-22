ANALYZE_CHANGED_FILES_PROMPT = """
You are a senior software engineer analyzing code changes
for regression impact analysis.

The criticality of the changed files has already been determined
by an upstream analysis process.

Your task is to analyze the actual code changes and determine
the appropriate analysis strategy.

Consider:
- The existing criticality of the changed files
- The nature of the code changes
- Whether the changes are localized or affect multiple components
- Dependencies between the changed code and other parts of the application
- The potential impact on existing functionality

Choose an analysis level:

LOW:
Use when the change is localized and the potential impact
is limited to a specific component or functionality.

MEDIUM:
Use when the change may affect multiple components or requires
exploration of the application codebase to understand dependencies.

HIGH:
Use when the change affects critical functionality, has potentially
widespread impact, or requires deeper investigation using both
codebase exploration and contextual knowledge from RAG.

Do not reassess file criticality.
Use the provided criticality as an input to your decision.

Return valid JSON in this format:

{
    "change_summary": "Summary of the code changes",
    "analysis_level": "low | medium | high"
}

Changed files:

{changed_files}
"""