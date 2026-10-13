// spec-ui.js v2 — поиск, цвета, lightbox для карточек, отрендеренных из JSON.
(function () {
    'use strict';

    // ---------- Единая инициализация всех интерактивных элементов карточки ----------
    function init() {
        var input = document.getElementById('v108Search');
        var clear = document.getElementById('v108Clear');
        var count = document.getElementById('v108Count');
        if (input && clear && count) {
            var items  = Array.prototype.slice.call(document.querySelectorAll('.v108-item'));
            var groups = Array.prototype.slice.call(document.querySelectorAll('.v108-group'));
            var originalOpen = new Map(groups.map(function (g) { return [g, g.open]; }));

            function run() {
                var query = (input.value || '').trim().toLocaleLowerCase('ru');
                var found = 0;
                items.forEach(function (item) {
                    var match = !query || (item.dataset.search || '').toLocaleLowerCase('ru').indexOf(query) !== -1;
                    item.hidden = !match;
                    if (match) found++;
                });
                count.textContent = query
                    ? 'Найдено: ' + found + ' из ' + items.length
                    : 'Показаны все позиции: ' + items.length;
                groups.forEach(function (group) {
                    var visible = Array.prototype.some.call(
                        group.querySelectorAll('.v108-item'),
                        function (item) { return !item.hidden; }
                    );
                    group.hidden = !visible;
                    group.open = query && visible ? true : (originalOpen.get(group) || false);
                });
            }
            if (!input.dataset.specUiBound) {
                input.dataset.specUiBound = '1';
                input.addEventListener('input', run);
                clear.addEventListener('click', function () { input.value = ''; run(); input.focus(); });
            }
            run();
        }

        // ---------- Модалка цвета ----------
        var modal;
        var previousFocus;
        function closeModal() {
            if (!modal) return;
            modal.classList.remove('visible');
            if (previousFocus) previousFocus.focus();
        }
        document.querySelectorAll('[data-spec-color]').forEach(function (button) {
            if (button.dataset.specColorBound) return;
            button.dataset.specColorBound = '1';
            button.addEventListener('click', function () {
                previousFocus = button;
                if (!modal) {
                    modal = document.createElement('div');
                    modal.className = 'color-modal spec-color-modal';
                    modal.innerHTML = '<div class="modal-card" role="dialog" aria-modal="true"><button class="modal-close" type="button" aria-label="Закрыть">×</button><div class="color-preview"></div><h3></h3><p class="modal-muted"></p></div>';
                    document.body.appendChild(modal);
                    modal.querySelector('.modal-close').addEventListener('click', closeModal);
                    modal.addEventListener('click', function (event) { if (event.target === modal) closeModal(); });
                    modal.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeModal(); });
                }
                var label = button.dataset.specColor || '';
                modal.querySelector('h3').textContent = label;
                modal.querySelector('.color-preview').style.background = button.querySelector('i').style.background;
                modal.querySelector('.modal-muted').textContent = label.indexOf('RAL ') === 0
                    ? 'Экранное приближение цвета. Фактический оттенок зависит от покрытия и освещения.'
                    : 'Цвет или тип покрытия указан в исходной спецификации.';
                modal.classList.add('visible');
                modal.querySelector('.modal-close').focus();
            });
        });

        // ---------- Lightbox ----------
        // script.js уже создаёт .lightbox глобально и вешает на [data-lightbox].
        // Но элементы карточки создаются после script.js — вешаем вручную.
        var lightbox = document.querySelector('.lightbox');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = '<button class="lightbox-close" type="button" aria-label="Закрыть">×</button><img src="" alt=""><div class="lightbox-title"></div>';
            document.body.appendChild(lightbox);

            var lbImg = lightbox.querySelector('img');
            var lbTitle = lightbox.querySelector('.lightbox-title');
            var lbClose = lightbox.querySelector('.lightbox-close');
            var scale = 1, x = 0, y = 0, dragging = false, startX = 0, startY = 0;

            function applyTransform() { lbImg.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(' + scale + ')'; }
            function resetZoom() { scale = 1; x = 0; y = 0; applyTransform(); }
            function changeZoom(d) { scale = Math.min(5, Math.max(1, scale + d)); if (scale === 1) { x = 0; y = 0; } applyTransform(); }

            var toolbar = document.createElement('div');
            toolbar.className = 'lightbox-toolbar';
            toolbar.innerHTML = '<button type="button" data-zoom-out>−</button><button type="button" data-zoom-reset>100%</button><button type="button" data-zoom-in>+</button>';
            lightbox.appendChild(toolbar);
            var hint = document.createElement('div');
            hint.className = 'lightbox-hint';
            hint.textContent = 'Колесо / + − / двойной клик · перетаскивание';
            lightbox.appendChild(hint);

            toolbar.querySelector('[data-zoom-in]').addEventListener('click', function () { changeZoom(.5); });
            toolbar.querySelector('[data-zoom-out]').addEventListener('click', function () { changeZoom(-.5); });
            toolbar.querySelector('[data-zoom-reset]').addEventListener('click', resetZoom);
            lightbox.addEventListener('wheel', function (e) { e.preventDefault(); changeZoom(e.deltaY < 0 ? .25 : -.25); }, { passive: false });
            lbImg.addEventListener('dblclick', function () { scale === 1 ? changeZoom(1) : resetZoom(); });
            lbImg.addEventListener('pointerdown', function (e) { dragging = true; lbImg.classList.add('dragging'); startX = e.clientX - x; startY = e.clientY - y; lbImg.setPointerCapture(e.pointerId); });
            lbImg.addEventListener('pointermove', function (e) { if (!dragging) return; x = e.clientX - startX; y = e.clientY - startY; applyTransform(); });
            lbImg.addEventListener('pointerup', function () { dragging = false; lbImg.classList.remove('dragging'); });
            lbImg.addEventListener('pointercancel', function () { dragging = false; lbImg.classList.remove('dragging'); });

            lbClose.addEventListener('click', function () { lightbox.classList.remove('visible'); resetZoom(); document.body.style.overflow = ''; });
            lightbox.addEventListener('click', function (e) { if (e.target === lightbox) { lightbox.classList.remove('visible'); resetZoom(); document.body.style.overflow = ''; } });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { lightbox.classList.remove('visible'); resetZoom(); document.body.style.overflow = ''; } });
        }

        document.querySelectorAll('[data-lightbox]').forEach(function (link) {
            if (link.dataset.lightboxBound) return;
            link.dataset.lightboxBound = '1';
            link.addEventListener('click', function (event) {
                event.preventDefault();
                var lb = document.querySelector('.lightbox');
                var img = lb.querySelector('img');
                var title = lb.querySelector('.lightbox-title');
                img.src = link.href;
                img.alt = link.dataset.title || '';
                title.textContent = link.dataset.title || '';
                lb.classList.add('visible');
                document.body.style.overflow = 'hidden';
            });
        });
    }

    window.SpecUI = { init: init };

    // Если spec-ui.js подключён ПОСЛЕ render-spec.js — элементы уже есть, инициализируем сразу.
    // Если ДО — render-spec.js сам вызовет init().
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Даём render-spec.js микротаск на рендер
        setTimeout(init, 0);
    }
})();
