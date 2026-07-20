import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

const icons = {
  success: <CheckCircle2 size={18} />,
  error: <XCircle size={18} />,
  warning: <AlertCircle size={18} />,
};

const colors = {
  success: { bg: "#ecfdf5", border: "#10b981", text: "#065f46" },
  error: { bg: "#fef2f2", border: "#ef4444", text: "#7f1d1d" },
  warning: { bg: "#fffbeb", border: "#f59e0b", text: "#78350f" },
};

export function Toast({ toasts, removeToast }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "360px",
      }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: colors[t.type]?.bg || "#fff",
            border: `1px solid ${colors[t.type]?.border || "#e5e7eb"}`,
            color: colors[t.type]?.text || "#111",
            borderRadius: "12px",
            padding: "14px 16px",
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
            animation: "slideInRight 0.25s ease",
          }}
        >
          <span style={{ color: colors[t.type]?.border, flexShrink: 0 }}>
            {icons[t.type]}
          </span>
          <span style={{ fontSize: "13px", fontWeight: 500, flex: 1, lineHeight: 1.4 }}>
            {t.message}
          </span>
          <button
            onClick={() => removeToast(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              opacity: 0.5,
              flexShrink: 0,
            }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// Custom hook for toast management
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return { toasts, addToast, removeToast };
}
