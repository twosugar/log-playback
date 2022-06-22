import { __assign, __values } from '../../ext/tslib/tslib.es6.js';
import { interpret as v, createMachine as s, assign as o } from '../../../../ext/@xstate/fsm/es/index.js';
import { EventType, IncrementalSource, ReplayerEvents } from '../types.js';
import { addDelay } from './timer.js';

function discardPriorSnapshots(events, baselineTime) {
    for (var idx = events.length - 1; idx >= 0; idx--) {
        var event_1 = events[idx];
        if (event_1.type === EventType.Meta) {
            if (event_1.timestamp <= baselineTime) {
                return events.slice(idx);
            }
        }
    }
    return events;
}
function createPlayerService(context, _a) {
    var getCastFn = _a.getCastFn, applyEventsSynchronously = _a.applyEventsSynchronously, emitter = _a.emitter;
    var playerMachine = s({
        id: 'player',
        context: context,
        initial: 'paused',
        states: {
            playing: {
                on: {
                    PAUSE: {
                        target: 'paused',
                        actions: ['pause'],
                    },
                    CAST_EVENT: {
                        target: 'playing',
                        actions: 'castEvent',
                    },
                    END: {
                        target: 'paused',
                        actions: ['resetLastPlayedEvent', 'pause'],
                    },
                    ADD_EVENT: {
                        target: 'playing',
                        actions: ['addEvent'],
                    },
                },
            },
            paused: {
                on: {
                    PLAY: {
                        target: 'playing',
                        actions: ['recordTimeOffset', 'play'],
                    },
                    CAST_EVENT: {
                        target: 'paused',
                        actions: 'castEvent',
                    },
                    TO_LIVE: {
                        target: 'live',
                        actions: ['startLive'],
                    },
                    ADD_EVENT: {
                        target: 'paused',
                        actions: ['addEvent'],
                    },
                },
            },
            live: {
                on: {
                    ADD_EVENT: {
                        target: 'live',
                        actions: ['addEvent'],
                    },
                    CAST_EVENT: {
                        target: 'live',
                        actions: ['castEvent'],
                    },
                },
            },
        },
    }, {
        actions: {
            castEvent: o({
                lastPlayedEvent: function (ctx, event) {
                    if (event.type === 'CAST_EVENT') {
                        return event.payload.event;
                    }
                    return ctx.lastPlayedEvent;
                },
            }),
            recordTimeOffset: o(function (ctx, event) {
                var timeOffset = ctx.timeOffset;
                if ('payload' in event && 'timeOffset' in event.payload) {
                    timeOffset = event.payload.timeOffset;
                }
                return __assign(__assign({}, ctx), { timeOffset: timeOffset, baselineTime: ctx.events[0].timestamp + timeOffset });
            }),
            play: function (ctx) {
                var e_1, _a, e_2, _b;
                var _c;
                var timer = ctx.timer, events = ctx.events, baselineTime = ctx.baselineTime, lastPlayedEvent = ctx.lastPlayedEvent;
                timer.clear();
                try {
                    for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
                        var event_2 = events_1_1.value;
                        addDelay(event_2, baselineTime);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (events_1_1 && !events_1_1.done && (_a = events_1.return)) _a.call(events_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                var neededEvents = discardPriorSnapshots(events, baselineTime);
                var lastPlayedTimestamp = lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.timestamp;
                if ((lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.type) === EventType.IncrementalSnapshot &&
                    lastPlayedEvent.data.source === IncrementalSource.MouseMove) {
                    lastPlayedTimestamp =
                        lastPlayedEvent.timestamp +
                            ((_c = lastPlayedEvent.data.positions[0]) === null || _c === void 0 ? void 0 : _c.timeOffset);
                }
                if (baselineTime < (lastPlayedTimestamp || 0)) {
                    emitter.emit(ReplayerEvents.PlayBack);
                }
                var syncEvents = new Array();
                var actions = new Array();
                var _loop_1 = function (event_3) {
                    if (lastPlayedTimestamp &&
                        lastPlayedTimestamp < baselineTime &&
                        (event_3.timestamp <= lastPlayedTimestamp ||
                            event_3 === lastPlayedEvent)) {
                        return "continue";
                    }
                    if (event_3.timestamp < baselineTime) {
                        syncEvents.push(event_3);
                    }
                    else {
                        var castFn_1 = getCastFn(event_3, false);
                        actions.push({
                            doAction: function () {
                                castFn_1();
                            },
                            delay: event_3.delay,
                        });
                    }
                };
                try {
                    for (var neededEvents_1 = __values(neededEvents), neededEvents_1_1 = neededEvents_1.next(); !neededEvents_1_1.done; neededEvents_1_1 = neededEvents_1.next()) {
                        var event_3 = neededEvents_1_1.value;
                        _loop_1(event_3);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (neededEvents_1_1 && !neededEvents_1_1.done && (_b = neededEvents_1.return)) _b.call(neededEvents_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                applyEventsSynchronously(syncEvents);
                emitter.emit(ReplayerEvents.Flush);
                timer.addActions(actions);
                timer.start();
            },
            pause: function (ctx) {
                ctx.timer.clear();
            },
            resetLastPlayedEvent: o(function (ctx) {
                return __assign(__assign({}, ctx), { lastPlayedEvent: null });
            }),
            startLive: o({
                baselineTime: function (ctx, event) {
                    ctx.timer.toggleLiveMode(true);
                    ctx.timer.start();
                    if (event.type === 'TO_LIVE' && event.payload.baselineTime) {
                        return event.payload.baselineTime;
                    }
                    return Date.now();
                },
            }),
            addEvent: o(function (ctx, machineEvent) {
                var baselineTime = ctx.baselineTime, timer = ctx.timer, events = ctx.events;
                if (machineEvent.type === 'ADD_EVENT') {
                    var event_4 = machineEvent.payload.event;
                    addDelay(event_4, baselineTime);
                    var end = events.length - 1;
                    if (!events[end] || events[end].timestamp <= event_4.timestamp) {
                        events.push(event_4);
                    }
                    else {
                        var insertionIndex = -1;
                        var start = 0;
                        while (start <= end) {
                            var mid = Math.floor((start + end) / 2);
                            if (events[mid].timestamp <= event_4.timestamp) {
                                start = mid + 1;
                            }
                            else {
                                end = mid - 1;
                            }
                        }
                        if (insertionIndex === -1) {
                            insertionIndex = start;
                        }
                        events.splice(insertionIndex, 0, event_4);
                    }
                    var isSync = event_4.timestamp < baselineTime;
                    var castFn_2 = getCastFn(event_4, isSync);
                    if (isSync) {
                        castFn_2();
                    }
                    else if (timer.isActive()) {
                        timer.addAction({
                            doAction: function () {
                                castFn_2();
                            },
                            delay: event_4.delay,
                        });
                    }
                }
                return __assign(__assign({}, ctx), { events: events });
            }),
        },
    });
    return v(playerMachine);
}
function createSpeedService(context) {
    var speedMachine = s({
        id: 'speed',
        context: context,
        initial: 'normal',
        states: {
            normal: {
                on: {
                    FAST_FORWARD: {
                        target: 'skipping',
                        actions: ['recordSpeed', 'setSpeed'],
                    },
                    SET_SPEED: {
                        target: 'normal',
                        actions: ['setSpeed'],
                    },
                },
            },
            skipping: {
                on: {
                    BACK_TO_NORMAL: {
                        target: 'normal',
                        actions: ['restoreSpeed'],
                    },
                    SET_SPEED: {
                        target: 'normal',
                        actions: ['setSpeed'],
                    },
                },
            },
        },
    }, {
        actions: {
            setSpeed: function (ctx, event) {
                if ('payload' in event) {
                    ctx.timer.setSpeed(event.payload.speed);
                }
            },
            recordSpeed: o({
                normalSpeed: function (ctx) { return ctx.timer.speed; },
            }),
            restoreSpeed: function (ctx) {
                ctx.timer.setSpeed(ctx.normalSpeed);
            },
        },
    });
    return v(speedMachine);
}

export { createPlayerService, createSpeedService, discardPriorSnapshots };
