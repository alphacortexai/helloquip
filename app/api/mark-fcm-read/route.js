import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, query, collection, where, getDocs } from "firebase/firestore";

export async function POST(req) {
  try {
    const { fcmMessageId, userId } = await req.json();

    if (!fcmMessageId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing fcmMessageId or userId" },
        { status: 400 }
      );
    }

    // Find the notification by FCM message ID and user ID
    const q = query(
      collection(db, "notifications"),
      where("fcmMessageId", "==", fcmMessageId),
      where("userId", "==", userId)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, error: "Notification not found" },
        { status: 404 }
      );
    }

    // Mark the notification as read
    const notificationDoc = snapshot.docs[0];
    await updateDoc(doc(db, "notifications", notificationDoc.id), {
      read: true,
      readAt: new Date(),
    });

    console.log("✅ FCM notification marked as read:", fcmMessageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error marking FCM notification as read:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
