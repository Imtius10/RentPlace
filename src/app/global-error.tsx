"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#0b1210",
          color: "#e7f5f0",
          textAlign: "center",
          padding: "24px",
        }}
      >
        <div>
          <p style={{ fontSize: 48, margin: 0, fontWeight: 700 }}>500</p>
          <h1 style={{ fontSize: 22, margin: "12px 0 8px" }}>
            RentPlace hit an unexpected error
          </h1>
          <p style={{ opacity: 0.7, maxWidth: 420, margin: "0 auto", fontSize: 14 }}>
            {error.message || "Please try again in a moment."}
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "10px 20px",
              borderRadius: 999,
              border: "none",
              background: "#10b981",
              color: "#04140e",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload page
          </button>
        </div>
      </body>
    </html>
  );
}
