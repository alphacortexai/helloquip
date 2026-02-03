"use client";

import { useState } from "react";
import { SparklesIcon, DocumentChartBarIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

function renderMarkdown(text) {
  if (!text || typeof text !== "string") return null;
  const lines = text.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith("## ")) {
      out.push(<h2 key={i} className="text-lg font-bold text-gray-900 mt-6 mb-2 first:mt-0">{trimmed.slice(3)}</h2>);
    } else if (trimmed.startsWith("### ")) {
      out.push(<h3 key={i} className="text-base font-semibold text-gray-800 mt-4 mb-1">{trimmed.slice(4)}</h3>);
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      out.push(<div key={i} className="ml-4 pl-2 border-l-2 border-gray-200 text-sm text-gray-700">{inlineMarkdown(trimmed.slice(2))}</div>);
    } else if (/^\d+\.\s/.test(trimmed)) {
      out.push(<div key={i} className="ml-4 pl-2 border-l-2 border-gray-200 text-sm text-gray-700">{inlineMarkdown(trimmed.replace(/^\d+\.\s/, ""))}</div>);
    } else if (trimmed === "") {
      out.push(<br key={i} />);
    } else {
      out.push(<p key={i} className="text-sm text-gray-700 mb-1">{inlineMarkdown(trimmed)}</p>);
    }
  }
  return out;
}

function inlineMarkdown(str) {
  const parts = [];
  let remaining = str;
  while (remaining.length > 0) {
    const bold = remaining.match(/\*\*(.+?)\*\*/);
    if (bold) {
      const before = remaining.slice(0, remaining.indexOf(bold[0]));
      if (before) parts.push(before);
      parts.push(<strong key={parts.length} className="font-semibold text-gray-900">{bold[1]}</strong>);
      remaining = remaining.slice(remaining.indexOf(bold[0]) + bold[0].length);
    } else {
      parts.push(remaining);
      break;
    }
  }
  return parts.length === 1 && typeof parts[0] === "string" ? parts[0] : <span>{parts}</span>;
}

export default function IntelligentAnalysis() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/intelligent-analysis", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to generate report");
        return;
      }
      setReport(data.report || "");
    } catch (err) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-0 sm:p-1">
      <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Intelligent Analysis</h2>
      <p className="text-sm text-gray-600 mb-4">
        Generate an AI report from <strong>Detailed User Tracking Analytics</strong> and <strong>Detailed Activity for every user</strong>: summary stats (users, page views, product clicks, product views, navigation), most accessed pages, trending/best liked products from clicks and views, user behaviour, and actionable improvements.
      </p>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            type="button"
            onClick={generateReport}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <ArrowPathIcon className="w-5 h-5 animate-spin" />
                Generating report…
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" />
                Generate report
              </>
            )}
          </button>
          {report && (
            <span className="inline-flex items-center gap-1.5 text-sm text-green-600">
              <DocumentChartBarIcon className="w-4 h-4" />
              Report ready
            </span>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        {report && (
          <div className="mt-4 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-100">
              <h3 className="text-sm font-semibold text-gray-800">Report</h3>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto prose prose-sm max-w-none">
              <div className="space-y-0.5 [&>ul]:list-disc [&>ul]:list-inside [&>ul]:pl-2">
                {renderMarkdown(report)}
              </div>
            </div>
          </div>
        )}

        {!report && !loading && !error && (
          <div className="text-center py-8 text-gray-500 text-sm">
            Click &quot;Generate report&quot; to analyse tracking data and per-user detailed activity and get a detailed report.
          </div>
        )}
      </div>
    </div>
  );
}
