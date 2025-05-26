// app/admin/chat/page.tsx
import { Suspense } from "react";
import ChatPage from "./ChatPage"; // your actual component that uses useSearchParams

export default function Page() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <ChatPage />
    </Suspense>
  );
}
