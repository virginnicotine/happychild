import {createClient} from 'npm:@supabase/supabase-js@2';
const URL=Deno.env.get('SUPABASE_URL')!;const PUB=Deno.env.get('SUPABASE_ANON_KEY')!;const SERVICE=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const headers={'Access-Control-Allow-Origin':'https://kl1huq.sourcecraft.site','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const send=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response(null,{headers});if(req.method!=='POST')return send({error:'Method not allowed'},405);
if(req.headers.get('origin')&&req.headers.get('origin')!=='https://kl1huq.sourcecraft.site')return send({error:'Forbidden origin'},403);
let body:any;try{body=await req.json()}catch{return send({error:'Bad request'},400)}
const admin=createClient(URL,SERVICE,{auth:{persistSession:false}});
try{
if(body.action==='login'){
const login=String(body.login||'').trim();const password=String(body.password||'');if(!/^[A-Za-z0-9_.-]{3,24}$/.test(login)||password.length<8)return send({error:'Неверный логин или пароль'},401);
// The SQL rate limiter must be installed before this function is deployed.
const {data:allowed,error:rateError}=await admin.rpc('site_login_rate_limit',{p_login:login});
if(rateError){console.error('rate limit unavailable',rateError.message);return send({error:'Вход временно недоступен. Обратитесь к администратору.'},503);}
if(!allowed)return send({error:'Слишком много попыток входа. Попробуйте через 15 минут.'},429);
const {data:matches,error:lookupError}=await admin.rpc('site_lookup_login',{p_login:login});
if(lookupError){console.error('login lookup unavailable',lookupError.message);return send({error:'Вход временно недоступен.'},503);}
const u=matches?.[0];if(!u||u.blocked)return send({error:'Неверный логин или пароль'},401);
const anon=createClient(URL,PUB,{auth:{persistSession:false}});const {data,error}=await anon.auth.signInWithPassword({email:u.email,password});if(error||!data.session)return send({error:'Неверный логин или пароль. Убедитесь, что email подтверждён.'},401);
return send({access_token:data.session.access_token,refresh_token:data.session.refresh_token});}
const token=(req.headers.get('authorization')||'').replace(/^Bearer\s+/i,'');if(!token)return send({error:'Авторизуйтесь'},401);
const {data:{user},error:authError}=await admin.auth.getUser(token);if(authError||!user)return send({error:'Недействительная сессия'},401);
const {data:actor}=await admin.from('profiles').select('id,role,blocked').eq('id',user.id).single();if(!actor||actor.blocked||actor.role!=='admin')return send({error:'Только администратор'},403);
if(body.action==='admin_list'){
const [u,c,a]=await Promise.all([admin.from('profiles').select('id,name,login,role,blocked,email').order('created_at',{ascending:false}).limit(500),admin.from('complaints').select('*').order('created_at',{ascending:false}).limit(100),admin.from('audit_logs').select('*').order('created_at',{ascending:false}).limit(50)]);
if(u.error||c.error||a.error)throw Error(u.error?.message||c.error?.message||a.error?.message);
return send({users:u.data,complaints:c.data,audit:a.data});}
if(body.action==='admin_action'){
const type=String(body.type||'');const id=String(body.user_id||'');let detail:Record<string,unknown>={};let target=id||null;
if(type==='role'||type==='block'||type==='warning'){
const {data:targetUser}=await admin.from('profiles').select('id,role,blocked').eq('id',id).maybeSingle();if(!targetUser)return send({error:'Пользователь не найден'},404);
if(id===actor.id&&(type==='block'||type==='role'))return send({error:'Нельзя менять свою роль или блокировать себя'},400);
if(type==='role') {if(!['admin','manager','user'].includes(body.value))return send({error:'Недопустимая роль'},400);const {error}=await admin.from('profiles').update({role:body.value}).eq('id',id);if(error)throw error;detail={role:body.value};}
if(type==='block'){if(typeof body.value!=='boolean')return send({error:'Неверный статус'},400);const {error}=await admin.from('profiles').update({blocked:body.value}).eq('id',id);if(error)throw error;detail={blocked:body.value};}
if(type==='warning'){const reason=String(body.reason||'').trim();if(reason.length<3||reason.length>2000)return send({error:'Причина: от 3 до 2000 символов'},400);const {error}=await admin.from('warnings').insert({user_id:id,issued_by:actor.id,reason});if(error)throw error;detail={reason};}
}else if(type==='complaint'){
if(!['resolved','rejected','reviewing'].includes(body.status))return send({error:'Неверный статус'},400);const {data,error}=await admin.from('complaints').update({status:body.status}).eq('id',body.complaint_id).select('author_id').single();if(error)throw error;target=data.author_id;detail={complaint_id:body.complaint_id,status:body.status};
}else return send({error:'Неизвестное действие'},400);
const {error:auditError}=await admin.from('audit_logs').insert({actor_id:actor.id,target_id:target,action:type,details:detail});if(auditError)console.error('Audit log insert failed',auditError.message);return send({ok:true});}
return send({error:'Неизвестная операция'},400);
}catch(e){console.error(e);return send({error:'Ошибка сервера. Проверьте логи Edge Function.'},500)}
});
