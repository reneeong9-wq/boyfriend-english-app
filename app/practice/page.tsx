import Link from "next/link";

export default function PracticeHomePage() {
  return (
    <div className="min-h-screen px-5 pb-10 pt-10">
      <header>
        <p className="text-sm text-slate-500">
          Practice center
        </p>

        <h1 className="mt-1 text-2xl font-bold">
          練習中心
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          選擇今天想練習的內容。
        </p>
      </header>

      <section className="mt-8 space-y-4">
        <PracticeCard
          href="/practice/daily"
          label="Daily mission"
          title="每日任務"
          description="完成單字、文法與錯題複習。"
          className="bg-blue-600 text-white"
          labelClassName="text-blue-100"
          descriptionClassName="text-blued-100"
        />

        <PracticeCard
          href="/practice/favorites"
          label="Favorites"
          title="我的收藏"
          description="查看收藏的單字與文法筆記。"
          className="bg-amber-500 text-white"
          labelClassName="text-amber-100"
          descriptionClassName="text-amber-100"
        />

        <PracticeCard
          href="/practice/vocabulary"
          label="Vocabulary"
          title="單字四選一"
          description="從單字庫自動產生題目。"
          className="bg-violet-600 text-white"
          labelClassName="text-violet-100"
          descriptionClassName="text-violet-100"
        />

        <PracticeCard
          href="/grammar/practice"
          label="Grammar"
          title="文法四選一"
          description="練習手動新增的文法題目。"
          className="bg-teal-900 text-white"
          labelClassName="text-teal-300"
          descriptionClassName="text-teal-100"
        />

        <PracticeCard
          href="/mistakes"
          label="Review mistakes"
          title="錯題複習"
          description="重新查看曾經答錯的內容。"
          className="border border-red-100 bg-red-50 text-slate-900"
          labelClassName="text-red-600"
          descriptionClassName="text-slate-600"
        />
      </section>
    </div>
  );
}

function PracticeCard({
  href,
  label,
  title,
  description,
  className,
  labelClassName,
  descriptionClassName,
}: {
  href: string;
  label: string;
  title: string;
  description: string;
  className: string;
  labelClassName: string;
  descriptionClassName: string;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-[32px] p-6 ${className}`}
    >
      <p
        className={`text-sm ${labelClassName}`}
      >
        {label}
      </p>

      <h2 className="mt-2 text-2xl font-bold">
        {title}
      </h2>

      <p
        className={`mt-3 text-sm leading-6 ${descriptionClassName}`}
      >
        {description}
      </p>
    </Link>
  );
}