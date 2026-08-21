```yaml
name: Ingest live trends

on:
  schedule:
    - cron: "*/10 * * * *"
  workflow_dispatch:

concurrency:
  group: live-trend-ingestion
  cancel-in-progress: false

jobs:
  ingest:
    runs-on: ubuntu-latest
    timeout-minutes: 9

    defaults:
      run:
        working-directory: whats-happening

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: whats-happening/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Run trend ingestion
        run: npm run ingest
        env:
          # Supabase URL sadece proje URL'si olmalı.
          # /rest/v1/ ekleme.
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}

          # Supabase Secret Key
          SUPABASE_SECRET_KEY: ${{ secrets.SUPABASE_SECRET_KEY }}

          # OpenAI
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
          OPENAI_WHY_MODEL: ${{ vars.OPENAI_WHY_MODEL }}

          # GitHub
          GITHUB_TOKEN: ${{ github.token }}

          # Ingestion settings
          INGEST_SOURCES: ${{ vars.INGEST_SOURCES }}
          GOOGLE_TRENDS_GEO: ${{ vars.GOOGLE_TRENDS_GEO }}

          # Reddit
          REDDIT_CLIENT_ID: ${{ secrets.REDDIT_CLIENT_ID }}
          REDDIT_CLIENT_SECRET: ${{ secrets.REDDIT_CLIENT_SECRET }}
          REDDIT_USER_AGENT: ${{ vars.REDDIT_USER_AGENT }}

          # X / Twitter
          X_BEARER_TOKEN: ${{ secrets.X_BEARER_TOKEN }}
          X_WATCH_QUERIES: ${{ vars.X_WATCH_QUERIES }}

          # Search APIs
          TAVILY_API_KEY: ${{ secrets.TAVILY_API_KEY }}
          EXA_API_KEY: ${{ secrets.EXA_API_KEY }}
```
