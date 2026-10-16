module.exports = {
    autoEvents: true,
    sendEvents: (events) => {
        events.forEach(({name, counters}) => {
            if (!counters || typeof window.ym !== 'function') {
                return;
            }

            const countersToSendTo = counters.include;

            if (!Array.isArray(countersToSendTo)) {
                return;
            }

            countersToSendTo.forEach(id => {
                window.ym(id, 'reachGoal', name);
            });
        });
    },
};
