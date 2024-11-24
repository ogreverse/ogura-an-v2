import axios from "axios";
import { ipcMain } from "electron";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config({ path: path.join(__dirname, "../.env") });

const NOTION_SECRET_KEY = process.env.NOTION_SECRET_KEY || "";
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

export const notionHandler = () => {
  // Notionに登録
  ipcMain.handle("register-to-notion", async (_event, resultText: string) => {
    try {
      const resultParams = JSON.parse(resultText);

      // 返却値の形式チェック
      if (!resultParams.word || !resultParams.meaning) {
        throw new Error("返却値が不正です");
      }

      const nowLocal = new Date();
      const diff: number = nowLocal.getTimezoneOffset() * 60 * 1000;
      const plusLocal = new Date(nowLocal.getTime() - diff);
      let createdAt = plusLocal.toISOString();
      createdAt = createdAt.slice(0, 19) + "+09:00";

      const tags = resultParams.tag.split(",");

      const response = await axios.post(
        "https://api.notion.com/v1/pages",
        {
          parent: { database_id: NOTION_DATABASE_ID },
          properties: {
            Word: {
              title: [
                {
                  text: {
                    content: resultParams.word,
                  },
                },
              ],
            },
            Meaning: {
              rich_text: [
                {
                  text: {
                    content: resultParams.meaning,
                  },
                },
              ],
            },
            Usage: {
              rich_text: [
                {
                  text: {
                    content: resultParams.usage || "",
                  },
                },
              ],
            },
            Tags: {
              multi_select: tags.map((tag: string) => {
                return {
                  name: tag.trim(),
                };
              }),
            },
            CreatedAt: {
              date: { start: createdAt },
            },
          },
        },
        {
          headers: {
            Authorization: `Bearer ${NOTION_SECRET_KEY}`,
            "Content-Type": "application/json",
            "Notion-Version": "2022-06-28",
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Notion APIのリクエストに失敗しました");
    }
  });
};
