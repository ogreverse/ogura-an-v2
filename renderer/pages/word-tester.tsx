import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { FetchFilter as NotionFetchFilter } from "../../main/helpers/notion-handler";
import Button from "../components/common/butttons/button";
import {
  TextRichTextItemResponse,
  NumberPropertyItemObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";

type StatusOption = {
  id: string;
  name: string;
  description: string | null;
  color: string;
};

type CurrentQuestionData = {
  pageId: string;
  word: string;
  question: string;
  answer: string;
  tags: { name: string; color: string }[];
};

type Question = {
  id: string;
  properties: {
    Status: {
      status: {
        name: string;
      };
    };
    Meaning: TextRichTextItemResponse;
    QuestionMeaningText: TextRichTextItemResponse;
    QuestionMeaningAnswer: TextRichTextItemResponse;
    QuestionWordText: TextRichTextItemResponse;
    QuestionWordAnswer: TextRichTextItemResponse;
    Word: {
      title: TextRichTextItemResponse[];
    };
    ReviewMeaningCount: NumberPropertyItemObjectResponse;
    ReviewWordCount: NumberPropertyItemObjectResponse;
  };
};

export default function HomePage() {
  const minCount = 1;
  const maxCount = 20;

  // 状態管理
  const [fetchCount, setFetchCount] = useState<number | null>(5);
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [questionMode, setQuestionMode] = useState<"word" | "meaning">("word");
  const [questionList, setQuestionList] = useState<[] | PageObjectResponse[]>(
    [],
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [currentQuestionData, setCurrentQuestionData] =
    useState<CurrentQuestionData | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await window.api.getSelectOptionsFromNotion();
        setStatusOptions(res.properties.Status.status.options);
      } catch (error) {
        console.error("ステータス取得に失敗しました。", error);
      }
    };
    fetchStatuses();
  }, []);

  const updateFetchCount = (count: number) => {
    setFetchCount(Math.min(Math.max(count, minCount), maxCount));
  };

  // 取得ボタンの処理
  const handleFetch = async () => {
    // 初期化
    setCurrentIndex(() => 0);
    setShowAnswer(() => false);
    setCurrentQuestionData(() => null);

    setLoading(true);
    setResult("取得中...");

    const filter: NotionFetchFilter = {
      page_size: fetchCount,
    };

    try {
      const res = await window.api.getDataFromNotion(filter);
      if (res?.results?.length > 0) {
        const filteredResults = res.results.filter(
          (item): item is PageObjectResponse => "parent" in item,
        );
        setQuestionList(filteredResults);
      }
    } catch (error) {
      setResult("取得エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  // 問題を準備する
  const prepareCurrentQuestionDisplayData = () => {
    if (questionList.length === 0) {
      setCurrentQuestionData(null);
      return;
    }

    const currentQuestionData = questionList[currentIndex];

    let questionText = "";
    let answerText = "";
    const tags = currentQuestionData.properties.Tags.multi_select.map(
      (item) => {
        return {
          name: item.name,
          color: item.color,
        };
      },
    );

    if (questionMode === "meaning") {
      // 意味を問う問題
      // memo: splitした後の一番最初のindexの文字列が回答になっている
      const answers =
        currentQuestionData.properties.QuestionMeaningAnswer.rich_text[0]?.text.content.split(
          ",",
        );
      const randomOrderAnswers = answers
        .slice()
        .sort(() => Math.random() - 0.5);
      questionText += `単語：${currentQuestionData.properties.Word.title[0].plain_text}`;
      questionText +=
        "\n\n" +
        currentQuestionData.properties.QuestionMeaningText.rich_text[0]
          ?.plain_text;
      questionText += "\n\n(選択肢)";
      randomOrderAnswers.forEach((answer, index) => {
        const optionText = `${index + 1}. ${answer}`;
        questionText += "\n" + optionText;
        if (answer === answers[0]) {
          answerText += optionText;

          // 単語の意味を表示
          answerText += `\n\n（意味）\n${currentQuestionData.properties.Meaning.rich_text[0]?.text.content}`;
        }
      });
    } else if (questionMode === "word") {
      // 単語を問う問題
      questionText +=
        currentQuestionData.properties.QuestionWordText.rich_text[0]
          ?.plain_text;
      answerText += currentQuestionData.properties.Word.title[0].plain_text;

      // 単語の意味を表示
      answerText += `\n\n（意味）\n${currentQuestionData.properties.Meaning.rich_text[0]?.text.content}`;
    }

    setCurrentQuestionData({
      pageId: currentQuestionData.id,
      word: currentQuestionData.properties.Word.title[0].plain_text,
      question: questionText,
      answer: answerText,
      tags,
    });
  };

  // 回答表示の切り替え時に答えの部分にスクロールする
  useEffect(() => {
    if (showAnswer) {
      const answerElement = document.getElementById("answer");
      answerElement?.scrollIntoView({ behavior: "smooth" });
    }
  }, [showAnswer]);

  // 問題表示用のデータを準備する
  useEffect(() => {
    prepareCurrentQuestionDisplayData();
  }, [questionMode, currentIndex, questionList]);

  const onChangeQuestionMode = (mode: "word" | "meaning") => {
    setQuestionMode(mode);
  };

  const onShiftQuestion = (direction: "prev" | "next") => {
    setShowAnswer(false);

    if (direction === "prev") {
      if (currentIndex === 0) {
        return;
      }

      setCurrentIndex((prevIndex) => prevIndex - 1);
    } else {
      if (currentIndex === questionList.length - 1) {
        return;
      }

      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  // ステータス更新の処理
  const onUpdateStatus = async (status: string) => {
    try {
      // await window.api.updateToNotion(status);
      // alert("ステータスを更新しました");
    } catch (error) {
      alert("ステータスの更新に失敗しました");
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
          <h2 className="text-xs font-bold mb-4">単語テスター</h2>
        </div>

        {/* 操作パネル */}
        <div className="mb-4">
          <label htmlFor="input__fetch_count" className="block text-xs mb-1">
            取得数（{minCount}〜{maxCount}）
          </label>

          <div className="flex gap-2 mb-4">
            <input
              type="number"
              id="input__fetch_count"
              className="w-3/4 border border-gray-300 rounded-md p-1"
              onChange={(e) => updateFetchCount(Number(e.target.value))}
              placeholder="取得数（1~20）"
              value={fetchCount}
            />

            <Button id="button__fetch" className="w-1/4" onClick={handleFetch}>
              取得
            </Button>
          </div>
        </div>

        {/* 問題送りボタン */}
        <div className="mb-4">
          <p className="text-xs mb-2 font-bold">問題送り / 設定</p>
          <div className="flex gap-1 mb-2">
            <Button
              id="button__familier"
              className=""
              onClick={() => onShiftQuestion("prev")}
              color="white"
              disabled={currentIndex === 0}
            >
              前へ
            </Button>
            <Button
              id="button__mastered"
              className=""
              onClick={() => onShiftQuestion("next")}
              color="white"
              disabled={currentIndex + 1 === questionList.length}
            >
              次へ
            </Button>
          </div>

          <div>
            <Button
              id="button__change_mode"
              className="mr-1"
              color={questionMode === "word" ? "white" : "black"}
              onClick={() =>
                onChangeQuestionMode(
                  questionMode === "word" ? "meaning" : "word",
                )
              }
            >
              {questionMode === "word" ? "単語問題" : "意味問題"}
            </Button>
            <Button
              id="button__show_answer"
              color={showAnswer ? "black" : "white"}
              onClick={() => setShowAnswer((prev) => !prev)}
            >
              {showAnswer ? "回答表示" : "回答非表示"}
            </Button>
          </div>
        </div>

        {/* ステータス更新ボタン */}
        <div className="mb-4">
          <p className="text-xs mb-2 font-bold">ステータス更新</p>
          <div className="flex gap-1">
            {statusOptions.map((option) => (
              <Button
                key={option.id}
                id={`button__status__${option.id}`}
                className=""
                onClick={() => onUpdateStatus(option.name)}
                color="white"
              >
                {option.name}
              </Button>
            ))}
          </div>
        </div>

        <hr className="mb-4" />

        {/* 問題と回答 */}
        {questionList.length > 0 && (
          <div className="mb-4">
            <div className="mb-4">
              <p className="mb-2 font-bold">
                [{questionMode === "word" ? "単語" : "意味"}問題{" "}
                {currentIndex + 1}/{questionList.length}]
              </p>
              <div className=" mb-2">
                {currentQuestionData?.tags.map((tag) => (
                  <span
                    key={tag.name}
                    className={`px-2 py-1 text-xs rounded-md text-white mr-1`}
                    style={{ background: tag.color }}
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
              <pre className="text-xs whitespace-pre-wrap">
                {currentQuestionData?.question}
              </pre>
            </div>

            {showAnswer ? (
              <div id="answer">
                <p className="mb-2 font-bold">[答え]</p>
                <pre className="text-xs whitespace-pre-wrap">
                  {currentQuestionData?.answer}
                </pre>
              </div>
            ) : (
              ""
            )}
          </div>
        )}
      </main>
    </>
  );
}
