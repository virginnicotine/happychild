#!/usr/bin/env python3
"""Приводит страницы горок (product-gsr-*.html и slides.html) к общему устройству сайта.

Что делает (безопасно запускать повторно, ничего не дублируется):
  1. Убирает «выдуманные» кнопки DXF, вписанные в страницу руками: ссылки вида metall/0013МП.dxf
     или downloads/000029.dxf. Если файла по такой ссылке нет на диске, кнопка удаляется.
  2. Подключает общий алгоритм сайта: dxf-library.js (DXF, зеркальные детали), metal-library.js
     (PDF и GIF металла по номеру детали: 0028МП → 28), pdf-preview.js (просмотр PDF) — они сами
     находят файлы по артикулу и пишут «в процессе добавления», если чертежа ещё нет.
  3. Подключает вход через Supabase (закрытая страница) и общие стили, как у остальных страниц.
  4. Убирает лишнюю кнопку «Личный кабинет», вписанную в шапку руками: настоящая добавляется скриптом.

Запуск из корня сайта (там, где лежит index.html):
    python3 tools/fix_slide_pages.py                    # все product-gsr-*.html и slides.html
    python3 tools/fix_slide_pages.py product-gsr-1.05.html
Для сверки без тяжёлых папок: --files-list путь/к/списку.txt (список файлов, по одному пути в строке).
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GATE = '<style>html{visibility:hidden}</style><script src="supabase-config.js"></script><script type="module" src="supabase-gate.js"></script>'
LIBS = ('<script src="products.js"></script><script src="site-contacts.js"></script>\n'
        '<script src="script.js"></script><script src="dxf-library.js"></script><script src="metal-index.js"></script>'
        '<script src="metal-library.js"></script>\n<script src="pdf-preview.js"></script>')
CATALOG_LIBS = '<script src="products.js"></script><script src="site-contacts.js"></script>\n<script src="script.js"></script>\n<script src="pdf-preview.js"></script>'

def known_files(list_path):
    if not list_path:
        return None
    return {re.sub(r'^\.?/?(site/)?', '', l.strip()) for l in open(list_path, encoding='utf8') if l.strip()}

def exists(href, listed):
    href = href.split('#')[0].split('?')[0]
    return (href in listed) if listed is not None else os.path.exists(os.path.join(ROOT, href))

def fix(path, listed):
    name = os.path.basename(path)
    t = open(path, encoding='utf8').read(); orig = t
    report = []
    # 1. выдуманные кнопки DXF
    removed = 0
    def drop(m):
        nonlocal removed
        hrefs = re.findall(r'href="([^"]+)"', m.group(0))
        if hrefs and all(not exists(h, listed) for h in hrefs):
            removed += 1; return ''
        return m.group(0)
    t = re.sub(r'[ \t]*<div class="dxf-downloads"[^>]*>(?:(?!</div>).)*</div>\n?', drop, t, flags=re.S)
    if removed: report.append(f'удалено выдуманных кнопок DXF: {removed}')
    # 3. вход и стили
    if 'supabase-gate.js' not in t:
        t = t.replace('<head>', '<head>' + GATE, 1); report.append('подключён вход Supabase')
    if 'site-enhancements.css' not in t:
        t = re.sub(r'(<link rel="stylesheet" href="style.css">)', r'\1\n<link rel="stylesheet" href="site-enhancements.css">', t, 1)
        report.append('подключены общие стили')
    if 'page-protected' not in t:
        t = re.sub(r'<body class="', '<body class="page-protected ', t, 1); report.append('страница закрыта для гостей')
    # 4. лишняя кнопка кабинета
    t, n = re.subn(r'[ \t]*<a href="admin\.html" class="header-action">Личный кабинет</a>\n?', '', t)
    if n: report.append('убрана дублирующая кнопка «Личный кабинет»')
    # 2. скрипты в конце страницы
    is_spec = 'v108-page' in t or 'v108-item' in t
    if 'dxf-library.js' not in t and is_spec:
        t = re.sub(r'<script src="script\.js"></script>', LIBS, t, 1); report.append('подключён алгоритм чертежей (DXF, металл, PDF)')
    elif 'script.js' not in t:
        t = t.replace('</body>', CATALOG_LIBS + '\n</body>', 1); report.append('подключены общие скрипты')
    if t != orig:
        open(path, 'w', encoding='utf8').write(t)
    print(f'{name}: ' + ('; '.join(report) if report else 'уже в порядке'))

if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    lp = sys.argv[sys.argv.index('--files-list') + 1] if '--files-list' in sys.argv else None
    if lp and lp in args: args.remove(lp)
    listed = known_files(lp)
    targets = args or sorted(glob.glob(os.path.join(ROOT, 'product-gsr-*.html'))) + [os.path.join(ROOT, 'slides.html')]
    for p in targets:
        fix(p if os.path.isabs(p) else os.path.join(ROOT, p), listed)
