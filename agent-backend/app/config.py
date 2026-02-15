from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_region: str = "us-east-1"
    bedrock_model_id: str = "anthropic.claude-sonnet-4-20250514-v1:0"
    default_tenant_id: str = "tenant-demo-001"
    host: str = "0.0.0.0"
    port: int = 8000

    model_config = {"env_file": ".env", "extra": "ignore"}

settings = Settings()
