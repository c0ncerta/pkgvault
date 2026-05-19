export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        position: "relative",
      }}
    >
      <div
        style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 480, padding: "0 24px" }}
      >
        {children}
      </div>
    </div>
  );
}
