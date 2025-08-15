export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body style={{ fontFamily: 'system-ui, sans-serif' }}>
        <header style={{ padding: 16, borderBottom: '1px solid #eee' }}>
          <a href="/" style={{ fontWeight: 700 }}>Figma→JSX→Next Starter</a>
          <nav style={{ marginTop: 8 }}>
            <a href="/figma">/figma</a>
          </nav>
        </header>
        <div style={{ maxWidth: 960, margin: '24px auto', padding: 16 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
