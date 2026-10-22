"""Импорт спецификаций и картинок песочниц из папки sandboxes в структуру проекта. Запуск на macOS: python import_sandboxes.py """ from pathlib import Path from collections import defaultdict from openpyxl import load_workbook import json, shutil, sys, re, html, warnings
warnings.filterwarnings('ignore', message='wmf image format')
SITE = Path(file).resolve().parent SOURCE = SITE / 'sandboxes'  # твоя папка с файлами из архива пср до 5.zip
def fmt(v): if v is None: return '' if isinstance(v, float): return format(v, '.12g') return str(v).strip()
def esc(v): return html.escape(fmt(v), quote=True) def text(v): return re.sub(r'\s+', ' ', fmt(v)).strip() def write(p, s): p.parent.mkdir(parents=True, exist_ok=True); p.write_text(s, encoding='utf-8') def jsonwrite(p, obj): write(p, json.dumps(obj, ensure_ascii=False, indent=2))
def run_import(): if not SOURCE.exists(): print(f"Ошибка: папка {SOURCE} не найдена! Создай папку 'sandboxes' и положи туда файлы.") return
excel_files = list(SOURCE.glob('*.xlsx'))
if not excel_files:
    print(f"В папке {SOURCE} не найдены Excel-файлы (.xlsx).")
    return

downloads_dir = SITE / 'downloads'
downloads_dir.mkdir(parents=True, exist_ok=True)
data_dir = SITE / 'data'
data_dir.mkdir(parents=True, exist_ok=True)

for f in excel_files:
    code = f.stem  # например, 1.01 или psr-1.01
    print(f"Импорт спецификации песочницы: {code}")
    
    # Копируем исходный excel в загрузки
    shutil.copy2(f, downloads_dir / f.name)

    w = load_workbook(f, data_only=True)
    s = w.worksheets[0]

    # Ищем строку заголовка
    hdr_rows = [r for r in range(1, 13) if text(s.cell(r, 2).value) == '№ п/п']
    hdr = max(hdr_rows) if hdr_rows else 5
    display_code = next((text(s.cell(r, 1).value) for r in range(1, hdr) if text(s.cell(r, 1).value)), f"ПСР-{code}")
    dimensions_text = next((text(s.cell(r, 2).value) for r in range(1, hdr) if text(s.cell(r, 2).value).startswith('Размер')), '')

    shift = 1 if text(s.cell(hdr, 6).value) == 'Кол-во' else 0
    col = {
        'qty': 5 + shift,
        'color': 7 + shift,
        'length': 8 + shift,
        'width': 9 + shift,
        'height': 10 + shift,
        'volume': 11 + shift,
        'total_volume': 12 + shift
    }

    rows = sorted(set(c.row for c in s._cells.values() if c.value is not None))
    groups = []
    records = []
    g = None

    for r in rows:
        if r <= hdr: continue
        b, c, d = (s.cell(r, k).value for k in [2, 3, 4])
        v = {key: s.cell(r, k).value if k else None for key, k in col.items()}
        
        if d is not None and v['qty'] is not None:
            if g is None:
                g = {'title': 'Состав изделия', 'row': r, 'records': []}
                groups.append(g)
            rec = {
                'row': r, 'number': fmt(b), 'article': fmt(c), 
                'name': text(d), 'group': g['title'], **v, 'images': []
            }
            g['records'].append(rec)
            records.append(rec)
        else:
            heading = next((text(x) for x in [s.cell(r, 1).value, b] if isinstance(x, str) and text(x)), None)
            if heading:
                g = {'title': heading, 'row': r, 'records': []}
                groups.append(g)

    spec = {
        'code': code,
        'display_code': display_code,
        'workbook': f.name,
        'dimensions': dimensions_text.removeprefix('Размер '),
        'records': records,
        'groups': groups
    }

    jsonwrite(data_dir / f'spec-psr-{code}.json', spec)
    print(f" Успешно обработано: {display_code} (позиций: {len(records)})")if name == 'main': run_import()