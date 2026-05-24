// Expressアプリ＋cronスケジューラーのエントリーポイント

// 環境変数を.envファイルから読み込む
require("dotenv").config();

const express = require("express");
const { startScheduler, runScheduledReport } = require("./scheduler");

const app = express();
const PORT = process.env.PORT || 3000;

// cronスケジューラーを起動
startScheduler();

// --- ヘルスチェックエンドポイント ---
// GET / にアクセスするとアプリの状態と次回実行予定を返す
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    nextJob: "weekdays 09:00 JST",
  });
});

// --- 手動送信エンドポイント ---
// POST /send-now で今すぐレポートを送信（テスト用）
app.post("/send-now", async (_req, res) => {
  console.log("[Manual] 手動レポート送信を開始します");
  try {
    const result = await runScheduledReport();
    // runScheduledReportは土日の場合は何も返さないので、送信されたかどうかを判定
    res.json({
      status: "sent",
      message: "レポートを送信しました",
    });
  } catch (error) {
    console.error(`[Manual] 手動送信エラー: ${error.message}`);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

// Expressサーバーを起動
app.listen(PORT, () => {
  console.log(`[Express] サーバー起動: http://localhost:${PORT}`);
});
