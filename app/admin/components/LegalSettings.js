"use client";

import { useEffect, useState, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

const LEGAL_DOC_ID = "legal";
const ACCEPT_DOC = ".pdf,.doc,.docx,.txt";

const TOOLBAR = ({ editor }) =>
  editor ? (
    <div className="flex flex-wrap gap-1 p-1.5 border border-gray-300 border-b-0 rounded-t-lg bg-gray-50">
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`px-2 py-1 text-xs font-semibold rounded ${editor.isActive("heading", { level: 1 }) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`}>H1</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-2 py-1 text-xs font-semibold rounded ${editor.isActive("heading", { level: 2 }) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`}>H2</button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={`px-2 py-1 text-xs font-semibold rounded ${editor.isActive("heading", { level: 3 }) ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`}>H3</button>
      <span className="w-px h-5 bg-gray-300 self-center mx-0.5" />
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-2 py-1 text-xs font-bold rounded ${editor.isActive("bold") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`}>B</button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-2 py-1 text-xs italic rounded ${editor.isActive("italic") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`}>I</button>
      <span className="w-px h-5 bg-gray-300 self-center mx-0.5" />
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive("bulletList") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`}>• List</button>
      <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={`px-2 py-1 text-xs rounded ${editor.isActive("orderedList") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`}>1. List</button>
      <span className="w-px h-5 bg-gray-300 self-center mx-0.5" />
      <button type="button" onClick={() => { const u = window.prompt("Link URL:", editor.getAttributes("link").href || "https://"); if (u) editor.chain().focus().setLink({ href: u }).run(); }} className={`px-2 py-1 text-xs rounded ${editor.isActive("link") ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-200"}`}>Link</button>
      <button type="button" onClick={() => editor.chain().focus().unsetLink().run()} className="px-2 py-1 text-xs rounded text-gray-600 hover:bg-gray-200">Unlink</button>
    </div>
  ) : null;

export default function LegalSettings() {
  const [tab, setTab] = useState("privacy"); // 'privacy' | 'terms'

  // Privacy
  const [source, setSource] = useState("text");
  const [privacyPolicyText, setPrivacyPolicyText] = useState("");
  const [privacyPolicyDocUrl, setPrivacyPolicyDocUrl] = useState("");
  const [privacyPolicyDocName, setPrivacyPolicyDocName] = useState("");

  // Terms
  const [termsSource, setTermsSource] = useState("text");
  const [termsText, setTermsText] = useState("");
  const [termsDocUrl, setTermsDocUrl] = useState("");
  const [termsDocName, setTermsDocName] = useState("");

  const [fileToUpload, setFileToUpload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const fileInputRef = useRef(null);

  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Placeholder.configure({ placeholder: "Write your privacy policy. Use the toolbar for headings, bold, bullets, and links." })],
    content: privacyPolicyText || "",
    onUpdate: ({ editor: e }) => setPrivacyPolicyText(e.getHTML()),
    editorProps: { attributes: { class: "min-h-[280px] px-3 py-2 text-sm focus:outline-none" } },
  });

  const termsEditor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Placeholder.configure({ placeholder: "Write your terms of service. Use the toolbar for headings, bold, bullets, and links." })],
    content: termsText || "",
    onUpdate: ({ editor: e }) => setTermsText(e.getHTML()),
    editorProps: { attributes: { class: "min-h-[280px] px-3 py-2 text-sm focus:outline-none" } },
  });

  useEffect(() => {
    if (!editor || loading) return;
    const html = editor.getHTML();
    const d = privacyPolicyText || "";
    if ((html === "" || html === "<p></p>") && d.length > 0) editor.commands.setContent(d, false);
  }, [editor, loading, privacyPolicyText]);

  useEffect(() => {
    if (!termsEditor || loading) return;
    const html = termsEditor.getHTML();
    const d = termsText || "";
    if ((html === "" || html === "<p></p>") && d.length > 0) termsEditor.commands.setContent(d, false);
  }, [termsEditor, loading, termsText]);

  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, "settings", LEGAL_DOC_ID));
        if (snap.exists()) {
          const d = snap.data();
          setSource(d.privacyPolicySource || "text");
          setPrivacyPolicyText(d.privacyPolicyText || "");
          setPrivacyPolicyDocUrl(d.privacyPolicyDocUrl || "");
          setPrivacyPolicyDocName(d.privacyPolicyDocName || "");
          setTermsSource(d.termsSource || "text");
          setTermsText(d.termsText || "");
          setTermsDocUrl(d.termsDocUrl || "");
          setTermsDocName(d.termsDocName || "");
        }
      } catch (e) {
        console.error("Error loading legal settings:", e);
        setMessage({ type: "error", text: "Failed to load." });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const clearMessage = () => setMessage({ type: "", text: "" });

  const save = async () => {
    setSaving(true);
    clearMessage();
    const isPrivacy = tab === "privacy";
    const src = isPrivacy ? source : termsSource;
    const pathPrefix = isPrivacy ? "privacy" : "terms";

    try {
      const updates = { updatedAt: new Date() };
      if (isPrivacy) {
        updates.privacyPolicySource = src;
      } else {
        updates.termsSource = src;
      }

      if (src === "text") {
        if (isPrivacy) {
          updates.privacyPolicyText = privacyPolicyText.trim();
          updates.privacyPolicyDocUrl = null;
          updates.privacyPolicyDocName = null;
        } else {
          updates.termsText = termsText.trim();
          updates.termsDocUrl = null;
          updates.termsDocName = null;
        }
        await setDoc(doc(db, "settings", LEGAL_DOC_ID), updates, { merge: true });
        setMessage({ type: "success", text: isPrivacy ? "Privacy policy saved." : "Terms of service saved." });
      } else {
        if (fileToUpload) {
          setUploading(true);
          const ext = (fileToUpload.name.match(/\.[^.]+$/) || [".bin"])[0];
          const path = `legal/${pathPrefix}-${Date.now()}${ext}`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, fileToUpload);
          const url = await getDownloadURL(storageRef);
          if (isPrivacy) {
            updates.privacyPolicyDocUrl = url;
            updates.privacyPolicyDocName = fileToUpload.name;
            setPrivacyPolicyDocUrl(url);
            setPrivacyPolicyDocName(fileToUpload.name);
          } else {
            updates.termsDocUrl = url;
            updates.termsDocName = fileToUpload.name;
            setTermsDocUrl(url);
            setTermsDocName(fileToUpload.name);
          }
          setFileToUpload(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
          setUploading(false);
        }
        if (isPrivacy) updates.privacyPolicyText = privacyPolicyText;
        else updates.termsText = termsText;
        await setDoc(doc(db, "settings", LEGAL_DOC_ID), updates, { merge: true });
        setMessage({ type: "success", text: isPrivacy ? "Privacy policy (document) saved." : "Terms of service (document) saved." });
      }
    } catch (e) {
      console.error("Error saving:", e);
      setMessage({ type: "error", text: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const isPrivacy = tab === "privacy";
  const src = isPrivacy ? source : termsSource;
  const docUrl = isPrivacy ? privacyPolicyDocUrl : termsDocUrl;
  const docName = isPrivacy ? privacyPolicyDocName : termsDocName;
  const pageLink = isPrivacy ? "/privacy" : "/terms";
  const label = isPrivacy ? "Privacy policy" : "Terms of service";

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2 text-gray-700">
        <DocumentTextIcon className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Privacy &amp; Terms</h2>
      </div>
      <p className="text-sm text-gray-500">
        Set the content for <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/privacy</a> and <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">/terms</a>. For each, you can paste rich text or upload a document.
      </p>

      {/* Tabs: Privacy | Terms */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <button type="button" onClick={() => { setTab("privacy"); setFileToUpload(null); clearMessage(); }} className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === "privacy" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"}`}>Privacy Policy</button>
        <button type="button" onClick={() => { setTab("terms"); setFileToUpload(null); clearMessage(); }} className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === "terms" ? "bg-white shadow text-gray-900" : "text-gray-600 hover:text-gray-900"}`}>Terms of Service</button>
      </div>

      {/* Source: text vs doc for active tab */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="legalSource" checked={src === "text"} onChange={() => { (isPrivacy ? setSource : setTermsSource)("text"); clearMessage(); }} className="text-blue-600" />
          <span className="text-sm font-medium">Paste text</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" name="legalSource" checked={src === "doc"} onChange={() => { (isPrivacy ? setSource : setTermsSource)("doc"); clearMessage(); }} className="text-blue-600" />
          <span className="text-sm font-medium">Upload document</span>
        </label>
      </div>

      {src === "text" ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{label} (rich text)</label>
          <p className="text-xs text-gray-500 mb-2">Use the toolbar for headings, bold, italic, lists, and links.</p>
          {isPrivacy && <TOOLBAR editor={editor} />}
          {!isPrivacy && <TOOLBAR editor={termsEditor} />}
          <div className="rich-editor-wrap border border-gray-300 rounded-b-lg [&_.ProseMirror]:min-h-[260px] [&_.ProseMirror]:px-3 [&_.ProseMirror]:py-2 [&_.ProseMirror]:text-sm [&_.ProseMirror]:outline-none">
            {isPrivacy && <EditorContent editor={editor} />}
            {!isPrivacy && <EditorContent editor={termsEditor} />}
          </div>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Document (PDF, DOC, DOCX, TXT)</label>
          {docUrl && !fileToUpload && <p className="text-sm text-gray-600 mb-2">Current file: <span className="font-medium">{docName || "Document"}</span></p>}
          <input ref={fileInputRef} type="file" accept={ACCEPT_DOC} onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          <p className="mt-1 text-xs text-gray-500">Leave empty to keep the current file. Choose a new file to replace it.</p>
        </div>
      )}

      {message.text && <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>}

      <button type="button" onClick={save} disabled={saving || uploading || (src === "doc" && !fileToUpload && !docUrl)} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
        {saving || uploading ? "Saving…" : "Save"}
      </button>
    </div>
  );
}
