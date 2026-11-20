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

## コードチェック

ESLintによる静的解析を実行します。

```bash
npm run lint
```

Prettierによるフォーマットチェックを実行します。

```bash
npm run format:check
```
