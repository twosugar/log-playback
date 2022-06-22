import { __spreadArray, __read } from '../../../../ext/tslib/tslib.es6.js';
import { patch, isBlocked } from '../../../utils.js';

function initCanvasContextObserver(win, blockClass) {
    var handlers = [];
    try {
        var restoreHandler = patch(win.HTMLCanvasElement.prototype, 'getContext', function (original) {
            return function (contextType) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (!isBlocked(this, blockClass)) {
                    if (!('__context' in this))
                        this.__context = contextType;
                }
                return original.apply(this, __spreadArray([contextType], __read(args), false));
            };
        });
        handlers.push(restoreHandler);
    }
    catch (_a) {
        console.error('failed to patch HTMLCanvasElement.prototype.getContext');
    }
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}

export default initCanvasContextObserver;
