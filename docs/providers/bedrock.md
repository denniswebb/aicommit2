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

## Example Model IDs

Amazon Bedrock supports various foundation models from different providers:

### Anthropic Claude Models
- `anthropic.claude-3-5-sonnet-20241022-v2:0` - Claude 3.5 Sonnet (most capable)
- `anthropic.claude-3-5-haiku-20241022-v1:0` - Claude 3.5 Haiku (fastest)
- `anthropic.claude-3-opus-20240229-v1:0` - Claude 3 Opus

### Meta Llama Models
- `meta.llama3-3-70b-instruct-v1:0` - Llama 3.3 70B
- `meta.llama3-1-8b-instruct-v1:0` - Llama 3.1 8B

### Amazon Titan Models
- `amazon.titan-text-premier-v1:0` - Titan Text Premier
- `amazon.titan-text-express-v1` - Titan Text Express

### Mistral AI Models
- `mistral.mistral-large-2407-v1:0` - Mistral Large
- `mistral.mistral-small-2402-v1:0` - Mistral Small

For the complete list of available models, visit the [AWS Bedrock Model IDs documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html).

## Tips

- Set `BEDROCK.runtimeMode=foundation` when you rely on IAM credentials or AWS profiles. The CLI automatically checks IAM-related environment variables and does not require an API key when they are present.
- Switch to `BEDROCK.runtimeMode=application` for Bedrock applications or agents. Provide an application API key and either a base URL or endpoint/inference profile identifiers.
- The CLI logs every request/response via `~/.local/state/aicommit2/logs` when `logging=true` to help diagnose AWS-specific errors.
- Combine multiple Bedrock models by comma separating `BEDROCK.model` values.

## Troubleshooting

### Authentication Issues

**Problem**: `UnrecognizedClientException` or `InvalidSignatureException`

**Solution**:
- Verify your AWS credentials are correct: `aws sts get-caller-identity`
- Ensure `AWS_REGION` or `AWS_DEFAULT_REGION` is set when using IAM credentials
- Check that your IAM credentials haven't expired (especially session tokens)
- For application mode, verify your `BEDROCK_APPLICATION_API_KEY` is correct

**Problem**: `AccessDeniedException`

**Solution**:
- Ensure your IAM user/role has the `bedrock:InvokeModel` permission
- Add the following policy to your IAM user/role:
  ```json
  {
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": "bedrock:InvokeModel",
      "Resource": "arn:aws:bedrock:*::foundation-model/*"
    }]
  }
  ```
- For application endpoints, verify you have permissions for `bedrock:InvokeModelWithResponseStream` if needed

### Region and Model Issues

**Problem**: `ResourceNotFoundException` - Model not found

**Solution**:
- Verify the model ID is correct and properly formatted (e.g., `anthropic.claude-3-5-haiku-20241022-v1:0`)
- Ensure the model is available in your selected region: not all models are available in all regions
- Check [AWS Bedrock regions](https://docs.aws.amazon.com/bedrock/latest/userguide/bedrock-regions.html) for model availability
- Enable model access in the AWS Bedrock console under "Model access"

**Problem**: `ValidationException` - Invalid request

**Solution**:
- Check that your model ID matches the exact format required by AWS Bedrock
- Verify inference parameters (`temperature`, `topP`, `maxTokens`) are within valid ranges for your model
- Some models have specific requirements - consult the model documentation

### Configuration Issues

**Problem**: Bedrock provider not appearing in available AIs

**Solution**:
- Ensure you have configured at least one of:
  - IAM credentials: Set `AWS_REGION` + (`AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` OR `AWS_PROFILE`)
  - Application endpoint: Set `BEDROCK.applicationBaseUrl` or `BEDROCK.applicationEndpointId`
- Verify you have a model configured: `aicommit2 config get BEDROCK.model`
- For code reviews, ensure `BEDROCK.codeReview=true`

**Problem**: "AWS region is required" error

**Solution**:
- Set the region explicitly: `aicommit2 config set BEDROCK.region="us-west-2"`
- Or set environment variable: `export AWS_REGION=us-west-2`

**Problem**: Invalid application base URL

**Solution**:
- Ensure the URL is properly formatted with protocol: `https://bedrock-runtime.us-west-2.amazonaws.com/application-inference`
- If using endpoint ID, it will be automatically appended to the base URL
- Test the URL format before adding to config

### Rate Limiting and Throttling

**Problem**: `ThrottlingException`

**Solution**:
- Wait a moment and retry the operation
- Check your AWS Bedrock service quotas in the AWS console
- Consider upgrading your AWS account or requesting quota increases
- Reduce the frequency of requests or implement retry logic with exponential backoff

### Debug Mode

To get detailed logs for troubleshooting:

1. Enable logging:
   ```sh
   aicommit2 config set BEDROCK.logging=true
   ```

2. Check logs at:
   - macOS: `~/Library/Application Support/aicommit2/logs/`
   - Linux: `~/.local/state/aicommit2/logs/`
   - Windows: `%LOCALAPPDATA%/aicommit2/logs/`

3. Look for request/response details, credential resolution, and error messages

### Testing Your Configuration

Verify your setup with these commands:

```sh
# Check your AWS identity (for IAM mode)
aws sts get-caller-identity

# Verify AWS Bedrock access
aws bedrock list-foundation-models --region us-west-2

# Test your aicommit2 configuration
aicommit2 config get BEDROCK

# Make a test commit with verbose output
aicommit2 --verbose
```
