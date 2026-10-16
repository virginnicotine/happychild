// PDF открываются штатным просмотрщиком браузера в отдельной вкладке.
document.addEventListener('click', e => {
  const a=e.target.closest('a[href]'); if(!a)return;
  const u=new URL(a.href,location.href);
  if(u.origin===location.origin && /\.pdf$/i.test(u.pathname)){a.removeAttribute('download');a.target='_blank';a.rel='noopener noreferrer';}
},true);
