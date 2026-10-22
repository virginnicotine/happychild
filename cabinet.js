import {supabase,profile,call} from './supabase-client.js';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p=await profile();
if(!p){location.replace('./index.html');throw Error('Нет доступа');}
if(p.role==='admin'){location.replace('./admin.html');throw Error('Администратор работает в своём кабинете');}

const STATUS={new:'Отправлена',reviewing:'На рассмотрении',resolved:'Решена',rejected:'Отклонена'};
const ROLE={user:'Сотрудник',manager:'Руководитель'};
const fmt=d=>d?new Date(d).toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'}):'';
$('userName').textContent=p.name||p.login;
$('cabinetRole').textContent=ROLE[p.role]||'Сотрудник';
$('cabinetInitial').textContent=(p.name||p.login||'✦').trim().charAt(0).toUpperCase();

// Вкладки
function openTab(t){
  document.querySelectorAll('[data-cabinet-tab]').forEach(x=>x.classList.toggle('active',x.dataset.cabinetTab===t));
  document.querySelectorAll('[data-cabinet-panel]').forEach(s=>{s.hidden=s.dataset.cabinetPanel!==t;});
}
document.querySelectorAll('[data-cabinet-tab]').forEach(b=>b.addEventListener('click',()=>openTab(b.dataset.cabinetTab)));

const note=(el,text,kind)=>{el.textContent=text;el.className='c-hint'+(kind?' c-'+kind:'');};

function complaintCard(c){
  const id=esc(c.id),open=['new','reviewing'].includes(c.status);
  const thread=c.replies.length?`<div class="c-thread">${c.replies.map(r=>`<div class="c-msg ${r.from==='me'?'':'c-staff'}"><small>${r.from==='me'?'Вы':'Ответ администрации'} · ${fmt(r.created_at)}</small>${esc(r.message)}</div>`).join('')}</div>`:'';
  const reply=open?`<div class="c-reply"><textarea data-reply-text="${id}" maxlength="4000" placeholder="Дополнить или ответить…"></textarea><button data-reply-send="${id}">Отправить</button></div>`:'<p class="c-hint">Жалоба закрыта. Если вопрос остался, напишите новую.</p>';
  return `<article><div class="c-head"><span class="c-status c-${esc(c.status)}">${esc(STATUS[c.status]||c.status)}</span><span class="c-date">${fmt(c.created_at)}</span></div><p class="c-text">${esc(c.message)}</p>${thread}${reply}</article>`;
}

async function refresh(){
  try{
    const d=await call('me_overview');
    $('status').textContent='';
    $('complaints').innerHTML=d.complaints.map(complaintCard).join('')||'<p>Вы пока не писали жалоб. Нажмите «Новая жалоба», если нужно сообщить о проблеме.</p>';
    $('warnings').innerHTML=d.warnings.map(w=>`<article><div class="c-head"><b>⚠️ Предупреждение</b><span class="c-date">${fmt(w.created_at)}</span></div><p class="c-text">${esc(w.reason)}</p></article>`).join('')||'<p>Предупреждений нет. Так держать!</p>';
    $('complaintCount').textContent=d.complaints.length;
    $('warningCount').textContent=d.warnings.length;
  }catch(e){$('status').textContent=e.message;}
}

addEventListener('click',async e=>{
  const x=e.target.closest('button');if(!x)return;
  if(x.dataset.replySend){
    const box=document.querySelector(`[data-reply-text="${CSS.escape(x.dataset.replySend)}"]`);
    const message=(box&&box.value||'').trim();
    if(!message){alert('Напишите текст ответа.');return;}
    x.disabled=true;
    try{await call('me_complaint_reply',{complaint_id:x.dataset.replySend,message});await refresh();}
    catch(err){alert(err.message);}finally{x.disabled=false;}
  }
});

$('newSend').addEventListener('click',async()=>{
  const message=$('newText').value.trim();
  if(message.length<5){note($('newHint'),'Опишите проблему подробнее: минимум 5 символов.','err');return;}
  $('newSend').disabled=true;
  try{
    await call('me_complaint_create',{message});
    $('newText').value='';note($('newHint'),'От 5 до 5000 символов.');
    await refresh();openTab('complaints');
  }catch(err){note($('newHint'),err.message,'err');}
  finally{$('newSend').disabled=false;}
});

$('pwSend').addEventListener('click',async()=>{
  const a=$('pw1').value,b=$('pw2').value;
  if(a.length<8||!/[A-Za-zА-Яа-яЁё]/.test(a)||!/\d/.test(a)){note($('pwHint'),'Пароль: не короче 8 символов, нужны и буквы, и цифры.','err');return;}
  if(a!==b){note($('pwHint'),'Пароли не совпадают.','err');return;}
  $('pwSend').disabled=true;
  try{
    const {error}=await supabase.auth.updateUser({password:a});
    if(error)throw error;
    $('pw1').value='';$('pw2').value='';note($('pwHint'),'Пароль изменён. В следующий раз входите с новым паролем.','ok');
  }catch(err){note($('pwHint'),err.message||'Не удалось сменить пароль.','err');}
  finally{$('pwSend').disabled=false;}
});

await refresh();
