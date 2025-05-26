import AdminChatPanel from "../components/AdminUserChat"; // Adjust the import path if needed

export default function AdminChatPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Chat</h1>
      <AdminChatPanel />
    </div>
  );
}
