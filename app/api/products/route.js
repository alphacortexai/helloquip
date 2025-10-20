import { NextResponse } from 'next/server';

// This is a server-side API route for fetching products
// It helps reduce client-side bundle size and improves performance

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '30');
    const offset = parseInt(searchParams.get('offset') || '0');
    const category = searchParams.get('category');

    // Import Firebase Admin SDK on server-side only
    // This keeps the client bundle smaller
    const admin = require('firebase-admin');
    
    // Initialize Firebase Admin if not already initialized
    if (!admin.apps.length) {
      console.error('Firebase Admin not initialized - check environment variables');
      return NextResponse.json(
        { 
          error: 'Service temporarily unavailable',
          message: 'Please try again later'
        },
        { status: 503 }
      );
    }

    const db = admin.firestore();
    
    // Build query
    let query = db.collection('products')
      .orderBy('createdAt', 'desc')
      .limit(limit);

    if (offset > 0) {
      // For pagination, you'd need to implement cursor-based pagination
      // This is a simplified version
      query = query.offset(offset);
    }

    if (category && category !== 'All Products') {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    
    const products = [];
    snapshot.forEach((doc) => {
      products.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Cache the response for 60 seconds
    return NextResponse.json(
      { products, count: products.length },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products', message: error.message },
      { status: 500 }
    );
  }
}

