# Agent Chat Setup Guide

## Overview
This guide will help you set up the new AI Agent Chat functionality that connects to your external server without requiring authentication.

## Features Implemented

### 1. Simplified Authentication
- **Anonymous access** - No Google OAuth required
- **No calendar/email access** - Simplified setup
- **Direct connection** to external AI agent server

### 2. Agent Chat API (`app/api/agent-chat/route.js`)
- **Connects to external server** at `http://127.0.0.1:8000`
- **Session management** with the external server
- **State initialization** for new chat sessions
- **Message processing** with the multi_tool_agent

### 3. Agent Chat Component (`components/AgentChat.js`)
- **Real-time chat interface** with external AI agent
- **Session persistence** using localStorage
- **No authentication required** - Works immediately
- **Responsive design** for mobile and desktop

### 4. Agent Chat Page (`app/agent-chat/page.js`)
- **Dedicated chat page** with clean interface
- **No sign-in required** - Start chatting immediately
- **Simple and intuitive** user experience

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with:

```env
# NextAuth Configuration (simplified)
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Existing Firebase Configuration (if not already set)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here

# Google Gemini API Key (for existing chat)
G_API_KEY=your_gemini_api_key_here
```

### 2. Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Add the output to `NEXTAUTH_SECRET` in your `.env.local` file.

### 3. External Server Configuration
Make sure your external server is running at `http://127.0.0.1:8000` and has:
- The `multi_tool_agent` application configured
- Proper CORS settings to allow requests from your Next.js app
- The `/run` endpoint available for chat processing

## How to Use

### For Users
1. Navigate to `/agent-chat` in your application
2. Start chatting immediately - no sign-in required!
3. Type your message and press Enter or click send
4. The AI agent will respond to your questions

### For Developers
1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000/agent-chat`
3. Test the chat functionality with the external server
4. No authentication setup required

## API Endpoints

### POST `/api/agent-chat`
Handles communication with the external AI agent server.

**Request Body:**
```json
{
  "message": "User message here",
  "session_id": "optional_session_id"
}
```

**Response:**
```json
{
  "response": {
    "message": "AI agent response"
  },
  "session_id": "session_id_for_persistence"
}
```

## Troubleshooting

### Common Issues

1. **External Server Connection**
   - Verify the server is running at `http://127.0.0.1:8000`
   - Check CORS settings on the external server
   - Ensure the `multi_tool_agent` is properly configured

2. **Session Issues**
   - Clear browser localStorage if sessions get stuck
   - Check that `NEXTAUTH_URL` matches your deployment URL

3. **NextAuth Issues**
   - Ensure `NEXTAUTH_SECRET` is set in your environment variables
   - The secret can be any random string for this simplified setup

### Debug Mode
Enable debug logging by adding to your `.env.local`:
```env
NEXTAUTH_DEBUG=true
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **External Server**: Ensure your external server has proper security measures
3. **CORS**: Configure proper CORS settings on your external server
4. **No Sensitive Data**: This setup doesn't require access to user calendars or emails

## Integration with Existing Chat

The new agent chat system runs alongside your existing chat functionality:
- **Existing chat**: Uses Gemini API for general customer support
- **Agent chat**: Uses external server for advanced AI capabilities
- **Both systems**: Can coexist in the same application

Users can choose which chat system to use based on their needs.

## Benefits of Simplified Setup

1. **No OAuth Configuration** - No need to set up Google Cloud Console
2. **No Calendar/Email Access** - Simpler privacy model
3. **Immediate Access** - Users can start chatting right away
4. **Easier Maintenance** - Fewer moving parts and dependencies
5. **Better Performance** - No authentication overhead
