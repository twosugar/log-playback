import { __values, __spreadArray, __read } from '../../../../ext/tslib/tslib.es6.js';
import { patch } from '../../../utils.js';
import { ErrorStackParser } from './error-stack-parser.js';
import { stringify } from './stringify.js';

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

export { PLUGIN_NAME, getRecordConsolePlugin };
