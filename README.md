require `.env` file

```.env
VITE_DISCORD_CLIENT_ID="DISCORD CLIENT ID"
DISCORD_CLIENT_SECRET="CLIENT SECRET"
DISCORD_API_HOST="https://discord.com/api/v10"
JWT_SECRET="JWT SECRET"
DAILY_MAX_TRY=6

PORT=3000
DATABASE_URL="mysql://user:password@host:port/database"
```

## How to run local server
```txt
bun install
bun run dev
```

## How to build & run prod server
```txt
bun run build
bun serve
```
