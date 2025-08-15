import fs from 'node:fs';
import path from 'node:path';

/**
 * Copy generated JSX from tools/out/*.jsx into Next.js app routes:
 * - Destination: ../../app-frontend/app/figma/<ScreenName>/page.tsx
 * - Also write a manifest JSON for listing page links.
 */

const OUT_DIR = path.resolve('out');
const NEXT_ROOT = path.resolve('../../app-frontend/app/figma');
fs.mkdirSync(NEXT_ROOT, { recursive: true });

function toRouteName(filename) {
  const base = filename.replace(/\.jsx$/,'').replace(/[^a-zA-Z0-9_]/g,'_');
  return base || 'Screen';
}

const files = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.jsx'));
const manifest = [];

for (const f of files) {
  const src = path.join(OUT_DIR, f);
  const code = fs.readFileSync(src, 'utf-8');
  const route = toRouteName(f);
  const destDir = path.join(NEXT_ROOT, route);
  const dest = path.join(destDir, 'page.tsx');
  fs.mkdirSync(destDir, { recursive: true });

  // The generated code is valid JSX; Next supports TSX, so write as-is.
  fs.writeFileSync(dest, code, 'utf-8');
  manifest.push({ route, title: route });
  console.log(` [+] Copied to /figma/${route}`);
}

// Write manifest JSON
const manifestPath = path.join(NEXT_ROOT, '_manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`[✓] Wrote manifest: ${manifestPath}`);

// Also ensure index page exists (list of links)
const indexPage = `import Link from 'next/link';
import manifest from './_manifest.json';

export const dynamic = 'force-static';

export default function FigmaIndex() {
  return (
    <main style={{ maxWidth: 960, margin: '40px auto', padding: 16 }}>
      <h1>Figma Screens</h1>
      <ul style={{ lineHeight: 2 }}>
        {manifest.map((m: any) => (
          <li key={m.route}><Link href={'/figma/' + m.route}>{m.title}</Link></li>
        ))}
      </ul>
      <p style={{marginTop:24, color:'#666'}}>※ 生成されたJSXは設計用の素材です。UIはラフでOK、重要なのは <code>domain-hints</code> と <code>data-entity/data-field</code> です。</p>
    </main>
  );
}
`;
const indexDir = NEXT_ROOT;
const indexPath = path.join(indexDir, 'page.tsx');
if (!fs.existsSync(indexPath)) {
  fs.writeFileSync(indexPath, indexPage, 'utf-8');
  console.log(` [+] Created /figma index page`);
}
