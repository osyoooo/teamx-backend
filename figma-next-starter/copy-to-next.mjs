import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// outディレクトリのパス
const outDir = path.join(__dirname, 'tools', 'figma-to-jsx', 'out');

// Next.js側のコピー先
const targetBase = path.join(__dirname, 'app-frontend', 'app', 'figma');

if (!fs.existsSync(outDir)) {
  console.error('❌ out/ ディレクトリが見つかりません:', outDir);
  process.exit(1);
}

fs.mkdirSync(targetBase, { recursive: true });

for (const file of fs.readdirSync(outDir)) {
  if (!file.endsWith('.jsx')) continue;
  const name = file.replace(/\.jsx$/, '');
  const srcPath = path.join(outDir, file);
  const destDir = path.join(targetBase, name);
  const destFile = path.join(destDir, 'page.tsx');

  fs.mkdirSync(destDir, { recursive: true });
  const jsx = fs.readFileSync(srcPath, 'utf-8');
  fs.writeFileSync(destFile, jsx, 'utf-8');
  console.log(`✅ Copied ${file} → ${path.relative(__dirname, destFile)}`);
}

console.log('🎉 All files copied to Next.js app/figma/');
