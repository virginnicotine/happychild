export interface PlaygroundProduct {
  code: string;
  specCode: string;
  title: string;
  dimensions: string;
  category: string;
  image: string;
  info: string;
  excelFile?: string;
  keys: string[];
}

export const PLAYGROUND_PRODUCTS: PlaygroundProduct[] = [
  {
    code: "ИКССР-1.06",
    specCode: "1.06",
    title: "Детский игровой городок ИКССР-1.06",
    dimensions: "6,04 × 3,43 × 3,38 м",
    category: "Детские городки",
    image: "/playgrounds/1.06/Рисунок1.jpg",
    info: "Детский игровой городок · 6,04 × 3,43 × 3,38 м · 48 позиций",
    excelFile: "ИКССР-1.06_спецификация.xlsx",
    keys: ["иксср-1.06", "1.06", "0003сб", "кчм6кс", "кчм8кс"],
  },
  {
    code: "ИКССР-1.07",
    specCode: "1.07",
    title: "Детский игровой городок ИКССР-1.07",
    dimensions: "6,15 × 3,89 × 3,43 м",
    category: "Детские городки",
    image: "/playgrounds/1.07/source-excel/image36.png",
    info: "Детский игровой городок · 6,15 × 3,89 × 3,43 м · 40 позиций",
    excelFile: "ИКССР-1.07_2023(новые цвета).xlsx",
    keys: ["иксср-1.07", "1.07", "0043сб", "0044сб", "000022", "пластик"],
  },
  {
    code: "ИКССР-1.08",
    specCode: "1.08",
    title: "Детский игровой городок ИКССР-1.08",
    dimensions: "6,30 × 4,65 × 3,50 м",
    category: "Детские городки",
    image: "/playgrounds/1.08/source-excel/image7.jpg",
    info: "Детский игровой городок · 6,30 × 4,65 × 3,50 м · 68 позиций",
    excelFile: "ИКССР-1.08_2023(новые цвета).xlsx",
    keys: ["иксср-1.08", "1.08", "метизы", "заглушка м8-10", "заглушка м6"],
  },
  {
    code: "ИКССР-1.09",
    specCode: "1.09",
    title: "Детский игровой городок ИКССР-1.09",
    dimensions: "8,34 × 5,65 × 3,50 м",
    category: "Детские городки",
    image: "/playgrounds/1.09/source-excel/image34.jpeg",
    info: "Детский игровой городок · 8,34 × 5,65 × 3,50 м · 79 позиций",
    excelFile: "ИКССР-1.09.xlsx",
    keys: ["иксср-1.09", "1.09", "метизы", "заглушка м8-10"],
  },
  {
    code: "ИКССР-1.10",
    specCode: "1.10",
    title: "Детский игровой городок ИКССР-1.10",
    dimensions: "4,15 × 7,85 × 3,30 м",
    category: "Детские городки",
    image: "/playgrounds/1.10/source-excel/image4.jpeg",
    info: "Детский игровой городок · 4,15 × 7,85 × 3,30 м · 57 позиций",
    excelFile: "ИКССР-1.10.xlsx",
    keys: ["иксср-1.10", "1.10", "метизы", "заглушка"],
  },
  {
    code: "ИКССР-1.11",
    specCode: "1.11",
    title: "Детский игровой городок ИКССР-1.11",
    dimensions: "8,30 × 11,20 × 3,50 м",
    category: "Детские городки",
    image: "/playgrounds/1.11/source-excel/image40.jpg",
    info: "Детский игровой городок · 8,30 × 11,20 × 3,50 м · 74 позиции",
    excelFile: "ИКССР-1.11.xlsx",
    keys: ["иксср-1.11", "1.11", "горка", "тоннель", "балкон"],
  },
  {
    code: "ИКССР-1.13.Н",
    specCode: "1.13",
    title: "Детский игровой городок ИКССР-1.13.Н",
    dimensions: "9,50 × 6,80 × 3,50 м",
    category: "Детские городки",
    image: "/playgrounds/1.13/source-excel/image28.jpg",
    info: "Детский игровой городок · 9,50 × 6,80 × 3,50 м · 83 позиции",
    excelFile: "ИКССР-1.13.Н.xlsx",
    keys: ["иксср-1.13", "1.13", "1.13.н", "качели", "горка"],
  },
  {
    code: "ИКССР-1.15.Н",
    specCode: "1.15",
    title: "Детский игровой городок ИКССР-1.15.Н",
    dimensions: "10,50 × 9,00 × 3,35 м",
    category: "Детские городки",
    image: "/playgrounds/1.15/source-excel/image11.jpg",
    info: "Детский игровой городок · 10,50 × 9,00 × 3,35 м · 97 позиций",
    excelFile: "ИКССР-1.15.Н.xlsx",
    keys: ["иксср-1.15", "1.15", "1.15.н", "комплекс", "мост"],
  },
  {
    code: "ИКССР-1.16.Н",
    specCode: "1.16",
    title: "Детский игровой городок ИКССР-1.16.Н",
    dimensions: "Компактная серия · H=900 мм",
    category: "Детские городки",
    image: "/playgrounds/1.16/source-excel/image5.jpg",
    info: "Детский игровой городок · Серия 1.16.Н · 42 позиции",
    excelFile: "ИКССР-1.16.Н.xlsx",
    keys: ["иксср-1.16", "1.16", "1.16.н", "0006сб"],
  },
];

export const DXF_MAP: Record<string, Array<[string, string]>> = {
  "000029": [
    ["29.DXF", "Основной"],
    ["29-п.DXF", "Зеркальный"],
  ],
  "000030": [
    ["30.DXF", "Основной"],
    ["30-з.DXF", "Зеркальный"],
  ],
  "000039": [["39.DXF", "DXF"]],
  "0044СБ": [["110.DXF", "DXF"]],
  "04.006.000": [["110.DXF", "DXF"]],
  "0074СБ": [["110.DXF", "DXF"]],
  "000157": [["157.DXF", "DXF"]],
  "000160": [["160.DXF", "DXF"]],
  "000161": [
    ["161-л.DXF", "Левый"],
    ["161-п.DXF", "Правый (зеркальный)"],
  ],
  "000162": [["162.DXF", "DXF"]],
  "000163": [
    ["163.DXF", "Основной"],
    ["163-п.DXF", "Зеркальный"],
  ],
  "000164": [
    ["164.DXF", "Основной"],
    ["164-л.DXF", "Левый / зеркальный"],
  ],
  "000165": [["165.DXF", "DXF"]],
  "000187": [["187.DXF", "DXF"]],
  "000110": [["110.DXF", "DXF"]],
  "000158": [["158.DXF", "DXF"]],
  "000159": [["159.DXF", "DXF"]],
  "000184": [["184.DXF", "DXF"]],
  "000185": [["185.DXF", "DXF"]],
  "000016": [
    ["16.DXF", "Основной"],
    ["16-з.DXF", "Зеркальный"],
  ],
  "000017": [
    ["17.DXF", "Основной"],
    ["17-з.DXF", "Зеркальный"],
  ],
  "000023": [
    ["23.DXF", "Основной"],
    ["23-з.DXF", "Зеркальный"],
  ],
};

export function getDxfFilesForArticle(article?: string | null) {
  if (!article) return { main: [], mirror: [] };
  const cleaned = String(article)
    .trim()
    .toUpperCase()
    .replace(/Ё/g, "Е")
    .replace(/\.П\.\d+\.[01]$/, "");
  const list = DXF_MAP[cleaned] || [];
  const main: Array<{ file: string; label: string; href: string }> = [];
  const mirror: Array<{ file: string; label: string; href: string }> = [];

  for (const [file, label] of list) {
    const entry = {
      file,
      label,
      href: `/downloads/dxf/${encodeURIComponent(file)}`,
    };
    if (
      /(зеркал|лев|прав)/i.test(label) ||
      /(?:-з|-п|-л)\.DXF$/i.test(file)
    ) {
      mirror.push(entry);
    } else {
      main.push(entry);
    }
  }
  return { main, mirror };
}

export interface LandscapingSubItem {
  article: string;
  name: string;
  dimensions: string;
  material: string;
  coating: string;
  image?: string;
  dxfFile?: string;
  mirrorDxfFile?: string;
  productRef?: string;
  status: string;
}

export const LANDSCAPING_SUBCATEGORIES: Array<{
  id: "benches" | "urns" | "facades";
  title: string;
  shortTitle: string;
  subtitle: string;
  badge: string;
  description: string;
  items: LandscapingSubItem[];
}> = [
  {
    id: "benches",
    title: "Лавочки и скамьи",
    shortTitle: "Лавочки",
    subtitle: "Парковые лавочки, встроенные сидушки домиков и каркасы",
    badge: "4 позиции",
    description:
      "Деревянные и комбинированные лавочки, сиденья с пазом для игровых комплексов и парковые скамьи.",
    items: [
      {
        article: "000165",
        name: "Сидушка лавочки с пазом (встроенная скамья домика)",
        dimensions: "620 × 268 × 21 мм",
        material: "Фанера ФСФ 21 мм / ПНД",
        coating: "RAL 1037 (жёлтый)",
        image: "/detail-images/165.GIF",
        dxfFile: "165.DXF",
        productRef: "ИКССР-1.07 / 1.08",
        status: "Чертёж DXF в базе",
      },
      {
        article: "000039",
        name: "Подпорка сидушки лавочки (опора скамьи)",
        dimensions: "335 × 200 × 21 мм",
        material: "Фанера ФСФ 21 мм",
        coating: "RAL 7024 (графитовый серый)",
        image: "/detail-images/39.GIF",
        dxfFile: "39.DXF",
        productRef: "ИКССР-1.07 / 1.08",
        status: "Чертёж DXF в базе",
      },
      {
        article: "000162",
        name: "Панель боковая с вырезом для сидушки лавочки",
        dimensions: "800 × 748 × 21 мм",
        material: "Фанера ФСФ 21 мм",
        coating: "RAL 1037",
        image: "/detail-images/162.GIF",
        dxfFile: "162.DXF",
        productRef: "ИКССР-1.07",
        status: "Чертёж DXF в базе",
      },
      {
        article: "ЛП-1500.СБ",
        name: "Лавочка парковая со спинкой (брус хвойный + боковины МП)",
        dimensions: "1500 × 620 × 780 мм",
        material: "Брус 90×40 мм · Сталь порошковая покраска",
        coating: "RAL 7024 / Полиуретановый лак",
        productRef: "Парковая серия МАФ",
        status: "Типовой узел благоустройства",
      },
    ],
  },
  {
    id: "urns",
    title: "Урны парковые",
    shortTitle: "Урны",
    subtitle: "Уличные урны, поворотные баки, деревянная обшивка и закладные",
    badge: "3 позиции",
    description:
      "Металлические и обшитые деревом урны для комплектации игровых площадок и дворовых территорий.",
    items: [
      {
        article: "УП-01.МП",
        name: "Урна парковая с деревянной обшивкой и съёмным вкладышем",
        dimensions: "Ø 340 × 680 мм · 35 л",
        material: "Сталь 1,5 мм + рейка 40×20 мм",
        coating: "Порошковая краска RAL 7024",
        productRef: "Парковая серия МАФ",
        status: "Базовая комплектация",
      },
      {
        article: "УП-02.МП",
        name: "Урна металлическая поворотная на стойке под бетонирование",
        dimensions: "310 × 270 × 750 мм · 28 л",
        material: "Сталь Ст3 · Оцинкованный бак",
        coating: "Порошковая краска RAL 8014 / 7024",
        productRef: "Парковая серия МАФ",
        status: "Базовая комплектация",
      },
      {
        article: "0013МП",
        name: "Опора закладная универсальная (стойки и малые формы)",
        dimensions: "100 × 100 × 500 мм",
        material: "Металл · сварной узел",
        coating: "Порошковая краска RAL 7024",
        image: "/detail-images/13.GIF",
        productRef: "Все серии ИКССР",
        status: "Чертёж в разделе Металл",
      },
    ],
  },
  {
    id: "facades",
    title: "Фасадные элементы и декоративные панели",
    shortTitle: "Фасадные элементы",
    subtitle: "Окна, рамы, боковины крыш, резные накладки и ограждения",
    badge: "8 позиций с DXF",
    description:
      "Фасадные панели домиков, башен и ограждений из ФСФ и ПНД с готовыми файлами раскроя DXF (включая зеркальные).",
    items: [
      {
        article: "000161",
        name: "Панель фасадная «Окно верхнее» (левая + правая зеркальная)",
        dimensions: "994 × 1210 × 21 мм",
        material: "Фанера ФСФ 21 мм",
        coating: "RAL 1037",
        image: "/detail-images/161.GIF",
        dxfFile: "161-л.DXF",
        mirrorDxfFile: "161-п.DXF",
        productRef: "ИКССР-1.07 / 1.08 / 1.09",
        status: "Основной + зеркальный DXF",
      },
      {
        article: "000157",
        name: "Накладка фасадная «Рама окна»",
        dimensions: "755 × 537 × 15 мм",
        material: "Фанера ФСФ 15 мм",
        coating: "RAL 5024",
        image: "/detail-images/157.GIF",
        dxfFile: "157.DXF",
        productRef: "ИКССР-1.07 / 1.08",
        status: "Чертёж DXF в базе",
      },
      {
        article: "000163",
        name: "Боковина крыши двойного домика (фасадный фронтон)",
        dimensions: "822 × 770 × 21 мм",
        material: "Фанера ФСФ 21 мм",
        coating: "RAL 1037",
        image: "/detail-images/163.GIF",
        dxfFile: "163.DXF",
        mirrorDxfFile: "163-п.DXF",
        productRef: "ИКССР-1.07 / 1.09",
        status: "Основной + зеркальный DXF",
      },
      {
        article: "000164",
        name: "Панель фасадная нижняя (с зеркальным исполнением)",
        dimensions: "800 × 650 × 21 мм",
        material: "Фанера ФСФ 21 мм",
        coating: "RAL 1037",
        image: "/detail-images/164.GIF",
        dxfFile: "164.DXF",
        mirrorDxfFile: "164-л.DXF",
        productRef: "ИКССР-1.07 / 1.08",
        status: "Основной + зеркальный DXF",
      },
      {
        article: "000160",
        name: "Панель декоративная «Спираль»",
        dimensions: "800 × 748 × 21 мм",
        material: "Фанера ФСФ 21 мм",
        coating: "RAL 5024",
        image: "/detail-images/160.GIF",
        dxfFile: "160.DXF",
        productRef: "ИКССР-1.07 / 1.08",
        status: "Чертёж DXF в базе",
      },
      {
        article: "000187",
        name: "Панель фасадная «Кривой заборчик»",
        dimensions: "800 × 950 × 21 мм",
        material: "Фанера ФСФ 21 мм",
        coating: "RAL 1037",
        image: "/detail-images/187.GIF",
        dxfFile: "187.DXF",
        productRef: "ИКССР-1.07 / 1.10",
        status: "Чертёж DXF в базе",
      },
      {
        article: "000158",
        name: "Крыша наклонная фасадная №1",
        dimensions: "1150 × 1000 × 15 мм",
        material: "Фанера ФСФ 15 мм",
        coating: "RAL 5024",
        image: "/detail-images/158.GIF",
        dxfFile: "158.DXF",
        productRef: "ИКССР-1.07",
        status: "Чертёж DXF в базе",
      },
      {
        article: "000159",
        name: "Крыша наклонная фасадная №2",
        dimensions: "1200 × 1000 × 15 мм",
        material: "Фанера ФСФ 15 мм",
        coating: "RAL 5024",
        image: "/detail-images/159.GIF",
        dxfFile: "159.DXF",
        productRef: "ИКССР-1.07",
        status: "Чертёж DXF в базе",
      },
    ],
  },
];

export const SPEC_EXCEL_FILES: Array<{
  file: string;
  title: string;
  code: string;
  note: string;
}> = [
  {
    file: "ИКССР-1.06_спецификация.xlsx",
    title: "Спецификация ИКССР-1.06",
    code: "1.06",
    note: "Базовая комплектация · Excel",
  },
  {
    file: "ИКССР-1.07_Спецификация.xlsx",
    title: "Спецификация ИКССР-1.07 (исходная)",
    code: "1.07",
    note: "Таблица комплектации · Excel",
  },
  {
    file: "ИКССР-1.07_2023(новые цвета).xlsx",
    title: "Спецификация ИКССР-1.07 · новые цвета 2023",
    code: "1.07",
    note: "Актуальная цветовая схема RAL · Excel",
  },
  {
    file: "ИКССР-1.08.xlsx",
    title: "Спецификация ИКССР-1.08 (исходная)",
    code: "1.08",
    note: "Таблица комплектации · Excel",
  },
  {
    file: "ИКССР-1.08_2023(новые цвета).xlsx",
    title: "Спецификация ИКССР-1.08 · новые цвета 2023",
    code: "1.08",
    note: "Актуальная цветовая схема RAL · Excel",
  },
  {
    file: "ИКССР-1.09.xlsx",
    title: "Спецификация ИКССР-1.09",
    code: "1.09",
    note: "Полная ведомость деталей · Excel",
  },
  {
    file: "ИКССР-1.10.xlsx",
    title: "Спецификация ИКССР-1.10",
    code: "1.10",
    note: "Полная ведомость деталей · Excel",
  },
  {
    file: "ИКССР-1.11.xlsx",
    title: "Спецификация ИКССР-1.11",
    code: "1.11",
    note: "Полная ведомость деталей · Excel",
  },
  {
    file: "ИКССР-1.13.Н.xlsx",
    title: "Спецификация ИКССР-1.13.Н",
    code: "1.13",
    note: "Серия Н · Полная ведомость · Excel",
  },
  {
    file: "ИКССР-1.15.Н.xlsx",
    title: "Спецификация ИКССР-1.15.Н",
    code: "1.15",
    note: "Серия Н · Полная ведомость · Excel",
  },
  {
    file: "ИКССР-1.16.Н.xlsx",
    title: "Спецификация ИКССР-1.16.Н",
    code: "1.16",
    note: "Серия Н · Полная ведомость · Excel",
  },
];

export const ARCHIVE_DOWNLOAD_FILES: Array<{
  file: string;
  icon: "ZIP" | "DXF";
  title: string;
  note: string;
  href: string;
}> = [
  {
    file: "библиотека-изображений-деталей.zip",
    icon: "ZIP",
    title: "Библиотека изображений деталей (полный архив)",
    note: "1804 GIF · исходная папка эскизов деталей предприятия",
    href: "/downloads/%D0%B1%D0%B8%D0%B1%D0%BB%D0%B8%D0%BE%D1%82%D0%B5%D0%BA%D0%B0-%D0%B8%D0%B7%D0%BE%D0%B1%D1%80%D0%B0%D0%B6%D0%B5%D0%BD%D0%B8%D0%B9-%D0%B4%D0%B5%D1%82%D0%B0%D0%BB%D0%B5%D0%B9.zip",
  },
  {
    file: "happychild-sourcecraft-update.zip",
    icon: "ZIP",
    title: "Пакет обновлённого кода сайта (для репозитория SourceCraft)",
    note: "Обновлённый дизайн, скрытые блоки и личный кабинет сотрудников",
    href: "/downloads/happychild-sourcecraft-update.zip",
  },
];

export const CHANGELOG_ENTRIES: Array<{
  date: string;
  title: string;
  badge: string;
  items: string[];
}> = [
  {
    date: "2026-10-19",
    title: "Обновление интерфейса для сотрудников цеха и реорганизация главной страницы",
    badge: "Текущий релиз",
    items: [
      "На главной странице оставлены 3 основные категории: «Детские городки», «Горки» и объединённый блок «Элементы благоустройства» (Лавочки, Урны, Фасадные элементы).",
      "Цеховые разделы «Металлические детали», «Заглушки», «Столбы» и «Сборочные узлы» собраны в удобный раскрывающийся блок в нижней части страницы.",
      "Разделы «Последние изменения» и «Документация и загрузки» объединены в единый аккуратный блок, который при нажатии выводит оба раздела.",
      "Обновлён личный кабинет сотрудника: при входе сразу видны «Последние скачивания», «Мои жалобы и обращения» и «Предупреждения от администратора сайта».",
      "Добавлен кастомный курсор, современные читаемые шрифты, понятные иконки и сохранена фирменная плавная анимация карточек.",
    ],
  },
  {
    date: "2026-10-16",
    title: "Уточнение каталога деталей, зеркальных DXF и единого кабинета",
    badge: "Релиз v12",
    items: [
      "Зеркальные и парные чертежи DXF (левый/правый) выделены в отдельный заметный блок внутри карточек.",
      "Добавлено открытие PDF-чертежей металла во встроенном окне предпросмотра и в новой вкладке.",
      "Карточки лестниц, горок, панелей, досок и парковой мебели распределены по точным производственным группам.",
    ],
  },
  {
    date: "2026-10-12",
    title: "Импорт полных спецификаций ИКССР 1.07–1.16.Н из Excel",
    badge: "База изделий",
    items: [
      "Подключены полные таблицы состава изделий, объёмов, метизов М8–10 / М6 и заглушек из рабочих файлов Excel.",
      "Добавлена единая библиотека из 1804 GIF-эскизов деталей с поиском без учёта ведущих нулей (00027 = 27.GIF).",
    ],
  },
];
