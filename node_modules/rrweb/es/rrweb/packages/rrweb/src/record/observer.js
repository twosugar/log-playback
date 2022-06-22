import { __read, __values, __spreadArray, __assign } from '../../ext/tslib/tslib.es6.js';
import { maskInputValue } from '../../../rrweb-snapshot/es/rrweb-snapshot.js';
import { on, throttle, isTouchEvent, isBlocked, getWindowHeight, getWindowWidth, hookSetter, patch } from '../utils.js';
import { IncrementalSource, MouseInteractions } from '../types.js';
import MutationBuffer from './mutation.js';

var mutationBuffers = [];
var isCSSGroupingRuleSupported = typeof CSSGroupingRule !== 'undefined';
var isCSSMediaRuleSupported = typeof CSSMediaRule !== 'undefined';
var isCSSSupportsRuleSupported = typeof CSSSupportsRule !== 'undefined';
var isCSSConditionRuleSupported = typeof CSSConditionRule !== 'undefined';
function getEventTarget(event) {
    try {
        if ('composedPath' in event) {
            var path = event.composedPath();
            if (path.length) {
                return path[0];
            }
        }
        else if ('path' in event && event.path.length) {
            return event.path[0];
        }
        return event.target;
    }
    catch (_a) {
        return event.target;
    }
}
function initMutationObserver(options, rootEl) {
    var _a, _b;
    var mutationBuffer = new MutationBuffer();
    mutationBuffers.push(mutationBuffer);
    mutationBuffer.init(options);
    var mutationObserverCtor = window.MutationObserver ||
        window.__rrMutationObserver;
    var angularZoneSymbol = (_b = (_a = window === null || window === void 0 ? void 0 : window.Zone) === null || _a === void 0 ? void 0 : _a.__symbol__) === null || _b === void 0 ? void 0 : _b.call(_a, 'MutationObserver');
    if (angularZoneSymbol &&
        window[angularZoneSymbol]) {
        mutationObserverCtor = window[angularZoneSymbol];
    }
    var observer = new mutationObserverCtor(mutationBuffer.processMutations.bind(mutationBuffer));
    observer.observe(rootEl, {
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true,
        childList: true,
        subtree: true,
    });
    return observer;
}
function initMoveObserver(_a) {
    var mousemoveCb = _a.mousemoveCb, sampling = _a.sampling, doc = _a.doc, mirror = _a.mirror;
    if (sampling.mousemove === false) {
        return function () { };
    }
    var threshold = typeof sampling.mousemove === 'number' ? sampling.mousemove : 50;
    var callbackThreshold = typeof sampling.mousemoveCallback === 'number'
        ? sampling.mousemoveCallback
        : 500;
    var positions = [];
    var timeBaseline;
    var wrappedCb = throttle(function (source) {
        var totalOffset = Date.now() - timeBaseline;
        mousemoveCb(positions.map(function (p) {
            p.timeOffset -= totalOffset;
            return p;
        }), source);
        positions = [];
        timeBaseline = null;
    }, callbackThreshold);
    var updatePosition = throttle(function (evt) {
        var target = getEventTarget(evt);
        var _a = isTouchEvent(evt)
            ? evt.changedTouches[0]
            : evt, clientX = _a.clientX, clientY = _a.clientY;
        if (!timeBaseline) {
            timeBaseline = Date.now();
        }
        positions.push({
            x: clientX,
            y: clientY,
            id: mirror.getId(target),
            timeOffset: Date.now() - timeBaseline,
        });
        wrappedCb(typeof DragEvent !== 'undefined' && evt instanceof DragEvent
            ? IncrementalSource.Drag
            : evt instanceof MouseEvent
                ? IncrementalSource.MouseMove
                : IncrementalSource.TouchMove);
    }, threshold, {
        trailing: false,
    });
    var handlers = [
        on('mousemove', updatePosition, doc),
        on('touchmove', updatePosition, doc),
        on('drag', updatePosition, doc),
    ];
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initMouseInteractionObserver(_a) {
    var mouseInteractionCb = _a.mouseInteractionCb, doc = _a.doc, mirror = _a.mirror, blockClass = _a.blockClass, sampling = _a.sampling;
    if (sampling.mouseInteraction === false) {
        return function () { };
    }
    var disableMap = sampling.mouseInteraction === true ||
        sampling.mouseInteraction === undefined
        ? {}
        : sampling.mouseInteraction;
    var handlers = [];
    var getHandler = function (eventKey) {
        return function (event) {
            var target = getEventTarget(event);
            if (isBlocked(target, blockClass)) {
                return;
            }
            var e = isTouchEvent(event) ? event.changedTouches[0] : event;
            if (!e) {
                return;
            }
            var id = mirror.getId(target);
            var clientX = e.clientX, clientY = e.clientY;
            mouseInteractionCb({
                type: MouseInteractions[eventKey],
                id: id,
                x: clientX,
                y: clientY,
            });
        };
    };
    Object.keys(MouseInteractions)
        .filter(function (key) {
        return Number.isNaN(Number(key)) &&
            !key.endsWith('_Departed') &&
            disableMap[key] !== false;
    })
        .forEach(function (eventKey) {
        var eventName = eventKey.toLowerCase();
        var handler = getHandler(eventKey);
        handlers.push(on(eventName, handler, doc));
    });
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initScrollObserver(_a) {
    var scrollCb = _a.scrollCb, doc = _a.doc, mirror = _a.mirror, blockClass = _a.blockClass, sampling = _a.sampling;
    var updatePosition = throttle(function (evt) {
        var target = getEventTarget(evt);
        if (!target || isBlocked(target, blockClass)) {
            return;
        }
        var id = mirror.getId(target);
        if (target === doc) {
            var scrollEl = (doc.scrollingElement || doc.documentElement);
            scrollCb({
                id: id,
                x: scrollEl.scrollLeft,
                y: scrollEl.scrollTop,
            });
        }
        else {
            scrollCb({
                id: id,
                x: target.scrollLeft,
                y: target.scrollTop,
            });
        }
    }, sampling.scroll || 100);
    return on('scroll', updatePosition, doc);
}
function initViewportResizeObserver(_a) {
    var viewportResizeCb = _a.viewportResizeCb;
    var lastH = -1;
    var lastW = -1;
    var updateDimension = throttle(function () {
        var height = getWindowHeight();
        var width = getWindowWidth();
        if (lastH !== height || lastW !== width) {
            viewportResizeCb({
                width: Number(width),
                height: Number(height),
            });
            lastH = height;
            lastW = width;
        }
    }, 200);
    return on('resize', updateDimension, window);
}
function wrapEventWithUserTriggeredFlag(v, enable) {
    var value = __assign({}, v);
    if (!enable)
        delete value.userTriggered;
    return value;
}
var INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
var lastInputValueMap = new WeakMap();
function initInputObserver(_a) {
    var inputCb = _a.inputCb, doc = _a.doc, mirror = _a.mirror, blockClass = _a.blockClass, ignoreClass = _a.ignoreClass, maskInputOptions = _a.maskInputOptions, maskInputFn = _a.maskInputFn, sampling = _a.sampling, userTriggeredOnInput = _a.userTriggeredOnInput;
    function eventHandler(event) {
        var target = getEventTarget(event);
        var userTriggered = event.isTrusted;
        if (target && target.tagName === 'OPTION')
            target = target.parentElement;
        if (!target ||
            !target.tagName ||
            INPUT_TAGS.indexOf(target.tagName) < 0 ||
            isBlocked(target, blockClass)) {
            return;
        }
        var type = target.type;
        if (target.classList.contains(ignoreClass)) {
            return;
        }
        var text = target.value;
        var isChecked = false;
        if (type === 'radio' || type === 'checkbox') {
            isChecked = target.checked;
        }
        else if (maskInputOptions[target.tagName.toLowerCase()] ||
            maskInputOptions[type]) {
            text = maskInputValue({
                maskInputOptions: maskInputOptions,
                tagName: target.tagName,
                type: type,
                value: text,
                maskInputFn: maskInputFn,
            });
        }
        cbWithDedup(target, wrapEventWithUserTriggeredFlag({ text: text, isChecked: isChecked, userTriggered: userTriggered }, userTriggeredOnInput));
        var name = target.name;
        if (type === 'radio' && name && isChecked) {
            doc
                .querySelectorAll("input[type=\"radio\"][name=\"".concat(name, "\"]"))
                .forEach(function (el) {
                if (el !== target) {
                    cbWithDedup(el, wrapEventWithUserTriggeredFlag({
                        text: el.value,
                        isChecked: !isChecked,
                        userTriggered: false,
                    }, userTriggeredOnInput));
                }
            });
        }
    }
    function cbWithDedup(target, v) {
        var lastInputValue = lastInputValueMap.get(target);
        if (!lastInputValue ||
            lastInputValue.text !== v.text ||
            lastInputValue.isChecked !== v.isChecked) {
            lastInputValueMap.set(target, v);
            var id = mirror.getId(target);
            inputCb(__assign(__assign({}, v), { id: id }));
        }
    }
    var events = sampling.input === 'last' ? ['change'] : ['input', 'change'];
    var handlers = events.map(function (eventName) { return on(eventName, eventHandler, doc); });
    var propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    var hookProperties = [
        [HTMLInputElement.prototype, 'value'],
        [HTMLInputElement.prototype, 'checked'],
        [HTMLSelectElement.prototype, 'value'],
        [HTMLTextAreaElement.prototype, 'value'],
        [HTMLSelectElement.prototype, 'selectedIndex'],
        [HTMLOptionElement.prototype, 'selected'],
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
        handlers.push.apply(handlers, __spreadArray([], __read(hookProperties.map(function (p) {
            return hookSetter(p[0], p[1], {
                set: function () {
                    eventHandler({ target: this });
                },
            });
        })), false));
    }
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function getNestedCSSRulePositions(rule) {
    var positions = [];
    function recurse(childRule, pos) {
        if ((isCSSGroupingRuleSupported &&
            childRule.parentRule instanceof CSSGroupingRule) ||
            (isCSSMediaRuleSupported &&
                childRule.parentRule instanceof CSSMediaRule) ||
            (isCSSSupportsRuleSupported &&
                childRule.parentRule instanceof CSSSupportsRule) ||
            (isCSSConditionRuleSupported &&
                childRule.parentRule instanceof CSSConditionRule)) {
            var rules = Array.from(childRule.parentRule.cssRules);
            var index = rules.indexOf(childRule);
            pos.unshift(index);
        }
        else {
            var rules = Array.from(childRule.parentStyleSheet.cssRules);
            var index = rules.indexOf(childRule);
            pos.unshift(index);
        }
        return pos;
    }
    return recurse(rule, positions);
}
function initStyleSheetObserver(_a, _b) {
    var styleSheetRuleCb = _a.styleSheetRuleCb, mirror = _a.mirror;
    var win = _b.win;
    var insertRule = win.CSSStyleSheet.prototype.insertRule;
    win.CSSStyleSheet.prototype.insertRule = function (rule, index) {
        var id = mirror.getId(this.ownerNode);
        if (id !== -1) {
            styleSheetRuleCb({
                id: id,
                adds: [{ rule: rule, index: index }],
            });
        }
        return insertRule.apply(this, arguments);
    };
    var deleteRule = win.CSSStyleSheet.prototype.deleteRule;
    win.CSSStyleSheet.prototype.deleteRule = function (index) {
        var id = mirror.getId(this.ownerNode);
        if (id !== -1) {
            styleSheetRuleCb({
                id: id,
                removes: [{ index: index }],
            });
        }
        return deleteRule.apply(this, arguments);
    };
    var supportedNestedCSSRuleTypes = {};
    if (isCSSGroupingRuleSupported) {
        supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
    }
    else {
        if (isCSSMediaRuleSupported) {
            supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
        }
        if (isCSSConditionRuleSupported) {
            supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
        }
        if (isCSSSupportsRuleSupported) {
            supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
        }
    }
    var unmodifiedFunctions = {};
    Object.entries(supportedNestedCSSRuleTypes).forEach(function (_a) {
        var _b = __read(_a, 2), typeKey = _b[0], type = _b[1];
        unmodifiedFunctions[typeKey] = {
            insertRule: type.prototype.insertRule,
            deleteRule: type.prototype.deleteRule,
        };
        type.prototype.insertRule = function (rule, index) {
            var id = mirror.getId(this.parentStyleSheet.ownerNode);
            if (id !== -1) {
                styleSheetRuleCb({
                    id: id,
                    adds: [
                        {
                            rule: rule,
                            index: __spreadArray(__spreadArray([], __read(getNestedCSSRulePositions(this)), false), [
                                index || 0,
                            ], false),
                        },
                    ],
                });
            }
            return unmodifiedFunctions[typeKey].insertRule.apply(this, arguments);
        };
        type.prototype.deleteRule = function (index) {
            var id = mirror.getId(this.parentStyleSheet.ownerNode);
            if (id !== -1) {
                styleSheetRuleCb({
                    id: id,
                    removes: [{ index: __spreadArray(__spreadArray([], __read(getNestedCSSRulePositions(this)), false), [index], false) }],
                });
            }
            return unmodifiedFunctions[typeKey].deleteRule.apply(this, arguments);
        };
    });
    return function () {
        win.CSSStyleSheet.prototype.insertRule = insertRule;
        win.CSSStyleSheet.prototype.deleteRule = deleteRule;
        Object.entries(supportedNestedCSSRuleTypes).forEach(function (_a) {
            var _b = __read(_a, 2), typeKey = _b[0], type = _b[1];
            type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
            type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
        });
    };
}
function initStyleDeclarationObserver(_a, _b) {
    var styleDeclarationCb = _a.styleDeclarationCb, mirror = _a.mirror;
    var win = _b.win;
    var setProperty = win.CSSStyleDeclaration.prototype.setProperty;
    win.CSSStyleDeclaration.prototype.setProperty = function (property, value, priority) {
        var _a, _b;
        var id = mirror.getId((_b = (_a = this.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet) === null || _b === void 0 ? void 0 : _b.ownerNode);
        if (id !== -1) {
            styleDeclarationCb({
                id: id,
                set: {
                    property: property,
                    value: value,
                    priority: priority,
                },
                index: getNestedCSSRulePositions(this.parentRule),
            });
        }
        return setProperty.apply(this, arguments);
    };
    var removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = function (property) {
        var _a, _b;
        var id = mirror.getId((_b = (_a = this.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet) === null || _b === void 0 ? void 0 : _b.ownerNode);
        if (id !== -1) {
            styleDeclarationCb({
                id: id,
                remove: {
                    property: property,
                },
                index: getNestedCSSRulePositions(this.parentRule),
            });
        }
        return removeProperty.apply(this, arguments);
    };
    return function () {
        win.CSSStyleDeclaration.prototype.setProperty = setProperty;
        win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
    };
}
function initMediaInteractionObserver(_a) {
    var mediaInteractionCb = _a.mediaInteractionCb, blockClass = _a.blockClass, mirror = _a.mirror, sampling = _a.sampling;
    var handler = function (type) {
        return throttle(function (event) {
            var target = getEventTarget(event);
            if (!target || isBlocked(target, blockClass)) {
                return;
            }
            var _a = target, currentTime = _a.currentTime, volume = _a.volume, muted = _a.muted;
            mediaInteractionCb({
                type: type,
                id: mirror.getId(target),
                currentTime: currentTime,
                volume: volume,
                muted: muted,
            });
        }, sampling.media || 500);
    };
    var handlers = [
        on('play', handler(0)),
        on('pause', handler(1)),
        on('seeked', handler(2)),
        on('volumechange', handler(3)),
    ];
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function initFontObserver(_a) {
    var fontCb = _a.fontCb, doc = _a.doc;
    var win = doc.defaultView;
    if (!win) {
        return function () { };
    }
    var handlers = [];
    var fontMap = new WeakMap();
    var originalFontFace = win.FontFace;
    win.FontFace = function FontFace(family, source, descriptors) {
        var fontFace = new originalFontFace(family, source, descriptors);
        fontMap.set(fontFace, {
            family: family,
            buffer: typeof source !== 'string',
            descriptors: descriptors,
            fontSource: typeof source === 'string'
                ? source
                :
                    JSON.stringify(Array.from(new Uint8Array(source))),
        });
        return fontFace;
    };
    var restoreHandler = patch(doc.fonts, 'add', function (original) {
        return function (fontFace) {
            setTimeout(function () {
                var p = fontMap.get(fontFace);
                if (p) {
                    fontCb(p);
                    fontMap.delete(fontFace);
                }
            }, 0);
            return original.apply(this, [fontFace]);
        };
    });
    handlers.push(function () {
        win.FontFace = originalFontFace;
    });
    handlers.push(restoreHandler);
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}
function mergeHooks(o, hooks) {
    var mutationCb = o.mutationCb, mousemoveCb = o.mousemoveCb, mouseInteractionCb = o.mouseInteractionCb, scrollCb = o.scrollCb, viewportResizeCb = o.viewportResizeCb, inputCb = o.inputCb, mediaInteractionCb = o.mediaInteractionCb, styleSheetRuleCb = o.styleSheetRuleCb, styleDeclarationCb = o.styleDeclarationCb, canvasMutationCb = o.canvasMutationCb, fontCb = o.fontCb;
    o.mutationCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.mutation) {
            hooks.mutation.apply(hooks, __spreadArray([], __read(p), false));
        }
        mutationCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.mousemoveCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.mousemove) {
            hooks.mousemove.apply(hooks, __spreadArray([], __read(p), false));
        }
        mousemoveCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.mouseInteractionCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.mouseInteraction) {
            hooks.mouseInteraction.apply(hooks, __spreadArray([], __read(p), false));
        }
        mouseInteractionCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.scrollCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.scroll) {
            hooks.scroll.apply(hooks, __spreadArray([], __read(p), false));
        }
        scrollCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.viewportResizeCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.viewportResize) {
            hooks.viewportResize.apply(hooks, __spreadArray([], __read(p), false));
        }
        viewportResizeCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.inputCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.input) {
            hooks.input.apply(hooks, __spreadArray([], __read(p), false));
        }
        inputCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.mediaInteractionCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.mediaInteaction) {
            hooks.mediaInteaction.apply(hooks, __spreadArray([], __read(p), false));
        }
        mediaInteractionCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.styleSheetRuleCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.styleSheetRule) {
            hooks.styleSheetRule.apply(hooks, __spreadArray([], __read(p), false));
        }
        styleSheetRuleCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.styleDeclarationCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.styleDeclaration) {
            hooks.styleDeclaration.apply(hooks, __spreadArray([], __read(p), false));
        }
        styleDeclarationCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.canvasMutationCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.canvasMutation) {
            hooks.canvasMutation.apply(hooks, __spreadArray([], __read(p), false));
        }
        canvasMutationCb.apply(void 0, __spreadArray([], __read(p), false));
    };
    o.fontCb = function () {
        var p = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            p[_i] = arguments[_i];
        }
        if (hooks.font) {
            hooks.font.apply(hooks, __spreadArray([], __read(p), false));
        }
        fontCb.apply(void 0, __spreadArray([], __read(p), false));
    };
}
function initObservers(o, hooks) {
    var e_1, _a;
    if (hooks === void 0) { hooks = {}; }
    var currentWindow = o.doc.defaultView;
    if (!currentWindow) {
        return function () { };
    }
    mergeHooks(o, hooks);
    var mutationObserver = initMutationObserver(o, o.doc);
    var mousemoveHandler = initMoveObserver(o);
    var mouseInteractionHandler = initMouseInteractionObserver(o);
    var scrollHandler = initScrollObserver(o);
    var viewportResizeHandler = initViewportResizeObserver(o);
    var inputHandler = initInputObserver(o);
    var mediaInteractionHandler = initMediaInteractionObserver(o);
    var styleSheetObserver = initStyleSheetObserver(o, { win: currentWindow });
    var styleDeclarationObserver = initStyleDeclarationObserver(o, {
        win: currentWindow,
    });
    var fontObserver = o.collectFonts ? initFontObserver(o) : function () { };
    var pluginHandlers = [];
    try {
        for (var _b = __values(o.plugins), _c = _b.next(); !_c.done; _c = _b.next()) {
            var plugin = _c.value;
            pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return function () {
        mutationBuffers.forEach(function (b) { return b.reset(); });
        mutationObserver.disconnect();
        mousemoveHandler();
        mouseInteractionHandler();
        scrollHandler();
        viewportResizeHandler();
        inputHandler();
        mediaInteractionHandler();
        styleSheetObserver();
        styleDeclarationObserver();
        fontObserver();
        pluginHandlers.forEach(function (h) { return h(); });
    };
}

export { INPUT_TAGS, initMutationObserver, initObservers, initScrollObserver, mutationBuffers };
