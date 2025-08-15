export default function Page() {
  return (
    <main>
      <h1>ようこそ</h1>
      <p>左上の <code>/figma</code> から、Figma抽出で生成された画面一覧へ移動できます。</p>
      <ol>
        <li>まず <code>tools/figma-to-jsx/.env</code> を設定</li>
        <li><code>npm run extract</code>（抽出）</li>
        <li><code>npm run copy</code>（Nextにコピー）</li>
        <li>このアプリを <code>npm run dev</code> で起動して確認</li>
      </ol>
    </main>
  );
}
