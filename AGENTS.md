<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->


1. Trending tokens page (next)
Replace the login-only homepage with a list of hot memecoins from DexScreener (no API key).

Fetch trending Solana pairs from DexScreener
Show name, symbol, price, 24h change
Link each row to /token/[mint]
This is the main screen after login.

2. Token detail page
Route: /token/[mint]

Price chart from DexScreener
Recent trades
Token metadata (name, symbol, mint)
3. Buy / sell
Wire Jupiter lite-api + Privy wallet:

quote → build swap tx → Privy signs → send → log trade in Supabase
Needs a small amount of SOL in the wallet for fees and swaps.

4. Profile / activity
Show trade history from Supabase trades for the logged-in user.

5. Custom tokens + R2 (if in scope)
Create token flow + logo upload to R2 → save URL in custom_tokens.

