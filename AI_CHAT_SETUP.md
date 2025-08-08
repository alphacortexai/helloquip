# AI Chat Setup Guide

## Overview
The HelloQuip application now includes an AI chat assistant powered by Google Gemini. The chat widget appears on the main page and allows customers to get instant support.

## Features Implemented

### 1. AI Chat Widget (`components/AIChatWidget.js`)
- **Floating chat button** on the main page
- **Real-time conversation** with AI assistant
- **Human handoff detection** - automatically detects when users want to speak to a human
- **Conversation logging** for admin monitoring
- **Responsive design** for mobile and desktop

### 2. Admin Chat Logs (`app/admin/chat-logs/page.js`)
- **Monitor all AI conversations** in the admin panel
- **View user messages and AI responses**
- **Session tracking** and timestamps
- **Real-time updates** from Firestore

### 3. API Integration
- **Chat API** (`app/api/chat/route.js`) - Handles AI responses using Gemini
- **Logging API** (`app/api/log-conversation/route.js`) - Stores conversations in Firestore

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with:

```env
# Google Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Firebase Configuration (if not already set)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id_here
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id_here
```

### 2. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file

### 3. Firestore Collections
The system uses these Firestore collections:
- `chat_logs` - Stores conversation logs for admin monitoring

## How to Use

### For Customers
1. Visit the main page
2. Click the chat button (bottom right corner)
3. Ask questions about products, orders, shipping, etc.
4. The AI will respond with helpful information

### For Admins
1. Log into the admin panel
2. Go to "Chat Logs" tab
3. Monitor all AI conversations
4. View user messages and AI responses

## Features

### AI Capabilities
- Product information and pricing
- Order status and tracking
- Shipping and delivery questions
- Returns and refunds
- General customer support

### Human Handoff
The AI automatically detects when users want to speak to a human by looking for keywords like:
- "human"
- "agent"
- "representative"
- "speak to someone"
- "real person"
- "live person"

### Conversation Logging
- All conversations are logged to Firestore
- Admins can monitor conversations in real-time
- Session IDs track individual conversations
- Timestamps for all messages

## Troubleshooting

### If AI doesn't respond:
1. Check if `GEMINI_API_KEY` is set in `.env.local`
2. Verify the API key is valid
3. Check browser console for errors

### If chat logs don't appear:
1. Check Firestore permissions
2. Verify the `chat_logs` collection exists
3. Check admin authentication

## Security Notes
- API keys are stored server-side only
- Conversations are logged for quality assurance
- No sensitive data is stored in chat logs
- Human handoff is simulated (can be extended to real agents)

## Future Enhancements
- Real human agent integration
- Chat history for returning users
- File upload support
- Voice chat capabilities
- Multi-language support
