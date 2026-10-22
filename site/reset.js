import {supabase} from './supabase-client.js';
const $=id=>document.getElementById(id);
let shown=false;
function showForm(){if(shown)return;shown=true;$('resetBad').hidden=true;$('resetForm').hidden=false;$('resetLead').textContent='Придумайте новый пароль для входа.';}
function showBad(){if(shown)return;$('resetForm').hidden=true;$('resetBad').hidden=false;$('resetLead').textContent='Не удалось подтвердить ссылку.';}
const note=(text,kind)=>{const h=$('resetHint');h.textContent=text;h.className='c-hint'+(kind?' c-'+kind:'');};
// Ссылка из письма создаёт временную сессию восстановления
supabase.auth.onAuthStateChange((ev,session)=>{if((ev==='PASSWORD_RECOVERY'||ev==='SIGNED_IN')&&session)showForm();});
setTimeout(async()=>{const {data:{session}}=await supabase.auth.getSession();if(session)showForm();else showBad();},2000);
$('resetSend').addEventListener('click',async()=>{
  const a=$('pw1').value,b=$('pw2').value;
  if(a.length<8||!/[A-Za-zА-Яа-яЁё]/.test(a)||!/\d/.test(a)){note('Пароль: не короче 8 символов, нужны и буквы, и цифры.','err');return;}
  if(a!==b){note('Пароли не совпадают.','err');return;}
  $('resetSend').disabled=true;
  try{
    const {error}=await supabase.auth.updateUser({password:a});
    if(error)throw error;
    note('Пароль изменён. Сейчас откроется страница входа.','ok');
    await supabase.auth.signOut();
    setTimeout(()=>location.replace('./index.html'),1800);
  }catch(err){note(err.message||'Не удалось сохранить пароль.','err');$('resetSend').disabled=false;}
});
