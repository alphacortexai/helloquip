import { NextResponse } from 'next/server';

// Server-side API route for fetching trending products
// This reduces client-side bundle and improves initial load time

export async function GET() {
  try {
    // Import Firebase Admin SDK on server-side only
    const admin = require('firebase-admin');
    
    // Check if Firebase Admin is initialized
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
    
    // Fetch trending product IDs
    const trendingSnapshot = await db.collection('trendingProducts')
      .limit(5)
      .get();

    if (trendingSnapshot.empty) {
      return NextResponse.json({ products: [] });
    }

    // Get product IDs
    const productIds = trendingSnapshot.docs.map(doc => {
      const data = doc.data();
      return data.productId || doc.id;
    });

    // Fetch all products in parallel
    const productPromises = productIds.map(async (productId) => {
      try {
        const productDoc = await db.collection('products').doc(productId).get();
        
        if (productDoc.exists) {
          return {
            id: productDoc.id,
            ...productDoc.data(),
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return null;
      }
    });

    const products = (await Promise.all(productPromises)).filter(Boolean);

    // Cache for 5 minutes
    return NextResponse.json(
      { products },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending products', message: error.message },
      { status: 500 }
    );
  }
}

