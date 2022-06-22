import { __values, __spreadArray, __read, __assign } from '../../ext/tslib/tslib.es6.js';
import { createCache, rebuild, buildNodeWithSN, NodeType } from '../../../rrweb-snapshot/es/rrweb-snapshot.js';
import * as mitt_es from '../../../../ext/mitt/dist/mitt.es.js';
import mitt$1 from '../../../../ext/mitt/dist/mitt.es.js';
import { polyfill } from './smoothscroll.js';
import { Timer } from './timer.js';
import { createPlayerService, createSpeedService } from './machine.js';
import { ReplayerEvents, EventType, IncrementalSource, MouseInteractions } from '../types.js';
import { polyfill as polyfill$1, isIframeINode, hasShadowRoot, queueToResolveTrees, iterateResolveTree, getBaseDimension, createMirror, TreeIndex } from '../utils.js';
import rules from './styles/inject-style.js';
import { getNestedRule, StyleRuleType, getPositionsAndIndex, storeCSSRules, applyVirtualStyleRulesToNode } from './virtual-styles.js';
import canvasMutation from './canvas/index.js';

var SKIP_TIME_THRESHOLD = 10 * 1000;
var SKIP_TIME_INTERVAL = 5 * 1000;
var mitt = mitt$1 || mitt_es;
var REPLAY_CONSOLE_PREFIX = '[replayer]';
var defaultMouseTailConfig = {
    duration: 500,
    lineCap: 'round',
    lineWidth: 3,
    strokeStyle: 'red',
};
function indicatesTouchDevice(e) {
    return (e.type == EventType.IncrementalSnapshot &&
        (e.data.source == IncrementalSource.TouchMove ||
            (e.data.source == IncrementalSource.MouseInteraction &&
                e.data.type == MouseInteractions.TouchStart)));
}
var Replayer = (function () {
    function Replayer(events, config) {
        var _this = this;
        this.mouseTail = null;
        this.tailPositions = [];
        this.emitter = mitt();
        this.legacy_missingNodeRetryMap = {};
        this.cache = createCache();
        this.imageMap = new Map();
        this.mirror = createMirror();
        this.firstFullSnapshot = null;
        this.newDocumentQueue = [];
        this.mousePos = null;
        this.touchActive = null;
        if (!(config === null || config === void 0 ? void 0 : config.liveMode) && events.length < 2) {
            throw new Error('Replayer need at least 2 events.');
        }
        var defaultConfig = {
            speed: 1,
            maxSpeed: 360,
            root: document.body,
            loadTimeout: 0,
            skipInactive: false,
            showWarning: true,
            showDebug: false,
            blockClass: 'rr-block',
            liveMode: false,
            insertStyleRules: [],
            triggerFocus: true,
            UNSAFE_replayCanvas: false,
            pauseAnimation: true,
            mouseTail: defaultMouseTailConfig,
        };
        this.config = Object.assign({}, defaultConfig, config);
        this.handleResize = this.handleResize.bind(this);
        this.getCastFn = this.getCastFn.bind(this);
        this.applyEventsSynchronously = this.applyEventsSynchronously.bind(this);
        this.emitter.on(ReplayerEvents.Resize, this.handleResize);
        this.setupDom();
        this.treeIndex = new TreeIndex();
        this.fragmentParentMap = new Map();
        this.elementStateMap = new Map();
        this.virtualStyleRulesMap = new Map();
        this.emitter.on(ReplayerEvents.Flush, function () {
            var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
            var _e = _this.treeIndex.flush(), scrollMap = _e.scrollMap, inputMap = _e.inputMap, mutationData = _e.mutationData;
            _this.fragmentParentMap.forEach(function (parent, frag) {
                return _this.restoreRealParent(frag, parent);
            });
            try {
                for (var _f = __values(mutationData.texts), _g = _f.next(); !_g.done; _g = _f.next()) {
                    var d = _g.value;
                    _this.applyText(d, mutationData);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _h = __values(_this.virtualStyleRulesMap.keys()), _j = _h.next(); !_j.done; _j = _h.next()) {
                    var node = _j.value;
                    _this.restoreNodeSheet(node);
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                }
                finally { if (e_2) throw e_2.error; }
            }
            _this.fragmentParentMap.clear();
            _this.elementStateMap.clear();
            _this.virtualStyleRulesMap.clear();
            try {
                for (var _k = __values(scrollMap.values()), _l = _k.next(); !_l.done; _l = _k.next()) {
                    var d = _l.value;
                    _this.applyScroll(d, true);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                }
                finally { if (e_3) throw e_3.error; }
            }
            try {
                for (var _m = __values(inputMap.values()), _o = _m.next(); !_o.done; _o = _m.next()) {
                    var d = _o.value;
                    _this.applyInput(d);
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
                }
                finally { if (e_4) throw e_4.error; }
            }
        });
        this.emitter.on(ReplayerEvents.PlayBack, function () {
            _this.firstFullSnapshot = null;
            _this.mirror.reset();
        });
        var timer = new Timer([], (config === null || config === void 0 ? void 0 : config.speed) || defaultConfig.speed);
        this.service = createPlayerService({
            events: events
                .map(function (e) {
                if (config && config.unpackFn) {
                    return config.unpackFn(e);
                }
                return e;
            })
                .sort(function (a1, a2) { return a1.timestamp - a2.timestamp; }),
            timer: timer,
            timeOffset: 0,
            baselineTime: 0,
            lastPlayedEvent: null,
        }, {
            getCastFn: this.getCastFn,
            applyEventsSynchronously: this.applyEventsSynchronously,
            emitter: this.emitter,
        });
        this.service.start();
        this.service.subscribe(function (state) {
            _this.emitter.emit(ReplayerEvents.StateChange, {
                player: state,
            });
        });
        this.speedService = createSpeedService({
            normalSpeed: -1,
            timer: timer,
        });
        this.speedService.start();
        this.speedService.subscribe(function (state) {
            _this.emitter.emit(ReplayerEvents.StateChange, {
                speed: state,
            });
        });
        var firstMeta = this.service.state.context.events.find(function (e) { return e.type === EventType.Meta; });
        var firstFullsnapshot = this.service.state.context.events.find(function (e) { return e.type === EventType.FullSnapshot; });
        if (firstMeta) {
            var _a = firstMeta.data, width_1 = _a.width, height_1 = _a.height;
            setTimeout(function () {
                _this.emitter.emit(ReplayerEvents.Resize, {
                    width: width_1,
                    height: height_1,
                });
            }, 0);
        }
        if (firstFullsnapshot) {
            setTimeout(function () {
                if (_this.firstFullSnapshot) {
                    return;
                }
                _this.firstFullSnapshot = firstFullsnapshot;
                _this.rebuildFullSnapshot(firstFullsnapshot);
                _this.iframe.contentWindow.scrollTo(firstFullsnapshot.data.initialOffset);
            }, 1);
        }
        if (this.service.state.context.events.find(indicatesTouchDevice)) {
            this.mouse.classList.add('touch-device');
        }
    }
    Object.defineProperty(Replayer.prototype, "timer", {
        get: function () {
            return this.service.state.context.timer;
        },
        enumerable: false,
        configurable: true
    });
    Replayer.prototype.on = function (event, handler) {
        this.emitter.on(event, handler);
        return this;
    };
    Replayer.prototype.off = function (event, handler) {
        this.emitter.off(event, handler);
        return this;
    };
    Replayer.prototype.setConfig = function (config) {
        var _this = this;
        Object.keys(config).forEach(function (key) {
            _this.config[key] = config[key];
        });
        if (!this.config.skipInactive) {
            this.backToNormal();
        }
        if (typeof config.speed !== 'undefined') {
            this.speedService.send({
                type: 'SET_SPEED',
                payload: {
                    speed: config.speed,
                },
            });
        }
        if (typeof config.mouseTail !== 'undefined') {
            if (config.mouseTail === false) {
                if (this.mouseTail) {
                    this.mouseTail.style.display = 'none';
                }
            }
            else {
                if (!this.mouseTail) {
                    this.mouseTail = document.createElement('canvas');
                    this.mouseTail.width = Number.parseFloat(this.iframe.width);
                    this.mouseTail.height = Number.parseFloat(this.iframe.height);
                    this.mouseTail.classList.add('replayer-mouse-tail');
                    this.wrapper.insertBefore(this.mouseTail, this.iframe);
                }
                this.mouseTail.style.display = 'inherit';
            }
        }
    };
    Replayer.prototype.getMetaData = function () {
        var firstEvent = this.service.state.context.events[0];
        var lastEvent = this.service.state.context.events[this.service.state.context.events.length - 1];
        return {
            startTime: firstEvent.timestamp,
            endTime: lastEvent.timestamp,
            totalTime: lastEvent.timestamp - firstEvent.timestamp,
        };
    };
    Replayer.prototype.getCurrentTime = function () {
        return this.timer.timeOffset + this.getTimeOffset();
    };
    Replayer.prototype.getTimeOffset = function () {
        var _a = this.service.state.context, baselineTime = _a.baselineTime, events = _a.events;
        return baselineTime - events[0].timestamp;
    };
    Replayer.prototype.getMirror = function () {
        return this.mirror;
    };
    Replayer.prototype.play = function (timeOffset) {
        var _a;
        if (timeOffset === void 0) { timeOffset = 0; }
        if (this.service.state.matches('paused')) {
            this.service.send({ type: 'PLAY', payload: { timeOffset: timeOffset } });
        }
        else {
            this.service.send({ type: 'PAUSE' });
            this.service.send({ type: 'PLAY', payload: { timeOffset: timeOffset } });
        }
        (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('html')[0].classList.remove('rrweb-paused');
        this.emitter.emit(ReplayerEvents.Start);
    };
    Replayer.prototype.pause = function (timeOffset) {
        var _a;
        if (timeOffset === undefined && this.service.state.matches('playing')) {
            this.service.send({ type: 'PAUSE' });
        }
        if (typeof timeOffset === 'number') {
            this.play(timeOffset);
            this.service.send({ type: 'PAUSE' });
        }
        (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('html')[0].classList.add('rrweb-paused');
        this.emitter.emit(ReplayerEvents.Pause);
    };
    Replayer.prototype.resume = function (timeOffset) {
        if (timeOffset === void 0) { timeOffset = 0; }
        console.warn("The 'resume' will be departed in 1.0. Please use 'play' method which has the same interface.");
        this.play(timeOffset);
        this.emitter.emit(ReplayerEvents.Resume);
    };
    Replayer.prototype.startLive = function (baselineTime) {
        this.service.send({ type: 'TO_LIVE', payload: { baselineTime: baselineTime } });
    };
    Replayer.prototype.addEvent = function (rawEvent) {
        var _this = this;
        var event = this.config.unpackFn
            ? this.config.unpackFn(rawEvent)
            : rawEvent;
        if (indicatesTouchDevice(event)) {
            this.mouse.classList.add('touch-device');
        }
        Promise.resolve().then(function () {
            return _this.service.send({ type: 'ADD_EVENT', payload: { event: event } });
        });
    };
    Replayer.prototype.enableInteract = function () {
        this.iframe.setAttribute('scrolling', 'auto');
        this.iframe.style.pointerEvents = 'auto';
    };
    Replayer.prototype.disableInteract = function () {
        this.iframe.setAttribute('scrolling', 'no');
        this.iframe.style.pointerEvents = 'none';
    };
    Replayer.prototype.resetCache = function () {
        this.cache = createCache();
    };
    Replayer.prototype.setupDom = function () {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('replayer-wrapper');
        this.config.root.appendChild(this.wrapper);
        this.mouse = document.createElement('div');
        this.mouse.classList.add('replayer-mouse');
        this.wrapper.appendChild(this.mouse);
        if (this.config.mouseTail !== false) {
            this.mouseTail = document.createElement('canvas');
            this.mouseTail.classList.add('replayer-mouse-tail');
            this.mouseTail.style.display = 'inherit';
            this.wrapper.appendChild(this.mouseTail);
        }
        this.iframe = document.createElement('iframe');
        var attributes = ['allow-same-origin'];
        if (this.config.UNSAFE_replayCanvas) {
            attributes.push('allow-scripts');
        }
        this.iframe.style.display = 'none';
        this.iframe.setAttribute('sandbox', attributes.join(' '));
        this.disableInteract();
        this.wrapper.appendChild(this.iframe);
        if (this.iframe.contentWindow && this.iframe.contentDocument) {
            polyfill(this.iframe.contentWindow, this.iframe.contentDocument);
            polyfill$1(this.iframe.contentWindow);
        }
    };
    Replayer.prototype.handleResize = function (dimension) {
        var e_5, _a;
        this.iframe.style.display = 'inherit';
        try {
            for (var _b = __values([this.mouseTail, this.iframe]), _c = _b.next(); !_c.done; _c = _b.next()) {
                var el = _c.value;
                if (!el) {
                    continue;
                }
                el.setAttribute('width', String(dimension.width));
                el.setAttribute('height', String(dimension.height));
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    Replayer.prototype.applyEventsSynchronously = function (events) {
        var e_6, _a;
        try {
            for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
                var event_1 = events_1_1.value;
                switch (event_1.type) {
                    case EventType.DomContentLoaded:
                    case EventType.Load:
                    case EventType.Custom:
                        continue;
                    case EventType.FullSnapshot:
                    case EventType.Meta:
                    case EventType.Plugin:
                        break;
                    case EventType.IncrementalSnapshot:
                        switch (event_1.data.source) {
                            case IncrementalSource.MediaInteraction:
                                continue;
                            default:
                                break;
                        }
                        break;
                    default:
                        break;
                }
                var castFn = this.getCastFn(event_1, true);
                castFn();
            }
        }
        catch (e_6_1) { e_6 = { error: e_6_1 }; }
        finally {
            try {
                if (events_1_1 && !events_1_1.done && (_a = events_1.return)) _a.call(events_1);
            }
            finally { if (e_6) throw e_6.error; }
        }
        if (this.mousePos) {
            this.moveAndHover(this.mousePos.x, this.mousePos.y, this.mousePos.id, true, this.mousePos.debugData);
        }
        this.mousePos = null;
        if (this.touchActive === true) {
            this.mouse.classList.add('touch-active');
        }
        else if (this.touchActive === false) {
            this.mouse.classList.remove('touch-active');
        }
        this.touchActive = null;
    };
    Replayer.prototype.getCastFn = function (event, isSync) {
        var _this = this;
        if (isSync === void 0) { isSync = false; }
        var castFn;
        switch (event.type) {
            case EventType.DomContentLoaded:
            case EventType.Load:
                break;
            case EventType.Custom:
                castFn = function () {
                    _this.emitter.emit(ReplayerEvents.CustomEvent, event);
                };
                break;
            case EventType.Meta:
                castFn = function () {
                    return _this.emitter.emit(ReplayerEvents.Resize, {
                        width: event.data.width,
                        height: event.data.height,
                    });
                };
                break;
            case EventType.FullSnapshot:
                castFn = function () {
                    if (_this.firstFullSnapshot) {
                        if (_this.firstFullSnapshot === event) {
                            _this.firstFullSnapshot = true;
                            return;
                        }
                    }
                    else {
                        _this.firstFullSnapshot = true;
                    }
                    _this.rebuildFullSnapshot(event, isSync);
                    _this.iframe.contentWindow.scrollTo(event.data.initialOffset);
                };
                break;
            case EventType.IncrementalSnapshot:
                castFn = function () {
                    var e_7, _a;
                    _this.applyIncremental(event, isSync);
                    if (isSync) {
                        return;
                    }
                    if (event === _this.nextUserInteractionEvent) {
                        _this.nextUserInteractionEvent = null;
                        _this.backToNormal();
                    }
                    if (_this.config.skipInactive && !_this.nextUserInteractionEvent) {
                        try {
                            for (var _b = __values(_this.service.state.context.events), _c = _b.next(); !_c.done; _c = _b.next()) {
                                var _event = _c.value;
                                if (_event.timestamp <= event.timestamp) {
                                    continue;
                                }
                                if (_this.isUserInteraction(_event)) {
                                    if (_event.delay - event.delay >
                                        SKIP_TIME_THRESHOLD *
                                            _this.speedService.state.context.timer.speed) {
                                        _this.nextUserInteractionEvent = _event;
                                    }
                                    break;
                                }
                            }
                        }
                        catch (e_7_1) { e_7 = { error: e_7_1 }; }
                        finally {
                            try {
                                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                            }
                            finally { if (e_7) throw e_7.error; }
                        }
                        if (_this.nextUserInteractionEvent) {
                            var skipTime = _this.nextUserInteractionEvent.delay - event.delay;
                            var payload = {
                                speed: Math.min(Math.round(skipTime / SKIP_TIME_INTERVAL), _this.config.maxSpeed),
                            };
                            _this.speedService.send({ type: 'FAST_FORWARD', payload: payload });
                            _this.emitter.emit(ReplayerEvents.SkipStart, payload);
                        }
                    }
                };
                break;
        }
        var wrappedCastFn = function () {
            var e_8, _a;
            if (castFn) {
                castFn();
            }
            try {
                for (var _b = __values(_this.config.plugins || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var plugin = _c.value;
                    plugin.handler(event, isSync, { replayer: _this });
                }
            }
            catch (e_8_1) { e_8 = { error: e_8_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_8) throw e_8.error; }
            }
            _this.service.send({ type: 'CAST_EVENT', payload: { event: event } });
            var last_index = _this.service.state.context.events.length - 1;
            if (event === _this.service.state.context.events[last_index]) {
                var finish_1 = function () {
                    if (last_index < _this.service.state.context.events.length - 1) {
                        return;
                    }
                    _this.backToNormal();
                    _this.service.send('END');
                    _this.emitter.emit(ReplayerEvents.Finish);
                };
                if (event.type === EventType.IncrementalSnapshot &&
                    event.data.source === IncrementalSource.MouseMove &&
                    event.data.positions.length) {
                    setTimeout(function () {
                        finish_1();
                    }, Math.max(0, -event.data.positions[0].timeOffset + 50));
                }
                else {
                    finish_1();
                }
            }
            _this.emitter.emit(ReplayerEvents.EventCast, event);
        };
        return wrappedCastFn;
    };
    Replayer.prototype.rebuildFullSnapshot = function (event, isSync) {
        var e_9, _a;
        var _this = this;
        if (isSync === void 0) { isSync = false; }
        if (!this.iframe.contentDocument) {
            return console.warn('Looks like your replayer has been destroyed.');
        }
        if (Object.keys(this.legacy_missingNodeRetryMap).length) {
            console.warn('Found unresolved missing node map', this.legacy_missingNodeRetryMap);
        }
        this.legacy_missingNodeRetryMap = {};
        var collected = [];
        this.mirror.map = rebuild(event.data.node, {
            doc: this.iframe.contentDocument,
            afterAppend: function (builtNode) {
                _this.collectIframeAndAttachDocument(collected, builtNode);
            },
            cache: this.cache,
        })[1];
        var _loop_1 = function (mutationInQueue, builtNode) {
            this_1.attachDocumentToIframe(mutationInQueue, builtNode);
            this_1.newDocumentQueue = this_1.newDocumentQueue.filter(function (m) { return m !== mutationInQueue; });
        };
        var this_1 = this;
        try {
            for (var collected_1 = __values(collected), collected_1_1 = collected_1.next(); !collected_1_1.done; collected_1_1 = collected_1.next()) {
                var _b = collected_1_1.value, mutationInQueue = _b.mutationInQueue, builtNode = _b.builtNode;
                _loop_1(mutationInQueue, builtNode);
            }
        }
        catch (e_9_1) { e_9 = { error: e_9_1 }; }
        finally {
            try {
                if (collected_1_1 && !collected_1_1.done && (_a = collected_1.return)) _a.call(collected_1);
            }
            finally { if (e_9) throw e_9.error; }
        }
        var _c = this.iframe.contentDocument, documentElement = _c.documentElement, head = _c.head;
        this.insertStyleRules(documentElement, head);
        if (!this.service.state.matches('playing')) {
            this.iframe.contentDocument
                .getElementsByTagName('html')[0]
                .classList.add('rrweb-paused');
        }
        this.emitter.emit(ReplayerEvents.FullsnapshotRebuilded, event);
        if (!isSync) {
            this.waitForStylesheetLoad();
        }
        if (this.config.UNSAFE_replayCanvas) {
            this.preloadAllImages();
        }
    };
    Replayer.prototype.insertStyleRules = function (documentElement, head) {
        var styleEl = document.createElement('style');
        documentElement.insertBefore(styleEl, head);
        var injectStylesRules = rules(this.config.blockClass).concat(this.config.insertStyleRules);
        if (this.config.pauseAnimation) {
            injectStylesRules.push('html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }');
        }
        for (var idx = 0; idx < injectStylesRules.length; idx++) {
            styleEl.sheet.insertRule(injectStylesRules[idx], idx);
        }
    };
    Replayer.prototype.attachDocumentToIframe = function (mutation, iframeEl) {
        var e_10, _a;
        var _this = this;
        var collected = [];
        if (!iframeEl.contentDocument) {
            var parent_1 = iframeEl.parentNode;
            while (parent_1) {
                if (this.fragmentParentMap.has(parent_1)) {
                    var frag = parent_1;
                    var realParent = this.fragmentParentMap.get(frag);
                    this.restoreRealParent(frag, realParent);
                    break;
                }
                parent_1 = parent_1.parentNode;
            }
        }
        buildNodeWithSN(mutation.node, {
            doc: iframeEl.contentDocument,
            map: this.mirror.map,
            hackCss: true,
            skipChild: false,
            afterAppend: function (builtNode) {
                _this.collectIframeAndAttachDocument(collected, builtNode);
                if (builtNode.__sn.type === NodeType.Element &&
                    builtNode.__sn.tagName.toUpperCase() === 'HTML') {
                    var _a = iframeEl.contentDocument, documentElement = _a.documentElement, head = _a.head;
                    _this.insertStyleRules(documentElement, head);
                }
            },
            cache: this.cache,
        });
        var _loop_2 = function (mutationInQueue, builtNode) {
            this_2.attachDocumentToIframe(mutationInQueue, builtNode);
            this_2.newDocumentQueue = this_2.newDocumentQueue.filter(function (m) { return m !== mutationInQueue; });
        };
        var this_2 = this;
        try {
            for (var collected_2 = __values(collected), collected_2_1 = collected_2.next(); !collected_2_1.done; collected_2_1 = collected_2.next()) {
                var _b = collected_2_1.value, mutationInQueue = _b.mutationInQueue, builtNode = _b.builtNode;
                _loop_2(mutationInQueue, builtNode);
            }
        }
        catch (e_10_1) { e_10 = { error: e_10_1 }; }
        finally {
            try {
                if (collected_2_1 && !collected_2_1.done && (_a = collected_2.return)) _a.call(collected_2);
            }
            finally { if (e_10) throw e_10.error; }
        }
    };
    Replayer.prototype.collectIframeAndAttachDocument = function (collected, builtNode) {
        if (isIframeINode(builtNode)) {
            var mutationInQueue = this.newDocumentQueue.find(function (m) { return m.parentId === builtNode.__sn.id; });
            if (mutationInQueue) {
                collected.push({ mutationInQueue: mutationInQueue, builtNode: builtNode });
            }
        }
    };
    Replayer.prototype.waitForStylesheetLoad = function () {
        var _this = this;
        var _a;
        var head = (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.head;
        if (head) {
            var unloadSheets_1 = new Set();
            var timer_1;
            var beforeLoadState_1 = this.service.state;
            var stateHandler_1 = function () {
                beforeLoadState_1 = _this.service.state;
            };
            this.emitter.on(ReplayerEvents.Start, stateHandler_1);
            this.emitter.on(ReplayerEvents.Pause, stateHandler_1);
            var unsubscribe_1 = function () {
                _this.emitter.off(ReplayerEvents.Start, stateHandler_1);
                _this.emitter.off(ReplayerEvents.Pause, stateHandler_1);
            };
            head
                .querySelectorAll('link[rel="stylesheet"]')
                .forEach(function (css) {
                if (!css.sheet) {
                    unloadSheets_1.add(css);
                    css.addEventListener('load', function () {
                        unloadSheets_1.delete(css);
                        if (unloadSheets_1.size === 0 && timer_1 !== -1) {
                            if (beforeLoadState_1.matches('playing')) {
                                _this.play(_this.getCurrentTime());
                            }
                            _this.emitter.emit(ReplayerEvents.LoadStylesheetEnd);
                            if (timer_1) {
                                clearTimeout(timer_1);
                            }
                            unsubscribe_1();
                        }
                    });
                }
            });
            if (unloadSheets_1.size > 0) {
                this.service.send({ type: 'PAUSE' });
                this.emitter.emit(ReplayerEvents.LoadStylesheetStart);
                timer_1 = setTimeout(function () {
                    if (beforeLoadState_1.matches('playing')) {
                        _this.play(_this.getCurrentTime());
                    }
                    timer_1 = -1;
                    unsubscribe_1();
                }, this.config.loadTimeout);
            }
        }
    };
    Replayer.prototype.hasImageArg = function (args) {
        var e_11, _a;
        try {
            for (var args_1 = __values(args), args_1_1 = args_1.next(); !args_1_1.done; args_1_1 = args_1.next()) {
                var arg = args_1_1.value;
                if (!arg || typeof arg !== 'object') {
                }
                else if ('rr_type' in arg && 'args' in arg) {
                    if (this.hasImageArg(arg.args))
                        return true;
                }
                else if ('rr_type' in arg && arg.rr_type === 'HTMLImageElement') {
                    return true;
                }
                else if (arg instanceof Array) {
                    if (this.hasImageArg(arg))
                        return true;
                }
            }
        }
        catch (e_11_1) { e_11 = { error: e_11_1 }; }
        finally {
            try {
                if (args_1_1 && !args_1_1.done && (_a = args_1.return)) _a.call(args_1);
            }
            finally { if (e_11) throw e_11.error; }
        }
        return false;
    };
    Replayer.prototype.getImageArgs = function (args) {
        var e_12, _a;
        var images = [];
        try {
            for (var args_2 = __values(args), args_2_1 = args_2.next(); !args_2_1.done; args_2_1 = args_2.next()) {
                var arg = args_2_1.value;
                if (!arg || typeof arg !== 'object') {
                }
                else if ('rr_type' in arg && 'args' in arg) {
                    images.push.apply(images, __spreadArray([], __read(this.getImageArgs(arg.args)), false));
                }
                else if ('rr_type' in arg && arg.rr_type === 'HTMLImageElement') {
                    images.push(arg.src);
                }
                else if (arg instanceof Array) {
                    images.push.apply(images, __spreadArray([], __read(this.getImageArgs(arg)), false));
                }
            }
        }
        catch (e_12_1) { e_12 = { error: e_12_1 }; }
        finally {
            try {
                if (args_2_1 && !args_2_1.done && (_a = args_2.return)) _a.call(args_2);
            }
            finally { if (e_12) throw e_12.error; }
        }
        return images;
    };
    Replayer.prototype.preloadAllImages = function () {
        var e_13, _a;
        var _this = this;
        this.service.state;
        var stateHandler = function () {
            _this.service.state;
        };
        this.emitter.on(ReplayerEvents.Start, stateHandler);
        this.emitter.on(ReplayerEvents.Pause, stateHandler);
        var _loop_3 = function (event_2) {
            if (event_2.type === EventType.IncrementalSnapshot &&
                event_2.data.source === IncrementalSource.CanvasMutation)
                if ('commands' in event_2.data) {
                    event_2.data.commands.forEach(function (c) { return _this.preloadImages(c, event_2); });
                }
                else {
                    this_3.preloadImages(event_2.data, event_2);
                }
        };
        var this_3 = this;
        try {
            for (var _b = __values(this.service.state.context.events), _c = _b.next(); !_c.done; _c = _b.next()) {
                var event_2 = _c.value;
                _loop_3(event_2);
            }
        }
        catch (e_13_1) { e_13 = { error: e_13_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_13) throw e_13.error; }
        }
    };
    Replayer.prototype.preloadImages = function (data, event) {
        var _this = this;
        if (data.property === 'drawImage' &&
            typeof data.args[0] === 'string' &&
            !this.imageMap.has(event)) {
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var imgd = ctx === null || ctx === void 0 ? void 0 : ctx.createImageData(canvas.width, canvas.height);
            imgd === null || imgd === void 0 ? void 0 : imgd.data;
            JSON.parse(data.args[0]);
            ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(imgd, 0, 0);
        }
        else if (this.hasImageArg(data.args)) {
            this.getImageArgs(data.args).forEach(function (url) {
                var image = new Image();
                image.src = url;
                _this.imageMap.set(url, image);
            });
        }
    };
    Replayer.prototype.applyIncremental = function (e, isSync) {
        var _this = this;
        var _a, _b;
        var d = e.data;
        switch (d.source) {
            case IncrementalSource.Mutation: {
                if (isSync) {
                    d.adds.forEach(function (m) { return _this.treeIndex.add(m); });
                    d.texts.forEach(function (m) {
                        var target = _this.mirror.getNode(m.id);
                        var parent = target === null || target === void 0 ? void 0 : target.parentNode;
                        if (parent && _this.virtualStyleRulesMap.has(parent))
                            _this.virtualStyleRulesMap.delete(parent);
                        _this.treeIndex.text(m);
                    });
                    d.attributes.forEach(function (m) { return _this.treeIndex.attribute(m); });
                    d.removes.forEach(function (m) { return _this.treeIndex.remove(m, _this.mirror); });
                }
                try {
                    this.applyMutation(d, isSync);
                }
                catch (error) {
                    this.warn("Exception in mutation ".concat(error.message || error), d);
                }
                break;
            }
            case IncrementalSource.Drag:
            case IncrementalSource.TouchMove:
            case IncrementalSource.MouseMove:
                if (isSync) {
                    var lastPosition = d.positions[d.positions.length - 1];
                    this.mousePos = {
                        x: lastPosition.x,
                        y: lastPosition.y,
                        id: lastPosition.id,
                        debugData: d,
                    };
                }
                else {
                    d.positions.forEach(function (p) {
                        var action = {
                            doAction: function () {
                                _this.moveAndHover(p.x, p.y, p.id, isSync, d);
                            },
                            delay: p.timeOffset +
                                e.timestamp -
                                _this.service.state.context.baselineTime,
                        };
                        _this.timer.addAction(action);
                    });
                    this.timer.addAction({
                        doAction: function () { },
                        delay: e.delay - ((_a = d.positions[0]) === null || _a === void 0 ? void 0 : _a.timeOffset),
                    });
                }
                break;
            case IncrementalSource.MouseInteraction: {
                if (d.id === -1) {
                    break;
                }
                var event_3 = new Event(MouseInteractions[d.type].toLowerCase());
                var target = this.mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                this.emitter.emit(ReplayerEvents.MouseInteraction, {
                    type: d.type,
                    target: target,
                });
                var triggerFocus = this.config.triggerFocus;
                switch (d.type) {
                    case MouseInteractions.Blur:
                        if ('blur' in target) {
                            target.blur();
                        }
                        break;
                    case MouseInteractions.Focus:
                        if (triggerFocus && target.focus) {
                            target.focus({
                                preventScroll: true,
                            });
                        }
                        break;
                    case MouseInteractions.Click:
                    case MouseInteractions.TouchStart:
                    case MouseInteractions.TouchEnd:
                        if (isSync) {
                            if (d.type === MouseInteractions.TouchStart) {
                                this.touchActive = true;
                            }
                            else if (d.type === MouseInteractions.TouchEnd) {
                                this.touchActive = false;
                            }
                            this.mousePos = {
                                x: d.x,
                                y: d.y,
                                id: d.id,
                                debugData: d,
                            };
                        }
                        else {
                            if (d.type === MouseInteractions.TouchStart) {
                                this.tailPositions.length = 0;
                            }
                            this.moveAndHover(d.x, d.y, d.id, isSync, d);
                            if (d.type === MouseInteractions.Click) {
                                this.mouse.classList.remove('active');
                                void this.mouse.offsetWidth;
                                this.mouse.classList.add('active');
                            }
                            else if (d.type === MouseInteractions.TouchStart) {
                                void this.mouse.offsetWidth;
                                this.mouse.classList.add('touch-active');
                            }
                            else if (d.type === MouseInteractions.TouchEnd) {
                                this.mouse.classList.remove('touch-active');
                            }
                        }
                        break;
                    case MouseInteractions.TouchCancel:
                        if (isSync) {
                            this.touchActive = false;
                        }
                        else {
                            this.mouse.classList.remove('touch-active');
                        }
                        break;
                    default:
                        target.dispatchEvent(event_3);
                }
                break;
            }
            case IncrementalSource.Scroll: {
                if (d.id === -1) {
                    break;
                }
                if (isSync) {
                    this.treeIndex.scroll(d);
                    break;
                }
                this.applyScroll(d, false);
                break;
            }
            case IncrementalSource.ViewportResize:
                this.emitter.emit(ReplayerEvents.Resize, {
                    width: d.width,
                    height: d.height,
                });
                break;
            case IncrementalSource.Input: {
                if (d.id === -1) {
                    break;
                }
                if (isSync) {
                    this.treeIndex.input(d);
                    break;
                }
                this.applyInput(d);
                break;
            }
            case IncrementalSource.MediaInteraction: {
                var target = this.mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                var mediaEl = target;
                try {
                    if (d.currentTime) {
                        mediaEl.currentTime = d.currentTime;
                    }
                    if (d.volume) {
                        mediaEl.volume = d.volume;
                    }
                    if (d.muted) {
                        mediaEl.muted = d.muted;
                    }
                    if (d.type === 1) {
                        mediaEl.pause();
                    }
                    if (d.type === 0) {
                        mediaEl.play();
                    }
                }
                catch (error) {
                    if (this.config.showWarning) {
                        console.warn("Failed to replay media interactions: ".concat(error.message || error));
                    }
                }
                break;
            }
            case IncrementalSource.StyleSheetRule: {
                var target = this.mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                var styleEl = target;
                var parent_2 = target.parentNode;
                var usingVirtualParent_1 = this.fragmentParentMap.has(parent_2);
                var styleSheet_1 = usingVirtualParent_1 ? null : styleEl.sheet;
                var rules_1;
                if (!styleSheet_1) {
                    if (this.virtualStyleRulesMap.has(target)) {
                        rules_1 = this.virtualStyleRulesMap.get(target);
                    }
                    else {
                        rules_1 = [];
                        this.virtualStyleRulesMap.set(target, rules_1);
                    }
                }
                if (d.adds) {
                    d.adds.forEach(function (_a) {
                        var rule = _a.rule, nestedIndex = _a.index;
                        if (styleSheet_1) {
                            try {
                                if (Array.isArray(nestedIndex)) {
                                    var _b = getPositionsAndIndex(nestedIndex), positions = _b.positions, index = _b.index;
                                    var nestedRule = getNestedRule(styleSheet_1.cssRules, positions);
                                    nestedRule.insertRule(rule, index);
                                }
                                else {
                                    var index = nestedIndex === undefined
                                        ? undefined
                                        : Math.min(nestedIndex, styleSheet_1.cssRules.length);
                                    styleSheet_1.insertRule(rule, index);
                                }
                            }
                            catch (e) {
                            }
                        }
                        else {
                            rules_1 === null || rules_1 === void 0 ? void 0 : rules_1.push({
                                cssText: rule,
                                index: nestedIndex,
                                type: StyleRuleType.Insert,
                            });
                        }
                    });
                }
                if (d.removes) {
                    d.removes.forEach(function (_a) {
                        var nestedIndex = _a.index;
                        if (usingVirtualParent_1) {
                            rules_1 === null || rules_1 === void 0 ? void 0 : rules_1.push({ index: nestedIndex, type: StyleRuleType.Remove });
                        }
                        else {
                            try {
                                if (Array.isArray(nestedIndex)) {
                                    var _b = getPositionsAndIndex(nestedIndex), positions = _b.positions, index = _b.index;
                                    var nestedRule = getNestedRule(styleSheet_1.cssRules, positions);
                                    nestedRule.deleteRule(index || 0);
                                }
                                else {
                                    styleSheet_1 === null || styleSheet_1 === void 0 ? void 0 : styleSheet_1.deleteRule(nestedIndex);
                                }
                            }
                            catch (e) {
                            }
                        }
                    });
                }
                break;
            }
            case IncrementalSource.StyleDeclaration: {
                var target = this.mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                var styleEl = target;
                var parent_3 = target.parentNode;
                var usingVirtualParent = this.fragmentParentMap.has(parent_3);
                var styleSheet = usingVirtualParent ? null : styleEl.sheet;
                var rules = [];
                if (!styleSheet) {
                    if (this.virtualStyleRulesMap.has(target)) {
                        rules = this.virtualStyleRulesMap.get(target);
                    }
                    else {
                        rules = [];
                        this.virtualStyleRulesMap.set(target, rules);
                    }
                }
                if (d.set) {
                    if (styleSheet) {
                        var rule = getNestedRule(styleSheet.rules, d.index);
                        rule.style.setProperty(d.set.property, d.set.value, d.set.priority);
                    }
                    else {
                        rules.push(__assign({ type: StyleRuleType.SetProperty, index: d.index }, d.set));
                    }
                }
                if (d.remove) {
                    if (styleSheet) {
                        var rule = getNestedRule(styleSheet.rules, d.index);
                        rule.style.removeProperty(d.remove.property);
                    }
                    else {
                        rules.push(__assign({ type: StyleRuleType.RemoveProperty, index: d.index }, d.remove));
                    }
                }
                break;
            }
            case IncrementalSource.CanvasMutation: {
                if (!this.config.UNSAFE_replayCanvas) {
                    return;
                }
                var target = this.mirror.getNode(d.id);
                if (!target) {
                    return this.debugNodeNotFound(d, d.id);
                }
                canvasMutation({
                    event: e,
                    mutation: d,
                    target: target,
                    imageMap: this.imageMap,
                    errorHandler: this.warnCanvasMutationFailed.bind(this),
                });
                break;
            }
            case IncrementalSource.Font: {
                try {
                    var fontFace = new FontFace(d.family, d.buffer ? new Uint8Array(JSON.parse(d.fontSource)) : d.fontSource, d.descriptors);
                    (_b = this.iframe.contentDocument) === null || _b === void 0 ? void 0 : _b.fonts.add(fontFace);
                }
                catch (error) {
                    if (this.config.showWarning) {
                        console.warn(error);
                    }
                }
                break;
            }
        }
    };
    Replayer.prototype.applyMutation = function (d, useVirtualParent) {
        var e_14, _a;
        var _this = this;
        d.removes.forEach(function (mutation) {
            var target = _this.mirror.getNode(mutation.id);
            if (!target) {
                if (d.removes.find(function (r) { return r.id === mutation.parentId; })) {
                    return;
                }
                return _this.warnNodeNotFound(d, mutation.id);
            }
            if (_this.virtualStyleRulesMap.has(target)) {
                _this.virtualStyleRulesMap.delete(target);
            }
            var parent = _this.mirror.getNode(mutation.parentId);
            if (!parent) {
                return _this.warnNodeNotFound(d, mutation.parentId);
            }
            if (mutation.isShadow && hasShadowRoot(parent)) {
                parent = parent.shadowRoot;
            }
            _this.mirror.removeNodeFromMap(target);
            if (parent) {
                var realTarget = null;
                var realParent = '__sn' in parent ? _this.fragmentParentMap.get(parent) : undefined;
                if (realParent && realParent.contains(target)) {
                    parent = realParent;
                }
                else if (_this.fragmentParentMap.has(target)) {
                    realTarget = _this.fragmentParentMap.get(target);
                    _this.fragmentParentMap.delete(target);
                    target = realTarget;
                }
                try {
                    parent.removeChild(target);
                }
                catch (error) {
                    if (error instanceof DOMException) {
                        _this.warn('parent could not remove child in mutation', parent, realParent, target, realTarget, d);
                    }
                    else {
                        throw error;
                    }
                }
            }
        });
        var legacy_missingNodeMap = __assign({}, this.legacy_missingNodeRetryMap);
        var queue = [];
        var nextNotInDOM = function (mutation) {
            var next = null;
            if (mutation.nextId) {
                next = _this.mirror.getNode(mutation.nextId);
            }
            if (mutation.nextId !== null &&
                mutation.nextId !== undefined &&
                mutation.nextId !== -1 &&
                !next) {
                return true;
            }
            return false;
        };
        var appendNode = function (mutation) {
            var e_15, _a;
            var _b, _c;
            if (!_this.iframe.contentDocument) {
                return console.warn('Looks like your replayer has been destroyed.');
            }
            var parent = _this.mirror.getNode(mutation.parentId);
            if (!parent) {
                if (mutation.node.type === NodeType.Document) {
                    return _this.newDocumentQueue.push(mutation);
                }
                return queue.push(mutation);
            }
            var parentInDocument = null;
            if (_this.iframe.contentDocument.contains) {
                parentInDocument = _this.iframe.contentDocument.contains(parent);
            }
            else if (_this.iframe.contentDocument.body.contains) {
                parentInDocument = _this.iframe.contentDocument.body.contains(parent);
            }
            var hasIframeChild = ((_c = (_b = parent).getElementsByTagName) === null || _c === void 0 ? void 0 : _c.call(_b, 'iframe').length) > 0;
            if (useVirtualParent &&
                parentInDocument &&
                !isIframeINode(parent) &&
                !hasIframeChild) {
                var virtualParent = document.createDocumentFragment();
                _this.mirror.map[mutation.parentId] = virtualParent;
                _this.fragmentParentMap.set(virtualParent, parent);
                _this.storeState(parent);
                while (parent.firstChild) {
                    virtualParent.appendChild(parent.firstChild);
                }
                parent = virtualParent;
            }
            if (mutation.node.isShadow) {
                if (!hasShadowRoot(parent)) {
                    parent.attachShadow({ mode: 'open' });
                    parent = parent.shadowRoot;
                }
                else
                    parent = parent.shadowRoot;
            }
            var previous = null;
            var next = null;
            if (mutation.previousId) {
                previous = _this.mirror.getNode(mutation.previousId);
            }
            if (mutation.nextId) {
                next = _this.mirror.getNode(mutation.nextId);
            }
            if (nextNotInDOM(mutation)) {
                return queue.push(mutation);
            }
            if (mutation.node.rootId && !_this.mirror.getNode(mutation.node.rootId)) {
                return;
            }
            var targetDoc = mutation.node.rootId
                ? _this.mirror.getNode(mutation.node.rootId)
                : _this.iframe.contentDocument;
            if (isIframeINode(parent)) {
                _this.attachDocumentToIframe(mutation, parent);
                return;
            }
            var target = buildNodeWithSN(mutation.node, {
                doc: targetDoc,
                map: _this.mirror.map,
                skipChild: true,
                hackCss: true,
                cache: _this.cache,
            });
            if (mutation.previousId === -1 || mutation.nextId === -1) {
                legacy_missingNodeMap[mutation.node.id] = {
                    node: target,
                    mutation: mutation,
                };
                return;
            }
            if ('__sn' in parent &&
                parent.__sn.type === NodeType.Element &&
                parent.__sn.tagName === 'textarea' &&
                mutation.node.type === NodeType.Text) {
                try {
                    for (var _d = __values(Array.from(parent.childNodes)), _e = _d.next(); !_e.done; _e = _d.next()) {
                        var c = _e.value;
                        if (c.nodeType === parent.TEXT_NODE) {
                            parent.removeChild(c);
                        }
                    }
                }
                catch (e_15_1) { e_15 = { error: e_15_1 }; }
                finally {
                    try {
                        if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                    }
                    finally { if (e_15) throw e_15.error; }
                }
            }
            if (previous && previous.nextSibling && previous.nextSibling.parentNode) {
                parent.insertBefore(target, previous.nextSibling);
            }
            else if (next && next.parentNode) {
                parent.contains(next)
                    ? parent.insertBefore(target, next)
                    : parent.insertBefore(target, null);
            }
            else {
                if (parent === targetDoc) {
                    while (targetDoc.firstChild) {
                        targetDoc.removeChild(targetDoc.firstChild);
                    }
                }
                parent.appendChild(target);
            }
            if (isIframeINode(target)) {
                var mutationInQueue_1 = _this.newDocumentQueue.find(function (m) { return m.parentId === target.__sn.id; });
                if (mutationInQueue_1) {
                    _this.attachDocumentToIframe(mutationInQueue_1, target);
                    _this.newDocumentQueue = _this.newDocumentQueue.filter(function (m) { return m !== mutationInQueue_1; });
                }
            }
            if (mutation.previousId || mutation.nextId) {
                _this.legacy_resolveMissingNode(legacy_missingNodeMap, parent, target, mutation);
            }
        };
        d.adds.forEach(function (mutation) {
            appendNode(mutation);
        });
        var startTime = Date.now();
        while (queue.length) {
            var resolveTrees = queueToResolveTrees(queue);
            queue.length = 0;
            if (Date.now() - startTime > 500) {
                this.warn('Timeout in the loop, please check the resolve tree data:', resolveTrees);
                break;
            }
            try {
                for (var resolveTrees_1 = (e_14 = void 0, __values(resolveTrees)), resolveTrees_1_1 = resolveTrees_1.next(); !resolveTrees_1_1.done; resolveTrees_1_1 = resolveTrees_1.next()) {
                    var tree = resolveTrees_1_1.value;
                    var parent_4 = this.mirror.getNode(tree.value.parentId);
                    if (!parent_4) {
                        this.debug('Drop resolve tree since there is no parent for the root node.', tree);
                    }
                    else {
                        iterateResolveTree(tree, function (mutation) {
                            appendNode(mutation);
                        });
                    }
                }
            }
            catch (e_14_1) { e_14 = { error: e_14_1 }; }
            finally {
                try {
                    if (resolveTrees_1_1 && !resolveTrees_1_1.done && (_a = resolveTrees_1.return)) _a.call(resolveTrees_1);
                }
                finally { if (e_14) throw e_14.error; }
            }
        }
        if (Object.keys(legacy_missingNodeMap).length) {
            Object.assign(this.legacy_missingNodeRetryMap, legacy_missingNodeMap);
        }
        d.texts.forEach(function (mutation) {
            var target = _this.mirror.getNode(mutation.id);
            if (!target) {
                if (d.removes.find(function (r) { return r.id === mutation.id; })) {
                    return;
                }
                return _this.warnNodeNotFound(d, mutation.id);
            }
            if (_this.fragmentParentMap.has(target)) {
                target = _this.fragmentParentMap.get(target);
            }
            target.textContent = mutation.value;
        });
        d.attributes.forEach(function (mutation) {
            var target = _this.mirror.getNode(mutation.id);
            if (!target) {
                if (d.removes.find(function (r) { return r.id === mutation.id; })) {
                    return;
                }
                return _this.warnNodeNotFound(d, mutation.id);
            }
            if (_this.fragmentParentMap.has(target)) {
                target = _this.fragmentParentMap.get(target);
            }
            for (var attributeName in mutation.attributes) {
                if (typeof attributeName === 'string') {
                    var value = mutation.attributes[attributeName];
                    if (value === null) {
                        target.removeAttribute(attributeName);
                    }
                    else if (typeof value === 'string') {
                        try {
                            target.setAttribute(attributeName, value);
                        }
                        catch (error) {
                            if (_this.config.showWarning) {
                                console.warn('An error occurred may due to the checkout feature.', error);
                            }
                        }
                    }
                    else if (attributeName === 'style') {
                        var styleValues = value;
                        var targetEl = target;
                        for (var s in styleValues) {
                            if (styleValues[s] === false) {
                                targetEl.style.removeProperty(s);
                            }
                            else if (styleValues[s] instanceof Array) {
                                var svp = styleValues[s];
                                targetEl.style.setProperty(s, svp[0], svp[1]);
                            }
                            else {
                                var svs = styleValues[s];
                                targetEl.style.setProperty(s, svs);
                            }
                        }
                    }
                }
            }
        });
    };
    Replayer.prototype.applyScroll = function (d, isSync) {
        var target = this.mirror.getNode(d.id);
        if (!target) {
            return this.debugNodeNotFound(d, d.id);
        }
        if (target === this.iframe.contentDocument) {
            this.iframe.contentWindow.scrollTo({
                top: d.y,
                left: d.x,
                behavior: isSync ? 'auto' : 'smooth',
            });
        }
        else if (target.__sn.type === NodeType.Document) {
            target.defaultView.scrollTo({
                top: d.y,
                left: d.x,
                behavior: isSync ? 'auto' : 'smooth',
            });
        }
        else {
            try {
                target.scrollTop = d.y;
                target.scrollLeft = d.x;
            }
            catch (error) {
            }
        }
    };
    Replayer.prototype.applyInput = function (d) {
        var target = this.mirror.getNode(d.id);
        if (!target) {
            return this.debugNodeNotFound(d, d.id);
        }
        try {
            target.checked = d.isChecked;
            target.value = d.text;
        }
        catch (error) {
        }
    };
    Replayer.prototype.applyText = function (d, mutation) {
        var target = this.mirror.getNode(d.id);
        if (!target) {
            return this.debugNodeNotFound(mutation, d.id);
        }
        try {
            target.textContent = d.value;
        }
        catch (error) {
        }
    };
    Replayer.prototype.legacy_resolveMissingNode = function (map, parent, target, targetMutation) {
        var previousId = targetMutation.previousId, nextId = targetMutation.nextId;
        var previousInMap = previousId && map[previousId];
        var nextInMap = nextId && map[nextId];
        if (previousInMap) {
            var _a = previousInMap, node = _a.node, mutation = _a.mutation;
            parent.insertBefore(node, target);
            delete map[mutation.node.id];
            delete this.legacy_missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
                this.legacy_resolveMissingNode(map, parent, node, mutation);
            }
        }
        if (nextInMap) {
            var _b = nextInMap, node = _b.node, mutation = _b.mutation;
            parent.insertBefore(node, target.nextSibling);
            delete map[mutation.node.id];
            delete this.legacy_missingNodeRetryMap[mutation.node.id];
            if (mutation.previousId || mutation.nextId) {
                this.legacy_resolveMissingNode(map, parent, node, mutation);
            }
        }
    };
    Replayer.prototype.moveAndHover = function (x, y, id, isSync, debugData) {
        var target = this.mirror.getNode(id);
        if (!target) {
            return this.debugNodeNotFound(debugData, id);
        }
        var base = getBaseDimension(target, this.iframe);
        var _x = x * base.absoluteScale + base.x;
        var _y = y * base.absoluteScale + base.y;
        this.mouse.style.left = "".concat(_x, "px");
        this.mouse.style.top = "".concat(_y, "px");
        if (!isSync) {
            this.drawMouseTail({ x: _x, y: _y });
        }
        this.hoverElements(target);
    };
    Replayer.prototype.drawMouseTail = function (position) {
        var _this = this;
        if (!this.mouseTail) {
            return;
        }
        var _a = this.config.mouseTail === true
            ? defaultMouseTailConfig
            : Object.assign({}, defaultMouseTailConfig, this.config.mouseTail), lineCap = _a.lineCap, lineWidth = _a.lineWidth, strokeStyle = _a.strokeStyle, duration = _a.duration;
        var draw = function () {
            if (!_this.mouseTail) {
                return;
            }
            var ctx = _this.mouseTail.getContext('2d');
            if (!ctx || !_this.tailPositions.length) {
                return;
            }
            ctx.clearRect(0, 0, _this.mouseTail.width, _this.mouseTail.height);
            ctx.beginPath();
            ctx.lineWidth = lineWidth;
            ctx.lineCap = lineCap;
            ctx.strokeStyle = strokeStyle;
            ctx.moveTo(_this.tailPositions[0].x, _this.tailPositions[0].y);
            _this.tailPositions.forEach(function (p) { return ctx.lineTo(p.x, p.y); });
            ctx.stroke();
        };
        this.tailPositions.push(position);
        draw();
        setTimeout(function () {
            _this.tailPositions = _this.tailPositions.filter(function (p) { return p !== position; });
            draw();
        }, duration / this.speedService.state.context.timer.speed);
    };
    Replayer.prototype.hoverElements = function (el) {
        var _a;
        (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.\\:hover').forEach(function (hoveredEl) {
            hoveredEl.classList.remove(':hover');
        });
        var currentEl = el;
        while (currentEl) {
            if (currentEl.classList) {
                currentEl.classList.add(':hover');
            }
            currentEl = currentEl.parentElement;
        }
    };
    Replayer.prototype.isUserInteraction = function (event) {
        if (event.type !== EventType.IncrementalSnapshot) {
            return false;
        }
        return (event.data.source > IncrementalSource.Mutation &&
            event.data.source <= IncrementalSource.Input);
    };
    Replayer.prototype.backToNormal = function () {
        this.nextUserInteractionEvent = null;
        if (this.speedService.state.matches('normal')) {
            return;
        }
        this.speedService.send({ type: 'BACK_TO_NORMAL' });
        this.emitter.emit(ReplayerEvents.SkipEnd, {
            speed: this.speedService.state.context.normalSpeed,
        });
    };
    Replayer.prototype.restoreRealParent = function (frag, parent) {
        this.mirror.map[parent.__sn.id] = parent;
        if (parent.__sn.type === NodeType.Element &&
            parent.__sn.tagName === 'textarea' &&
            frag.textContent) {
            parent.value = frag.textContent;
        }
        parent.appendChild(frag);
        this.restoreState(parent);
    };
    Replayer.prototype.storeState = function (parent) {
        var e_16, _a;
        if (parent) {
            if (parent.nodeType === parent.ELEMENT_NODE) {
                var parentElement = parent;
                if (parentElement.scrollLeft || parentElement.scrollTop) {
                    this.elementStateMap.set(parent, {
                        scroll: [parentElement.scrollLeft, parentElement.scrollTop],
                    });
                }
                if (parentElement.tagName === 'STYLE')
                    storeCSSRules(parentElement, this.virtualStyleRulesMap);
                var children = parentElement.children;
                try {
                    for (var _b = __values(Array.from(children)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var child = _c.value;
                        this.storeState(child);
                    }
                }
                catch (e_16_1) { e_16 = { error: e_16_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_16) throw e_16.error; }
                }
            }
        }
    };
    Replayer.prototype.restoreState = function (parent) {
        var e_17, _a;
        if (parent.nodeType === parent.ELEMENT_NODE) {
            var parentElement = parent;
            if (this.elementStateMap.has(parent)) {
                var storedState = this.elementStateMap.get(parent);
                if (storedState.scroll) {
                    parentElement.scrollLeft = storedState.scroll[0];
                    parentElement.scrollTop = storedState.scroll[1];
                }
                this.elementStateMap.delete(parent);
            }
            var children = parentElement.children;
            try {
                for (var _b = __values(Array.from(children)), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var child = _c.value;
                    this.restoreState(child);
                }
            }
            catch (e_17_1) { e_17 = { error: e_17_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_17) throw e_17.error; }
            }
        }
    };
    Replayer.prototype.restoreNodeSheet = function (node) {
        var storedRules = this.virtualStyleRulesMap.get(node);
        if (node.nodeName !== 'STYLE') {
            return;
        }
        if (!storedRules) {
            return;
        }
        var styleNode = node;
        applyVirtualStyleRulesToNode(storedRules, styleNode);
    };
    Replayer.prototype.warnNodeNotFound = function (d, id) {
        if (this.treeIndex.idRemoved(id)) {
            this.warn("Node with id '".concat(id, "' was previously removed. "), d);
        }
        else {
            this.warn("Node with id '".concat(id, "' not found. "), d);
        }
    };
    Replayer.prototype.warnCanvasMutationFailed = function (d, error) {
        this.warn("Has error on canvas update", error, 'canvas mutation:', d);
    };
    Replayer.prototype.debugNodeNotFound = function (d, id) {
        if (this.treeIndex.idRemoved(id)) {
            this.debug(REPLAY_CONSOLE_PREFIX, "Node with id '".concat(id, "' was previously removed. "), d);
        }
        else {
            this.debug(REPLAY_CONSOLE_PREFIX, "Node with id '".concat(id, "' not found. "), d);
        }
    };
    Replayer.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.config.showWarning) {
            return;
        }
        console.warn.apply(console, __spreadArray([REPLAY_CONSOLE_PREFIX], __read(args), false));
    };
    Replayer.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.config.showDebug) {
            return;
        }
        console.log.apply(console, __spreadArray([REPLAY_CONSOLE_PREFIX], __read(args), false));
    };
    return Replayer;
}());

export { Replayer };
