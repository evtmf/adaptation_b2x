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
  Clock,
} from "lucide-react";

// Суперэллипс (n≈3.4) — только для элементов, близких к квадрату (бейджи, плитки).
// На вытянутых карточках форма искажает углы, поэтому там обычное скругление.
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

// -webkit-префикс продублирован ради Safari < 14 и старых WebView в Telegram на Android
const squircleTile = {
  clipPath: SQUIRCLE_TIGHT,
  WebkitClipPath: SQUIRCLE_TIGHT,
  filter: "drop-shadow(0 1px 3px rgba(17,19,24,0.07))",
  WebkitFilter: "drop-shadow(0 1px 3px rgba(17,19,24,0.07))",
};

const mockData = {
  profile: {
    name: "Артём",
    lastName: "Соколов",
    role: "Стажёр отдела B2B-продаж",
    department: "Корпоративные продажи, Москва",
    startDate: "3 июля 2026",
    dayNumber: 3,
    avatarInitials: "А",
  },
  mentor: {
    name: "Алексей Иванов",
    role: "Руководитель B2B",
    status: "Обычно отвечает в течение часа",
    avatarInitials: "АИ",
  },
  gamification: {
    points: 240,
    levelTitle: "Стажёр",
    nextLevelTitle: "Специалист",
    nextLevelPoints: 400,
    streakDays: 3,
    badges: [
      { id: "b1", title: "Первый день", earned: true, hint: "Открыть приложение в день выхода" },
      { id: "b2", title: "Знакомство с CRM", earned: true, hint: "Пройти курс по CRM" },
      { id: "b3", title: "Первый звонок", earned: false, hint: "Отработать скрипт звонка с наставником" },
      { id: "b4", title: "Неделя в строю", earned: false, hint: "7 дней подряд в приложении" },
    ],
  },
  quickLinks: [
    { id: "services", title: "Услуги B2B", subtitle: "Каталог и тарифы", icon: Briefcase },
    { id: "map", title: "Карта офиса", subtitle: "Этажи и переговорные", icon: MapPin },
    { id: "coverage", title: "Зона покрытия", subtitle: "Карта сети и SLA", icon: Wifi },
    { id: "templates", title: "Шаблоны КП", subtitle: "Документы для клиента", icon: FileText },
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
    hint: "Ответ видит только ваш наставник",
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
      {
        id: "a1",
        title: "Тарифы B2B: как считать выгоду клиенту",
        category: "Продукт",
        minutes: 6,
        tag: "Популярное",
        summary: "Как за две минуты показать клиенту экономию при переходе на корпоративный тариф.",
        body: [
          "Клиент почти никогда не сравнивает тарифы по абонентской плате. Он сравнивает итоговый счёт за месяц на весь парк номеров — и именно эту цифру нужно называть первой.",
          "Считайте по формуле: текущий счёт клиента минус наш пакет минус стоимость сверхлимитного трафика. Разницу озвучивайте в рублях за год, а не за месяц — годовая цифра выглядит весомее и совпадает с горизонтом планирования бюджета.",
          "Отдельно проговорите, что перенос номеров бесплатный и занимает до 8 рабочих дней. Это снимает главное возражение, которое обычно не звучит вслух: «переезд — это боль».",
        ],
      },
      {
        id: "a2",
        title: "Скрипт первого звонка",
        category: "Скрипты продаж",
        minutes: 4,
        tag: "Популярное",
        summary: "Структура холодного звонка в корпоративный сегмент: от приветствия до договорённости.",
        body: [
          "Цель первого звонка — не продать, а получить согласие на встречу или расчёт. Всё, что уводит от этой цели, из разговора убираем.",
          "Структура: представление (15 секунд), причина звонка со ссылкой на отрасль клиента, один открытый вопрос про текущего оператора, предложение сделать бесплатный расчёт, фиксация следующего шага с датой.",
          "Не зачитывайте скрипт дословно. Держите в голове только каркас: кто вы, зачем звоните, какой вопрос задаёте, о чём договариваетесь в конце.",
        ],
      },
      {
        id: "a3",
        title: "Как завести сделку в CRM",
        category: "CRM",
        minutes: 8,
        tag: null,
        summary: "Пошаговая инструкция: от создания карточки компании до постановки задачи.",
        body: [
          "Перед созданием сделки обязательно проверьте компанию по ИНН — дубли карточек ломают отчётность отдела и могут привести к спору за клиента между менеджерами.",
          "Заполните обязательные поля: ИНН, контактное лицо с должностью, источник обращения и ожидаемое количество номеров. Без последнего сделка не попадёт в прогноз выручки.",
          "Сразу поставьте себе задачу с датой следующего контакта. Сделка без активной задачи через 5 дней автоматически подсвечивается руководителю как зависшая.",
        ],
      },
      {
        id: "a4",
        title: "Возражение «уже есть оператор»",
        category: "Скрипты продаж",
        minutes: 5,
        tag: "Новое",
        summary: "Что отвечать, когда клиент говорит, что его всё устраивает.",
        body: [
          "Это возражение почти всегда означает не «мне не нужно», а «мне лень разбираться». Спорить с текущим оператором бессмысленно — вы обесцените прошлый выбор клиента.",
          "Рабочая рамка: согласиться, а затем сузить вопрос. «Логично, менять всё сразу никто не станет. А если посчитать только по мобильной связи — вам интересно будет посмотреть цифру?»",
          "Дальше просите последний счёт и делаете расчёт. Переход от спора к конкретному документу — это и есть момент, где возражение перестаёт работать.",
        ],
      },
      {
        id: "a5",
        title: "Регламент согласования скидок",
        category: "Регламенты",
        minutes: 3,
        tag: null,
        summary: "Кто и какую скидку может утвердить, и сколько это занимает времени.",
        body: [
          "До 10% — на усмотрение менеджера, без согласования. Фиксируется в карточке сделки комментарием с обоснованием.",
          "От 10% до 20% — согласование с руководителем группы, срок до одного рабочего дня. Нужен расчёт и последний счёт клиента.",
          "Свыше 20% — только через коммерческого директора, срок до трёх рабочих дней. Такие заявки имеет смысл готовить заранее, а не в день дедлайна по сделке.",
        ],
      },
      {
        id: "a6",
        title: "Зона покрытия и SLA",
        category: "Продукт",
        minutes: 5,
        tag: "Новое",
        summary: "Что можно и чего нельзя обещать клиенту по качеству связи.",
        body: [
          "Карта покрытия показывает прогнозную зону, а не гарантию. В коммерческом предложении формулировка всегда «прогнозное покрытие», иначе это становится обязательством по договору.",
          "SLA по корпоративным каналам связи — 99,5% доступности в месяц. Это примерно 3,5 часа допустимого простоя, о чём честнее сказать сразу, чем объясняться потом.",
          "Если у клиента объект в зоне неуверенного приёма — не обещайте решение на месте. Заявка на техническое обследование оформляется через инженерный отдел и занимает до 10 рабочих дней.",
        ],
      },
    ],
  },
  sos: {
    contacts: [
      { id: "s2", name: "HR-поддержка", role: "Оформление, отпуск, справки", icon: PhoneCall },
      { id: "s3", name: "IT-хелпдеск", role: "Доступы, почта, техника", icon: Phone },
      { id: "s1", name: "Алексей Иванов", role: "Наставник, рабочие вопросы", icon: MessageCircle },
    ],
  },
  aiAssistant: {
    name: "ИИ-ассистент",
    tagline: "Отвечает на частые вопросы 24/7",
    greeting: "Привет! Спроси меня про тарифы, скрипты продаж или работу в CRM.",
    suggestions: ["Как считать выгоду по тарифу?", "Где взять шаблон КП?", "Как завести сделку в CRM?"],
  },
  plan: {
    currentWeek: 1,
    weeks: [
      {
        id: "w1",
        title: "Неделя 1",
        subtitle: "Знакомство и основы",
        status: "current",
        completed: 2,
        total: 5,
        items: [
          { id: "w1i1", title: "Вводный инструктаж", done: false },
          { id: "w1i2", title: "О компании и структуре B2B", done: true },
          { id: "w1i3", title: "Полевой устав менеджера", done: true },
          { id: "w1i4", title: "Знакомство с командой отдела", done: false },
          { id: "w1i5", title: "Настройка рабочих доступов", done: false },
        ],
      },
      {
        id: "w2",
        title: "Неделя 2",
        subtitle: "Продукт и тарифы",
        status: "upcoming",
        completed: 0,
        total: 4,
        items: [
          { id: "w2i1", title: "Линейка тарифов B2B", done: false },
          { id: "w2i2", title: "Расчёт выгоды для клиента", done: false },
          { id: "w2i3", title: "Зона покрытия и SLA", done: false },
          { id: "w2i4", title: "Тест по продукту", done: false },
        ],
      },
      {
        id: "w3",
        title: "Неделя 3",
        subtitle: "Скрипты и практика звонков",
        status: "upcoming",
        completed: 0,
        total: 6,
        items: [
          { id: "w3i1", title: "Скрипт первого звонка", done: false },
          { id: "w3i2", title: "Работа с возражениями", done: false },
          { id: "w3i3", title: "Тренировка звонка с наставником", done: false },
          { id: "w3i4", title: "Разбор записи разговора", done: false },
          { id: "w3i5", title: "Подготовка КП", done: false },
          { id: "w3i6", title: "Первые 10 холодных звонков", done: false },
        ],
      },
      {
        id: "w4",
        title: "Неделя 4",
        subtitle: "Самостоятельные сделки",
        status: "upcoming",
        completed: 0,
        total: 3,
        items: [
          { id: "w4i1", title: "Ведение сделки в CRM", done: false },
          { id: "w4i2", title: "Встреча с клиентом с наставником", done: false },
          { id: "w4i3", title: "Аттестация по итогам месяца", done: false },
        ],
      },
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
  if (t.includes("тариф") || t.includes("выгод")) {
    return "Считайте разницу между текущим счётом клиента и нашим пакетом, и называйте её в рублях за год. Подробно — в «Базе знаний» → «Продукт».";
  }
  if (t.includes("скрипт") || t.includes("звон")) {
    return "Цель первого звонка — договориться о расчёте, а не продать. Полный скрипт есть в «Базе знаний» → «Скрипты продаж».";
  }
  if (t.includes("crm") || t.includes("срм") || t.includes("сделк")) {
    return "Перед созданием сделки проверьте компанию по ИНН, чтобы не создать дубль. Пошаговая инструкция — в «Базе знаний» → «CRM».";
  }
  if (t.includes("кп") || t.includes("шаблон") || t.includes("документ")) {
    return "Шаблоны коммерческих предложений лежат в «Базе знаний» → плитка «Шаблоны КП».";
  }
  if (t.includes("скидк")) {
    return "До 10% утверждаете сами, от 10 до 20% — через руководителя группы, свыше 20% — через коммерческого директора.";
  }
  if (t.includes("привет") || t.includes("здрав")) {
    return "Привет! Чем могу помочь: тарифы, скрипты продаж, CRM или регламенты?";
  }
  return "Пока отвечаю на ограниченный набор тем — это демо-версия. В боевом решении подключусь к полной базе знаний и LMS.";
}

function Header({ profile, onClose, onOpenProfile }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4">
      <button onClick={onOpenProfile} className="flex items-center gap-3 active:opacity-70 transition-opacity">
        <div className="w-11 h-11 rounded-full bg-[#111318] flex items-center justify-center text-white font-semibold text-base flex-shrink-0">
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

function ScreenHeader({ title, onBack }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {onBack && (
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          aria-label="Назад"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
      )}
      <p className="text-lg font-semibold text-[#111318]">{title}</p>
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
      <span className="flex items-center gap-1 text-[#111318] ml-auto flex-shrink-0">
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
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[#111318] font-semibold text-sm flex-shrink-0">
          {mentor.avatarInitials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-[#111318] text-[15px] truncate">{mentor.name}</p>
          <p className="text-gray-500 text-[13px] truncate">{mentor.role}</p>
          <p className="text-gray-400 text-[11px] truncate">{mentor.status}</p>
        </div>
      </div>
      <button
        onClick={() => alert("Переход в чат")}
        className="w-11 h-11 rounded-full bg-[#3390ec] flex items-center justify-center active:scale-90 transition-transform flex-shrink-0 ml-3"
        aria-label="Написать наставнику"
      >
        <MessageCircle size={20} className="text-white" />
      </button>
    </div>
  );
}

function DateScroller({ dates }) {
  return (
    <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar -mx-5 px-5">
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
          <div className="flex-1 text-left min-w-0">
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
        <span className="text-[11px] text-gray-400 ml-auto flex-shrink-0">изменить</span>
      </button>
    );
  }

  return (
    <div className="mb-6 bg-white rounded-[24px] p-4 shadow-sm border border-gray-100">
      <p className="text-[13px] font-medium text-[#111318]">{checkin.question}</p>
      <p className="text-[11px] text-gray-400 mb-3">{checkin.hint}</p>
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
    <div className="absolute top-3 left-3 right-3 z-30 push-in">
      <button
        onClick={onDismiss}
        className="w-full bg-white rounded-[20px] p-3 flex items-start gap-3 text-left shadow-sm border border-gray-100"
      >
        <div className="w-9 h-9 rounded-full bg-[#3390ec] flex items-center justify-center flex-shrink-0">
          <Bell size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
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
    </div>
  );
}

function ProfileScreen({ profile, gamification, onBack, onShowPush }) {
  const progressPct = Math.min(100, Math.round((gamification.points / gamification.nextLevelPoints) * 100));
  const left = Math.max(0, gamification.nextLevelPoints - gamification.points);
  return (
    <div className="px-5 pt-6">
      <ScreenHeader title="Личный кабинет" onBack={onBack} />

      <div className="bg-white rounded-[24px] p-5 mb-4 flex flex-col items-center text-center shadow-sm border border-gray-100">
        <div className="w-16 h-16 rounded-full bg-[#111318] flex items-center justify-center text-white font-semibold text-xl mb-3">
          {profile.avatarInitials}
        </div>
        <p className="text-lg font-semibold text-[#111318]">{profile.name} {profile.lastName}</p>
        <p className="text-[13px] text-gray-500">{profile.role}</p>
        <p className="text-[12px] text-gray-400 mb-4">{profile.department} · с {profile.startDate}</p>

        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-[12px] text-gray-500">{gamification.levelTitle}</span>
          <span className="text-[12px] text-gray-500">{gamification.points} / {gamification.nextLevelPoints}</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
          <div className="h-full bg-[#111318] rounded-full" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="text-[11px] text-gray-400 mb-3">
          Ещё {left} баллов до уровня «{gamification.nextLevelTitle}»
        </p>
        <div className="flex items-center gap-1 text-[#111318]">
          <Flame size={14} />
          <span className="text-[12px] font-medium">{gamification.streakDays} дня подряд на связи</span>
        </div>
      </div>

      <p className="text-[13px] font-medium text-gray-500 mb-3">Достижения</p>
      <div className="grid grid-cols-4 gap-2 mb-4">
        {gamification.badges.map((b) => (
          <button
            key={b.id}
            onClick={() => alert(b.earned ? `Получено: ${b.title}` : `Как получить: ${b.hint}`)}
            className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
          >
            <div
              style={squircleTile}
              className={`w-12 h-12 flex items-center justify-center ${b.earned ? "bg-[#111318]" : "bg-gray-100"}`}
            >
              {b.earned ? <Award size={17} className="text-white" /> : <Lock size={15} className="text-gray-400" />}
            </div>
            <span className="text-[10px] text-gray-500 text-center leading-tight">{b.title}</span>
          </button>
        ))}
      </div>

      <button
        onClick={onShowPush}
        className="w-full flex items-center justify-center gap-1.5 text-[12px] text-gray-500 bg-white rounded-[16px] p-3 border border-gray-100 shadow-sm active:scale-[0.98] transition-transform"
      >
        <Bell size={13} />
        Посмотреть пример пуша от бота
      </button>
    </div>
  );
}

function BaseScreen({ base, quickLinks, onOpenArticle }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Все");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return base.articles.filter((a) => {
      const matchesCategory = category === "Все" || a.category === category;
      const matchesQuery = !q || a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q);
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

      <p className="text-[13px] font-medium text-gray-500 mb-3">Полезное под рукой</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {quickLinks.map((link) => {
          const Icon = link.icon;
          return (
            <button
              key={link.id}
              onClick={() => alert(link.title)}
              className="bg-white rounded-[20px] p-3.5 flex flex-col items-start gap-2.5 shadow-sm border border-gray-100 active:scale-95 transition-transform"
            >
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                <Icon size={16} className="text-[#111318]" />
              </div>
              <div className="text-left">
                <p className="text-[13px] font-medium text-[#111318] leading-tight">{link.title}</p>
                <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{link.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-[13px] font-medium text-gray-500 mb-3">Материалы</p>

      <div className="mb-3">
        <div className="flex items-center gap-2 bg-white rounded-[16px] px-3 py-2.5 border border-gray-100 shadow-sm">
          <Search size={16} className="text-gray-400 flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Найти материал"
            className="w-full text-[14px] outline-none bg-transparent text-[#111318] placeholder:text-gray-400 min-w-0"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar -mx-5 px-5">
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
            onClick={() => onOpenArticle(a)}
            className="w-full bg-white rounded-[16px] p-3 mb-2 flex items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.98] transition-transform"
          >
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <p className="text-[14px] font-medium text-[#111318]">{a.title}</p>
                {a.tag && (
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full flex-shrink-0 ${tagStyles[a.tag]}`}>
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

function ArticleScreen({ article, onBack }) {
  return (
    <div className="px-5 pt-6">
      <ScreenHeader title="Материал" onBack={onBack} />
      <div className="bg-white rounded-[24px] p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 text-gray-400 mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wide">{article.category}</span>
          <span className="text-[11px]">·</span>
          <Clock size={12} />
          <span className="text-[11px]">{article.minutes} мин</span>
        </div>
        <p className="text-lg font-semibold text-[#111318] leading-snug mb-3">{article.title}</p>
        {article.body.map((p, i) => (
          <p key={i} className="text-[14px] text-gray-600 leading-relaxed mb-3">
            {p}
          </p>
        ))}
        <button
          onClick={() => alert("Материал отмечен как прочитанный (+20 баллов)")}
          className="w-full mt-2 bg-[#111318] text-white text-[13px] font-medium rounded-full py-3 active:scale-[0.98] transition-transform"
        >
          Отметить как прочитанное
        </button>
      </div>
    </div>
  );
}

function PlanScreen({ plan }) {
  const [openWeek, setOpenWeek] = useState(plan.weeks[0]?.id ?? null);
  const totalDone = plan.weeks.reduce((s, w) => s + w.completed, 0);
  const totalAll = plan.weeks.reduce((s, w) => s + w.total, 0);

  return (
    <div className="px-5 pt-6">
      <p className="text-xl font-semibold text-[#111318] mb-1">План адаптации</p>
      <p className="text-[13px] text-gray-500 mb-4">
        Неделя {plan.currentWeek} из {plan.weeks.length} · {totalDone} из {totalAll} задач выполнено
      </p>

      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-[#111318] rounded-full"
          style={{ width: `${Math.round((totalDone / totalAll) * 100)}%` }}
        />
      </div>

      <div>
        {plan.weeks.map((w, i) => {
          const isLast = i === plan.weeks.length - 1;
          const pct = w.total ? Math.round((w.completed / w.total) * 100) : 0;
          const isUpcoming = w.status === "upcoming";
          const isOpen = openWeek === w.id;
          return (
            <div key={w.id} className="flex gap-3">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${
                    w.status === "done"
                      ? "bg-[#111318]"
                      : w.status === "current"
                      ? "bg-white border-2 border-[#111318]"
                      : "bg-gray-200"
                  }`}
                />
                {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
              </div>

              <div className={`flex-1 min-w-0 ${isLast ? "pb-2" : "pb-5"}`}>
                <button
                  onClick={() => setOpenWeek(isOpen ? null : w.id)}
                  className="w-full text-left active:opacity-70 transition-opacity"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
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
                    <p className="text-[12px] text-gray-400">{w.total} задач · начнётся позже</p>
                  ) : (
                    <>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
                        <div className="h-full bg-[#111318] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[12px] text-gray-500">{w.completed}/{w.total} задач выполнено</p>
                    </>
                  )}
                </button>

                {isOpen && (
                  <div className="mt-3 bg-white rounded-[16px] p-3 shadow-sm border border-gray-100">
                    {w.items.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2.5 py-2 ${
                          idx !== w.items.length - 1 ? "border-b border-gray-50" : ""
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            item.done ? "bg-[#111318]" : "bg-gray-200 border border-gray-300"
                          }`}
                        />
                        <span
                          className={`text-[13px] ${item.done ? "text-gray-400 line-through" : "text-[#111318]"}`}
                        >
                          {item.title}
                        </span>
                      </div>
                    ))}
                  </div>
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
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium text-[#111318]">{aiAssistant.name}</p>
          <p className="text-[12px] text-gray-500">{aiAssistant.tagline}</p>
        </div>
        <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
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
            <div className="flex-1 text-left min-w-0">
              <p className="text-[14px] font-medium text-[#111318]">{c.name}</p>
              <p className="text-[12px] text-gray-500">{c.role}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
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
    if (endRef.current && endRef.current.scrollIntoView) {
      endRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, typing]);

  const sendText = (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((prev) => [...prev, { id: `u${Date.now()}`, from: "user", text: clean }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((prev) => [...prev, { id: `b${Date.now()}`, from: "bot", text: getAiReply(clean) }]);
    }, 700);
  };

  const showSuggestions = messages.length === 1;

  return (
    <div className="h-full flex flex-col min-h-0">
      <div className="flex items-center gap-2 px-5 pt-6 pb-4 flex-shrink-0">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center active:scale-90 transition-transform flex-shrink-0"
          aria-label="Назад"
        >
          <ChevronLeft size={18} className="text-gray-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-[#111318]" />
        </div>
        <p className="text-[15px] font-semibold text-[#111318]">{aiAssistant.name}</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-5">
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
        {showSuggestions && (
          <div className="flex flex-col items-start gap-2 mt-3">
            {aiAssistant.suggestions.map((s) => (
              <button
                key={s}
                onClick={() => sendText(s)}
                className="text-[12px] text-gray-600 bg-white border border-gray-200 rounded-full px-3 py-1.5 active:scale-95 transition-transform text-left"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex-shrink-0 px-5 py-3 flex items-center gap-2 border-t border-gray-100 bg-white">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendText(input);
          }}
          placeholder="Спросите что-нибудь"
          className="flex-1 min-w-0 text-[14px] bg-[#F5F6F3] rounded-full px-4 py-2.5 outline-none placeholder:text-gray-400"
        />
        <button
          onClick={() => sendText(input)}
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
    <div className="flex-shrink-0 bg-white border-t border-gray-100 px-2 pt-2 nav-safe-area">
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
  const [article, setArticle] = useState(null);
  const [pushVisible, setPushVisible] = useState(false);

  // Разворачиваем мини-апп на всю доступную высоту при запуске.
  // Гарантированный полноэкранный режим также зависит от настроек бота в BotFather.
  useEffect(() => {
    try {
      const wa = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
      if (wa) {
        if (typeof wa.ready === "function") wa.ready();
        if (typeof wa.expand === "function") wa.expand();
        if (typeof wa.disableVerticalSwipes === "function") wa.disableVerticalSwipes();
      }
    } catch (e) {
      console.log("Telegram WebApp API недоступен — работаем как обычная веб-страница");
    }
  }, []);

  const handleClose = () => {
    console.log("Telegram.WebApp.close()");
    try {
      const wa = typeof window !== "undefined" && window.Telegram && window.Telegram.WebApp;
      if (wa && typeof wa.close === "function") wa.close();
    } catch (e) {
      /* демо-режим вне Telegram */
    }
  };

  const handleShowPush = () => {
    setPushVisible(true);
    setTimeout(() => setPushVisible(false), 3500);
  };

  const goTab = (tab) => {
    setProfileOpen(false);
    setAiChatOpen(false);
    setArticle(null);
    setActiveTab(tab);
  };

  let content;
  let scrollable = true;

  if (aiChatOpen) {
    content = <AiChatScreen aiAssistant={mockData.aiAssistant} onBack={() => setAiChatOpen(false)} />;
    scrollable = false;
  } else if (article) {
    content = <ArticleScreen article={article} onBack={() => setArticle(null)} />;
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
    content = (
      <BaseScreen base={mockData.base} quickLinks={mockData.quickLinks} onOpenArticle={(a) => setArticle(a)} />
    );
  } else if (activeTab === "plan") {
    content = <PlanScreen plan={mockData.plan} />;
  } else {
    content = (
      <SosScreen sos={mockData.sos} aiAssistant={mockData.aiAssistant} onOpenAiChat={() => setAiChatOpen(true)} />
    );
  }

  return (
    <div className="relative bg-[#F5F6F3] mx-auto flex flex-col app-shell">
      <style>{`
        .app-shell {
          max-width: 400px;
          width: 100%;
          height: 100vh;          /* фолбэк для старых браузеров */
          height: 100dvh;          /* корректная высота с учётом панелей мобильных браузеров */
          -webkit-font-smoothing: antialiased;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
        }
        .no-scrollbar {
          scrollbar-width: none;             /* Firefox */
          -ms-overflow-style: none;          /* IE / старый Edge */
          -webkit-overflow-scrolling: touch; /* инерционный скролл в iOS WebView */
        }
        .no-scrollbar::-webkit-scrollbar {   /* Chrome / Safari */
          display: none;
          width: 0;
          height: 0;
        }
        .nav-safe-area {
          padding-bottom: 24px;
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 8px));
        }
        .push-in {
          animation: pushIn 0.25s ease-out;
        }
        @keyframes pushIn {
          from { opacity: 0; -webkit-transform: translateY(-12px); transform: translateY(-12px); }
          to { opacity: 1; -webkit-transform: translateY(0); transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .push-in { animation: none; }
        }
      `}</style>

      {pushVisible && <PushToast push={mockData.push} onDismiss={() => setPushVisible(false)} />}

      {scrollable ? (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-6">{content}</div>
      ) : (
        <div className="flex-1 min-h-0">{content}</div>
      )}

      <BottomNav activeTab={profileOpen || aiChatOpen || article ? "" : activeTab} setActiveTab={goTab} />
    </div>
  );
}
