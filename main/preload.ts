import { contextBridge, ipcRenderer } from "electron";
import { FetchFilter as NotionFetchFilter } from "../main/helpers/notion-handler";
import {
  CreatePageParameters,
  UpdateDatabaseParameters,
} from "@notionhq/client/build/src/api-endpoints";

// exposeInMainWorld で renderer のプロセスに公開する
contextBridge.exposeInMainWorld("api", {
  fetchDatabaseId: (databaseKey: string) =>
    ipcRenderer.invoke("fetch-database-id", databaseKey),
  fetchWordMeaning: (word: string, context: string) =>
    ipcRenderer.invoke("fetch-word-meaning", { word, context }),
  registerToNotion: (createParams: CreatePageParameters) =>
    ipcRenderer.invoke("register-to-notion", createParams),
  getDataFromNotion: (filter: NotionFetchFilter) =>
    ipcRenderer.invoke("get-data-from-notion", filter),
  getSelectOptionsFromNotion: (filter: NotionFetchFilter) =>
    ipcRenderer.invoke("get-select-options-from-notion", filter),
  updateDataToNotion: (params: UpdateDatabaseParameters) =>
    ipcRenderer.invoke("update-data-to-notion", params),
});
