# <a href="https://aws.amazon.com/bedrock/" target="_blank">Amazon Bedrock</a>

## 📌 Important Note

**Before configuring, please review:**

- [Configuration Guide](../../README.md#configuration) - How to configure providers
- [General Settings](../../README.md#general-settings) - Common settings applicable to all providers

## Example Configuration

### IAM (Foundation Model Runtime)

```sh
aicommit2 config set BEDROCK.model="anthropic.claude-3-5-haiku-20241022-v1:0" \
    BEDROCK.runtimeMode=foundation \
    BEDROCK.region="us-west-2" \
    BEDROCK.codeReview=true
```

Set the following environment variables (or use your existing AWS profile):

```sh
export AWS_ACCESS_KEY_ID="AKIA..."
export AWS_SECRET_ACCESS_KEY="<secret>"
export AWS_SESSION_TOKEN="<optional-session-token>"
export AWS_REGION="us-west-2"
# or export AWS_DEFAULT_REGION
# optional profile support
aicommit2 config set BEDROCK.profile=your-profile
```

### Application Endpoint Runtime

```sh
aicommit2 config set BEDROCK.runtimeMode=application \
    BEDROCK.model="anthropic.claude-3-5-haiku-20241022-v1:0" \
    BEDROCK.applicationBaseUrl="https://bedrock-runtime.us-west-2.amazonaws.com/application-inference" \
    BEDROCK.applicationEndpointId="your-endpoint-id" \
    BEDROCK.codeReview=true
```

Set the application API key (falls back automatically if `BEDROCK_API_KEY` is not present):

```sh
export BEDROCK_APPLICATION_API_KEY="your-application-api-key"
# Optional helpers when working with application endpoints
export BEDROCK_APPLICATION_INFERENCE_PROFILE_ARN="arn:aws:bedrock:..."
```

## Settings

| Setting                                 | Description                                                                                           | Default                                        |
| --------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `model`                                 | Bedrock model identifier (foundation or application)                                                  | `anthropic.claude-3-5-haiku-20241022-v1:0`     |
| `runtimeMode`                           | `foundation` for the Bedrock runtime or `application` for application inference endpoints             | `foundation`                                   |
| `key`                                   | API key for application endpoints (falls back to environment variables)                               | –                                              |
| `envKey`                                | Environment variable name that holds the API key                                                      | `BEDROCK_API_KEY` (also checks application key) |
| `region`                                | AWS region for IAM authentication                                                                     | `AWS_REGION`/`AWS_DEFAULT_REGION` if available |
| `profile`                               | Named AWS profile to load from `~/.aws/credentials`                                                   | `AWS_PROFILE` if available                     |
| `accessKeyId` / `secretAccessKey`       | Explicit IAM credentials                                                                              | `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY`  |
| `sessionToken`                          | Optional STS session token                                                                            | `AWS_SESSION_TOKEN`                            |
| `applicationBaseUrl`                    | Base URL for application inference endpoints                                                          | –                                              |
| `applicationEndpointId`                 | Optional Bedrock application endpoint ID appended to the base URL                                    | –                                              |
| `applicationInferenceProfileArn`        | Optional inference profile ARN sent in requests                                                       | –                                              |
| `codeReview`                            | Enable Bedrock for code review prompts                                                                | `false`                                        |
| `temperature`, `topP`, `maxTokens` etc. | Generation settings shared with other providers                                                       | See [General Settings](../../README.md#general-settings) |

## Environment Variables

Amazon Bedrock honours the standard AWS environment variables in addition to provider-specific keys:

- `BEDROCK_API_KEY` – default API key variable for application endpoints.
- `BEDROCK_APPLICATION_API_KEY` – fallback API key when `BEDROCK_API_KEY` is not defined.
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` – IAM credentials for foundation runtime access.
- `AWS_REGION`, `AWS_DEFAULT_REGION` – region selection.
- `AWS_PROFILE` – named profile when using shared credentials files.
- `BEDROCK_APPLICATION_BASE_URL`, `BEDROCK_APPLICATION_ENDPOINT_ID`, `BEDROCK_APPLICATION_INFERENCE_PROFILE_ARN` – optional helpers for application mode.

Use `BEDROCK.envKey` if you prefer to point to a custom environment variable for your API key.

## Tips

- Set `BEDROCK.runtimeMode=foundation` when you rely on IAM credentials or AWS profiles. The CLI automatically checks IAM-related environment variables and does not require an API key when they are present.
- Switch to `BEDROCK.runtimeMode=application` for Bedrock applications or agents. Provide an application API key and either a base URL or endpoint/inference profile identifiers.
- The CLI logs every request/response via `~/.local/state/aicommit2/logs` when `logging=true` to help diagnose AWS-specific errors.
- Combine multiple Bedrock models by comma separating `BEDROCK.model` values.
