// cronジョブと平日チェックのロジックを担当するモジュール

const cron = require("node-cron");
const { sendReport } = require("./slack");

/**
 * 今日が平日（月〜金）かどうかを判定（日本時間ベース）
 * @returns {boolean} 平日ならtrue、土日ならfalse
 */
function isWeekday() {
  const now = new Date();
  // 日本時間での曜日を取得（0=日, 1=月, ... 6=土）
  const jstDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const day = jstDate.getDay();
  // 月(1)〜金(5)が平日
  return day >= 1 && day <= 5;
}

/**
 * 平日チェック付きのレポート送信処理
 * 土日はスキップし、平日のみSlackへ送信
 */
async function runScheduledReport() {
  if (!isWeekday()) {
    console.log("[Scheduler] 今日は土日のためスキップします");
    return;
  }

  console.log("[Scheduler] 平日レポート送信を開始します");
  try {
    await sendReport();
  } catch (error) {
    console.error(`[Scheduler] レポート送信エラー: ${error.message}`);
  }
}

/**
 * cronジョブを開始
 * 毎日朝9時（日本時間）に起動するcron式: 0 9 * * *
 * タイムゾーンに Asia/Tokyo を指定
 * @returns {cron.ScheduledTask} スケジュールされたタスク
 */
function startScheduler() {
  // 平日朝9時に実行するcronジョブ（Asia/Tokyo指定）
  const task = cron.schedule(
    "0 9 * * *",
    () => {
      runScheduledReport();
    },
    {
      scheduled: true,
      timezone: "Asia/Tokyo",
    }
  );

  console.log("スケジューラー起動。平日朝9時に送信します");
  return task;
}

module.exports = { startScheduler, runScheduledReport, isWeekday };
