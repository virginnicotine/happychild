(function(){
  'use strict';
  const wrapper=document.createElement('div');wrapper.className='pdf-preview-backdrop';wrapper.hidden=true;
  wrapper.innerHTML='<section class="pdf-preview-dialog" role="dialog" aria-modal="true" aria-label="Просмотр PDF"><header><strong>Предварительный просмотр PDF</strong><button type="button" data-close>Закрыть</button></header><iframe title="PDF-документ"></iframe><footer><a class="site-tool-button primary" data-save download>Скачать PDF</a></footer></section>';
  document.body.append(wrapper);
  const frame=wrapper.querySelector('iframe'),save=wrapper.querySelector('[data-save]');
  function close(){wrapper.hidden=true;frame.removeAttribute('src')}
  wrapper.querySelector('[data-close]').addEventListener('click',close);
  wrapper.addEventListener('click',e=>{if(e.target===wrapper)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!wrapper.hidden)close()});
  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');if(!a||wrapper.contains(a))return;
    const u=new URL(a.href,location.href);if(u.origin!==location.origin||!/\.pdf$/i.test(u.pathname))return;
    e.preventDefault();frame.src=u.href;save.href=u.href;save.download=decodeURIComponent(u.pathname.split('/').pop());wrapper.hidden=false;
  });
})();
