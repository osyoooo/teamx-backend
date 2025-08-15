# Figma → JSX → Next.js 統合スターター（超ていねい版）

このパッケージは **1つのZIP** で
- Figma API から画面テキスト構造を取得して **JSX（domain-hints + data-entity/data-field付き）** を生成
- 生成されたJSXを **Next.jsアプリに自動コピーしてページ化**
までを行います。

---

## 0) 前提（インストール）
- Node.js 18 以上（必須）
- Figmaの **Personal access token**（後述）
- Figmaの **ファイルキー**（後述）

---

## 1) フォルダ構成（ZIPを解凍した直後）

```
figma-next-starter/
├─ tools/
│  └─ figma-to-jsx/
│     ├─ src/               # 抽出＆コピー用のNodeスクリプト
│     ├─ config/            # 画面ごとの簡易マッピング設定（要編集）
│     ├─ out/               # 抽出結果（JSX）が出力される
│     ├─ package.json
│     ├─ .env.example       # ← これを .env にコピーして書き換える（※この階層）
│     └─ README.md
└─ app-frontend/
   ├─ app/                  # Next.js (App Router)
   ├─ package.json
   ├─ next.config.mjs
   ├─ tsconfig.json
   └─ README.md
```

**重要：`.env` は `tools/figma-to-jsx/` の直下に作ります。**  
パス：`figma-next-starter/tools/figma-to-jsx/.env`

---

## 2) Figmaトークンとファイルキーの準備
- **FIGMA_TOKEN**：Figma → 右上アイコン → Settings → Account → *Personal access tokens* → Generate  
- **FIGMA_FILE_KEY**：FigmaのURL `https://www.figma.com/file/<FILE_KEY>/...` の `<FILE_KEY>`

---

## 3) セットアップ手順（Windows / macOS どちらも同じ）

### (A) 依存インストール
```bash
# 1) 抽出ツール側
cd figma-next-starter/tools/figma-to-jsx
copy .env.example .env         # Windows (PowerShell)
# macOS/Linux の場合: cp .env.example .env

# .env をメモ帳で開いて以下を設定
# FIGMA_TOKEN=FIG-xxxxxx...
# FIGMA_FILE_KEY=あなたのファイルキー
# SCREENS=12,13,14,15,16,17  ← 12〜17が対象ならこのまま

npm i

# 2) フロントエンド側
cd ../../app-frontend
npm i
```

### (B) Figmaから抽出（JSX生成）
```bash
# 抽出ツールのディレクトリに移動
cd ../tools/figma-to-jsx
# .envのSCREENSに従って抽出（例: 12,13,14,15,16,17）
npm run extract
# 成功すると out/ に JSX が出ます
```

### (C) Next.js へ自動コピー＆ページ化
```bash
# 抽出ツール直下で実行（JSX → Next にコピー＆ルーティング生成）
npm run copy
```
- これで `app-frontend/app/figma/` 配下に、各スクリーンのページが自動生成されます
- さらに `app-frontend/app/figma/_manifest.json` が作られ、一覧ページ（/figma）でリンク化されます

### (D) Next.js を起動して確認
```bash
cd ../../app-frontend
npm run dev
```
- ブラウザで http://localhost:3000/figma を開く  
  → 生成された各スクリーン（例：`12_Profile` など）がリンク表示されます  
  → クリックで中身（Figmaから抽出したJSX）が見られます

---

## 4) 画面マッピングの微調整（重要）
`tools/figma-to-jsx/config/*.json` を編集して、**Figmaのレイヤー名（またはテキスト）** と **エンティティ/フィールド** の対応を調整します。  
例：`12_profile.json`
```json
{
  "screen": "Profile",
  "entities": ["User","Profile","Interest"],
  "actions": ["updateProfile","updateInterests"],
  "fieldsMap": {
    "表示名": ["User","name"],
    "抱負": ["Profile","aspiration"],
    "みつける": ["Profile","find_score"],
    "カタチにする": ["Profile","shape_score"],
    "とどける": ["Profile","deliver_score"]
  }
}
```
- 左側キーは **部分一致** します（レイヤー名→テキスト本文の順で照合）
- 右側は DBエンティティとフィールドの候補名

**変更したら** 再度 `(B)` 抽出 → `(C)` コピーを実行してください。

---

## 5) Codex に渡すときのプロンプト（例）
> JSXの `domain-hints` と `data-entity/data-field` を読み取り、既存DDLとの差分DDLと必要なFastAPIエンドポイントを提案して。対象は12〜17のみ。PK/FK/インデックス、冪等性、バリデーションも考慮。

---

## 6) つまずき対策
- **抽出が0件** → `.env` の `SCREENS` と Figma側のフレーム名の接頭辞が一致しているか（例：`12-1_Profile` など）
- **文字が空** → Textノードの `characters` が空のケースは自動で `/nodes` で補完します。うまく取れない時はレイヤーがTextか確認。
- **Nextでビルド失敗** → 生成JSXがJSXとして不正なとき（未閉じタグなど）。`tools/out/*.jsx` を開いて崩れてないか確認。

困ったら、エラーメッセージをそのまま貼ってください。ピンポイントで直します。
