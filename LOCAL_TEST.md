# C108 ベータ公開候補版 ローカル確認

プロジェクトルートで:

```bash
python3 -m http.server 8000
```

ブラウザ:

1. `http://localhost:8000/`
2. `http://localhost:8000/game/`
3. `http://localhost:8000/self-test.html`

## 必須確認

### トップページ

「🐱 招き猫ゲームを遊ぶ」をクリックして `/game/` に遷移する。

### ゲーム

- サイコロを振る
- 出目が表示される
- 招き猫が表示される
- ターンが進む
- ドロップアウトできる

### Self Test

`RESULT: PASS (14/14)` を確認。

## Node.js

```bash
node tests/run-all-tests.mjs
```

期待値:

```text
TEST RESULT: PASS (22/22)
```
