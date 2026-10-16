#!/usr/bin/env python3
"""Собирает metal-index.js: какие файлы из папки metall относятся к какой детали.

Правило: номер детали = число в начале имени файла (без нулей).
    0028МП  ->  28  ->  28.GIF, 28a.GIF, 28.pdf, ...
Файлы вида «311 - Название.pdf» тоже относятся к детали 311.

Запуск из корня проекта:   python tools/build_metal_index.py
После добавления или замены файлов в metall запусти скрипт ещё раз.
"""
import glob, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
METAL_DIR = os.path.join(ROOT, 'metall', 'metall')
ORDER = {'pdf': 0, 'gif': 1, 'png': 2, 'step': 3, 'dxf': 4}

def label(kind, suffix, name):
    if kind == 'pdf':
        return 'PDF'
    if kind == 'gif':
        if suffix == '':
            return 'GIF'
        return 'GIF · вид 2' if suffix.lower() == 'a' else 'GIF · ' + suffix
    if kind == 'dxf':
        return 'DXF' + (' · ' + name if name else '')
    return kind.upper()

def scan():
    parts = {}
    skipped = []
    for dirpath, _, files in os.walk(METAL_DIR):
        for f in sorted(files):
            rel = os.path.relpath(os.path.join(dirpath, f), METAL_DIR).replace(os.sep, '/')
            stem, ext = os.path.splitext(f)
            ext = ext.lower().lstrip('.')
            kind = {'stp': 'step'}.get(ext, ext)
            if kind not in ORDER:
                skipped.append(rel); continue
            # номер: из имени файла или из имени папки (158/площадка пружины.dxf)
            m = re.match(r'^(\d+)(.*)$', stem) or re.match(r'^(\d+)$', os.path.dirname(rel))
            if not m:
                skipped.append(rel); continue
            number = str(int(m.group(1)))
            rest = m.group(2) if re.match(r'^(\d+)(.*)$', stem) else ''
            title = ''
            tm = re.match(r'^\s*-\s*(.+)$', rest)
            if tm:
                title, rest = tm.group(1).strip(), ''
            suffix = rest.strip() if not title else ''
            if not re.match(r'^\d+', stem):          # номер взят из папки
                title = stem; suffix = ''
            item = {'f': rel, 't': kind, 'l': label(kind, suffix, title)}
            if title and kind == 'pdf':
                item['n'] = title
            parts.setdefault(number, []).append(item)
    for items in parts.values():
        if not any(x['t'] == 'gif' and x['l'] == 'GIF' for x in items):
            for x in items:
                if x['t'] == 'gif' and x['l'] == 'GIF · вид 2':
                    x['l'] = 'GIF'; break
        items.sort(key=lambda x: (ORDER[x['t']], x['l'], x['f']))
    return parts, skipped

def spec_mp_articles():
    arts = {}
    for p in sorted(glob.glob(os.path.join(ROOT, 'data', 'spec-*.json'))):
        d = json.load(open(p, encoding='utf8'))
        for r in d['records']:
            a = (r.get('article') or '').strip()
            if re.match(r'^\d+\s*[МM][ПP](?![А-ЯЁA-Z0-9])', a.upper()):
                arts.setdefault(a, set()).add(d.get('code'))
    return arts

if __name__ == '__main__':
    parts, skipped = scan()
    out = {'root': './metall/metall/', 'parts': dict(sorted(parts.items(), key=lambda kv: int(kv[0])))}
    with open(os.path.join(ROOT, 'metal-index.js'), 'w', encoding='utf8') as fh:
        fh.write('// Создано tools/build_metal_index.py — не редактировать вручную.\n')
        fh.write('window.METAL_INDEX = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    n_files = sum(len(v) for v in parts.values())
    print(f'деталей с файлами: {len(parts)}, файлов привязано: {n_files}')
    if skipped:
        print('пропущено (нет номера или не чертёж):', *skipped, sep='\n  ')
    arts = spec_mp_articles()
    missing = [a for a in sorted(arts) if str(int(re.match(r'^0*(\d+)', a).group(1))) not in parts]
    print(f'артикулов МП в спецификациях: {len(arts)}, без файлов в metall: {len(missing)}')
    for a in missing:
        print('  нет чертежей:', a, '(городки', ', '.join(sorted(x for x in arts[a] if x)) + ')')
