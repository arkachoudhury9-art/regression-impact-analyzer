from config.settings import EnvSettingsLoader, SettingsLoader
from models.change import Change, ChangeSource
from prompts.change_category import CHANGE_CATEGORY_PROMPT
from typesafe_sdk import AsyncTypeSafeClient, Choice, Score

from services.github_service import GithubService


class ChangeCategoryService:
    def __init__(self, settings_loader: SettingsLoader | None = None) -> None:
        self._settings_loader = settings_loader or EnvSettingsLoader()

    async def change_category(self, *args: str, **kwargs: object) -> tuple[str, float]:
        file_content, change, change_id, filename = args
        db = kwargs["db"]
        github_source_tree = kwargs["github_source_tree"]
        repository_id = kwargs["repository_id"]
        commit_sha = kwargs["commit_sha"]
        settings = self._settings_loader.load()
        category = CHANGE_CATEGORY_PROMPT["category"]
        criticality = CHANGE_CATEGORY_PROMPT["criticality"]
        async with AsyncTypeSafeClient(
            api_key=settings.typesafe.api_key
        ) as client:
            response = await client.system_one(
                state={"file_content": file_content, "change": change},
                questions={
                    "tone": Choice(
                        instructions=category["instructions"],
                        criteria=category["criteria"],
                    ),
                    "urgency": Score(
                        instructions=criticality["instructions"],
                        criteria=criticality["criteria"],
                    ),
                },
            )
        criticality = GithubService().get_criticality(response.scores["urgency"].score)
        tree = github_source_tree.model_dump(mode="json")
         
        change_record = Change(
            change_id=change_id,
            category=response.choices["tone"].choice,
            criticality=criticality,
            file_name=filename,
            repository_id=repository_id,
            commit_sha=commit_sha,
            source=ChangeSource(
                change_pk=change_id,
                diff=change,
                source=file_content,
                tree=tree,
            ),
        )
        db.add(change_record)
        await db.commit()
        return (response.choices["tone"].choice, response.scores["urgency"].score)
