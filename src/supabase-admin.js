import {profile,call} from './supabase-client.js';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const p=await profile();if(!p){location.replace('./index.html');throw Error('Войдите в аккаунт');}
const admin=p.role==='admin';$('adminName').textContent=p.name||p.login||'Сотрудник';$('cabinetRole').textContent=admin?'👑 Администратор':p.role==='manager'?'🌿 Руководитель':'🌿 Сотрудник';
for(const e of document.querySelectorAll('[data-admin-only]'))e.hidden=!admin;
if(!admin){document.querySelector('[data-cabinet-tab="complaints"]').click();document.querySelector('.cabinet-stats').hidden=true;}
const status=$('status');
async function refresh(){try{
const d=await call(admin?'admin_list':'my_dashboard');
if(admin){$('userCount').textContent=d.users.length;$('complaintCount').textContent=d.complaints.length;
$('users').innerHTML=d.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.login)}</td><td><select data-role="${esc(u.id)}">${['user','manager','admin'].map(r=>`<option value="${r}" ${u.role===r?'selected':''}>${({user:'Сотрудник',manager:'Руководитель',admin:'Администратор'})[r]}</option>`).join('')}</select></td><td>${u.blocked?'Заблокирован':'Активен'}</td><td><button data-block="${esc(u.id)}" data-state="${!u.blocked}">${u.blocked?'Разблокировать':'Блокировать'}</button><button data-warn="${esc(u.id)}">Предупредить</button></td></tr>`).join('');
$('audit').innerHTML=d.audit.map(a=>`<p>${esc(a.created_at)} · ${esc(a.action)} · ${esc(a.details&&JSON.stringify(a.details))}</p>`).join('')||'Событий пока нет';}
else{document.querySelector('[data-cabinet-panel="complaints"] h2').textContent='📨 Мои обращения и жалобы';}
$('complaints').innerHTML=d.complaints.map(c=>`<article><p>${admin?'<b>'+esc(c.author_login||c.author_id)+'</b>: ':''}${esc(c.message)}</p><p>Статус: ${esc(c.status)} ${admin?`<button data-complaint="${esc(c.id)}" data-cstatus="resolved">Решена</button><button data-complaint="${esc(c.id)}" data-cstatus="rejected">Отклонена</button>`:''}</p></article>`).join('')||'Обращений пока нет';
if(!admin){$('warningsPanel').hidden=false;$('myWarnings').innerHTML=d.warnings.map(w=>`<article><b>⚠️ ${esc(new Date(w.created_at).toLocaleDateString('ru-RU'))}</b><p>${esc(w.reason)}</p></article>`).join('')||'Предупреждений нет';}
status.textContent='Данные синхронизированы с Supabase';}catch(e){status.textContent='Ошибка загрузки: '+e.message;}}
if(admin){addEventListener('change',async e=>{const x=e.target;if(!x.matches('[data-role]'))return;try{await call('admin_action',{type:'role',user_id:x.dataset.role,value:x.value});await refresh()}catch(err){alert(err.message);await refresh()}});
addEventListener('click',async e=>{const x=e.target.closest('button');if(!x)return;try{if(x.dataset.block){if(!confirm('Изменить блокировку пользователя?'))return;await call('admin_action',{type:'block',user_id:x.dataset.block,value:x.dataset.state==='true'});}else if(x.dataset.warn){const reason=prompt('Причина предупреждения');if(!reason)return;await call('admin_action',{type:'warning',user_id:x.dataset.warn,reason});}else if(x.dataset.complaint){await call('admin_action',{type:'complaint',complaint_id:x.dataset.complaint,status:x.dataset.cstatus});}else return;await refresh();}catch(err){alert(err.message)}});}
await refresh();
