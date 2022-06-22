var rrwebConsoleRecord = (function (exports) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var EventType;
    (function (EventType) {
        EventType[EventType["DomContentLoaded"] = 0] = "DomContentLoaded";
        EventType[EventType["Load"] = 1] = "Load";
        EventType[EventType["FullSnapshot"] = 2] = "FullSnapshot";
        EventType[EventType["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
        EventType[EventType["Meta"] = 4] = "Meta";
        EventType[EventType["Custom"] = 5] = "Custom";
        EventType[EventType["Plugin"] = 6] = "Plugin";
    })(EventType || (EventType = {}));
    var IncrementalSource;
    (function (IncrementalSource) {
        IncrementalSource[IncrementalSource["Mutation"] = 0] = "Mutation";
        IncrementalSource[IncrementalSource["MouseMove"] = 1] = "MouseMove";
        IncrementalSource[IncrementalSource["MouseInteraction"] = 2] = "MouseInteraction";
        IncrementalSource[IncrementalSource["Scroll"] = 3] = "Scroll";
        IncrementalSource[IncrementalSource["ViewportResize"] = 4] = "ViewportResize";
        IncrementalSource[IncrementalSource["Input"] = 5] = "Input";
        IncrementalSource[IncrementalSource["TouchMove"] = 6] = "TouchMove";
        IncrementalSource[IncrementalSource["MediaInteraction"] = 7] = "MediaInteraction";
        IncrementalSource[IncrementalSource["StyleSheetRule"] = 8] = "StyleSheetRule";
        IncrementalSource[IncrementalSource["CanvasMutation"] = 9] = "CanvasMutation";
        IncrementalSource[IncrementalSource["Font"] = 10] = "Font";
        IncrementalSource[IncrementalSource["Log"] = 11] = "Log";
        IncrementalSource[IncrementalSource["Drag"] = 12] = "Drag";
        IncrementalSource[IncrementalSource["StyleDeclaration"] = 13] = "StyleDeclaration";
    })(IncrementalSource || (IncrementalSource = {}));
    var MouseInteractions;
    (function (MouseInteractions) {
        MouseInteractions[MouseInteractions["MouseUp"] = 0] = "MouseUp";
        MouseInteractions[MouseInteractions["MouseDown"] = 1] = "MouseDown";
        MouseInteractions[MouseInteractions["Click"] = 2] = "Click";
        MouseInteractions[MouseInteractions["ContextMenu"] = 3] = "ContextMenu";
        MouseInteractions[MouseInteractions["DblClick"] = 4] = "DblClick";
        MouseInteractions[MouseInteractions["Focus"] = 5] = "Focus";
        MouseInteractions[MouseInteractions["Blur"] = 6] = "Blur";
        MouseInteractions[MouseInteractions["TouchStart"] = 7] = "TouchStart";
        MouseInteractions[MouseInteractions["TouchMove_Departed"] = 8] = "TouchMove_Departed";
        MouseInteractions[MouseInteractions["TouchEnd"] = 9] = "TouchEnd";
        MouseInteractions[MouseInteractions["TouchCancel"] = 10] = "TouchCancel";
    })(MouseInteractions || (MouseInteractions = {}));
    var CanvasContext;
    (function (CanvasContext) {
        CanvasContext[CanvasContext["2D"] = 0] = "2D";
        CanvasContext[CanvasContext["WebGL"] = 1] = "WebGL";
        CanvasContext[CanvasContext["WebGL2"] = 2] = "WebGL2";
    })(CanvasContext || (CanvasContext = {}));
    var MediaInteractions;
    (function (MediaInteractions) {
        MediaInteractions[MediaInteractions["Play"] = 0] = "Play";
        MediaInteractions[MediaInteractions["Pause"] = 1] = "Pause";
        MediaInteractions[MediaInteractions["Seeked"] = 2] = "Seeked";
        MediaInteractions[MediaInteractions["VolumeChange"] = 3] = "VolumeChange";
    })(MediaInteractions || (MediaInteractions = {}));
    var ReplayerEvents;
    (function (ReplayerEvents) {
        ReplayerEvents["Start"] = "start";
        ReplayerEvents["Pause"] = "pause";
        ReplayerEvents["Resume"] = "resume";
        ReplayerEvents["Resize"] = "resize";
        ReplayerEvents["Finish"] = "finish";
        ReplayerEvents["FullsnapshotRebuilded"] = "fullsnapshot-rebuilded";
        ReplayerEvents["LoadStylesheetStart"] = "load-stylesheet-start";
        ReplayerEvents["LoadStylesheetEnd"] = "load-stylesheet-end";
        ReplayerEvents["SkipStart"] = "skip-start";
        ReplayerEvents["SkipEnd"] = "skip-end";
        ReplayerEvents["MouseInteraction"] = "mouse-interaction";
        ReplayerEvents["EventCast"] = "event-cast";
        ReplayerEvents["CustomEvent"] = "custom-event";
        ReplayerEvents["Flush"] = "flush";
        ReplayerEvents["StateChange"] = "state-change";
        ReplayerEvents["PlayBack"] = "play-back";
    })(ReplayerEvents || (ReplayerEvents = {}));

    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["Document"] = 0] = "Document";
        NodeType[NodeType["DocumentType"] = 1] = "DocumentType";
        NodeType[NodeType["Element"] = 2] = "Element";
        NodeType[NodeType["Text"] = 3] = "Text";
        NodeType[NodeType["CDATA"] = 4] = "CDATA";
        NodeType[NodeType["Comment"] = 5] = "Comment";
    })(NodeType || (NodeType = {}));

    var DEPARTED_MIRROR_ACCESS_WARNING = 'Please stop import mirror directly. Instead of that,' +
        '\r\n' +
        'now you can use replayer.getMirror() to access the mirror instance of a replayer,' +
        '\r\n' +
        'or you can use record.mirror to access the mirror instance during recording.';
    var _mirror = {
        map: {},
        getId: function () {
            console.error(DEPARTED_MIRROR_ACCESS_WARNING);
            return -1;
        },
        getNode: function () {
            console.error(DEPARTED_MIRROR_ACCESS_WARNING);
            return null;
        },
        removeNodeFromMap: function () {
            console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        },
        has: function () {
            console.error(DEPARTED_MIRROR_ACCESS_WARNING);
            return false;
        },
        reset: function () {
            console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        },
    };
    if (typeof window !== 'undefined' && window.Proxy && window.Reflect) {
        _mirror = new Proxy(_mirror, {
            get: function (target, prop, receiver) {
                if (prop === 'map') {
                    console.error(DEPARTED_MIRROR_ACCESS_WARNING);
                }
                return Reflect.get(target, prop, receiver);
            },
        });
    }
    function patch(source, name, replacement) {
        try {
            if (!(name in source)) {
                return function () { };
            }
            var original_1 = source[name];
            var wrapped = replacement(original_1);
            if (typeof wrapped === 'function') {
                wrapped.prototype = wrapped.prototype || {};
                Object.defineProperties(wrapped, {
                    __rrweb_original__: {
                        enumerable: false,
                        value: original_1,
                    },
                });
            }
            source[name] = wrapped;
            return function () {
                source[name] = original_1;
            };
        }
        catch (_a) {
            return function () { };
        }
    }

    var StackFrame = (function () {
        function StackFrame(obj) {
            this.fileName = obj.fileName || '';
            this.functionName = obj.functionName || '';
            this.lineNumber = obj.lineNumber;
            this.columnNumber = obj.columnNumber;
        }
        StackFrame.prototype.toString = function () {
            var lineNumber = this.lineNumber || '';
            var columnNumber = this.columnNumber || '';
            if (this.functionName) {
                return (this.functionName +
                    ' (' +
                    this.fileName +
                    ':' +
                    lineNumber +
                    ':' +
                    columnNumber +
                    ')');
            }
            return this.fileName + ':' + lineNumber + ':' + columnNumber;
        };
        return StackFrame;
    }());
    var FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
    var CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
    var SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
    var ErrorStackParser = {
        parse: function (error) {
            if (!error) {
                return [];
            }
            if (typeof error.stacktrace !== 'undefined' ||
                typeof error['opera#sourceloc'] !== 'undefined') {
                return this.parseOpera(error);
            }
            else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
                return this.parseV8OrIE(error);
            }
            else if (error.stack) {
                return this.parseFFOrSafari(error);
            }
            else {
                throw new Error('Cannot parse given Error object');
            }
        },
        extractLocation: function (urlLike) {
            if (urlLike.indexOf(':') === -1) {
                return [urlLike];
            }
            var regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
            var parts = regExp.exec(urlLike.replace(/[()]/g, ''));
            if (!parts)
                throw new Error("Cannot parse given url: ".concat(urlLike));
            return [parts[1], parts[2] || undefined, parts[3] || undefined];
        },
        parseV8OrIE: function (error) {
            var filtered = error.stack.split('\n').filter(function (line) {
                return !!line.match(CHROME_IE_STACK_REGEXP);
            }, this);
            return filtered.map(function (line) {
                if (line.indexOf('(eval ') > -1) {
                    line = line
                        .replace(/eval code/g, 'eval')
                        .replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
                }
                var sanitizedLine = line.replace(/^\s+/, '').replace(/\(eval code/g, '(');
                var location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
                sanitizedLine = location
                    ? sanitizedLine.replace(location[0], '')
                    : sanitizedLine;
                var tokens = sanitizedLine.split(/\s+/).slice(1);
                var locationParts = this.extractLocation(location ? location[1] : tokens.pop());
                var functionName = tokens.join(' ') || undefined;
                var fileName = ['eval', '<anonymous>'].indexOf(locationParts[0]) > -1
                    ? undefined
                    : locationParts[0];
                return new StackFrame({
                    functionName: functionName,
                    fileName: fileName,
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                });
            }, this);
        },
        parseFFOrSafari: function (error) {
            var filtered = error.stack.split('\n').filter(function (line) {
                return !line.match(SAFARI_NATIVE_CODE_REGEXP);
            }, this);
            return filtered.map(function (line) {
                if (line.indexOf(' > eval') > -1) {
                    line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ':$1');
                }
                if (line.indexOf('@') === -1 && line.indexOf(':') === -1) {
                    return new StackFrame({
                        functionName: line,
                    });
                }
                else {
                    var functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
                    var matches = line.match(functionNameRegex);
                    var functionName = matches && matches[1] ? matches[1] : undefined;
                    var locationParts = this.extractLocation(line.replace(functionNameRegex, ''));
                    return new StackFrame({
                        functionName: functionName,
                        fileName: locationParts[0],
                        lineNumber: locationParts[1],
                        columnNumber: locationParts[2],
                    });
                }
            }, this);
        },
        parseOpera: function (e) {
            if (!e.stacktrace ||
                (e.message.indexOf('\n') > -1 &&
                    e.message.split('\n').length > e.stacktrace.split('\n').length)) {
                return this.parseOpera9(e);
            }
            else if (!e.stack) {
                return this.parseOpera10(e);
            }
            else {
                return this.parseOpera11(e);
            }
        },
        parseOpera9: function (e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n');
            var result = [];
            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        fileName: match[2],
                        lineNumber: parseFloat(match[1]),
                    }));
                }
            }
            return result;
        },
        parseOpera10: function (e) {
            var lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n');
            var result = [];
            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(new StackFrame({
                        functionName: match[3] || undefined,
                        fileName: match[2],
                        lineNumber: parseFloat(match[1]),
                    }));
                }
            }
            return result;
        },
        parseOpera11: function (error) {
            var filtered = error.stack.split('\n').filter(function (line) {
                return (!!line.match(FIREFOX_SAFARI_STACK_REGEXP) &&
                    !line.match(/^Error created at/));
            }, this);
            return filtered.map(function (line) {
                var tokens = line.split('@');
                var locationParts = this.extractLocation(tokens.pop());
                var functionCall = tokens.shift() || '';
                var functionName = functionCall
                    .replace(/<anonymous function(: (\w+))?>/, '$2')
                    .replace(/\([^)]*\)/g, '') || undefined;
                return new StackFrame({
                    functionName: functionName,
                    fileName: locationParts[0],
                    lineNumber: locationParts[1],
                    columnNumber: locationParts[2],
                });
            }, this);
        },
    };

    function pathToSelector(node) {
        if (!node || !node.outerHTML) {
            return '';
        }
        var path = '';
        while (node.parentElement) {
            var name_1 = node.localName;
            if (!name_1) {
                break;
            }
            name_1 = name_1.toLowerCase();
            var parent_1 = node.parentElement;
            var domSiblings = [];
            if (parent_1.children && parent_1.children.length > 0) {
                for (var i = 0; i < parent_1.children.length; i++) {
                    var sibling = parent_1.children[i];
                    if (sibling.localName && sibling.localName.toLowerCase) {
                        if (sibling.localName.toLowerCase() === name_1) {
                            domSiblings.push(sibling);
                        }
                    }
                }
            }
            if (domSiblings.length > 1) {
                name_1 += ':eq(' + domSiblings.indexOf(node) + ')';
            }
            path = name_1 + (path ? '>' + path : '');
            node = parent_1;
        }
        return path;
    }
    function isObject(obj) {
        return Object.prototype.toString.call(obj) === '[object Object]';
    }
    function isObjTooDeep(obj, limit) {
        var e_1, _a;
        if (limit === 0) {
            return true;
        }
        var keys = Object.keys(obj);
        try {
            for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
                var key = keys_1_1.value;
                if (isObject(obj[key]) && isObjTooDeep(obj[key], limit - 1)) {
                    return true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return)) _a.call(keys_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return false;
    }
    function stringify(obj, stringifyOptions) {
        var options = {
            numOfKeysLimit: 50,
            depthOfLimit: 4,
        };
        Object.assign(options, stringifyOptions);
        var stack = [];
        var keys = [];
        return JSON.stringify(obj, function (key, value) {
            if (stack.length > 0) {
                var thisPos = stack.indexOf(this);
                ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
                ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
                if (~stack.indexOf(value)) {
                    if (stack[0] === value) {
                        value = '[Circular ~]';
                    }
                    else {
                        value =
                            '[Circular ~.' +
                                keys.slice(0, stack.indexOf(value)).join('.') +
                                ']';
                    }
                }
            }
            else {
                stack.push(value);
            }
            if (value === null || value === undefined) {
                return value;
            }
            if (shouldIgnore(value)) {
                return toString(value);
            }
            if (value instanceof Event) {
                var eventResult = {};
                for (var eventKey in value) {
                    var eventValue = value[eventKey];
                    if (Array.isArray(eventValue)) {
                        eventResult[eventKey] = pathToSelector(eventValue.length ? eventValue[0] : null);
                    }
                    else {
                        eventResult[eventKey] = eventValue;
                    }
                }
                return eventResult;
            }
            else if (value instanceof Node) {
                if (value instanceof HTMLElement) {
                    return value ? value.outerHTML : '';
                }
                return value.nodeName;
            }
            else if (value instanceof Error) {
                return value.stack
                    ? value.stack + '\nEnd of stack for Error object'
                    : value.name + ': ' + value.message;
            }
            return value;
        });
        function shouldIgnore(_obj) {
            if (isObject(_obj) && Object.keys(_obj).length > options.numOfKeysLimit) {
                return true;
            }
            if (typeof _obj === 'function') {
                return true;
            }
            if (isObject(_obj) && isObjTooDeep(_obj, options.depthOfLimit)) {
                return true;
            }
            return false;
        }
        function toString(_obj) {
            var str = _obj.toString();
            if (options.stringLengthLimit && str.length > options.stringLengthLimit) {
                str = "".concat(str.slice(0, options.stringLengthLimit), "...");
            }
            return str;
        }
    }

    var defaultLogOptions = {
        level: [
            'assert',
            'clear',
            'count',
            'countReset',
            'debug',
            'dir',
            'dirxml',
            'error',
            'group',
            'groupCollapsed',
            'groupEnd',
            'info',
            'log',
            'table',
            'time',
            'timeEnd',
            'timeLog',
            'trace',
            'warn',
        ],
        lengthThreshold: 1000,
        logger: 'console',
    };
    function initLogObserver(cb, win, logOptions) {
        var e_1, _a;
        var loggerType = logOptions.logger;
        if (!loggerType) {
            return function () { };
        }
        var logger;
        if (typeof loggerType === 'string') {
            logger = win[loggerType];
        }
        else {
            logger = loggerType;
        }
        var logCount = 0;
        var cancelHandlers = [];
        if (logOptions.level.includes('error')) {
            if (window) {
                var errorHandler_1 = function (event) {
                    var message = event.message, error = event.error;
                    var trace = ErrorStackParser.parse(error).map(function (stackFrame) { return stackFrame.toString(); });
                    var payload = [stringify(message, logOptions.stringifyOptions)];
                    cb({
                        level: 'error',
                        trace: trace,
                        payload: payload,
                    });
                };
                window.addEventListener('error', errorHandler_1);
                cancelHandlers.push(function () {
                    if (window)
                        window.removeEventListener('error', errorHandler_1);
                });
            }
        }
        try {
            for (var _b = __values(logOptions.level), _c = _b.next(); !_c.done; _c = _b.next()) {
                var levelType = _c.value;
                cancelHandlers.push(replace(logger, levelType));
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
            cancelHandlers.forEach(function (h) { return h(); });
        };
        function replace(_logger, level) {
            var _this = this;
            if (!_logger[level]) {
                return function () { };
            }
            return patch(_logger, level, function (original) {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    original.apply(_this, args);
                    try {
                        var trace = ErrorStackParser.parse(new Error())
                            .map(function (stackFrame) { return stackFrame.toString(); })
                            .splice(1);
                        var payload = args.map(function (s) {
                            return stringify(s, logOptions.stringifyOptions);
                        });
                        logCount++;
                        if (logCount < logOptions.lengthThreshold) {
                            cb({
                                level: level,
                                trace: trace,
                                payload: payload,
                            });
                        }
                        else if (logCount === logOptions.lengthThreshold) {
                            cb({
                                level: 'warn',
                                trace: [],
                                payload: [
                                    stringify('The number of log records reached the threshold.'),
                                ],
                            });
                        }
                    }
                    catch (error) {
                        original.apply(void 0, __spreadArray(['rrweb logger error:', error], __read(args), false));
                    }
                };
            });
        }
    }
    var PLUGIN_NAME = 'rrweb/console@1';
    var getRecordConsolePlugin = function (options) { return ({
        name: PLUGIN_NAME,
        observer: initLogObserver,
        options: options
            ? Object.assign({}, defaultLogOptions, options)
            : defaultLogOptions,
    }); };

    exports.PLUGIN_NAME = PLUGIN_NAME;
    exports.getRecordConsolePlugin = getRecordConsolePlugin;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
