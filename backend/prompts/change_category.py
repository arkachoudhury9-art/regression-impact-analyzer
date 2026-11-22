CHANGE_CATEGORY_PROMPT = {
    "category": {
        "instructions": (
            "Using `change` as the edit and `file_content` as the complete file after that edit, "
            "which kind of change was made?"
        ),
        "criteria": {
            "template": (
                "The edit adds scaffolding, generated files, or repeated structure and does not change product behavior. "
                "The surrounding file is a shell, boilerplate, or a copied layout."
            ),
            "business_logic": (
                "The edit changes rules, calculations, data handling, or API behavior that decide what the product does. "
                "Examples in the changed lines or the surrounding file: validation, persistence, permissions, or a response."
            ),
            "ui": (
                "The edit changes what a person sees or interacts with, while the surrounding file keeps the same rules. "
                "Examples: layout, styling, copy, or component presentation."
            ),
        },
    },
    "criticality": {
        "instructions": (
            "Using `change` as the edit and `file_content` as the complete file after that edit, "
            "how much harm can this change cause if it is wrong?"
        ),
        "criteria": [
            "The edit is local copy, formatting, or presentation. The surrounding file shows no change to behavior, data, security, or availability.",
            "The edit changes one feature's behavior. A mistake stays inside that feature, as shown by the surrounding file, and can be reverted without losing or exposing data.",
            "The edit touches authentication, payments, data writes, or shared infrastructure in this file. A mistake can lose data, expose data, or stop a core flow, and the file shows no safe workaround.",
        ],
    },
}
