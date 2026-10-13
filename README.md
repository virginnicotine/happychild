# SourceCraft Sites Template

Этот репозиторий служит шаблоном для создания статических сайтов на SourceCraft Sites.

**Живой пример**: <https://sourcecraft.sourcecraft.site/sites-landing/>
**Документация по SourceCraft Sites**: <https://sourcecraft.dev/portal/docs/ru/sourcecraft/tutorials/sites>

## Как использовать этот шаблон

1. **Создайте репозиторий** из этого шаблона: [Создать репозиторий](https://sourcecraft.dev/create/repo?templateOrg=sourcecraft&templateRepo=sites-landing)

2. **Замените содержимое** в папке [`src`](./src):

    - Поменяйте конфиг страницы [`src/pages/index.yaml`](./src/pages/index.yaml) на нужный вам (сейчас там конфигурация для [лендинга SourceCraft Sites](https://sourcecraft.site))
    - Добавьте свои CSS-файлы или React-комопоненты (пример конфигурации есть в [`page-builder.config.yml`](./page-builder.config.yml))
    - Убедитесь, что главный файл называется `index.yaml`

3. **Сделайте push** в ветку `main` и ваш сайт станет доступен по адресу `{org_name}.sourcecraft.site/{repository_name}` (например, <https://sourcecraft.sourcecraft.site/sites-landing/> — полная сслыка к странице этого репозитория)

## Как устроен шаблон

### Структура репозитория

```
├── .sourcecraft/
│   └── sites.yaml          # Конфигурация SourceCraft Sites
│   └── ci.yaml             # Конфигурация CI для сборки и публикации
├── src/                    # Папка с содержимым сайта
│   └── components          # 
│   └── css                 # Свои CSS-файлы, которые нужно подключить на страницу
│   └── images              # Папка с используемыми изображениями
│   └── pages               # Папка с конфигурациями страниц
│       └── index.yaml      # Конфигурация самой страницы
└── README.md               # Вы находитесь здесь :)
```

## Настройка SourceCraft Sites

В файле [`.sourcecraft/sites.yaml`](./.sourcecraft/sites.yaml) можно указать:

- `site` как корень конфига, в нём:
    - `root` - папка с файлами сайта
    - `ref` - ветка или тег для публикации (опционально, если не указано, используется ветка по умолчанию, в шаблоне настроена `release`)

### Сборка и выкладка

В файле [`.sourcecraft/ci.yaml`](./.sourcecraft/ci.yaml) текущая настройка подразумевает автосборку и автопубликацию сайта по пушу в ветку `main`.
Результат сборки публикуется в ветку `release` и уже оттуда доступен через Sites.

### Содержимое страниц

SourceCraft Sites может работать с любыми статическими HTML/JS/CSS файлами, как и любой статический хостинг, однако на практике вручную
создавать статические сайты неудобно и обычно для этих целей используют какие-то сборщики.

Шаблон построен на основе сборщика статичесих сайтов [@gravity-ui/page-constructor-builder](https://github.com/gravity-ui/page-constructor-builder)
и библиотеки для простого изготовления страниц  [@gravity-ui/page-constructor](https://gravity-ui.com/ru/libraries/page-constructor).
Вы можете использовать этот сборщик или любой другой на свой вкус.

{% cut "Почему мы используем именно этот сборщик?" %}

Вся клиентская разработка в SourceCraft ведётся на стеке [GravityUI](https://gravity-ui.com) и наши лендинги — не исключение. Попробуйте, может, и вам понравится :)

{% endcut %}

Для проверки локально можно:

1. Установить NodeJS (проще всего использовать [nvm](https://github.com/nvm-sh/nvm))
2. Собрать сайт

   ```shell
   npm ci
   npm run build
   ```

3. Открыть `site/index.html` в браузере.

