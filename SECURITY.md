# Security policy

## Supported versions

Only the latest commit on `main` is supported. Fixes are not backported.

## Reporting a vulnerability

Please report security problems **privately** through GitHub:

1. Open the [Security tab](https://github.com/aimanmalib/learnpath/security) of this repository.
2. Click **Report a vulnerability** and describe the issue, how to reproduce it and its impact.

Please do not open a public issue for security problems. You should get a first reply within a few days.

## Scope notes

- In bring-your-own-key mode, visitors' API keys are kept in their own browser and are forwarded per request to the chosen provider. Anything that could leak, log or redirect those keys is in scope.
- The server only forwards to the built-in provider base URLs unless `LLM_ALLOW_CUSTOM_BASE_URL=1` is set. A way around that allowlist (SSRF) is in scope.
