export async function POST(req) {
  try {
    const { message, session_id } = await req.json();

    console.log("Received message:", message);
    console.log("Received session_id:", session_id);

    let currentSessionId = session_id;
    let sessionValid = false;

    // Check if the session ID exists and is valid
    if (currentSessionId) {
      const check = await fetch(
        `http://127.0.0.1:8000/apps/multi_tool_agent/users/user/sessions/${currentSessionId}`
      );
      sessionValid = check.status === 200;
      console.log("Checked session validity:", sessionValid);
    }

    // Create new session and send initial state
    if (!currentSessionId || !sessionValid) {
      const sessionRes = await fetch(
        "http://127.0.0.1:8000/apps/multi_tool_agent/users/user/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        }
      );

      const sessionData = await sessionRes.json();
      console.log("Created new session:", sessionData);
      currentSessionId = sessionData.id;

      // ✅ Send stateDelta ONCE after session creation
      const stateRes = await fetch(
        `http://127.0.0.1:8000/users/user/sessions/${currentSessionId}/state`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            actions: {
              stateDelta: {
                mood: "curious",
                page: "home",
                onboarding_complete: false,
              },
            },
          }),
        }
      );

      if (!stateRes.ok) {
        console.error("❌ Failed to set initial state:", await stateRes.text());
      } else {
        console.log("✅ Initial state sent successfully");
      }
    }

    // Call /run with user message (state already set above)
    const res = await fetch("http://127.0.0.1:8000/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appName: "multi_tool_agent",
        userId: "user",
        sessionId: currentSessionId,
        newMessage: {
          role: "USER",
          parts: [{ text: message }],
        },
        streaming: false,
      }),
    });

    const data = await res.json();
    console.log("Agent response data:", data);

    // Extract reply text from ADK response
    let replyText = "No response from agent";
    const eventsArray = Array.isArray(data) ? data : data?.events || [];

    const textEvent = eventsArray.find(
      (event) =>
        event?.content?.role === "model" &&
        Array.isArray(event.content.parts) &&
        event.content.parts.some((part) => typeof part.text === "string")
    );

    if (textEvent) {
      const part = textEvent.content.parts.find(
        (part) => typeof part.text === "string"
      );
      if (part?.text) replyText = part.text;
    } else {
      console.warn("No valid reply from agent. Raw:", JSON.stringify(data));
    }

    return new Response(
      JSON.stringify({
        response: { message: replyText },
        session_id: currentSessionId,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("API Error:", error);
    return new Response(
      JSON.stringify({ response: { message: "Server error." } }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
