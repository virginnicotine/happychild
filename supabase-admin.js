import {profile,call} from './supabase-client.js';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p=await profile();
if(!p){location.replace('./index.html');throw Error('Нет доступа');}
// Сотрудники попадают в свой кабинет, а не на главную
if(p.role!=='admin'){location.replace('./cabinet.html');throw Error('Только для администратора');}
if($('adminName'))$('adminName').textContent=p.name||p.login;

const STATUS={new:'Новая',reviewing:'На рассмотрении',resolved:'Решена',rejected:'Отклонена'};
const ROLE={user:'Сотрудник',manager:'Руководитель',admin:'Администратор'};
const fmt=d=>d?new Date(d).toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'}):'';

// Переключение вкладок (работает и без cabinet-ui.js)
document.querySelectorAll('[data-cabinet-tab]').forEach(b=>b.addEventListener('click',()=>{
  const t=b.dataset.cabinetTab;
  document.querySelectorAll('[data-cabinet-tab]').forEach(x=>x.classList.toggle('active',x===b));
  document.querySelectorAll('[data-cabinet-panel]').forEach(s=>{s.hidden=s.dataset.cabinetPanel!==t;});
}));

function userRow(u){
  return `<tr><td>${esc(u.name)}</td><td>${esc(u.login)}</td>
  <td><select data-role="${esc(u.id)}">${['user','manager','admin'].map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${ROLE[r]}</option>`).join('')}</select></td>
  <td>${u.blocked?'Заблокирован':'Активен'}</td>
  <td><button data-block="${esc(u.id)}" data-state="${!u.blocked}">${u.blocked?'Разблокировать':'Блокировать'}</button>
  <button data-warn="${esc(u.id)}">Предупредить</button>
  <button data-reset="${esc(u.id)}" data-mode="email" title="Отправить на email письмо со ссылкой для нового пароля">Письмо для сброса</button>
  <button data-reset="${esc(u.id)}" data-mode="temp" title="Задать временный пароль, который вы передадите сотруднику">Временный пароль</button></td></tr>`;
}

function complaintCard(c){
  const id=esc(c.id),who=c.author_name||c.author_login||'Неизвестный сотрудник';
  const thread=(c.replies||[]).length?`<div class="c-thread">${c.replies.map(r=>`<div class="c-msg ${r.author_id===c.author_id?'':'c-staff'}"><small>${r.author_id===c.author_id?esc(who):esc(r.author_name||'Администрация')} · ${fmt(r.created_at)}</small>${esc(r.message)}</div>`).join('')}</div>`:'';
  return `<article>
    <div class="c-head"><b>${esc(who)}</b>${c.author_login?`<span class="c-login">@${esc(c.author_login)}</span>`:''}<span class="c-status c-${esc(c.status)}">${esc(STATUS[c.status]||c.status)}</span><span class="c-date">${fmt(c.created_at)}</span></div>
    <p class="c-text">${esc(c.message)}</p>${thread}
    <div class="c-reply"><textarea data-reply-text="${id}" maxlength="4000" placeholder="Ответить сотруднику…"></textarea><button data-reply-send="${id}">Отправить ответ</button></div>
    <p class="c-actions">Статус: <button data-complaint="${id}" data-cstatus="reviewing">В работе</button><button data-complaint="${id}" data-cstatus="resolved">Решена</button><button data-complaint="${id}" data-cstatus="rejected">Ложная / отклонена</button></p>
  </article>`;
}

async function refresh(){
  try{
    const d=await call('admin_list');
    $('status').textContent='Управление аккаунтами через Supabase';
    $('users').innerHTML=d.users.map(userRow).join('');
    $('complaints').innerHTML=d.complaints.map(complaintCard).join('')||'<p>Жалоб пока нет</p>';
    $('audit').innerHTML=d.audit.map(a=>`<p>${esc(a.created_at)} · ${esc(a.action)} · ${esc(a.details&&JSON.stringify(a.details))}</p>`).join('')||'Событий пока нет';
    if($('userCount'))$('userCount').textContent=d.users.length;
    if($('complaintCount'))$('complaintCount').textContent=d.complaints.length;
  }catch(e){$('status').textContent=e.message;}
}

addEventListener('change',async e=>{const x=e.target;if(!x.matches('[data-role]'))return;try{await call('admin_action',{type:'role',user_id:x.dataset.role,value:x.value});await refresh()}catch(err){alert(err.message);await refresh()}});

addEventListener('click',async e=>{
  const x=e.target.closest('button');if(!x)return;
  try{
    if(x.dataset.block){
      if(!confirm('Изменить блокировку пользователя?'))return;
      await call('admin_action',{type:'block',user_id:x.dataset.block,value:x.dataset.state==='true'});
    }else if(x.dataset.warn){
      const reason=prompt('Причина предупреждения');if(!reason)return;
      await call('admin_action',{type:'warning',user_id:x.dataset.warn,reason});
    }else if(x.dataset.reset){
      if(x.dataset.mode==='temp'){
        if(!confirm('Задать временный пароль? Прежний пароль сразу перестанет работать.'))return;
        const r=await call('admin_action',{type:'reset_password',user_id:x.dataset.reset,mode:'temp'});
        prompt('Временный пароль (показывается один раз). Скопируйте и передайте сотруднику, он сможет сменить его в своём кабинете, вкладка «Пароль»:',r.temp_password);
      }else{
        if(!confirm('Отправить на email сотрудника письмо со ссылкой для нового пароля?'))return;
        await call('admin_action',{type:'reset_password',user_id:x.dataset.reset,mode:'email'});
        alert('Письмо отправлено. Оно может прийти не сразу, попросите проверить и папку «Спам».');
      }
      return;
    }else if(x.dataset.replySend){
      const box=document.querySelector(`[data-reply-text="${CSS.escape(x.dataset.replySend)}"]`);
      const message=(box&&box.value||'').trim();
      if(!message){alert('Напишите текст ответа.');return;}
      x.disabled=true;
      try{await call('admin_action',{type:'reply',complaint_id:x.dataset.replySend,message});}finally{x.disabled=false;}
    }else if(x.dataset.complaint){
      await call('admin_action',{type:'complaint',complaint_id:x.dataset.complaint,status:x.dataset.cstatus});
    }else return;
    await refresh();
  }catch(err){alert(err.message)}
});
await refresh();
