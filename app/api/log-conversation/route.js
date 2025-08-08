import { NextResponse } from 'next/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request) {
  try {
    const { userMessage, aiResponse, timestamp, sessionId } = await request.json();

    // Log conversation to Firestore
    await addDoc(collection(db, 'chat_logs'), {
      userMessage,
      aiResponse,
      timestamp: serverTimestamp(),
      sessionId,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error logging conversation:', error);
    return NextResponse.json(
      { error: 'Failed to log conversation' },
      { status: 500 }
    );
  }
}


