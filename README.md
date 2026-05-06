# Telegram MCP Server

A Model Context Protocol (MCP) server for sending messages to Telegram using the Bot API. This server exposes a `send_telegram_message` tool that can be used by MCP clients (like Claude or other AI applications) to send messages to Telegram.

## Click the button to install:

[![Add MCP Server telegram-mcp to LM Studio](https://files.lmstudio.ai/deeplink/mcp-install-light.svg)](https://lmstudio.ai/install-mcp?name=telegram-mcp&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyJnaXRodWI6SWItUi90ZWxlZ3JhbS1tY3AiXSwiZW52Ijp7IlRFTEVHUkFNX0JPVF9UT0tFTiI6IkJPVF9UT0tFTiIsIlRFTEVHUkFNX0NIQVRfSUQiOiJDSEFUX0lEIn19)


## Prerequisites

- Node.js 18+ installed

## Installation

```bash
npm install
```

## Configuration

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Edit `.env`:
- `TELEGRAM_BOT_TOKEN`: Get from @BotFather in Telegram (https://t.me/BotFather)
- `TELEGRAM_CHAT_ID`: Your target chat ID (numeric ID for your user/group)

## Running the Server

```bash
npm start
```

Or directly:
```bash
node index.js
```

## Getting Your Telegram Chat ID

To find your chat ID:
1. Send a message to [@userinfobot](https://t.me/userinfobot) on Telegram
2. Reply to the message it sends you to get your user ID
3. For group chats, add the bot to the group and use the group ID

## Using the Server with MCP Clients

Once running, this server communicates via the Model Context Protocol over stdio. MCP clients can:

1. **Discover available tools** - The server exposes the `send_telegram_message` tool
2. **Call the tool** - Send tool calls with a `message` parameter (string, required)
3. **Receive results** - Get confirmation with message ID or error details

### Example Tool Usage

**Tool name:** `send_telegram_message`

**Input schema:**
```json
{
  "type": "object",
  "properties": {
    "message": {
      "type": "string",
      "description": "The message text to send (supports Markdown)"
    }
  },
  "required": ["message"]
}
```

**Success response:**
```
Message sent! Message ID: 12345
```

**Error response:**
```
Failed to send message: Bad Request: message text is empty
```

## Architecture

- **Transport**: Uses stdio (standard input/output) for MCP communication
- **Protocol Version**: Supports MCP 2024-11-05
- **Tools**: Exposes `send_telegram_message` tool
- **Message Format**: Supports Markdown formatting via Telegram's `parse_mode`

## Integration Examples

### With Claude Desktop

Add to Claude's config file (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "telegram": {
      "command": "node",
      "args": ["/path/to/index.js"],
      "env": {
        "TELEGRAM_BOT_TOKEN": "your_bot_token",
        "TELEGRAM_CHAT_ID": "your_chat_id"
      }
    }
  }
}
```

The server will then be available as a tool in Claude for sending Telegram messages.