import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Button from "../components/common/butttons/button";

export default function WordRegister() {
  // 状態管理
  const [word, setWord] = useState("");
  const [context, setContext] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // クリアボタンの処理
  const handleClear = () => {
    setWord("");
    setContext("");
    setResult(null);
  };

  // 検索ボタンの処理
  const handleSearch = async () => {
    if (!word) {
      alert("ワードを入力してください");
      return;
    }

    setLoading(true);
    setResult("検索中...");

    try {
      const fetchedResult = await window.api.fetchWordMeaning(word, context);

      setResult(fetchedResult);
    } catch (error) {
      setResult("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // Notionへの登録ボタンの処理
  const handleRegister = async () => {
    if (!result) return;

    try {
      await window.api.registerToNotion(result);
      alert("Notionに登録しました");
    } catch (error) {
      alert("Notionへの登録に失敗しました");
    }
  };

  return (
    <>
      <Head>
        <title>Ogura AN</title>
      </Head>
      <main className="p-4 text-sm font-sans bg-white">
        {/* Header */}
        <header className="flex items-center gap-2 mb-2">
          <Image
            className="w-8 h-8"
            src="/images/icon_page.png"
            alt="Ogura AN"
            width={32}
            height={32}
          />
          <h1 className="text-lg text-gray-800">Ogura AN</h1>
        </header>

        <div>
          <h2 className="text-xs mb-4 font-bold">単語登録</h2>
        </div>

        {/* Input Areas */}
        <div className="mb-4">
          <label htmlFor="input__word" className="block text-xs mb-1">
            ワード
          </label>
          <input
            type="text"
            id="input__word"
            className="w-full border border-gray-300 rounded-md p-1"
            value={word}
            onChange={(e) => setWord(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="input__context" className="block text-xs mb-1">
            文脈
          </label>
          <textarea
            id="input__context"
            value={context}
            className="w-full border border-gray-300 rounded-md p-1"
            onChange={(e) => setContext(e.target.value)}
          />
        </div>

        {/* Button Area */}
        <div className="flex justify-end gap-2 flex-wrap mb-4">
          <Button id="button__clear" onClick={handleClear}>
            消去
          </Button>
          <Button id="button__search" onClick={handleSearch}>
            調べる
          </Button>
        </div>

        {/* Result Wrapper */}
        <div id="result__wrapper" className="mt-4">
          {result && (
            <div>
              <pre className="result__text w-full whitespace-pre-wrap text-xs mb-4">
                {result}
              </pre>
              <div className="flex">
                <Button onClick={handleRegister} className="ml-auto">
                  登録
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
