from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gemini_api_key: str = ""
    github_client_id: str = ""
    github_client_secret: str = ""
    github_token: str = ""
    notion_token: str = ""
    neo4j_uri: str = ""
    neo4j_username: str = "neo4j"
    neo4j_password: str = ""
    jwt_secret: str = "changeme"
    demo_mode: bool = False

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
