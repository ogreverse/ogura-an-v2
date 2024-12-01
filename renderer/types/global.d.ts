declare global {
  interface Window {
    api: {
      fetchWordMeaning: (word: string, context: string) => Promise<string>;
      registerToNotion: (result: string) => Promise<void>;
      fetchFromNotion: (filter: NotionFetchFilter) => Promise<string>;
    };
  }
}

export {};
