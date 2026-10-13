// Чертежи металла (PDF, GIF и др.) из папки metall — кнопки скачивания у деталей с артикулом «…МП».
// Правило: 0028МП → деталь № 28 → все файлы 28.* из папки metall. Индекс собирает tools/build_metal_index.py.
(function(){
'use strict';
const IDX=window.METAL_INDEX; if(!IDX||!IDX.parts) return;
const ROOT=IDX.root;

// «0028МП», «0022МП (чертеж с изменениями)» → '28' / '22'; для остальных артикулов — null.
function metalNumber(article){
  const s=String(article||'').trim().toUpperCase().replace(/Ё/g,'Е');
  const m=s.match(/^0*(\d+)\s*[МM][ПP](?![А-ЯA-Z0-9])/);
  return m?String(parseInt(m[1],10)):null;
}
const files=n=>IDX.parts[String(parseInt(n,10))]||[];
const href=f=>ROOT+f.split('/').map(encodeURIComponent).join('/');

function box(number,opts){
  const list=files(number), wrap=document.createElement('div');
  wrap.className='dxf-downloads metal-downloads';
  const label=document.createElement('span'); label.className='dxf-downloads-label'; label.textContent='Чертежи металла'; wrap.appendChild(label);
  if(!list.length){
    if(!(opts&&opts.showMissing)) return null;
    const none=document.createElement('span'); none.className='metal-missing'; none.textContent='В процессе добавления…'; wrap.appendChild(none);
    return wrap;
  }
  list.forEach(f=>{
    const a=document.createElement('a'); a.className='dxf-download metal-download'; a.dataset.type=f.t;
    a.href=href(f.f); a.download=f.f.split('/').pop(); a.title=f.n?f.l+' · '+f.n:f.f.split('/').pop();
    const kind=f.l.split(' · ')[0], extra=f.l.includes(' · ')?f.l.split(' · ').slice(1).join(' · '):(f.n||'');
    a.innerHTML='<b>'+kind+'</b>'+(extra?'<span></span>':'')+'<i>↓</i>';
    if(extra) a.querySelector('span').textContent=extra;
    wrap.appendChild(a);
  });
  return wrap;
}
function make(article){ const n=metalNumber(article); return n?box(n,{showMissing:true}):null; }

function attach(root=document){
  root.querySelectorAll('.v108-item').forEach(item=>{
    if(item.querySelector('.metal-downloads')) return;
    const art=item.querySelector('.v108-art')?.textContent; const b=make(art); if(b) item.querySelector('.v108-main')?.appendChild(b);
  });
  root.querySelectorAll('.component-item').forEach(item=>{
    if(item.querySelector('.metal-downloads')) return;
    const body=item.querySelector('div'); const art=body?.querySelector('strong')?.textContent; const b=make(art); if(b) body.appendChild(b);
  });
  root.querySelectorAll('.part-card').forEach(item=>{
    if(item.querySelector('.metal-downloads')) return;
    const body=item.querySelector(':scope > div:last-child'); const art=body?.querySelector('strong')?.textContent; const b=make(art); if(b) body.appendChild(b);
  });
  root.querySelectorAll('.assembly-table tbody tr').forEach(row=>{
    if(row.querySelector('.metal-downloads')) return;
    const cell=row.cells&&row.cells[0]; if(!cell) return; const b=make(cell.textContent); if(b) cell.appendChild(b);
  });
}
attach();
let queued=false;
new MutationObserver(()=>{ if(queued) return; queued=true; requestAnimationFrame(()=>{ queued=false; attach(); }); }).observe(document.body,{childList:true,subtree:true});
window.attachMetalDownloads=attach;
window.FactoryMetal={metalNumber,files,box,href};
})();
