import { __values, __spreadArray, __read } from '../../../../ext/tslib/tslib.es6.js';
import { PLUGIN_NAME } from '../record/index.js';
import { EventType, IncrementalSource } from '../../../types.js';

var ORIGINAL_ATTRIBUTE_NAME = '__rrweb_original__';
var defaultLogConfig = {
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
    replayLogger: undefined,
};
var LogReplayPlugin = (function () {
    function LogReplayPlugin(config) {
        this.config = Object.assign(defaultLogConfig, config);
    }
    LogReplayPlugin.prototype.getConsoleLogger = function () {
        var e_1, _a;
        var _this = this;
        var replayLogger = {};
        var _loop_1 = function (level) {
            if (level === 'trace') {
                replayLogger[level] = function (data) {
                    var logger = console.log[ORIGINAL_ATTRIBUTE_NAME]
                        ? console.log[ORIGINAL_ATTRIBUTE_NAME]
                        : console.log;
                    logger.apply(void 0, __spreadArray(__spreadArray([], __read(data.payload.map(function (s) { return JSON.parse(s); })), false), [_this.formatMessage(data)], false));
                };
            }
            else {
                replayLogger[level] = function (data) {
                    var logger = console[level][ORIGINAL_ATTRIBUTE_NAME]
                        ? console[level][ORIGINAL_ATTRIBUTE_NAME]
                        : console[level];
                    logger.apply(void 0, __spreadArray(__spreadArray([], __read(data.payload.map(function (s) { return JSON.parse(s); })), false), [_this.formatMessage(data)], false));
                };
            }
        };
        try {
            for (var _b = __values(this.config.level), _c = _b.next(); !_c.done; _c = _b.next()) {
                var level = _c.value;
                _loop_1(level);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return replayLogger;
    };
    LogReplayPlugin.prototype.formatMessage = function (data) {
        if (data.trace.length === 0) {
            return '';
        }
        var stackPrefix = '\n\tat ';
        var result = stackPrefix;
        result += data.trace.join(stackPrefix);
        return result;
    };
    return LogReplayPlugin;
}());
var getReplayConsolePlugin = function (options) {
    var replayLogger = (options === null || options === void 0 ? void 0 : options.replayLogger) || new LogReplayPlugin(options).getConsoleLogger();
    return {
        handler: function (event, _isSync, context) {
            var logData = null;
            if (event.type === EventType.IncrementalSnapshot &&
                event.data.source === IncrementalSource.Log) {
                logData = event.data;
            }
            else if (event.type === EventType.Plugin &&
                event.data.plugin === PLUGIN_NAME) {
                logData = event.data.payload;
            }
            if (logData) {
                try {
                    if (typeof replayLogger[logData.level] === 'function') {
                        replayLogger[logData.level](logData);
                    }
                }
                catch (error) {
                    if (context.replayer.config.showWarning) {
                        console.warn(error);
                    }
                }
            }
        },
    };
};

export { getReplayConsolePlugin };
