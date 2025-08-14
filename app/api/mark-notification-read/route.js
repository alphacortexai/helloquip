import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { notificationId, userId } = await req.json();

    if (!notificationId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing notificationId or userId" },
        { status: 400 }
      );
    }

    // Update the notification to mark it as read
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: new Date(),
    });

    console.log("✅ Notification marked as read:", notificationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error marking notification as read:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
