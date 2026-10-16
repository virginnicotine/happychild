import { useEffect } from "react";

interface MetrikaProps {
    counterId: number;
}

/**
 * Компонент для инициализации счётчика Яндекс Метрики.
 * Для использования нужно указать блок "metrika" в конфигурации страницы,
 * передав параметр "counterId".
 *
 * Использует "официальный" способ подключения счётчика,
 * но обычно код инициализации инлайнится в страницу.
 * @param counterId
 * @constructor
 */
const MetrikaInit = ({ counterId }: MetrikaProps) => {
    useEffect(() => {
        (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
        (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

        try {
            ym(counterId, "init", {
                defer: false,
                clickmap: true,
                trackLinks: true,
                accurateTrackBounce: false,
                webvisor: false,
                sendTitle: true,
                triggerEvent: false,
                trackHash: false,
                ecommerce: false,
                type: 0,
            });

        } catch(e) {}
    }, []);

    return null;
};

export default MetrikaInit;
