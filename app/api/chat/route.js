import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json();

    // Check if API key is available
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { 
          response: "I apologize, but the AI service is currently being configured. Please contact our human support team for assistance." 
        },
        { status: 200 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const systemPrompt = `You are a helpful customer service AI assistant for HelloQuip, an e-commerce platform in Uganda. 

Your role is to:
- Help customers with product information, pricing, and availability
- Assist with order status and tracking
- Provide information about shipping, delivery, and returns
- Handle general customer support inquiries
- Be friendly, professional, and helpful
- If a customer asks for a human agent, offer to connect them

Keep responses concise but informative. If you don't know specific details about products or orders, suggest contacting customer support.

Important context about HelloQuip:
- We sell various products including electronics, clothing, home goods, etc.
- We offer free shipping on orders above UGX 50,000
- Returns are accepted within 30 days
- We have customer support available via phone and WhatsApp
- We serve customers across Uganda with delivery to major cities and regions`;

    // Build conversation history for Gemini
    const conversation = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...conversationHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      { role: 'user', parts: [{ text: message }] }
    ];

    const result = await model.generateContent(conversation);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}


