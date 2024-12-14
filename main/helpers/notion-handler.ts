import axios from "axios";
import { ipcMain } from "electron";
import * as path from "path";
import * as dotenv from "dotenv";
import { Client } from "@notionhq/client";
import {
  CreatePageParameters,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";

dotenv.config({ path: path.join(__dirname, "../.env") });

const NOTION_SECRET_KEY = process.env.NOTION_SECRET_KEY || "";
const NOTION_DATABASE_IDS = {
  word: process.env.NOTION_DATABASE_ID_WORD || "",
};

const notion = new Client({ auth: NOTION_SECRET_KEY });

export type FetchFilter =
  | { and: FetchFilter[] }
  | { or: FetchFilter[] }
  | { [condition: string]: unknown };

export const notionHandler = () => {
  // データベースIDを取得
  ipcMain.handle("fetch-database-id", async (_event, databasKey: string) => {
    return NOTION_DATABASE_IDS[databasKey] || "";
  });

  // Notionに登録
  ipcMain.handle(
    "register-to-notion",
    async (_event, createParams: CreatePageParameters) => {
      try {
        const response = await notion.pages.create(createParams);
        return response;
      } catch (error) {
        console.error(error);
        throw new Error("Notion APIのリクエストに失敗しました");
      }
    },
  );

  // Notionから取得
  ipcMain.handle(
    "get-data-from-notion",
    async (_event, filter: FetchFilter) => {
      try {
        const response = await notion.databases.query({
          database_id: NOTION_DATABASE_IDS.word,
          ...filter,
        });
        return response;
      } catch (error) {
        console.error(error);
        throw new Error("Notion APIのリクエストに失敗しました");
      }
    },
  );

  // データベースで用意されているセレクトのオプションを取得
  ipcMain.handle("get-select-options-from-notion", async (event) => {
    try {
      const response = await notion.databases.retrieve({
        database_id: NOTION_DATABASE_IDS.word,
      });
      return response;
    } catch (error) {
      console.error(error);
      throw new Error("Notion APIのリクエストに失敗しました");
    }
  });

  // データベースのレコードのデータを更新
  ipcMain.handle(
    "update-data-to-notion",
    async (_event, params: UpdatePageParameters) => {
      try {
        const response = await notion.pages.update(params);
        return response;
      } catch (error) {
        console.error(error);
        throw new Error("Notion APIのリクエストに失敗しました");
      }
    },
  );
};
