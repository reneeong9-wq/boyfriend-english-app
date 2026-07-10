import Link from "next/link";

const navigationItems = [
  {
    label: "首頁",
    href: "/",
    icon: "⌂",
  },
  {
    label: "單字",
    href: "/words",
    icon: "Aa",
  },
  {
    label: "練習",
    href: "/practice",
    icon: "✓",
  },
  {
    label: "文法",
    href: "/grammar",
    icon: "文",
  },
  {
    label: "我的",
    href: "/profile",
    icon: "○",
  },
];

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-md items-center justify-around">
        {navigationItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-3 text-xs text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600"
          >
            <span className="flex h-7 w-7 items-center justify-center text-base font-semibold">
              {item.icon}
            </span>

            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}