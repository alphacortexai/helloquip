

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
import { readFileSync, existsSync, readdirSync } from "fs";
import path from "path";

let initErrorMessage = null;

if (!admin.apps.length) {
  try {
    let serviceAccount = null;

    const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
    const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

    if (inline) {
      serviceAccount = JSON.parse(inline);
    } else if (filePath) {
      const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);
      const content = readFileSync(resolved, "utf-8");
      serviceAccount = JSON.parse(content);
    } else {
      const defaultDir = path.join(process.cwd(), "server/firebase");
      if (existsSync(defaultDir)) {
        const jsonFiles = readdirSync(defaultDir).filter((f) => f.endsWith(".json"));
        if (jsonFiles.length > 0) {
          const candidate = path.join(defaultDir, jsonFiles[0]);
          const content = readFileSync(candidate, "utf-8");
          serviceAccount = JSON.parse(content);
        } else {
          initErrorMessage = "Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH (no JSON found in server/firebase)";
        }
      } else {
        initErrorMessage = "Missing FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH (server/firebase not found)";
      }
    }

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    }
  } catch (e) {
    initErrorMessage = `Failed to initialize Firebase Admin: ${e.message}`;
  }
}

export async function POST(req) {
  try {
    if (!admin.apps.length) {
      return new Response(
        JSON.stringify({ success: false, error: initErrorMessage || "Firebase Admin not initialized" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { fcmToken, title, body, target, link } = await req.json();

    if (!fcmToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing fcmToken" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let resolvedLink = link || null;
    try {
      if (!resolvedLink) {
        const headers = req.headers;
        const origin = headers.get?.("origin") || process.env.PUBLIC_BASE_URL || "http://localhost:3000";
        if (target) {
          resolvedLink = new URL(target, origin).toString();
        } else {
          resolvedLink = origin;
        }
      }
    } catch {}

    const dataPayload = {};
    if (target) dataPayload.target = target;
    if (resolvedLink) dataPayload.link = resolvedLink;

    const message = {
      token: fcmToken,
      notification: { title: title || "", body: body || "" },
      webpush: {
        notification: { icon: "/logo.png" },
        fcmOptions: resolvedLink ? { link: resolvedLink } : undefined,
      },
      data: dataPayload,
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
