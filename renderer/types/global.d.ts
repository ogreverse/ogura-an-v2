import {
  CreatePageParameters,
  QueryDatabaseResponse,
  UpdatePageParameters,
} from "@notionhq/client/build/src/api-endpoints";

declare global {
  interface Window {
    api: {
      fetchDatabaseId: (databaseKey: string) => Promise<string>;
      fetchWordMeaning: (word: string, context: string) => Promise<string>;
      registerToNotion: (createParams: CreatePageParameters) => Promise<void>;
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
