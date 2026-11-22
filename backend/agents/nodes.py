import json
import os

from config.settings import BACKEND_ENV_PATH
from dotenv import load_dotenv
from openai import AsyncOpenAI
from prompts.analyze_file_change import ANALYZE_CHANGED_FILES_PROMPT

from agents.state import RegressionState

load_dotenv(BACKEND_ENV_PATH)

_client = AsyncOpenAI(
    api_key=os.environ["OPENROUTER_API_KEY"],
    base_url="https://openrouter.ai/api/v1",
)


async def analyze_changed_files(state: RegressionState) -> dict:
    changed_files = state["changed_files"]
    changes = []
    for file in changed_files:
        changes.append({
            'file_path': file['file_path'],
            'file_content': file['file_content'],
            'diff_content': file['diff_content'],
            'criticality': file['criticality'],
        })
    updated_prompt = ANALYZE_CHANGED_FILES_PROMPT.replace("{changed_files}", str(changes))
    response = await _client.chat.completions.create(
        model="openai/gpt-6-luna",
        messages=[
            {"role": "system", "content": updated_prompt},
        ],
    )
    result = json.loads(response.choices[0].message.content)
    print(result)
    return {
        'change_summary': result['change_summary'],
        'analysis_level': result['analysis_level'],
    }

    
