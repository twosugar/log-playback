'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var defaultOptions = {
    key: '_sid',
};
var PLUGIN_NAME = 'rrweb/sequential-id@1';
var getRecordSequentialIdPlugin = function (options) {
    var _options = options
        ? Object.assign({}, defaultOptions, options)
        : defaultOptions;
    var id = 0;
    return {
        name: PLUGIN_NAME,
        eventProcessor: function (event) {
            var _a;
            Object.assign(event, (_a = {},
                _a[_options.key] = ++id,
                _a));
            return event;
        },
        options: _options,
    };
};

exports.PLUGIN_NAME = PLUGIN_NAME;
exports.getRecordSequentialIdPlugin = getRecordSequentialIdPlugin;
