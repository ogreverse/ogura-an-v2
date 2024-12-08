import {
  QueryDatabaseResponse,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";

declare global {
  interface Window {
    api: {
      fetchWordMeaning: (word: string, context: string) => Promise<string>;
      registerToNotion: (result: string) => Promise<void>;
      getDataFromNotion: (
        filter: NotionFetchFilter,
      ) => Promise<QueryDatabaseResponse>;
      getSelectOptionsFromNotion: {
        (filter: NotionFetchFilter): Promise<QueryDatabaseResponse>;
        (): Promise<QueryDatabase>;
      };
      updateDataToNotion: (params: UpdatePageParameters) => Promise<void>;
    };
  }
}

export {};
