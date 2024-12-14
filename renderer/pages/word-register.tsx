import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Button from "../components/common/butttons/button";
import { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";

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

  // OpenAIのレスポンスをNotionへの登録用のパラメータに変換
  const convertResultToCreateParams = async (
    resultText: string,
  ): Promise<CreatePageParameters> => {
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
    const notionDatabaseId = await window.api.fetchDatabaseId("word");
    console.log("notionDatabaseId", notionDatabaseId);

    if (!notionDatabaseId) {
      throw new Error("データベースIDが設定されていません");
    }

    return {
      parent: { database_id: notionDatabaseId },
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
        QuestionWordText: {
          rich_text: [
            {
              text: {
                content: resultParams.q_word || "",
              },
            },
          ],
        },
        QuestionMeaningText: {
          rich_text: [
            {
              text: {
                content: resultParams.q_meaning || "",
              },
            },
          ],
        },
        QuestionMeaningAnswer: {
          rich_text: [
            {
              text: {
                content: resultParams.q_meaning_a || "",
              },
            },
          ],
        },
        CreatedAt: {
          date: { start: createdAt },
        },
      },
    };
  };

  // Notionへの登録ボタンの処理
  const handleRegister = async () => {
    if (!result) return;

    try {
      const createdParams = await convertResultToCreateParams(result);
      await window.api.registerToNotion(createdParams);

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
