"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWords } from "../../../lib/wordStorage";
import { getGrammarQuestions } from "../../../lib/grammarStorage";

export default function TodayPracticePage() {

  const [wordCount,setWordCount]=useState(0);
  const [grammarCount,setGrammarCount]=useState(0);

  useEffect(()=>{

    setWordCount(getWords().length);

    setGrammarCount(getGrammarQuestions().length);

  },[])

  return(

<div className="min-h-screen px-5 py-10">

<p className="text-sm text-slate-500">
Today's Learning
</p>

<h1 className="mt-2 text-3xl font-bold">
今日練習
</h1>

<p className="mt-2 text-slate-500">
每天完成一些小目標，慢慢累積英文能力。
</p>

<div className="mt-8 space-y-4">

<div className="rounded-3xl bg-indigo-600 p-6 text-white">

<p className="text-indigo-100">
Vocabulary
</p>

<h2 className="mt-2 text-2xl font-bold">
單字練習
</h2>

<p className="mt-2">
目前共有 {wordCount} 個單字
</p>

<Link
href="/practice/vocabulary"
className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-indigo-600"
>

開始練習

</Link>

</div>

<div className="rounded-3xl bg-slate-900 p-6 text-white">

<p className="text-slate-300">
Grammar
</p>

<h2 className="mt-2 text-2xl font-bold">
文法練習
</h2>

<p className="mt-2">
目前共有 {grammarCount} 題
</p>

<Link
href="/grammar/practice"
className="mt-6 inline-block rounded-xl bg-white px-5 py-3 font-semibold text-slate-900"
>

開始練習

</Link>

</div>

<div className="rounded-3xl border p-6">

<h2 className="font-bold">
今日目標
</h2>

<div className="mt-5 space-y-3">

<div className="flex justify-between">

<span>單字10題</span>

<span>⬜</span>

</div>

<div className="flex justify-between">

<span>文法5題</span>

<span>⬜</span>

</div>

<div className="flex justify-between">

<span>複習錯題</span>

<span>⬜</span>

</div>

</div>

</div>

</div>

</div>

)

}