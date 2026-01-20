# Agent Chat Setup Guide

## Overview
This guide covers the built-in customer service chatbot powered by LangChain + Google Gemini. The UI lives at `/agent-chat` and the bulb icon in the navbar opens it for users.

## Features Implemented

### 1. Customer Service Chat UI (`components/AgentChat.js`)
- **Real-time chat interface** for support conversations
- **Works without login** so users can start immediately
- **Responsive** for mobile and desktop

### 2. Chat Page (`app/agent-chat/page.js`)
- **Dedicated support page** with instructions and header
- **Clean layout** for long chats

### 3. Server-Side LangChain + Gemini (`app/api/agent-chat/route.js`)
- **Uses LangChain** with `@langchain/google-genai`
- **Gemini model**: `gemini-1.5-flash`
- **System prompt** tuned for orders, quotes, shipping, and support
- **API key stays server-side** for security

### 4. Navbar Access (`components/Navbar.js`)
- **Light bulb icon** links to `/agent-chat`

## Setup Instructions

### 1. Install Dependencies
Already included in `package.json`:
- `langchain`
- `@langchain/google-genai`

If you need to install manually:
```bash
npm install langchain @langchain/google-genai
```

### 2. Environment Variables
Create a `.env.local` file in the root directory with:

```env
# Google Gemini API Key (server-side only)
GOOGLE_API_KEY=your_gemini_api_key_here

# Firebase: Agent-chat uses the same client Firestore as the rest of the app (lib/firebase).
# No FIREBASE_SERVICE_ACCOUNT or service account file is needed for agent-chat.

# Existing Firebase Configuration (if not already in lib/firebase.js)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
```

> Never expose `GOOGLE_API_KEY` on the client.

## How to Use

### For Users
1. Click the **bulb icon** in the navbar or visit `/agent-chat`
2. Type a question and press Enter
3. Get instant answers about orders, shipping, and products

### For Developers
1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000/agent-chat`
3. Send a message and verify the response

## API Endpoint

### POST `/api/agent-chat`
Handles Gemini responses via LangChain.

**Request Body:**
```json
{
  "message": "User message here"
}
```

**Response:**
```json
{
  "reply": "Assistant response"
}
```

## Troubleshooting

### Common Issues
1. **Missing API Key**
   - Ensure `GOOGLE_API_KEY` is present in `.env.local`

2. **500 errors**
   - Check server logs for Gemini or LangChain errors
   - Ensure the model name is valid (`gemini-1.5-flash`)

3. **No replies**
   - Confirm the API route `app/api/agent-chat/route.js` is deployed
   - Verify the request body contains `message`

## Reducing Hallucinations
The system prompt includes anti-hallucination rules so the agent does not claim backend actions that do not exist (e.g. "I have logged your request," "our sales team will contact you"). In particular:
- The chat does **not** save conversations or forward requests to any team.
- **Quote requests** are only created via the "Request Quote" form on cart/checkout—not from chat. The agent is instructed to direct users there for new quotes and never to say an in-chat message has been "submitted" or "noted."
If you add new behavior (e.g. saving chat leads or creating quote requests from the chat), update the system prompt in `app/api/agent-chat/route.js` so the agent can accurately describe what the system does.

## Security Considerations
1. **Environment variables**: Never commit `.env.local`
2. **No sensitive data**: The system prompt requests order number + email only
3. **Server-only key**: Gemini key stays in the API route
