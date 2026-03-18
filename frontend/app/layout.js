import { AuthProvider } from "../context/AuthContext";
import "./globals.css";

export const metadata = {
  title: "Pulse Chat",
  description: "Modern real-time chat built with Next.js and Socket.io"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add('light');
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
