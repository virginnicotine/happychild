// DXF downloads attached directly to matching detail rows/cards.
(function(){
'use strict';
const ROOT='./downloads/dxf/';
const MAP={
 '000029':[['29.DXF','Основной'],['29-п.DXF','Зеркальный']],
 '000030':[['30.DXF','Основной'],['30-з.DXF','Зеркальный']],
 '000039':[['39.DXF','DXF']],
 '0044СБ':[['110.DXF','DXF']], '04.006.000':[['110.DXF','DXF']], '0074СБ':[['110.DXF','DXF']],
 '000157':[['157.DXF','DXF']], '000160':[['160.DXF','DXF']],
 '000161':[['161-л.DXF','Левый'],['161-п.DXF','Правый']],
 '000162':[['162.DXF','DXF']],
 '000163':[['163.DXF','Основной'],['163-п.DXF','Зеркальный']],
 '000164':[['164.DXF','Основной'],['164-л.DXF','Левый / зеркальный']],
 '000165':[['165.DXF','DXF']], '000187':[['187.DXF','DXF']],
 '000110':[['110.DXF','DXF']],
 '000158':[['158.DXF','DXF']], '000159':[['159.DXF','DXF']],
 '000184':[['184.DXF','DXF']], '000185':[['185.DXF','DXF']],
 '000016':[['16.DXF','Основной'],['16-з.DXF','Зеркальный']],
 '000017':[['17.DXF','Основной'],['17-з.DXF','Зеркальный']],
 '000023':[['23.DXF','Основной'],['23-з.DXF','Зеркальный']]
};
function clean(v){
  return String(v||'').trim().toUpperCase().replace(/Ё/g,'Е').replace(/\.П\.\d+\.[01]$/,'');
}
function files(article){ return MAP[clean(article)]||[]; }
function make(article){
  const list=files(article); if(!list.length) return null;
  const box=document.createElement('div'); box.className='dxf-downloads';
  const label=document.createElement('span'); label.className='dxf-downloads-label'; label.textContent='Чертёж DXF'; box.appendChild(label);
  list.forEach(([file,labelText])=>{
    const a=document.createElement('a'); a.className='dxf-download'; a.href=ROOT+encodeURIComponent(file); a.download=file;
    a.innerHTML='<b>DXF</b><span>'+labelText+'</span><i>↓</i>'; box.appendChild(a);
  });
  return box;
}
function attach(root=document){
  root.querySelectorAll('.v108-item').forEach(item=>{
    if(item.querySelector('.dxf-downloads')) return;
    const art=item.querySelector('.v108-art')?.textContent; const box=make(art); if(box) item.querySelector('.v108-main')?.appendChild(box);
  });
  root.querySelectorAll('.component-item').forEach(item=>{
    if(item.querySelector('.dxf-downloads')) return;
    const body=item.querySelector('div'); const art=body?.querySelector('strong')?.textContent; const box=make(art); if(box) body.appendChild(box);
  });
  root.querySelectorAll('.part-card').forEach(item=>{
    if(item.querySelector('.dxf-downloads')) return;
    const body=item.querySelector(':scope > div:last-child'); const art=body?.querySelector('strong')?.textContent; const box=make(art); if(box) body.appendChild(box);
  });
  root.querySelectorAll('.assembly-table tbody tr').forEach(row=>{
    if(row.querySelector('.dxf-downloads')) return;
    const cell=row.cells && row.cells[0]; if(!cell) return; const box=make(cell.textContent); if(box) cell.appendChild(box);
  });
}
attach();
let queued=false;
new MutationObserver(()=>{ if(queued) return; queued=true; requestAnimationFrame(()=>{ queued=false; attach(); }); }).observe(document.body,{childList:true,subtree:true});
window.attachDxfDownloads=attach; window.FactoryDxf={files,clean};
})();
