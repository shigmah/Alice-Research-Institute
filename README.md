# アリス研究所

「面白い、を数学に。」

招き猫ゲームと、ゲームの記録を使った研究・統計分析を制作するプロジェクトです。

## 公開サイト

- 公式サイト: https://shigmah.github.io/Alice-Research-Institute/
- 招き猫ゲーム: https://shigmah.github.io/Alice-Research-Institute/game/
- アリス研究所: https://shigmah.github.io/Alice-Research-Institute/game/institute.html

## 現在の公開候補

2026年11月7日時点の公開候補です。

- 招き猫ゲーム（ブラウザ上で動作）
- アリス研究所の施設・研究テーマ・研究記録
- クラシックモードの実験記録と統計分析
- 停止条件を再現したモンテカルロ検定
- Wilson 95%区間、推定値の収束履歴、進捗表示
- 2,000～50,000回のモンテカルロ反復

研究テーマ・機能は段階的に追加しています。すべての研究テーマや将来構想が実装済みという意味ではありません。

## ローカル実行

プロジェクトルートで静的HTTPサーバーを起動します。

```bash
python -m http.server 8000
```

ブラウザで以下を開きます。

- http://localhost:8000/
- http://localhost:8000/game/
- http://localhost:8000/game/institute.html

## テスト

Node.js のテスト一式:

```bash
node tests/run-all-tests.mjs
```

2026年11月7日の公開候補ブランチでは **94/94 PASS** を確認しています。テストを追加・変更した場合は、実行結果を改めて確認してください。

ブラウザ実動作検証ページ（開発・検証用）:

- http://localhost:8000/game/institute-browser-e2e.html

この検証ページは公開サイトの一般利用者向け画面ではありません。均等・5%境界付近・極端な偏りの観測データを使い、モンテカルロ検定の進捗・推定値・Wilson区間を確認するための開発用ページです。
