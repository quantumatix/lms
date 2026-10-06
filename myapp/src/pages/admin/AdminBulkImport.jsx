import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { Toast, useToast } from "../../components/Toast";
import { Upload, FileCode, AlertCircle, CheckCircle2 } from "lucide-react";
import { API_BASE } from "../../config";

function AdminBulkImport() {
  const { toasts, addToast, removeToast } = useToast();
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    try {
      setLoading(true);
      const parsedData = JSON.parse(jsonInput);
      const response = await fetch(API_BASE + "/admin/bulk-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedData)
      });
      const result = await response.json();
      if (response.ok) {
        addToast(result.message, "success");
        setJsonInput("");
      } else {
        addToast(result.detail || "Import failed.", "error");
      }
    } catch {
      addToast("Invalid JSON format. Please check your syntax.", "error");
    } finally {
      setLoading(false);
    }
  };

  const sampleJson = `{
  "lessons": [
    {
      "id": "my_lesson_1",
      "title": "Introduction to Python",
      "category_id": "fundamentals",
      "category_title": "Python Fundamentals",
      "difficulty": "Beginner",
      "xp_reward": 50,
      "theory": "Python is a versatile language...",
      "mcq_quiz": [],
      "coding_challenges": []
    }
  ]
}`;

  return (
    <AdminLayout>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0f172a", margin: 0 }}>Bulk Content Import</h1>
        <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0, marginTop: "4px" }}>Upload your curriculum using structured JSON</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "24px" }}>
        {/* JSON Editor */}
        <div style={{ background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <FileCode size={20} style={{ color: "#6366f1" }} />
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", margin: 0 }}>JSON Data Input</h3>
          </div>

          <textarea
            rows={18}
            placeholder='{ "lessons": [ ... ] }'
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            style={{
              width: "100%", borderRadius: "12px", border: "1.5px solid #e5e7eb",
              padding: "16px", fontFamily: "monospace", fontSize: "13px", lineHeight: 1.6,
              background: "#0f172a", color: "#e2e8f0", resize: "vertical",
              outline: "none", boxSizing: "border-box", marginBottom: "16px",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              onClick={() => setJsonInput(sampleJson)}
              style={{ padding: "10px 20px", background: "#f1f5f9", color: "#374151", border: "none", borderRadius: "10px", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}
            >
              Load Sample
            </button>
            <button
              onClick={handleImport}
              disabled={loading || !jsonInput.trim()}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px",
                background: loading || !jsonInput.trim() ? "#c7d2fe" : "linear-gradient(135deg,#6366f1,#4f46e5)",
                color: "#fff", border: "none", borderRadius: "10px", fontWeight: 700, fontSize: "13px",
                cursor: loading || !jsonInput.trim() ? "not-allowed" : "pointer",
                boxShadow: loading || !jsonInput.trim() ? "none" : "0 4px 12px rgba(99,102,241,0.4)",
              }}
            >
              {loading ? <span className="spinner-border spinner-border-sm" /> : <Upload size={16} />}
              {loading ? "Processing..." : "Import Data"}
            </button>
          </div>
        </div>

        {/* Guide Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ background: "#0f172a", borderRadius: "16px", padding: "24px", color: "#fff" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "14px" }}>Schema Guide</h4>
            <pre style={{ fontFamily: "monospace", fontSize: "11px", color: "#38bdf8", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", background: "rgba(255,255,255,0.03)", borderRadius: "8px", padding: "12px" }}>
{`{
  "lessons": [
    {
      "id": "unique_id",
      "title": "Lesson Name",
      "category_id": "module",
      "theory": "...",
      "mcq_quiz": [...],
      "difficulty": "Beginner"
    }
  ]
}`}
            </pre>
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "Lessons", ok: true },
                { label: "MCQ Questions (inline)", ok: true },
                { label: "Coding Challenges (inline)", ok: true },
                { label: "Exercises (separate)", ok: true },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>
                  <CheckCircle2 size={13} style={{ color: "#10b981", flexShrink: 0 }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", borderRadius: "16px", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.04)" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#374151", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
              <AlertCircle size={15} style={{ color: "#f59e0b" }} /> Validation Rules
            </h4>
            <ul style={{ fontSize: "12px", color: "#6b7280", paddingLeft: "16px", lineHeight: 2, margin: 0 }}>
              <li>IDs must be unique strings</li>
              <li>XP rewards should be 50–200</li>
              <li>Category IDs must match modules</li>
              <li>Duplicate IDs will be rejected</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminBulkImport;
