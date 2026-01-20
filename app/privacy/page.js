"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

const LEGAL_DOC_ID = "legal";

const ALLOWED_TAGS = ["p", "br", "strong", "b", "em", "i", "u", "h1", "h2", "h3", "h4", "ul", "ol", "li", "a", "span", "blockquote", "div"];
const ALLOWED_ATTR = ["href", "target", "rel", "class"];

export default function PrivacyPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "settings", LEGAL_DOC_ID));
        setData(snap.exists() ? snap.data() : null);
      } catch (e) {
        console.error("Error loading privacy policy:", e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#255cdc]" />
      </div>
    );
  }

  const source = data?.privacyPolicySource || "text";
  const docUrl = data?.privacyPolicyDocUrl || "";
  const docName = (data?.privacyPolicyDocName || "").toLowerCase();
  const text = data?.privacyPolicyText || "";
  const isPdf = docUrl && (docName.endsWith(".pdf") || docUrl.toLowerCase().includes(".pdf"));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <div className="mb-6">
        <Link href="/" className="text-sm text-[#255cdc] hover:underline">
          ← Back to Home
        </Link>
      </div>
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>

      {source === "doc" && docUrl ? (
        isPdf ? (
          <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden bg-white">
            <iframe
              src={docUrl}
              title="Privacy Policy"
              className="w-full min-h-[70vh]"
            />
          </div>
        ) : (
          <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-gray-600 mb-4">
              Your privacy policy is available as a document. Download it to view.
            </p>
            <a
              href={docUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#255cdc] text-white rounded-lg hover:bg-[#1e4bc4]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download Privacy Policy
            </a>
          </div>
        )
      ) : text ? (
        <div
          className="privacy-content mt-6 prose prose-slate max-w-none text-gray-700 [&_p]:mb-3 [&_ul]:my-3 [&_ol]:my-3 [&_li]:ml-4 [&_strong]:font-semibold [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-6 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_a]:text-[#255cdc] [&_a]:underline [&_a]:hover:no-underline"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(text, { ALLOWED_TAGS, ALLOWED_ATTR }),
          }}
        />
      ) : (
        <p className="mt-6 text-gray-500">Privacy policy has not been set yet. Please check back later.</p>
      )}
    </div>
  );
}
