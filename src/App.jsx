import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  X,
  ChevronLeft,
  MessageCircle,
  Briefcase,
  MapPin,
  Wifi,
  FileText,
  ChevronRight,
  Home,
  BookOpen,
  ListChecks,
  LifeBuoy,
  Search,
  Phone,
  PhoneCall,
  Flame,
  Award,
  Bell,
  Lock,
  Sparkles,
  Send,
} from "lucide-react";

// Настоящая суперэллипсовая форма (n=4) — только для элементов, близких к квадрату
// (плитки, бейджи). На вытянутых прямоугольных карточках она искажает углы,
// поэтому там используется обычное скругление.
function buildSquircle(n = 4, steps = 48) {
  const p = 2 / n;
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const x = 50 + 50 * Math.sign(c) * Math.pow(Math.abs(c), p);
    const y = 50 + 50 * Math.sign(s) * Math.pow(Math.abs(s), p);
    pts.push(`${x.toFixed(2)}% ${y.toFixed(2)}%`);
  }
  return `polygon(${pts.join(",")})`;
}

const SQUIRCLE_TIGHT = buildSquircle(3.4);

const squircleTile = {
  clipPath: SQUIRCLE_TIGHT,
  filter: "drop-shadow(0 1px 3px rgba(17,19,24,0.07))",
};

const mockData = {
  profile: {
    name: "Артём",
    role: "Стажёр отдела B2B-продаж",
    dayNumber: 3,
    avatarInitials: "А",
  },
  mentor: { name: "Алексей Иванов", role: "Руководитель B2B", avatarInitials: "АИ" },
  gamification: {
    points: 240,
    levelTitle: "Стажёр",
    nextLevelPoints: 400,
    streakDays: 3,
    badges: [
      { id: "b1", title: "Первый день", earned: true },
      { id: "b2", title: "Знакомство с CRM", earned: true },
      { id: "b3", title: "Первый звонок", earned: false },
      { id: "b4", title: "Неделя в строю", earned: false },
    ],
  },
  quickLinks: [
    { id: "services", title: "Услуги B2B", icon: Briefcase },
    { id: "map", title: "Карта офиса", icon: MapPin },
    { id: "coverage", title: "Зона покрытия", icon: Wifi },
    { id: "templates", title: "Шаблоны КП", icon: FileText },
  ],
  dates: [
    { id: "d3", label: "3", weekday: "ЧТ" },
    { id: "d4", label: "4", weekday: "ПТ" },
    { id: "d5", label: "5", weekday: "СБ", active: true },
    { id: "d6", label: "6", weekday: "ВС" },
  ],
  tasks: [
    { id: "t1", title: "Вводный инструктаж", type: "Инструктаж", duration: "30 мин", status: "urgent" },
    { id: "t2", title: "О компании и структуре B2B", type: "Материал", duration: "15 мин", status: "done" },
    { id: "t3", title: "Полевой устав менеджера", type: "Документ", duration: "10 мин", status: "done" },
    { id: "t4", title: "Первый звонок клиенту: разбор скрипта", type: "Практика", duration: "40 мин", status: "todo" },
  ],
  checkin: {
    question: "Как прошёл день?",
    scale: [
      { value: 1, emoji: "😞" },
      { value: 2, emoji: "🙁" },
      { value: 3, emoji: "😐" },
      { value: 4, emoji: "🙂" },
      { value: 5, emoji: "😄" },
    ],
  },
  push: {
    sender: "Бот-наставник",
    text: "Не забудьте пройти «Вводный инструктаж» сегодня до 18:00",
  },
  base: {
    categories: ["Все", "Продукт", "Скрипты продаж", "CRM", "Регламенты"],
    articles: [
      { id: "a1", title: "Тарифы B2B: как считать выгоду клиенту", category: "Продукт", minutes: 6, tag: "Популярное" },
      { id: "a2", title: "Скрипт первого звонка", category: "Скрипты продаж", minutes: 4, tag: "Популярное" },
      { id: "a3", title: "Как завести сделку в CRM", category: "CRM", minutes: 8, tag: null },
      { id: "a4", title: "Возражение «уже есть оператор»", category: "Скрипты продаж", minutes: 5, tag: "Новое" },
      { id: "a5", title: "Регламент согласования скидок", category: "Регламенты", minutes: 3, tag: null },
      { id: "a6", title: "Зона покрытия и SLA", category: "Продукт", minutes: 5, tag: "Новое" },
    ],
  },
  sos: {
    contacts: [
      { id: "s2", name: "HR-поддержка", role: "Вопросы по оформлению", icon: PhoneCall },
      { id: "s3", name: "IT-хелпдеск", role: "Доступы и техника", icon: Phone },
      { id: "s1", name: "Алексей Иванов", role: "Наставник", icon: MessageCircle },
    ],
  },
  aiAssistant: {
    name: "ИИ-ассистент",
    tagline: "Отвечает на частые вопросы 24/7",
    greeting: "Привет! Спроси меня про тарифы, скрипты продаж или работу в CRM.",
  },
  plan: {
    currentWeek: 1,
    weeks: [
      { id: "w1", title: "Неделя 1", subtitle: "Знакомство и основы", status: "current", completed: 2, total: 5 },
      { id: "w2", title: "Неделя 2", subtitle: "Продукт и тарифы", status: "upcoming", completed: 0, total: 4 },
      { id: "w3", title: "Неделя 3", subtitle: "Скрипты и практика звонков", status: "upcoming", completed: 0, total: 6 },
      { id: "w4", title: "Неделя 4", subtitle: "Самостоятельные сделки", status: "upcoming", completed: 0, total: 3 },
    ],
  },
};

const statusStyles = {
  urgent: "bg-[#C64545]",
  done: "bg-[#111318]",
  todo: "bg-gray-200 border border-gray-300",
};

function getAiReply(text) {
  const t = text.toLowerCase();
  if (t.includes("тариф")) {
    return "По тарифам B2B: сравнение и калькулятор выгоды есть в разделе «База знаний» → категория «Продукт».";
  }
  if (t.includes("скрипт") || t.includes("звон")) {
    return "Скрипт первого звонка и разбор частых возражений — в «Базе знаний» → «Скрипты продаж».";
  }
  if (t.includes("crm") || t.includes("срм")) {
    return "Завести сделку в CRM можно за 3 шага — подробная инструкция в «Базе знаний» → «CRM».";
  }
  if (t.includes("привет")) {
    return "Привет! Чем могу помочь: тарифы, скрипты продаж или работа в CRM?";
  }
  return "Пока отвечаю на ограниченный набор тем — это демо-версия. В боевом решении подключусь к полной базе знаний и LMS.";
}

function Header({ profile, onClose, onOpenProfile }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4">
      <button onClick={onOpenProfile} className="flex items-center gap-3 active:opacity-70 transition-opacity">
        <div className="w-11 h-11 rounded-full bg-[#111318] flex items-center justify-center text-white font-semibold text-base">
          {profile.avatarInitials}
        </div>
        <div className="text-left">
          <p className="text-xl font-semibold text-[#111318] leading-tight">Привет, {profile.name}!</p>
          <p className="text-[12px] text-gray-500">{profile.dayNumber}-й день в компании</p>
        </div>
      </button>
      <button
        onClick={onClose}
        className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
        aria-label="Закрыть"
      >
        <X size={18} className="text-gray-500" />
      </button>
    </div>
  );
}

function ProfileTeaser({ data, onOpen }) {
  return (
    <button
      onClick={onOpen}
      className="w-full mb-4 flex items-center gap-2.5 bg-white rounded-full pl-2 pr-3 py-2 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Award size={13} className="text-[#111318]" />
      </div>
      <span className="text-[12px] font-medium text-[#111318]">{data.levelTitle}</span>
      <span className="text-[12px] text-gray-400">·</span>
      <span className="text-[12px] text-gray-500">{data.points} баллов</span>
      <span className="flex items-center gap-1 text-[#111318] ml-auto">
        <Flame size={13} />
        <span className="text-[12px] font-medium">{data.streakDays} дня</span>
      </span>
      <ChevronRight size={15} className="text-gray-300 flex-shrink-0" />
    </button>
  );
}

function MentorCard({ mentor }) {
  return (
    <div className="mb-6 bg-white rounded-[24px] p-4 flex items-center justify-between shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#111318] font-semibold text-sm">
          {mentor.avatarInitials}
        </div>
        <div>
          <p className="font-semibold text-[#111318] text-[15px]">{mentor.name}</p>
          <p className="text-gray-500 text-[13px]">{mentor.role}</p>
        </div>
      </div>
      <button
        onClick={() => alert("Переход в чат")}
        className="w-11 h-11 rounded-full bg-[#3390ec] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
        aria-label="Написать наставнику"
      >
        <MessageCircle size={20} className="text-white" />
      </button>
    </div>
  );
}

function QuickLinksRow({ links }) {
  return (
    <div className="mb-6">
      <p className="text-[13px] font-medium text-gray-500 mb-3">Полезное под рукой</p>
      <div className="flex gap-2.5 overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              onClick={() => alert(link.title)}
              className="flex-shrink-0 flex items-center gap-2 bg-white rounded-full pl-2 pr-3.5 py-2 border border-gray-100 shadow-sm active:scale-95 transition-transform"
            >
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Icon size={14} className="text-[#111318]" />
              </div>
              <p className="text-[12px] font-medium text-[#111318] whitespace-nowrap">{link.title}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateScroller({ dates }) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
      {dates.map((d) => (
        <div
          key={d.id}
          className={`flex-shrink-0 w-14 h-16 rounded-[18px] flex flex-col items-center justify-center gap-0.5 ${
            d.active ? "bg-[#111318]" : "bg-white border border-gray-100"
          }`}
        >
          <span className={`text-[11px] ${d.active ? "text-gray-300" : "text-gray-400"}`}>{d.weekday}</span>
          <span className={`text-base font-semibold ${d.active ? "text-white" : "text-[#111318]"}`}>
            {d.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function TaskList({ tasks }) {
  return (
    <div>
      {tasks.map((task) => (
        <button
          key={task.id}
          onClick={() => alert(`Открыть: ${task.title}`)}
          className="w-full bg-white rounded-[16px] p-3 mb-2 flex items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
        >
          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusStyles[task.status]}`} />
          <div className="flex-1 text-left">
            <p className="text-[14px] font-medium text-[#111318]">{task.title}</p>
            <p className="text-[12px] text-gray-500">{task.type} · {task.duration}</p>
          </div>
          <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
        </button>
      ))}
    </div>
  );
}

function DailyCheckin({ checkin }) {
  const [value, setValue] = useState(null);

  if (value !== null) {
    const picked = checkin.scale.find((s) => s.value === value);
    return (
      <button
        onClick={() => setValue(null)}
        className="w-full mb-6 flex items-center gap-2.5 bg-white rounded-full pl-3 pr-4 py-2.5 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
      >
        <span className="text-base">{picked.emoji}</span>
        <span className="text-[12px] text-gray-500">Спасибо, день оценён на {value}/5</span>
        <span className="text-[11px] text-gray-400 ml-auto">изменить</span>
      </button>
    );
  }

  return (
    <div className="mb-6 bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
      <p className="text-[13px] font-medium text-[#111318] mb-3">{checkin.question}</p>
      <div className="flex justify-between">
        {checkin.scale.map((s) => (
          <button
            key={s.value}
            onClick={() => setValue(s.value)}
            className="w-10 h-10 rounded-full bg-[#F5F6F3] flex items-center justify-center text-lg active:scale-90 transition-transform"
            aria-label={`Оценка ${s.value}`}
          >
            {s.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function PushToast({ push, onDismiss }) {
  return (
    <div className="absolute top-3 left-3 right-3 z-30 animate-[pushIn_0.25s_ease-out]">
      <button
        onClick={onDismiss}
        className="w-full bg-white rounded-[20px] p-3 flex items-start gap-3 text-left shadow-sm border border-gray-100"
      >
        <div className="w-9 h-9 rounded-full bg-[#3390ec] flex items-center justify-center flex-shrink-0">
          <Bell size={16} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-[#111318]">{push.sender}</p>
          <p className="text-[12px] text-gray-500 leading-snug">{push.text}</p>
        </div>
      </button>
    </div>
  );
}

function DashboardScreen({ data, onClose, onOpenProfile }) {
  return (
    <div className="px-5 pt-6">
      <Header profile={data.profile} onClose={onClose} onOpenProfile={onOpenProfile} />
      <ProfileTeaser data={data.gamification} onOpen={onOpenProfile} />
      <DateScroller dates={data.dates} />
      <p className="text-[13px] font-medium text-gray-500 mb-3">Задачи на сегодня</p>
      <div className="mb-6">
        <TaskList tasks={data.tasks} />
      </div>
      <DailyCheckin checkin={data.checkin} />
      <MentorCard mentor={data.mentor} />
      <QuickLinksRow links={data.quickLinks} />
    </div>
  );
}

function ProfileScreen({ profile, gamification, onBack, onShowPush }) {
  const progressPct = Math.min(100, Math.round((gamification.points / gamification.nextLevelPoints) * 100));
  return (
    <div className="px-5 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Назад"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
        <p className="text-lg font-semibold text-[#111318]">Личный кабинет</p>
      </div>

      <div className="bg-white rounded-[24px] p-5 mb-4 flex flex-col items-center text-center shadow-sm border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-[#111318] flex items-center justify-center text-white font-semibold text-xl mb-3">
          {profile.avatarInitials}
        </div>
        <p className="text-lg font-semibold text-[#111318]">{profile.name}</p>
        <p className="text-[13px] text-gray-500 mb-4">{profile.role}</p>

        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-[12px] text-gray-500">{gamification.levelTitle}</span>
          <span className="text-[12px] text-gray-500">{gamification.points} / {gamification.nextLevelPoints} баллов</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-[#111318] rounded-full" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="flex items-center gap-1 text-[#111318]">
          <Flame size={14} />
          <span className="text-[12px] font-medium">{gamification.streakDays} дня подряд на связи</span>
        </div>
      </div>

      <p className="text-[13px] font-medium text-gray-500 mb-3">Достижения</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {gamification.badges.map((b) => (
          <div key={b.id} className="flex flex-col items-center gap-1.5">
            <div
              style={squircleTile}
              className={`w-12 h-12 flex items-center justify-center ${b.earned ? "bg-[#111318]" : "bg-gray-100"}`}
            >
              {b.earned ? (
                <Award size={17} className="text-white" />
              ) : (
                <Lock size={15} className="text-gray-400" />
              )}
            </div>
            <span className="text-[10px] text-gray-500 text-center leading-tight">{b.title}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onShowPush}
        className="w-full flex items-center justify-center gap-1.5 text-[12px] text-gray-500 bg-white rounded-[16px] p-3 border border-gray-100 shadow-sm"
      >
        <Bell size={13} />
        Посмотреть пример пуша от бота
      </button>
    </div>
  );
}

function BaseScreen({ base }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");

  const filtered = useMemo(() => {
    return base.articles.filter((a) => {
      const matchesCategory = category === "Все" || a.category === category;
      const matchesQuery = a.title.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [base.articles, query, category]);

  const tagStyles = {
    Популярное: "bg-[#111318] text-white",
    Новое: "bg-white text-gray-600 border border-gray-300",
  };

  return (
    <div className="px-5 pt-6">
      <p className="text-xl font-semibold text-[#111318] mb-4">База знаний</p>

      <div className="mb-3">
        <div className="flex items-center gap-2 bg-white rounded-[16px] px-3 py-2.5 border border-gray-100 shadow-sm">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти материал"
            className="w-full text-[14px] outline-none bg-transparent text-[#111318] placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto -mx-5 px-5" style={{ scrollbarWidth: "none" }}>
        {base.categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium transition-colors ${
              category === c ? "bg-[#111318] text-white" : "bg-white text-gray-500 border border-gray-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div>
        {filtered.length === 0 && (
          <p className="text-[13px] text-gray-400 text-center pt-8">Ничего не нашлось</p>
        )}
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => alert(`Открыть материал: ${a.title}`)}
            className="w-full bg-white rounded-[16px] p-3 mb-2 flex items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
          >
            <div className="flex-1 text-left">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-[14px] font-medium text-[#111318]">{a.title}</p>
                {a.tag && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${tagStyles[a.tag]}`}>
                    {a.tag}
                  </span>
                )}
              </div>
              <p className="text-[12px] text-gray-500">{a.category} · {a.minutes} мин</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function PlanScreen({ plan }) {
  return (
    <div className="px-5 pt-6">
      <p className="text-xl font-semibold text-[#111318] mb-1">План адаптации</p>
      <p className="text-[13px] text-gray-500 mb-6">
        Неделя {plan.currentWeek} из {plan.weeks.length}
      </p>

      <div>
        {plan.weeks.map((w, i) => {
          const isLast = i === plan.weeks.length - 1;
          const pct = w.total ? Math.round((w.completed / w.total) * 100) : 0;
          const isUpcoming = w.status === "upcoming";
          return (
            <div key={w.id} className="flex gap-3">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    w.status === "done"
                      ? "bg-[#111318]"
                      : w.status === "current"
                      ? "bg-white border-2 border-[#111318]"
                      : "bg-gray-200"
                  }`}
                />
                {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
              </div>
              <div className={`flex-1 ${isLast ? "pb-2" : "pb-6"}`}>
                <div className="flex items-center justify-between mb-1.5 gap-2">
                  <p className={`text-[14px] font-semibold ${isUpcoming ? "text-gray-400" : "text-[#111318]"}`}>
                    {w.title}: {w.subtitle}
                  </p>
                  {w.status === "current" && (
                    <span className="text-[10px] font-medium text-white bg-[#111318] px-2 py-0.5 rounded-full flex-shrink-0">
                      Сейчас
                    </span>
                  )}
                </div>
                {isUpcoming ? (
                  <p className="text-[12px] text-gray-400">Начнётся позже</p>
                ) : (
                  <>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-[#111318] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-[12px] text-gray-500">{w.completed}/{w.total} задач выполнено</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SosScreen({ sos, aiAssistant, onOpenAiChat }) {
  return (
    <div className="px-5 pt-10">
      <p className="text-xl font-semibold text-[#111318] mb-1">Нужна помощь?</p>
      <p className="text-[13px] text-gray-500 mb-6">Выберите, куда обратиться прямо сейчас</p>

      <button
        onClick={onOpenAiChat}
        className="w-full bg-white rounded-[20px] p-4 mb-3 flex items-center gap-3 text-left shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
      >
        <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} className="text-[#111318]" />
        </div>
        <div className="flex-1">
          <p className="text-[14px] font-medium text-[#111318]">{aiAssistant.name}</p>
          <p className="text-[12px] text-gray-500">{aiAssistant.tagline}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300" />
      </button>

      {sos.contacts.map((c) => {
        const Icon = c.icon;
        return (
          <button
            key={c.id}
            onClick={() => alert(`Связь с: ${c.name}`)}
            className="w-full bg-white rounded-[20px] p-4 mb-3 flex items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
          >
            <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Icon size={18} className="text-[#111318]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[14px] font-medium text-[#111318]">{c.name}</p>
              <p className="text-[12px] text-gray-500">{c.role}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300" />
          </button>
        );
      })}
    </div>
  );
}

function AiChatScreen({ aiAssistant, onBack }) {
  const [messages, setMessages] = useState([{ id: "m0", from: "bot", text: aiAssistant.greeting }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = { id: `u${Date.now()}`, from: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: `b${Date.now()}`, from: "bot", text: getAiReply(text) }]);
    }, 700);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-5 pt-6 pb-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          aria-label="Назад"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
          <Sparkles size={14} className="text-[#111318]" />
        </div>
        <p className="text-[15px] font-semibold text-[#111318]">{aiAssistant.name}</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5" style={{ scrollbarWidth: "none" }}>
        {messages.map((m) => (
          <div key={m.id} className={`flex mb-2 ${m.from === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] px-3.5 py-2.5 text-[13px] leading-snug rounded-[16px] ${
                m.from === "user" ? "bg-[#111318] text-white" : "bg-white text-[#111318] border border-gray-100"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start mb-2">
            <div className="bg-white border border-gray-100 rounded-[16px] px-3.5 py-2.5 text-[13px] text-gray-400">
              печатает…
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 px-5 py-3 flex items-center gap-2 border-t border-gray-100 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Спросите что-нибудь"
          className="flex-1 text-[14px] bg-[#F5F6F3] rounded-full px-4 py-2.5 outline-none placeholder:text-gray-400"
        />
        <button
          onClick={send}
          className="w-10 h-10 rounded-full bg-[#111318] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          aria-label="Отправить"
        >
          <Send size={16} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const tabs = [
    { id: "home", label: "Главная", icon: Home },
    { id: "base", label: "База", icon: BookOpen },
    { id: "plan", label: "План", icon: ListChecks },
    { id: "sos", label: "SOS", icon: LifeBuoy },
  ];
  return (
    <div className="flex-shrink-0 bg-white border-t border-gray-100 px-2 pt-2 pb-6">
      <div className="flex justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-1 active:scale-95 transition-transform"
            >
              <Icon size={22} className={isActive ? "text-[#111318]" : "text-gray-400"} />
              <span className={`text-[11px] ${isActive ? "text-[#111318] font-medium" : "text-gray-400"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [pushVisible, setPushVisible] = useState(false);

  const handleClose = () => {
    console.log("Telegram.WebApp.close()");
    if (typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp) {
      window.Telegram.WebApp.close();
    }
  };

  const handleShowPush = () => {
    setPushVisible(true);
    setTimeout(() => setPushVisible(false), 3500);
  };

  const goTab = (tab) => {
    setProfileOpen(false);
    setAiChatOpen(false);
    setActiveTab(tab);
  };

  let content;
  let scrollable = true;

  if (aiChatOpen) {
    content = <AiChatScreen aiAssistant={mockData.aiAssistant} onBack={() => setAiChatOpen(false)} />;
    scrollable = false;
  } else if (profileOpen) {
    content = (
      <ProfileScreen
        profile={mockData.profile}
        gamification={mockData.gamification}
        onBack={() => setProfileOpen(false)}
        onShowPush={handleShowPush}
      />
    );
  } else if (activeTab === "home") {
    content = <DashboardScreen data={mockData} onClose={handleClose} onOpenProfile={() => setProfileOpen(true)} />;
  } else if (activeTab === "base") {
    content = <BaseScreen base={mockData.base} />;
  } else if (activeTab === "plan") {
    content = <PlanScreen plan={mockData.plan} />;
  } else {
    content = (
      <SosScreen sos={mockData.sos} aiAssistant={mockData.aiAssistant} onOpenAiChat={() => setAiChatOpen(true)} />
    );
  }

  return (
    <div className="relative bg-[#F5F6F3] mx-auto flex flex-col" style={{ maxWidth: "400px", height: "100vh" }}>
      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes pushIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {pushVisible && <PushToast push={mockData.push} onDismiss={() => setPushVisible(false)} />}
      {scrollable ? (
        <div className="flex-1 overflow-y-auto pb-6" style={{ scrollbarWidth: "none" }}>
          {content}
        </div>
      ) : (
        <div className="flex-1 min-h-0">{content}</div>
      )}
      <BottomNav activeTab={profileOpen || aiChatOpen ? "" : activeTab} setActiveTab={goTab} />
    </div>
  );
}
