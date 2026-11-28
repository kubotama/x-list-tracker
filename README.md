# X List Tracker

Xのリストごとに、最後に読んだポストの投稿日時を記録するアプリケーションです。

## 技術構成

- React
- TypeScript
- Vite
- Cloudflare Workers

## 動作環境

- Node.js 26

## セットアップ

依存関係をインストールします。

```bash
npm install
```

## 開発

開発サーバーを起動します。

```bash
npm run dev
```

## ビルド

本番用のビルドを実行します。

```bash
npm run build
```

## データの保存

タブと最後に読んだ日時は、ブラウザの localStorage に保存されます。サーバーには送信されません。

- ブラウザのデータを削除すると、保存したタブと日時は復元できません。
- ブラウザや端末、アクセスするURLごとに、保存されるデータは別々です。
- 設定（「日時を選んだら確定する」）も、同じブラウザの localStorage に、タブとは別に保存されます。

## コードチェック

ESLintによる静的解析を実行します。

```bash
npm run lint
```

Prettierによるフォーマットチェックを実行します。

```bash
npm run format:check
```

## テスト

Vitest によるテストを実行します。

```bash
npm test
```

変更を監視しながら実行する場合は、次のコマンドを使います。

```bash
npm run test:watch
```

## デプロイ

Cloudflare Workers の static assets としてデプロイします。初回のみ、Wrangler で Cloudflare にログインします。

```bash
npx wrangler login
```

ビルドとデプロイを実行します。

```bash
npm run deploy
```

タブと日時はブラウザの localStorage に保存されるため、デプロイ先の URL が変わると、保存したデータは引き継がれません。
