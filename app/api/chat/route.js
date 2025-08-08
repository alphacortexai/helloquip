import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// TODO: TEMPORARY HARDCODED API KEY - REMOVE BEFORE PRODUCTION
// Replace this with process.env.G_API_KEY when environment variables are working
const API_KEY = "AIzaSyChOZyn4FgZm41gyg2VEValfDV47IIuw3Q";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(request) {
  try {
    const { message, conversationHistory } = await request.json();

    // TODO: TEMPORARILY DISABLED - REMOVE THIS CHECK WHEN USING ENV VARIABLE
    // Check if API key is available
    // if (!process.env.G_API_KEY) {
    //   return NextResponse.json(
    //     { 
    //       response: "I apologize, but the AI service is currently being configured. Please contact our human support team for assistance." 
    //     },
    //     { status: 200 }
    //   );
    // }

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
    const prompt = `${systemPrompt}\n\nUser: ${message}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { 
        response: "I apologize, but I'm having trouble connecting right now. Please try again in a moment or contact our human support team." 
      },
      { status: 200 }
    );
  }
}


