import { contextBridge, ipcRenderer } from "electron";
import { FetchFilter as NotionFetchFilter } from "../main/helpers/notion-handler";
import { UpdateDatabaseParameters } from "@notionhq/client/build/src/api-endpoints";

// exposeInMainWorld で renderer のプロセスに公開する
contextBridge.exposeInMainWorld("api", {
  fetchWordMeaning: (word: string, context: string) =>
    ipcRenderer.invoke("fetch-word-meaning", { word, context }),
  registerToNotion: (resultText: string) =>
    ipcRenderer.invoke("register-to-notion", resultText),
  getDataFromNotion: (filter: NotionFetchFilter) =>
    ipcRenderer.invoke("get-data-from-notion", filter),
  getSelectOptionsFromNotion: (filter: NotionFetchFilter) =>
    ipcRenderer.invoke("get-select-options-from-notion", filter),
  updateDataToNotion: (params: UpdateDatabaseParameters) =>
    ipcRenderer.invoke("update-data-to-notion", params),
});
