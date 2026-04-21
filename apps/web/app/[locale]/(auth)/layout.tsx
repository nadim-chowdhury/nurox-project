import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nurox ERP — Sign In",
  description: "Login to your Nurox ERP account",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        background: `
          radial-gradient(ellipse at 30% 20%, rgba(0, 229, 255, 0.04) 0%, transparent 50%),
          radial-gradient(ellipse at 70% 80%, rgba(195, 245, 255, 0.03) 0%, transparent 50%),
          #0c1324
        `,
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>{children}</div>
    </div>
  );
}
