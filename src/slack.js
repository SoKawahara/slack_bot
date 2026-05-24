// Slack送信処理を担当するモジュール

const { WebClient } = require("@slack/web-api");

// 環境変数からBotトークンとチャンネルIDを取得
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;
// レポートタイトル（未設定時はデフォルト値を使用）
const REPORT_TITLE = process.env.REPORT_TITLE || "日次レポート";

// Slack Web APIクライアントの初期化
const web = new WebClient(SLACK_BOT_TOKEN);

/**
 * 現在の日付を YYYY/MM/DD 形式で取得（日本時間）
 */
function getFormattedDate() {
  const now = new Date();
  // 日本時間に変換してフォーマット
  const jstDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const year = jstDate.getFullYear();
  const month = String(jstDate.getMonth() + 1).padStart(2, "0");
  const day = String(jstDate.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

/**
 * 現在の時刻を HH:mm 形式で取得（日本時間）
 */
function getFormattedTime() {
  const now = new Date();
  const jstDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  const hours = String(jstDate.getHours()).padStart(2, "0");
  const minutes = String(jstDate.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Block Kit形式のレポートメッセージを構築
 * - ヘッダー：タイトル＋日付
 * - 区切り線
 * - KPI一覧（ダミー値）
 * - フッター：生成時刻
 */
function buildReportBlocks() {
  const dateStr = getFormattedDate();
  const timeStr = getFormattedTime();

  return [
    // ヘッダーブロック：レポートタイトル＋今日の日付
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${REPORT_TITLE} - ${dateStr}`,
        emoji: true,
      },
    },
    // 区切り線
    {
      type: "divider",
    },
    // KPI一覧セクション：売上・新規登録数・アクティブユーザー数
    {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `*売上*\n¥1,234,567`,
        },
        {
          type: "mrkdwn",
          text: `*新規登録数*\n42人`,
        },
        {
          type: "mrkdwn",
          text: `*アクティブユーザー数*\n1,893人`,
        },
      ],
    },
    // 区切り線
    {
      type: "divider",
    },
    // フッター：生成時刻
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `生成時刻 ${timeStr} JST`,
        },
      ],
    },
  ];
}

/**
 * Slackチャンネルにレポートを送信
 * @returns {Promise<object>} Slack APIのレスポンス
 */
async function sendReport() {
  const blocks = buildReportBlocks();
  const dateStr = getFormattedDate();

  try {
    // chat.postMessage APIでメッセージを送信
    const result = await web.chat.postMessage({
      channel: SLACK_CHANNEL_ID,
      text: `${REPORT_TITLE} - ${dateStr}`,
      blocks,
    });

    console.log(`[Slack] メッセージ送信成功: ts=${result.ts}`);
    return result;
  } catch (error) {
    console.error(`[Slack] メッセージ送信失敗: ${error.message}`);
    throw error;
  }
}

module.exports = { sendReport };
