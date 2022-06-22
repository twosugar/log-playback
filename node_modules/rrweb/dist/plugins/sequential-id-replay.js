var rrwebSequentialIdReplay = (function (exports) {
    'use strict';

    var defaultOptions = {
        key: '_sid',
        warnOnMissingId: true,
    };
    var getReplaySequentialIdPlugin = function (options) {
        var _a = options
            ? Object.assign({}, defaultOptions, options)
            : defaultOptions, key = _a.key, warnOnMissingId = _a.warnOnMissingId;
        var currentId = 1;
        return {
            handler: function (event) {
                if (key in event) {
                    var id = event[key];
                    if (id !== currentId) {
                        console.error("[sequential-id-plugin]: expect to get an id with value \"".concat(currentId, "\", but got \"").concat(id, "\""));
                    }
                    else {
                        currentId++;
                    }
                }
                else if (warnOnMissingId) {
                    console.warn("[sequential-id-plugin]: failed to get id in key: \"".concat(key, "\""));
                }
            },
        };
    };

    exports.getReplaySequentialIdPlugin = getReplaySequentialIdPlugin;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
