import axios from "axios";
import { ipcMain } from "electron";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const OPENAI_API_MODEL = process.env.OPENAI_API_MODEL || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

export const openAiHandler = (mainWindow) => {
  // OpenAIに意味を問い合わせる
  ipcMain.handle(
    "fetch-word-meaning",
    async (_event, { word, context }: { word: string; context: string }) => {
      const messages = [
        {
          role: "system",
          content: `
        以下のワードと文脈を参考に、ワード、意味（500文字以下で、である調の詳細な説明、略語の場合は分解した言葉を頭に含める）、タグ（カテゴリ分けしやすいタグを、カンマ区切りで１〜３個記載する）、使い方の4つの項目を含むJSONを返却してください。
        返却値は必ずJSONだけにしてください。
        JSONのキーは例に合わせてください。
        使い方は文脈をそのまま転載せず、ワードを使用した適切な例文を作成してください。
        （例）ワード: GRIT、文脈: 評価においてGRITが重要だと言われている。
        {
          "word": "GRIT",
          "meaning": "Guts Resilience Initiative Tenacity。長期的な目標に対する情熱と忍耐力を指す概念であり、困難や障害に直面しても諦めずに努力を続ける力を表す。心理学者アンジェラ・ダックワースによって提唱され、個人の成功や達成において重要な要素とされている。",
          "tag": "心理学,特性",
          "usage": "彼女のGRITが評価され、厳しいプロジェクトを最後までやり遂げることができた。"
        }
        `,
        },
        { role: "user", content: `ワード: ${word}\n文脈: ${context}` },
      ];
      try {
        // ウィンドウのサイズを変更
        const [currentWidth, currentHeight] = mainWindow.getSize();
        const newHeight = 600;
        mainWindow.setSize(currentWidth, newHeight);

        const response = await axios.post(
          "https://api.openai.com/v1/chat/completions",
          {
            model: OPENAI_API_MODEL,
            messages,
          },
          {
            headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          },
        );

        return response.data.choices[0].message.content;
      } catch (error) {
        console.error(error);
        throw new Error("OpenAI APIのリクエストに失敗しました");
      }
    },
  );
};
