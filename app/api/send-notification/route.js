

// import { NextResponse } from "next/server";
// import admin from "firebase-admin";
// import { readFileSync } from "fs";
// import path from "path";

// // Prevent re-initialization
// if (!admin.apps.length) {
//   const serviceAccountPath = path.join(process.cwd(), "@/server/firebase/serviceAccountKey.json");
//   const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// export async function POST(req) {
//   try {
//     const { fcmToken, title, body } = await req.json();

//     const message = {
//       token: fcmToken,
//       notification: {
//         title,
//         body,
//       },
//       webpush: {
//         notification: {
//           icon: "/icon.png", // Optional
//         },
//       },
//     };

//     const response = await admin.messaging().send(message);

//     return NextResponse.json({ success: true, response });
//   } catch (error) {
//     console.error("FCM Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }




// // app/api/send-notification/route.js
// import admin from "firebase-admin";
// import { readFileSync } from "fs";
// import path from "path";

// if (!admin.apps.length) {
//   const serviceAccountPath = path.join(
//     process.cwd(),
//     "server/firebase/helloquip-80e20-firebase-adminsdk-fbsvc-9c445489ba.json"
//   );

//   const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, "utf-8"));

//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//   });
// }

// export async function POST(req) {
//   try {
//     const { fcmToken, title, body } = await req.json();

//     const message = {
//       token: fcmToken,
//       notification: {
//         title,
//         body,
//       },
//       webpush: {
//         notification: {
//           icon: "/icon.png",
//         },
//       },
//     };

//     const response = await admin.messaging().send(message);

//     return new Response(
//       JSON.stringify({ success: true, response }),
//       { status: 200, headers: { "Content-Type": "application/json" } }
//     );
//   } catch (error) {
//     console.error("Error sending notification:", error);
//     return new Response(
//       JSON.stringify({ success: false, error: error.message }),
//       { status: 500, headers: { "Content-Type": "application/json" } }
//     );
//   }
// }





// app/api/send-notification/route.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT environment variable");
  }

  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(req) {
  try {
    const { fcmToken, title, body } = await req.json();

    const message = {
      token: fcmToken,
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          icon: "/icon.png",
        },
      },
    };

    const response = await admin.messaging().send(message);

    return new Response(
      JSON.stringify({ success: true, response }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
