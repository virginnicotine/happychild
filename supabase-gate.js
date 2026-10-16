import {supabase,profile} from './supabase-client.js';
const get=async()=>{const p=await profile();if(!p)throw Error('Нет доступа');const prior=JSON.parse(sessionStorage.getItem('factorySystemDemoSession')||'null');sessionStorage.setItem('factorySystemDemoSession',JSON.stringify({id:p.id,login:p.login,name:p.name,role:p.role,supabase:true}));if(!prior||prior.id!==p.id||prior.role!==p.role)location.reload();return p};
try {const p=await get();if(document.body)document.body.style.visibility='visible';else document.documentElement.style.visibility='visible';
// У сотрудника также есть личный кабинет.
if(!location.pathname.endsWith('/admin.html')){
  const addCabinet=()=>{const header=document.querySelector('.header');if(header&&!header.querySelector('[data-open-cabinet]')){const a=document.createElement('a');a.href='./admin.html';a.textContent='👤 Личный кабинет';a.className='header-action cabinet-link';a.setAttribute('data-open-cabinet','');header.append(a);}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',addCabinet,{once:true});else addCabinet();
}
// refresh role / block every minute, force logout if access is revoked
setInterval(async()=>{const next=await get().catch(()=>null);if(!next){await supabase.auth.signOut();sessionStorage.removeItem('factorySystemDemoSession');location.replace('./index.html');}else if(next.role!==p.role)location.reload();},60000);
// legacy logout handler is intercepted without trusting local session
addEventListener('click',async e=>{const el=e.target.closest('[data-supabase-logout]');if(el){e.preventDefault();await supabase.auth.signOut();sessionStorage.removeItem('factorySystemDemoSession');location.replace('./index.html');}},true);
}catch(e){sessionStorage.removeItem('factorySystemDemoSession');location.replace('./index.html');}
