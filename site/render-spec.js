/**
 * render-spec.js — рендер карточки изделия из data/spec-*.json
 * Подключается вместо гигантского HTML. Работает с существующими script.js и spec-ui.js.
 */
(function () {
    'use strict';

    var RAL = {
        7024:'#4b4f54',1037:'#f2a900',5024:'#73879a',7047:'#c9cacc',
        8014:'#4b3a2f',6018:'#57a639',2008:'#ed5b2f',1023:'#f5c400',
        9007:'#878581',9005:'#0e0e10',7015:'#51565c',5017:'#063971',3020:'#bb1e10'
    };
    var LABELS = {
        ingredients:'Входящие детали / узлы', length:'Длина, м', width:'Ширина, м',
        height:'Высота, м', volume:'Объём, м³', total_volume:'Объём всего, м³',
        fasteners:'Метизы на 1 комплектующую', m8_each:'М8–10 на 1 комплектующую',
        m8_total:'Всего М8–10', m6_each:'М6 на 1 комплектующую', m6_total:'Всего М6'
    };
    var PLUGS = ['00.001.000','00.002.000','00.003.000','КЧМ6КС','КЧМ8КС','100-100.11КК','П-5.01.01','П-5.01.02','П-5.01.03'];

    function esc(v) {
        return String(v == null ? '' : v).replace(/[&<>"']/g, function(c) {
            return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
        });
    }

    function colorInfo(rec) {
        var raw = rec.color;
        if (raw == null || raw === '') return null;
        var s = String(raw).trim();
        var key = s.replace(/^RAL\s*/i, '');
        if (RAL[key]) return { label: 'RAL ' + key, hex: RAL[key] };
        if (RAL[s.toLowerCase()]) return { label: s, hex: RAL[s.toLowerCase()] };
        if (/черн/i.test(s)) return { label: s, hex: '#14181b' };
        if (/жёлт|желт/i.test(s)) return { label: s, hex: '#f4c400' };
        if (/сер/i.test(s)) return { label: s, hex: '#9da5aa' };
        if (/красн/i.test(s)) return { label: s, hex: '#bb1e10' };
        if (/противоскол/i.test(s)) return { label: s, hex: '#68737b', pattern: true };
        return { label: s, hex: '#8c98a3' };
    }

    function photo(rec) {
        var imgs = rec.images || [];
        if (!imgs.length) return '<div class="v108-photo v108-empty"><span>нет<br>фото</span></div>';
        var out = imgs.map(function(img) {
            return '<a class="v108-photo" href="./' + esc(img.path) + '" data-lightbox data-title="' +
                esc((rec.article || '') + ' — ' + rec.name) + '">' +
                '<img loading="lazy" src="./' + esc(img.path) + '" alt="' + esc(rec.name) + '"></a>';
        }).join('');
        return '<div class="v108-photos">' + out + '</div>';
    }

    function colorColumn(rec) {
        var c = colorInfo(rec);
        if (!c) return '<div class="v108-color-column"><span class="v108-color-label">Цвет / покрытие</span><span class="v108-color-missing">Не указан</span></div>';
        var bg = c.pattern ? 'repeating-linear-gradient(45deg,#68737b 0 3px,#dfe5e9 3px 6px)' : c.hex;
        return '<div class="v108-color-column"><span class="v108-color-label">Цвет / покрытие</span>' +
            '<button class="v108-chip color-chip" type="button" data-spec-color="' + esc(c.label) +
            '" data-color-hex="' + c.hex + '" title="' + esc(c.label) + '">' +
            '<i style="background:' + bg + '"></i>' + esc(c.label) + '</button></div>';
    }

    function tech(rec) {
        var cells = [];
        Object.keys(LABELS).forEach(function(k) {
            var v = rec[k];
            if (v === null || v === undefined || v === '') return;
            var wide = (k === 'ingredients' || k === 'fasteners') ? ' class="v108-wide"' : '';
            cells.push('<div' + wide + '><span>' + esc(LABELS[k]) + '</span><strong>' + esc(v) + '</strong></div>');
        });
        var extras = rec.extra_cells || {};
        Object.keys(extras).forEach(function(k) {
            if (extras[k] == null) return;
            cells.push('<div><span>Ячейка ' + esc(k) + '</span><strong>' + esc(extras[k]) + '</strong></div>');
        });
        if (!cells.length) return '';
        return '<details class="v108-tech"><summary>Технические данные</summary><div class="v108-tech-grid">' +
            cells.join('') + '</div></details>';
    }

    function item(rec) {
        var s = [rec.number, rec.article, rec.name, rec.color, rec.ingredients, rec.fasteners]
            .filter(Boolean).join(' ').toLowerCase();
        return '<article class="v108-item" id="row-' + rec.row + '" data-source-row="' + rec.row +
            '" data-search="' + esc(s) + '">' +
            '<div class="v108-num">' + esc(rec.number) + '</div>' +
            photo(rec) +
            '<div class="v108-main">' +
                '<div class="v108-art">' + (esc(rec.article) || 'Артикул не указан') + '</div>' +
                '<h3>' + esc(rec.name) + '</h3>' +
                '<div class="v108-row-source">Excel · строка ' + rec.row + '</div>' +
                tech(rec) +
            '</div>' +
            colorColumn(rec) +
            '<div class="v108-qty"><strong>' + esc(rec.qty) + '</strong><span>шт.</span></div>' +
            '</article>';
    }

    function groups(spec) {
        return (spec.groups || []).map(function(g) {
            if (!g.records || !g.records.length) return '';
            return '<details class="v108-group" open><summary><span>' + esc(g.title) + '</span><b>' +
                g.records.length + '</b></summary><div class="v108-list">' +
                g.records.map(item).join('') + '</div></details>';
        }).join('');
    }

    function gallery(spec) {
        var imgs = spec.main_images || [];
        if (!imgs.length) return '';
        var code = spec.display_code || ('ИКССР-' + spec.code);
        return '<section class="info-section v108-section"><div class="section-header"><h2>Основные изображения</h2>' +
            '<span>' + imgs.length + ' изображений из Excel</span></div><div class="v108-gallery">' +
            imgs.map(function(img, i) {
                return '<a href="./' + esc(img.path) + '" data-lightbox data-title="' + esc(code) + ' — ' + (i+1) + '">' +
                    '<img src="./' + esc(img.path) + '" alt="' + esc(code) + ' — ' + (i+1) + '">' +
                    '<span>ВИД / СХЕМА · ' + String(i+1).padStart(2,'0') + '</span></a>';
            }).join('') + '</div></section>';
    }

    function hero(spec) {
        var code = spec.display_code || ('ИКССР-' + spec.code);
        return '<section class="v108-hero"><div><div class="hero-label">ТЕХНИЧЕСКАЯ КАРТОЧКА ИЗДЕЛИЯ</div>' +
            '<h1>Детский игровой городок<br><em>' + esc(code) + '</em></h1>' +
            '<p>Размер изделия: <strong>' + esc(spec.dimensions || 'не указан в Excel') + '</strong></p></div>' +
            '<div class="v108-source"><span></span><b>ИСТОЧНИК</b><small>Excel · ' + esc(spec.code) + '</small></div></section>';
    }

    function fasteners(spec) {
        var p = (spec.records || []).filter(function(r) { return PLUGS.indexOf(r.article) !== -1; });
        if (!p.length) return '';
        return '<div class="v108-fastener-card"><div class="v108-fastener-head"><span>ЗАГЛУШКИ</span><b>из Excel</b></div>' +
            p.map(function(r) {
                return '<div class="v108-fastener-row"><span>' + esc(r.name) + '</span><strong>' +
                    esc(r.qty) + '</strong><small>шт.</small></div>';
            }).join('') + '</div>';
    }

    function overview(spec) {
        var t = spec.totals || {};
        var notice = '';
        var bad = (spec.issues || []).filter(function(i) { return /заглушек/.test(i.issue); });
        if (bad.length) {
            notice = '<p class="spec-source-notice">' + bad.map(function(d) {
                return (/m8_total/.test(d.issue) ? 'М8–10' : 'М6') + ': итог ' + d.total + ', заглушки ' + d.plug_qty + '.';
            }).join(' ') + ' Значения сохранены по Excel.</p>';
        }
        return '<section class="v108-overview"><div class="v108-overview-copy">' +
            '<span class="v108-kicker">КОМПЛЕКТАЦИЯ</span>' +
            '<h2>Всё по спецификации — в одной карточке</h2>' +
            '<p>Состав, цвета и крепёж из Excel. Раскройте технические данные для просмотра размеров и входящих деталей.</p>' +
            '<div class="v108-stats">' +
            '<div><b>' + (spec.records || []).length + '</b><span>позиций спецификации</span></div>' +
            '<div><b>' + esc(t.m8_total == null ? '—' : t.m8_total) + '</b><span>итог М8–10 из Excel</span></div>' +
            '<div><b>' + esc(t.m6_total == null ? '—' : t.m6_total) + '</b><span>итог М6 из Excel</span></div>' +
            '</div>' + notice + '</div>' + fasteners(spec) + '</section>';
    }

    function body(spec) {
        return hero(spec) + overview(spec) + gallery(spec) +
            '<section class="info-section v108-section"><div class="section-header">' +
            '<div><div class="hero-label">СПЕЦИФИКАЦИЯ</div><h2>Состав изделия</h2></div>' +
            '<span>Цвета и покрытия — отдельным блоком</span></div>' +
            '<div class="v108-tools"><div class="v108-search"><span>⌕</span>' +
            '<input id="v108Search" aria-label="Поиск по спецификации" placeholder="Артикул, название, цвет, метизы...">' +
            '<button id="v108Clear" type="button">Очистить</button></div>' +
            '<div id="v108Count" class="v108-count" aria-live="polite">Показаны все позиции</div></div>' +
            '<div id="v108Spec" class="v108-groups">' + groups(spec) + '</div></section>';
    }

    function start() {
        var code = document.body.dataset.specCode;
        var root = document.getElementById('spec-root');
        if (!code || !root) return;

        fetch('./data/spec-' + code + '.json')
            .then(function(r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .then(function(spec) {
                root.innerHTML = body(spec);

                var display = spec.display_code || ('ИКССР-' + code);
                if (document.title) document.title = display + ' — Счастливый ребёнок';
                var crumb = document.querySelector('.breadcrumb strong');
                if (crumb) crumb.textContent = display;

                // Переподключаем spec-ui.js к новым элементам
                if (window.SpecUI && typeof window.SpecUI.init === 'function') window.SpecUI.init();
            })
            .catch(function(e) {
                root.innerHTML = '<p style="padding:20px;color:#b04b45">Ошибка загрузки спецификации: ' + esc(e.message) + '</p>';
            });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
    else start();
})();
