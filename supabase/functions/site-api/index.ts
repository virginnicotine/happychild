import { createClient } from 'npm:@supabase/supabase-js@2';

const URL = Deno.env.get('SUPABASE_URL')!;
const PUB = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ALLOWED_ORIGIN = 'https://kl1huq.sourcecraft.site';

const headers = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
};

const send = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers });
  if (req.method !== 'POST') return send({ error: 'Method not allowed' }, 405);

  const origin = req.headers.get('origin');
  if (origin && origin !== ALLOWED_ORIGIN) {
    return send({ error: 'Forbidden origin' }, 403);
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return send({ error: 'Bad request' }, 400);
  }

  const admin = createClient(URL, SERVICE, {
    auth: { persistSession: false },
  });

  try {
    // Авторизация по логину и паролю.
    if (body.action === 'login') {
      const login = String(body.login || '').trim();
      const password = String(body.password || '');

      if (!/^[A-Za-z0-9_.-]{3,24}$/.test(login) || password.length < 8) {
        return send({ error: 'Неверный логин или пароль' }, 401);
      }

      const { data: allowed, error: rateError } = await admin.rpc(
        'site_login_rate_limit',
        { p_login: login },
      );

      if (rateError) {
        console.error('rate limit unavailable', rateError.message);
        return send({
          error: 'Вход временно недоступен. Обратитесь к администратору.',
        }, 503);
      }

      if (!allowed) {
        return send({
          error: 'Слишком много попыток входа. Попробуйте через 15 минут.',
        }, 429);
      }

      const { data: matches, error: lookupError } = await admin.rpc(
        'site_lookup_login',
        { p_login: login },
      );

      if (lookupError) {
        console.error('login lookup unavailable', lookupError.message);
        return send({ error: 'Вход временно недоступен.' }, 503);
      }

      const account = matches?.[0];
      if (!account) return send({ error: 'Неверный логин или пароль' }, 401);

      const anon = createClient(URL, PUB, {
        auth: { persistSession: false },
      });

      const { data, error } = await anon.auth.signInWithPassword({
        email: account.email,
        password,
      });

      if (error || !data.session) {
        return send({
          error: 'Неверный логин или пароль. Убедитесь, что email подтверждён.',
        }, 401);
      }

      if (account.blocked) {
        return send({
          error: 'Вы в чёрном списке сайта. Обратитесь к администратору. Контакты указаны в разделе «Помощь со входом».',
          code: 'BLACKLISTED',
        }, 403);
      }

      return send({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });
    }

    // Все остальные действия требуют действующей сессии.
    const token = (req.headers.get('authorization') || '')
      .replace(/^Bearer\s+/i, '');

    if (!token) return send({ error: 'Авторизуйтесь' }, 401);

    const {
      data: { user },
      error: authError,
    } = await admin.auth.getUser(token);

    if (authError || !user) {
      return send({ error: 'Недействительная сессия' }, 401);
    }

    const { data: actor, error: actorError } = await admin
      .from('profiles')
      .select('id,role,blocked,name,login')
      .eq('id', user.id)
      .maybeSingle();

    if (actorError) throw actorError;
    if (!actor || actor.blocked) {
      return send({
        error: 'Доступ ограничен. Обратитесь к администратору.',
      }, 403);
    }

    // Личный кабинет сотрудника. Поддерживаются оба имени действия,
    // чтобы не ломать старые версии фронтенда.
    if (['my_dashboard', 'me_overview'].includes(body.action)) {
      const [complaintsResult, warningsResult] = await Promise.all([
        admin
          .from('complaints')
          .select('id,author_id,message,status,created_at')
          .eq('author_id', actor.id)
          .order('created_at', { ascending: false })
          .limit(100),
        admin
          .from('warnings')
          .select('reason,created_at')
          .eq('user_id', actor.id)
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (complaintsResult.error || warningsResult.error) {
        throw Error(
          complaintsResult.error?.message || warningsResult.error?.message,
        );
      }

      const complaintRows = complaintsResult.data || [];
      const complaintIds = complaintRows.map((item) => item.id);
      let replies: any[] = [];

      if (complaintIds.length) {
        const { data, error } = await admin
          .from('complaint_replies')
          .select('id,complaint_id,author_id,message,created_at')
          .in('complaint_id', complaintIds)
          .order('created_at', { ascending: true });

        if (error) throw error;
        replies = data || [];
      }

      const authorIds = [
        ...new Set(replies.map((reply) => reply.author_id).filter(Boolean)),
      ];
      let replyAuthors: any[] = [];

      if (authorIds.length) {
        const { data, error } = await admin
          .from('profiles')
          .select('id,name,login')
          .in('id', authorIds);

        if (error) throw error;
        replyAuthors = data || [];
      }

      const complaints = complaintRows.map((complaint) => ({
        ...complaint,
        replies: replies
          .filter((reply) => reply.complaint_id === complaint.id)
          .map((reply) => {
            const author = replyAuthors.find(
              (profile) => profile.id === reply.author_id,
            );
            return {
              ...reply,
              from: reply.author_id === actor.id ? 'me' : 'staff',
              author_name: author?.name || author?.login || 'Администрация',
            };
          }),
      }));

      return send({
        complaints,
        warnings: warningsResult.data || [],
      });
    }

    // Создание жалобы: оба названия поддерживаются для совместимости.
    if (['submit_complaint', 'me_complaint_create'].includes(body.action)) {
      const subject = String(body.subject || '').trim().slice(0, 150);
      const message = String(body.message || '').trim();

      if (message.length < 3 || message.length > 5000) {
        return send({
          error: 'Текст жалобы должен содержать от 3 до 5000 символов',
        }, 400);
      }

      const value = (subject ? `${subject}\n` : '') + message;
      const { error } = await admin.from('complaints').insert({
        author_id: actor.id,
        message: value,
      });

      if (error) throw error;
      return send({ ok: true });
    }

    // Сотрудник может ответить в своей открытой жалобе.
    if (body.action === 'me_complaint_reply') {
      const complaintId = String(body.complaint_id || '');
      const message = String(body.message || '').trim();

      if (!complaintId) {
        return send({ error: 'Не указана жалоба' }, 400);
      }
      if (message.length < 1 || message.length > 4000) {
        return send({
          error: 'Сообщение должно содержать от 1 до 4000 символов',
        }, 400);
      }

      const { data: complaint, error: complaintError } = await admin
        .from('complaints')
        .select('id,author_id,status')
        .eq('id', complaintId)
        .maybeSingle();

      if (complaintError) throw complaintError;
      if (!complaint || complaint.author_id !== actor.id) {
        return send({ error: 'Жалоба не найдена' }, 404);
      }
      if (['resolved', 'rejected'].includes(complaint.status)) {
        return send({ error: 'Эта жалоба уже закрыта' }, 400);
      }

      const { error } = await admin.from('complaint_replies').insert({
        complaint_id: complaintId,
        author_id: actor.id,
        message,
      });

      if (error) throw error;
      return send({ ok: true });
    }

    // Все административные операции доступны только администратору.
    if (actor.role !== 'admin') {
      return send({ error: 'Только администратор' }, 403);
    }

    if (body.action === 'admin_list') {
      const [usersResult, complaintsResult, auditResult] = await Promise.all([
        admin
          .from('profiles')
          .select('id,name,login,role,blocked,email')
          .order('created_at', { ascending: false })
          .limit(500),
        admin
          .from('complaints')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
        admin
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (
        usersResult.error ||
        complaintsResult.error ||
        auditResult.error
      ) {
        throw Error(
          usersResult.error?.message ||
            complaintsResult.error?.message ||
            auditResult.error?.message,
        );
      }

      const complaintRows = complaintsResult.data || [];
      const complaintIds = complaintRows.map((item) => item.id);
      let replies: any[] = [];

      if (complaintIds.length) {
        const { data, error } = await admin
          .from('complaint_replies')
          .select('id,complaint_id,author_id,message,created_at')
          .in('complaint_id', complaintIds)
          .order('created_at', { ascending: true });

        if (error) throw error;
        replies = data || [];
      }

      const profileIds = [
        ...new Set([
          ...complaintRows.map((item) => item.author_id).filter(Boolean),
          ...replies.map((reply) => reply.author_id).filter(Boolean),
        ]),
      ];
      let profiles: any[] = [];

      if (profileIds.length) {
        const { data, error } = await admin
          .from('profiles')
          .select('id,name,login')
          .in('id', profileIds);

        if (error) throw error;
        profiles = data || [];
      }

      const complaints = complaintRows.map((complaint) => {
        const author = profiles.find(
          (profile) => profile.id === complaint.author_id,
        );

        return {
          ...complaint,
          author_name: author?.name || author?.login || 'Сотрудник',
          author_login: author?.login || '',
          replies: replies
            .filter((reply) => reply.complaint_id === complaint.id)
            .map((reply) => {
              const replyAuthor = profiles.find(
                (profile) => profile.id === reply.author_id,
              );
              return {
                ...reply,
                author_name:
                  replyAuthor?.name ||
                  replyAuthor?.login ||
                  'Администрация',
              };
            }),
        };
      });

      return send({
        users: usersResult.data || [],
        complaints,
        audit: auditResult.data || [],
      });
    }

    if (body.action === 'admin_action') {
      const type = String(body.type || '');
      const id = String(body.user_id || '');
      let detail: Record<string, unknown> = {};
      let target: string | null = id || null;

      if (['role', 'block', 'warning'].includes(type)) {
        const { data: targetUser, error } = await admin
          .from('profiles')
          .select('id,role,blocked')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        if (!targetUser) {
          return send({ error: 'Пользователь не найден' }, 404);
        }
        if (
          id === actor.id &&
          (type === 'block' || type === 'role')
        ) {
          return send({
            error: 'Нельзя менять свою роль или блокировать себя',
          }, 400);
        }

        if (type === 'role') {
          if (!['admin', 'manager', 'user'].includes(body.value)) {
            return send({ error: 'Недопустимая роль' }, 400);
          }

          const { error: updateError } = await admin
            .from('profiles')
            .update({ role: body.value })
            .eq('id', id);

          if (updateError) throw updateError;
          detail = { role: body.value };
        }

        if (type === 'block') {
          if (typeof body.value !== 'boolean') {
            return send({ error: 'Неверный статус' }, 400);
          }

          const { error: updateError } = await admin
            .from('profiles')
            .update({ blocked: body.value })
            .eq('id', id);

          if (updateError) throw updateError;
          detail = { blocked: body.value };
        }

        if (type === 'warning') {
          const reason = String(body.reason || '').trim();

          if (reason.length < 3 || reason.length > 2000) {
            return send({
              error: 'Причина: от 3 до 2000 символов',
            }, 400);
          }

          const { error: insertError } = await admin.from('warnings').insert({
            user_id: id,
            issued_by: actor.id,
            reason,
          });

          if (insertError) throw insertError;
          detail = { reason };
        }
      } else if (type === 'reply') {
        const complaintId = String(body.complaint_id || '');
        const message = String(body.message || '').trim();

        if (!complaintId) {
          return send({ error: 'Не указана жалоба' }, 400);
        }
        if (message.length < 1 || message.length > 4000) {
          return send({
            error: 'Ответ должен содержать от 1 до 4000 символов',
          }, 400);
        }

        const { data: complaint, error: complaintError } = await admin
          .from('complaints')
          .select('id,author_id')
          .eq('id', complaintId)
          .maybeSingle();

        if (complaintError) throw complaintError;
        if (!complaint) {
          return send({ error: 'Жалоба не найдена' }, 404);
        }

        const { error: replyError } = await admin
          .from('complaint_replies')
          .insert({
            complaint_id: complaintId,
            author_id: actor.id,
            message,
          });

        if (replyError) throw replyError;

        target = complaint.author_id;
        detail = {
          complaint_id: complaintId,
          message_length: message.length,
        };
      } else if (type === 'complaint') {
        if (!['resolved', 'rejected', 'reviewing'].includes(body.status)) {
          return send({ error: 'Неверный статус' }, 400);
        }

        const { data, error } = await admin
          .from('complaints')
          .update({ status: body.status })
          .eq('id', body.complaint_id)
          .select('author_id')
          .single();

        if (error) throw error;
        target = data.author_id;
        detail = {
          complaint_id: body.complaint_id,
          status: body.status,
        };
      } else {
        return send({ error: 'Неизвестное действие' }, 400);
      }

      const { error: auditError } = await admin.from('audit_logs').insert({
        actor_id: actor.id,
        target_id: target,
        action: type,
        details: detail,
      });

      if (auditError) {
        console.error('Audit log insert failed', auditError.message);
      }

      return send({ ok: true });
    }

    return send({ error: 'Неизвестная операция' }, 400);
  } catch (error) {
    console.error('site-api error:', error);
    return send({
      error: 'Ошибка сервера. Проверьте логи Edge Function.',
    }, 500);
  }
});
