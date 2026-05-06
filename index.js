#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  InitializeRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.error('TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set in environment variables');
  process.exit(1);
}

// Handle Telegram message sending
async function sendTelegramMessage(message) {
  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    }
  );

  const data = await response.json();

  if (response.ok) {
    console.log('Telegram message sent successfully');
    return { success: true, text: `Message sent! Message ID: ${data.result.message_id}` };
  } else {
    console.error(`Telegram API error: ${data.description || 'Unknown error'}`);
    return { success: false, error: data.description || 'Failed to send message' };
  }
}

// Create MCP server
const server = new Server(
  { name: 'telegram', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// Register list tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'send_telegram_message',
        description: 'Send a message to Telegram via this MCP server',
        inputSchema: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'The message text to send'
            }
          },
          required: ['message']
        }
      }
    ]
  };
});

// Register initialize handler
server.setRequestHandler(InitializeRequestSchema, async (request) => {
  const result = {
    capabilities: { tools: {} },
    protocolVersion: request.params.protocolVersion || '2024-11-05',
    serverInfo: { name: 'telegram-mcp', version: '1.0.0' }
  };

  console.log(`MCP Initialized: protocol=${request.params.protocolVersion}`);
  return result;
});

// Register tool call handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const params = request.params;

  if (params.name !== 'send_telegram_message') {
    return {
      content: [{ type: 'text', text: `Unknown tool: ${params.name}` }],
      isError: true
    };
  }

  const result = await sendTelegramMessage(params.arguments?.message);

  return {
    content: [
      {
        type: 'text',
        text: result.text || result.error || 'Operation completed'
      }
    ],
    isError: !result.success
  };
});

// Connect to stdin/stdout for MCP protocol
const transport = new StdioServerTransport();
await server.connect(transport);

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nReceived SIGINT, shutting down...');
  await server.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nReceived SIGTERM, shutting down...');
  await server.close();
  process.exit(0);
});

console.log('Telegram MCP Server started successfully!');