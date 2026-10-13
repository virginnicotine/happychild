"""Импорт неизменённых Excel и изображений в статические карточки городков.
Запуск: python tools/import_specs.py /путь/к/распакованному/архиву
Требуются openpyxl, lxml, Pillow; для EMF/WMF — Inkscape.
"""
from pathlib import Path
from zipfile import ZipFile
from collections import defaultdict
from lxml import etree, html as LH
from PIL import Image
from openpyxl import load_workbook
import json, shutil, subprocess, sys, re, hashlib, warnings, html, posixpath, tempfile
from PIL import ImageChops
warnings.filterwarnings('ignore',message='wmf image format')
SITE=Path(__file__).resolve().parents[1]
SOURCE=Path(sys.argv[1]).resolve()
NS={'x':'http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing','a':'http://schemas.openxmlformats.org/drawingml/2006/main'}
def fmt(v):
 if v is None:return ''
 if isinstance(v,float):return format(v,'.12g')
 return str(v).strip()
def esc(v):return html.escape(fmt(v),quote=True)
def formula_text(v):return getattr(v,'text',v) if not isinstance(v,(str,int,float,type(None))) else v
def text(v):return re.sub(r'\s+',' ',fmt(v)).strip()
def vector_to_png(src,dst):
 """EMF/WMF -> PNG. Inkscape, если установлен; иначе LibreOffice (с обрезкой белых полей)."""
 if shutil.which('inkscape'):
  subprocess.run(['inkscape',str(src),'--export-type=png','--export-background=white','--export-background-opacity=1','--export-width=900','--export-filename='+str(dst)],check=True,capture_output=True);return
 soffice=shutil.which('soffice') or shutil.which('libreoffice');assert soffice,'Нужен Inkscape или LibreOffice для EMF/WMF'
 with tempfile.TemporaryDirectory() as tmp:
  flt='png:draw_png_Export:{"PixelWidth":{"type":"long","value":"1800"},"PixelHeight":{"type":"long","value":"2546"}}'
  subprocess.run([soffice,'--headless','--convert-to',flt,'--outdir',tmp,str(src)],check=True,capture_output=True,timeout=180)
  made=Path(tmp)/(Path(src).stem+'.png')
  with Image.open(made) as im:
   im=im.convert('RGBA');bg=Image.new('RGBA',im.size,(255,255,255,255));bg.alpha_composite(im);im=bg.convert('RGB')
   box=ImageChops.difference(im,Image.new('RGB',im.size,(255,255,255))).getbbox()
   if box:
    pad=24;box=(max(box[0]-pad,0),max(box[1]-pad,0),min(box[2]+pad,im.width),min(box[3]+pad,im.height));im=im.crop(box)
   im.save(dst)
def write(p,s):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(s,encoding='utf-8')
def jsonwrite(p,obj):write(p,json.dumps(obj,ensure_ascii=False,indent=2))
COLORS={'7024':'#4b4f54','1037':'#f2a900','5024':'#73879a','7047':'#c9cacc','8014':'#4b3a2f','6018':'#57a639','2008':'#ed5b2f','1023':'#f5c400','9007':'#878581','9005':'#0e0e10','7015':'#51565c','5017':'#063971','красный':'#bb1e10','3020':'#bb1e10','тик':'#9b683c'}
all_specs=[];audit=[]
for code in (sys.argv[2:] or ['1.07','1.08','1.09','1.10']):
 files=list(SOURCE.rglob('*'+code+'*.xlsx'));assert len(files)==1,(code,files)
 f=files[0];dest=SITE/'downloads'/f.name;shutil.copy2(f,dest)
 source_zip=next(SOURCE.rglob(code+'.zip'))
 shutil.copy2(source_zip,SITE/'downloads'/('изображения-'+code+'.zip'))
 supplied=SITE/'playgrounds'/code/'provided';supplied.mkdir(parents=True,exist_ok=True)
 provided_count=0
 with ZipFile(source_zip) as z:
  for name in z.namelist():
   if Path(name).suffix.lower() in ['.png','.jpg','.jpeg','.gif','.webp']:
    b=z.read(name);target=supplied/Path(name).name;target.write_bytes(b)
    with Image.open(target) as im:im.verify()
    provided_count+=1
 w=load_workbook(f,data_only=True);wf=load_workbook(f,data_only=False);s=w.worksheets[0];sf=wf.worksheets[0]
 hdr_rows=[r for r in range(1,13) if text(s.cell(r,2).value)=='№ п/п'];hdr=max(hdr_rows) if hdr_rows else 5
 display_code=next((text(s.cell(r,1).value) for r in range(1,hdr) if text(s.cell(r,1).value).startswith('ИКССР')),text(s.cell(1,1).value))
 dimensions_text=next((text(s.cell(r,2).value) for r in range(1,hdr) if text(s.cell(r,2).value).startswith('Размер')),text(s.cell(2,2).value) if hdr==5 else '')
 if hdr==5:
  shift=1 if text(s.cell(hdr,6).value)=='Кол-во' else 0
  col={'qty':5+shift,'ingredients':5 if shift else None,'color':7+shift,'length':8+shift,'width':9+shift,'height':10+shift,'volume':11+shift,'total_volume':12+shift,'fasteners':13+shift,'m8_each':14+shift,'m8_total':15+shift,'m6_each':16+shift,'m6_total':17+shift}
 else:
  # Нестандартная шапка: колонки ищем по названиям заголовков.
  names={k:text(s.cell(hdr,k).value).lower() for k in range(1,s.max_column+1)}
  def find(test):return next((k for k,v in names.items() if v and test(v)),None)
  col={'qty':find(lambda v:v.startswith('кол-во')),'ingredients':find(lambda v:v.startswith('входящие')),'color':find(lambda v:v=='цвет'),'length':find(lambda v:v.startswith('длина')),'width':find(lambda v:v.startswith('ширина')),'height':find(lambda v:v.startswith('высота')),'volume':find(lambda v:v.startswith(('объем,','объём,'))),'total_volume':find(lambda v:v.startswith(('объем всего','объём всего'))),'fasteners':find(lambda v:v.startswith('метизы')),'m8_each':find(lambda v:v.startswith('заглушка м8')),'m8_total':find(lambda v:v.startswith('всего м8')),'m6_each':find(lambda v:v.startswith('заглушка м6')),'m6_total':find(lambda v:v.startswith('всего м6'))}
 for key,k in list(col.items()):
  if k and not s.cell(hdr,k).value:col[key]=None
 extra_labels={} if hdr==5 else {s.cell(hdr,k).column_letter:text(s.cell(hdr,k).value) for k in range(max(k for k in col.values() if k)+1,s.max_column+1) if text(s.cell(hdr,k).value)}
 images=defaultdict(list);main=[];media_map={};image_events=[]
 asset_dir=SITE/'playgrounds'/code/'source-excel';asset_dir.mkdir(parents=True,exist_ok=True)
 with ZipFile(f) as z:
  for n in z.namelist():
   if not n.startswith('xl/drawings/') or not re.match(r'.*/drawing\d+\.xml$',n):continue
   drawing=etree.fromstring(z.read(n));rels=etree.fromstring(z.read(posixpath.dirname(n)+'/_rels/'+posixpath.basename(n)+'.rels'))
   targets={r.get('Id'):posixpath.normpath(posixpath.join(posixpath.dirname(n),r.get('Target'))) if not r.get('Target').startswith('/') else r.get('Target').lstrip('/') for r in rels if r.get('TargetMode')!='External'}
   for a in drawing:
    start=a.find('x:from',NS)
    if start is None:continue
    row=int(start.find('x:row',NS).text)+1;column=int(start.find('x:col',NS).text)+1
    ids=a.xpath('.//a:blip/@r:embed',namespaces={**NS,'r':'http://schemas.openxmlformats.org/officeDocument/2006/relationships'})
    for rid in dict.fromkeys(ids):
     target=targets[rid]
     if not target.startswith('xl/media/'):continue
     if target not in media_map:
      suffix=Path(target).suffix.lower();out=asset_dir/Path(target).name
      out.write_bytes(z.read(target));converted=False
      if suffix in ['.emf','.wmf']:
       out_png=out.with_suffix('.png')
       vector_to_png(out,out_png)
       out=out_png;converted=True
      with Image.open(out) as im:im.verify()
      media_map[target]={'path':out.relative_to(SITE).as_posix(),'source_media':target,'converted':converted}
     entry={**media_map[target],'row':row,'column':column}
     image_events.append(entry)
     if row<hdr:
      if entry['path'] not in [x['path'] for x in main]:main.append(entry)
     elif entry['path'] not in [x['path'] for x in images[row]]:images[row].append(entry)
 main.sort(key=lambda x:(x['row'],x['column']))
 rows=sorted(set(c.row for c in s._cells.values() if c.value is not None));groups=[];records=[];g=None;total={};issues=[];sum_volume_issues=[]
 for r in rows:
  if r<=hdr:continue
  b,c,d=(s.cell(r,k).value for k in [2,3,4]);a=s.cell(r,1).value
  v={key:s.cell(r,k).value if k else None for key,k in col.items()}
  if d is not None and v['qty'] is not None:
   if code=='1.11' and r==82:
    g={'title':'МЕТИЗЫ И КРЕПЁЖ','row':r,'records':[]};groups.append(g)
   if g is None:g={'title':'Состав изделия','row':r,'records':[]};groups.append(g)
   rec={'row':r,'number':fmt(b),'article':fmt(c),'name':text(d),'group':g['title'],**v,'images':images.get(r,[]),'formulas':{key:formula_text(sf.cell(r,k).value) for key,k in col.items() if k and sf.cell(r,k).data_type=='f'}}
   rec['ingredients']=fmt(rec['ingredients']);rec['fasteners']=fmt(rec['fasteners'])
   rec['extra_cells']={cell.column_letter:cell.value for cell in s[r] if cell.column>max(k for k in col.values() if k) and cell.value is not None}
   if not rec['article'] and not (code=='1.11' and r>=82):issues.append({'row':r,'issue':'В исходнике отсутствует артикул','name':rec['name']})
   for key,k in col.items():
    if k and sf.cell(r,k).data_type=='f' and v[key] is None:issues.append({'row':r,'issue':'Нет сохранённого результата формулы','column':sf.cell(r,k).column_letter,'formula':formula_text(sf.cell(r,k).value)})
   for key in ['volume','total_volume']:
    if isinstance(rec[key],str) and rec[key].startswith('#'):issues.append({'row':r,'issue':'Ошибка формулы в исходнике','column':key,'value':rec[key]})
   if all(isinstance(rec[k],(int,float)) for k in ['length','width','height','volume']) and rec['volume']>rec['length']*rec['width']*rec['height']*1.1+1e-9:
    issues.append({'row':r,'issue':'Объём больше произведения габаритов; исходное значение сохранено','value':rec['volume'],'dimensions_product':rec['length']*rec['width']*rec['height']})
   g['records'].append(rec);records.append(rec)
  elif c and v['qty'] is not None and not d:
   g={'title':text(c),'row':r,'qty':v['qty'],'assembly_code':fmt(v['ingredients']),'records':[]};groups.append(g)
  else:
   heading=next((text(x) for x in [a,b] if isinstance(x,str) and text(x)),None)
   if heading:
    g={'title':heading,'row':r,'records':[]};groups.append(g)
   elif isinstance(a,(int,float)):
    g={'title':'Состав узла · строка '+str(r)+' Excel','row':r,'source_heading':a,'records':[]};groups.append(g)
   elif b is None and c is None and d is None and any(v[k] is not None for k in ['m8_total','m6_total']):
    total={'row':r,'m8_total':v['m8_total'],'m6_total':v['m6_total'],'total_volume':v['total_volume']}
 if code=='1.08':
  for group in groups:
   if 63<=group['row']<=83 and group['records']:
    group['title']=('Горка 900' if group['row']<73 else 'Горка 1200')+' · '+group['title']
    for rec in group['records']:rec['group']=group['title']
 for k,article in [('m8_total','00.002.000'),('m6_total','00.001.000')]:
  plugs=next((rec for rec in records if rec['article'] in ([article,'КЧМ8КС','П-5.01.02'] if k=='m8_total' else [article,'КЧМ6КС','П-5.01.01'])),None)
  if plugs and total.get(k) is not None and total.get(k)!=plugs['qty']:issues.append({'row':plugs['row'],'issue':'Количество заглушек отличается от итога '+k,'plug_qty':plugs['qty'],'total':total.get(k)})
 oldfile=SITE/('product-'+code+'.html')
 old=LH.fromstring(oldfile.read_text() if oldfile.exists() else '<html></html>')
 olditems=old.cssselect('.v108-item') if False else old.xpath('//*[contains(concat(" ",normalize-space(@class)," ")," v108-item ") or contains(concat(" ",normalize-space(@class)," ")," component-item ")]')
 previous=[]
 for item in olditems:
  def sel(cls):return item.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," '+cls+' ")]')
  num=sel('v108-num') or sel('component-number');art=sel('v108-art');h= item.xpath('.//h3') or item.xpath('.//p');qty=sel('v108-qty') or item.xpath('.//em')
  if not art:art=item.xpath('.//strong')[:1]
  previous.append({'number':text(num[0].text_content()) if num else '', 'article':text(art[0].text_content()) if art else '', 'name':text(h[0].text_content()) if h else '', 'qty':text(qty[0].text_content()).replace('шт.','').strip() if qty else '', 'has_image':bool(item.xpath('.//img'))})
 missing=[];changed=[];used=set()
 for rec in records:
  pair=next(((i,x) for i,x in enumerate(previous) if i not in used and x['number'].lstrip('0')==rec['number'].lstrip('0') and x['article'].replace('—','').upper()==rec['article'].upper()),None)
  prev=pair[1] if pair else None
  if pair:used.add(pair[0])
  if prev is None:missing.append({'row':rec['row'],'number':rec['number'],'article':rec['article'],'name':rec['name']})
  elif prev['qty']!=fmt(rec['qty']) or prev['name']!=rec['name']:changed.append({'row':rec['row'],'before':prev,'after':{k:rec[k] for k in ['number','article','name','qty']}})
 spec={'code':code,'display_code':display_code,'workbook':f.name,'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'sheet':s.title,'dimensions':dimensions_text.removeprefix('Размер '),'records':records,'groups':groups,'totals':total,'main_images':main,'images':image_events,'provided_images_count':provided_count,'issues':issues}
 jsonwrite(SITE/'data'/('spec-'+code+'.json'),spec);all_specs.append(spec)
 audit.append({'code':code,'records_before':len(previous),'records_after':len(records),'images_before':sum(x['has_image'] for x in previous),'rows_with_images_after':sum(bool(x['images']) for x in records),'provided_images':provided_count,'converted_vectors':sum(x['converted'] for x in media_map.values()),'added':missing,'changed':changed,'source_issues':issues,'totals':total})
 # Page: preserve brand and compact 1.08 design with the separate colour column.
 def colors(rec):
  raw=fmt(rec['color']);parts=raw.split('/') if raw else []
  chips=[]
  for token in parts:
   token=token.strip();label='RAL '+token if token.isdigit() and len(token)==4 else token
   color=COLORS.get(token);lower=token.lower()
   if not color:color= '#14181b' if 'черн' in lower or 'чёрн' in lower else '#f4c400' if 'желт' in lower or 'жёлт' in lower else '#9da5aa' if 'сер' in lower else '#68737b'
   background='repeating-linear-gradient(45deg,#68737b 0 3px,#dfe5e9 3px 6px)' if 'противоскольз' in lower else color
   chips.append('<button class="v108-chip color-chip" type="button" data-spec-color="'+esc(label)+'" data-color-hex="'+color+'" title="'+esc(label)+'"><i style="background:'+background+'"></i>'+esc(label)+'</button>')
  return '<div class="v108-color-column"><span class="v108-color-label">Цвет / покрытие</span>'+(''.join(chips) if chips else '<span class="v108-color-missing">Не указан</span>')+'</div>'
 def photo(rec):
  if not rec['images']:return '<div class="v108-photo v108-empty"><span>нет<br>фото</span></div>'
  links=[]
  for i,img in enumerate(rec['images']):
   links.append('<a class="v108-photo" href="./'+esc(img['path'])+'" data-lightbox data-title="'+esc(rec['article']+' — '+rec['name'])+'"><img loading="lazy" src="./'+esc(img['path'])+'" alt="'+esc(rec['name'])+'"></a>')
  return '<div class="v108-photos">'+''.join(links)+'</div>'
 labels={'ingredients':'Входящие детали / узлы','length':'Длина, м','width':'Ширина, м','height':'Высота, м','volume':'Объём, м³','total_volume':'Объём всего, м³','fasteners':'Метизы на 1 комплектующую','m8_each':'М8–10 на 1 комплектующую','m8_total':'Всего М8–10','m6_each':'М6 на 1 комплектующую','m6_total':'Всего М6'}
 def card(rec):
  tech=''.join('<div'+(' class="v108-wide"' if k in ['ingredients','fasteners'] else '')+'><span>'+label+'</span><strong>'+esc(rec[k])+'</strong></div>' for k,label in labels.items() if rec.get(k) is not None and rec[k]!='')
  extra=''.join('<div><span>'+(esc(extra_labels[k]) if k in extra_labels else 'Дополнительная ячейка '+esc(k)+str(rec['row']))+'</span><strong>'+esc(v)+'</strong></div>' for k,v in rec['extra_cells'].items())
  search=' '.join(fmt(rec.get(k)) for k in ['number','article','name','color','ingredients','fasteners'])
  return '<article class="v108-item" id="row-'+str(rec['row'])+'" data-source-row="'+str(rec['row'])+'" data-search="'+esc(search)+'"><div class="v108-num">'+esc(rec['number'])+'</div>'+photo(rec)+'<div class="v108-main"><div class="v108-art">'+(esc(rec['article']) or 'Артикул не указан')+'</div><h3>'+esc(rec['name'])+'</h3><div class="v108-row-source">Excel · строка '+str(rec['row'])+'</div><details class="v108-tech"><summary>Технические данные</summary><div class="v108-tech-grid">'+tech+extra+'</div></details></div>'+colors(rec)+'<div class="v108-qty"><strong>'+esc(rec['qty'])+'</strong><span>шт.</span></div></article>'
 grouphtml=''
 for group in groups:
  if not group['records']:continue
  note=('<p class="spec-group-note">Узел '+esc(group.get('assembly_code',''))+' · '+esc(group['qty'])+' шт.</p>') if 'qty' in group else ''
  grouphtml+='<details class="v108-group" open><summary><span>'+esc(group['title'])+'</span><b>'+str(len(group['records']))+'</b></summary>'+note+'<div class="v108-list">'+''.join(card(rec) for rec in group['records'])+'</div></details>'
 gallery=''.join('<a href="./'+esc(im['path'])+'" data-lightbox data-title="ИКССР-'+code+' — изображение '+str(i+1)+'"><img src="./'+esc(im['path'])+'" alt="ИКССР-'+code+' — изображение '+str(i+1)+'"><span>ВИД / СХЕМА · '+str(i+1).zfill(2)+'</span></a>' for i,im in enumerate(main))
 plugrows=[x for x in records if x['article'] in ['00.001.000','00.002.000','00.003.000','КЧМ6КС','КЧМ8КС','100-100.11КК','П-5.01.01','П-5.01.02','П-5.01.03']]
 plughtml=''.join('<div class="v108-fastener-row"><span>'+esc(x['name'])+'</span><strong>'+esc(x['qty'])+'</strong><small>шт.</small></div>' for x in plugrows)
 docs=''.join('<div class="document-card"><div class="document-icon">XLSX</div><div><strong>'+esc(x.name)+'</strong><span>'+('Актуальная спецификация' if x.name==f.name else 'Предыдущий вариант спецификации')+'</span></div><a class="document-button" href="./downloads/'+esc(x.name)+'" download>Скачать Excel</a></div>' for x in sorted((SITE/'downloads').glob('*'+code+'*.xlsx')))
 sourcearchive=SITE/'downloads'/('исходники-'+code+'.zip')
 ziplink='<a href="./downloads/'+esc(sourcearchive.name)+'" download>Скачать исходный ZIP</a>' if sourcearchive.exists() else ''
 review=''
 discrepancies=[x for x in issues if 'заглушек' in x['issue']]
 if discrepancies:
  review='<p class="spec-source-notice">'+esc(' '.join(('М8–10' if 'm8_total' in x['issue'] else 'М6')+': итог '+fmt(x['total'])+', заглушки '+fmt(x['plug_qty'])+'.' for x in discrepancies))+' Значения сохранены по Excel.</p>'
 page='''<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ИКССР-'''+code+''' — Счастливый ребёнок</title><link rel="stylesheet" href="style.css"></head><body class="page-protected v108-page" data-spec-code="'''+code+'''">
<header class="header"><a class="logo" href="./home.html"><div class="logo-icon">🏭</div><div class="logo-text"><strong>СЧАСТЛИВЫЙ РЕБЁНОК</strong><span>ЕДИНАЯ ТЕХНИЧЕСКАЯ СИСТЕМА</span></div></a><div class="user"><span class="user-status"></span>Пользователь</div></header>
<main class="inner-page product-page v108-shell"><div class="breadcrumb"><a href="./home.html">Главная</a><span>/</span><a href="./playgrounds.html">Детские городки</a><span>/</span><strong>ИКССР-'''+code+'''</strong></div>
<section class="v108-hero"><div><div class="hero-label">ТЕХНИЧЕСКАЯ КАРТОЧКА ИЗДЕЛИЯ</div><h1>Детский игровой городок<br><em>ИКССР-'''+code+'''</em></h1><p>Размер изделия: <strong>'''+(esc(spec['dimensions']) or 'не указан в Excel')+'''</strong></p></div><div class="v108-source"><span></span><b>ИСТОЧНИК</b><small>Excel · '''+code+'''</small></div></section>
<section class="v108-overview"><div class="v108-overview-copy"><span class="v108-kicker">КОМПЛЕКТАЦИЯ</span><h2>Всё по спецификации — в одной карточке</h2><p>Состав, цвета и крепёж из Excel. Раскройте технические данные для просмотра размеров и входящих деталей.</p><div class="v108-stats"><div><b>'''+str(len(records))+'''</b><span>позиций спецификации</span></div><div><b>'''+esc(total.get('m8_total'))+'''</b><span>итог М8–10 из Excel</span></div><div><b>'''+esc(total.get('m6_total'))+'''</b><span>итог М6 из Excel</span></div></div>'''+review+'''</div><div class="v108-fastener-card"><div class="v108-fastener-head"><span>ЗАГЛУШКИ</span><b>из Excel</b></div>'''+plughtml+'''</div></section>
<section class="info-section v108-section"><div class="section-header"><h2>Основные изображения</h2><span>'''+str(len(main))+''' изображения из Excel</span></div><div class="v108-gallery">'''+gallery+'''</div></section>
<section class="info-section v108-section"><div class="section-header"><div><div class="hero-label">СПЕЦИФИКАЦИЯ</div><h2>Состав изделия</h2></div><span>Цвета и покрытия — отдельным блоком</span></div><div class="v108-tools"><div class="v108-search"><span>⌕</span><input id="v108Search" aria-label="Поиск по спецификации" placeholder="Артикул, название, цвет, метизы..."><button id="v108Clear" type="button">Очистить</button></div><div id="v108Count" class="v108-count" aria-live="polite">Показаны все позиции</div></div><div id="v108Spec" class="v108-groups">'''+grouphtml+'''</div></section>
<section class="info-section product-excel-docs"><div class="section-header"><h2>Excel-файлы городка '''+code+'''</h2></div><div class="documents">'''+docs+'''</div></section>
<section class="v108-docs"><div><div class="hero-label">ИСТОЧНИКИ</div><h2>Изображения и исходники</h2></div><div class="v108-doc-actions"><a href="./downloads/изображения-'''+code+'''.zip" download>Скачать картинки</a>'''+ziplink+'''</div></section>
<div class="author-note"><strong>Источник: '''+esc(f.name)+'''.</strong> Изображения связаны со строками по привязкам внутри Excel. Значения спецификации сохранены; отсутствующие артикулы и цвета отмечены в карточках.</div></main>
<footer><span>© Счастливый ребёнок</span><span>Внутренняя информационная система</span></footer><script src="products.js"></script><script src="script.js"></script><script src="spec-ui.js"></script></body></html>'''
 if display_code!='ИКССР-'+code:
  page=page.replace('ИКССР-'+code+'<',display_code+'<').replace('ИКССР-'+code+' —',display_code+' —')
 if not total:
  page=page.replace('<div><b></b><span>итог М8–10 из Excel</span></div><div><b></b><span>итог М6 из Excel</span></div>','')
 if code=='1.11':
  page=page.replace('Раскройте технические данные для просмотра размеров и входящих деталей.','Раскройте технические данные для просмотра размеров. Метизы вынесены в отдельную группу в конце спецификации.')
  spec['main_image_note']='Файлов 53/54 в ZIP нет. Общий вид и схема извлечены из шапки Excel и стоят первыми двумя. Пользователь указал, что экспортированные 53/54 следует считать 1/2.'
  jsonwrite(SITE/'data'/('spec-'+code+'.json'),spec)
 write(SITE/('product-'+code+'.html'),page)
# Update the shared parts catalogue rather than leaving stale article/color variants.
parts=json.loads((SITE/'parts-catalog.json').read_text());parts=[x for x in parts if x['product'] not in [s['display_code'] for s in all_specs]]
for spec in all_specs:
 for rec in spec['records']:
  parts.append({'product':spec['display_code'],'group':rec['group'],'article':rec['article'],'name':rec['name'],'qty':fmt(rec['qty'])+' шт.','color':fmt(rec['color']),'ingredients':rec['ingredients'],'image':rec['images'][0]['path'] if rec['images'] else None,'href':'./product-'+spec['code']+'.html#row-'+str(rec['row']),'source_row':rec['row']})
jsonwrite(SITE/'parts-catalog.json',parts)
auditfile=SITE/'data'/'import-audit.json'
prior=json.loads(auditfile.read_text()) if auditfile.exists() else []
jsonwrite(auditfile,[x for x in prior if x['code'] not in [s['code'] for s in all_specs]]+audit)
# Update only imported products; keep all existing search entries and routes.
js=(SITE/'products.js').read_text()
new_products=[];entries=[];part_entries=[]
for spec in all_specs:
 code=spec['code'];display=spec['display_code']
 new_products.append({'code':display,'title':'Детский игровой городок '+display,'category':'Детские городки','href':'./product-'+code+'.html','folder':code,'image':spec['main_images'][0]['path'],'info':'Детский игровой городок'+(' · '+spec['dimensions'] if spec['dimensions'] else ''),'keys':[code,display,'метизы','заглушки','цвета','Excel']})
 entries.append({'type':'Документ','title':spec['workbook'],'info':'Спецификация '+display,'href':'./downloads/'+spec['workbook'],'keys':[code,display,'excel','xlsx','эксель','спецификация']})
 for rec in spec['records']:
  part_entries.append({'type':'Деталь','title':(rec['article']+' — ' if rec['article'] else '')+rec['name'],'info':display+' · '+rec['group']+' · '+fmt(rec['qty'])+' шт.'+(' · '+fmt(rec['color']) if rec['color'] is not None else ''),'href':'./product-'+code+'.html#row-'+str(rec['row']),'keys':[rec['article'],rec['name'],rec['group'],display,fmt(rec['color']),rec['ingredients']]})
block='\n// Импорт дополнительных городков.\n(function(){\nconst products='+json.dumps(new_products,ensure_ascii=False)+';\nconst documents='+json.dumps(entries,ensure_ascii=False)+';\nconst parts='+json.dumps(part_entries,ensure_ascii=False)+';\nconst folders=new Set(products.map(x=>x.folder));\nconst routes=new Set(products.map(x=>x.href));\nwindow.PRODUCTS=window.PRODUCTS.filter(x=>!folders.has(x.folder)).concat(products);\nwindow.SEARCH_INDEX=window.SEARCH_INDEX.filter(x=>!documents.some(d=>d.href===x.href)).concat(documents);\nwindow.PARTS_SEARCH_INDEX=window.PARTS_SEARCH_INDEX.filter(x=>!routes.has(x.href.split("#")[0])).concat(parts);\n})();\n'
write(SITE/'products.js',js+block)
print(json.dumps([{k:x[k] for k in ['code','records_before','records_after','images_before','rows_with_images_after','provided_images','converted_vectors']} for x in audit],ensure_ascii=False,indent=2))
