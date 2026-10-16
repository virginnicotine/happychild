#!/usr/bin/env python3
"""Готовит чистую папку для публикации на Netlify.

Копирует проект в соседнюю папку factory-site и НЕ берёт с собой лишнее:
  • служебные папки (tests, tools, .git, .vscode, __pycache__) и старые complaints.json / sessions.json;
  • «дубли с кракозябрами» (имена вроде ╨╕╨╖╨╛… или тХи…) — но ТОЛЬКО если рядом лежит такая же копия с нормальным
    именем и на файл не ссылается ни одна страница. Если нормальной копии нет, файл остаётся (ничего не теряется);
  • с ключом --no-big ещё и файлы тяжелее 40 МБ (например, metals-elements.rar).

Запуск из корня проекта:
    python tools/make_deploy_folder.py            # папка ../factory-site
    python tools/make_deploy_folder.py --no-big   # если Netlify зависает на больших файлах
"""
import os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(os.path.dirname(ROOT), 'factory-site')
SKIP_DIRS = {'tests', 'tools', '.git', '.vscode', '__pycache__', 'node_modules'}
SKIP_FILES = {'complaints.json', 'sessions.json', 'Thumbs.db', '.DS_Store', 'README-DXF.txt'}
MOJIBAKE = re.compile('[\u2500-\u257f]|тХ')
BIG = 40 * 1024 * 1024

def mb(n): return f'{n / 1048576:.0f} МБ'

def demojibake(name):
    """Возможные «исправленные» имена для файла с кракозябрами (╨а╨╕╤Б… → Рис…)."""
    cur, outs = name, []
    for _ in range(3):
        for enc in ('cp866', 'cp437'):
            try:
                new = cur.encode(enc).decode('utf8')
            except (UnicodeError, ValueError):
                continue
            if new != cur:
                cur = new; outs.append(cur); break
        else:
            break
    return outs

def site_text():
    """Весь текст сайта (страницы, скрипты, данные) — чтобы понять, какие файлы реально используются."""
    chunks = []
    for dirpath, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for f in files:
            if f.endswith(('.html', '.js', '.json', '.css')) and os.path.getsize(os.path.join(dirpath, f)) < 8 * 1024 * 1024:
                try:
                    chunks.append(open(os.path.join(dirpath, f), encoding='utf8', errors='ignore').read())
                except OSError:
                    pass
    return '\n'.join(chunks)

def main():
    no_big = '--no-big' in sys.argv
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    corpus = site_text()
    from urllib.parse import quote
    copied = size = 0
    skipped = {'служебные': 0, 'кракозябры': [], 'тяжёлые': []}
    kept_no_twin = 0
    for dirpath, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        rel_dir = os.path.relpath(dirpath, ROOT)
        names = set(files)
        for f in files:
            src = os.path.join(dirpath, f)
            if f in SKIP_FILES or f.endswith(('.py', '.pyc')):
                skipped['служебные'] += 1; continue
            if MOJIBAKE.search(f):
                has_twin = any(o in names for o in demojibake(f))
                if has_twin and f not in corpus and quote(f) not in corpus:
                    skipped['кракозябры'].append(f); continue
                if not has_twin:
                    kept_no_twin += 1
            s = os.path.getsize(src)
            if no_big and s > BIG:
                skipped['тяжёлые'].append(f'{f} ({mb(s)})'); continue
            dst = os.path.join(OUT, rel_dir, f) if rel_dir != '.' else os.path.join(OUT, f)
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst); copied += 1; size += s
    print(f'Готово: {OUT}')
    print(f'Файлов: {copied}, размер: {mb(size)}')
    print(f'Не взято служебных файлов: {skipped["служебные"]}')
    print(f'Не взято дублей с кракозябрами: {len(skipped["кракозябры"])}')
    if kept_no_twin:
        print(f'Оставлено файлов с кракозябрами без нормальной копии: {kept_no_twin} (удалять их вручную не нужно)')
    if skipped['тяжёлые']:
        print('Не взято тяжёлых файлов:'); [print('  ', x) for x in skipped['тяжёлые']]
        print('Плитки скачивания этих файлов на главной будут вести в никуда — убери их или выложи файлы отдельно.')
    biggest = []
    for dp, _, fs in os.walk(OUT):
        for f in fs:
            p = os.path.join(dp, f); biggest.append((os.path.getsize(p), os.path.relpath(p, OUT)))
    biggest.sort(reverse=True)
    print('Самые тяжёлые файлы в папке публикации:'); [print(f'   {mb(sz):>7}  {name}') for sz, name in biggest[:4]]

if __name__ == '__main__':
    main()
