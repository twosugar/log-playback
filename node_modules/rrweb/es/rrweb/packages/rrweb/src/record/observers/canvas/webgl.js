import { __spreadArray, __read, __values } from '../../../../ext/tslib/tslib.es6.js';
import { CanvasContext } from '../../../types.js';
import { patch, isBlocked, hookSetter } from '../../../utils.js';
import { saveWebGLVar, serializeArgs } from './serialize-args.js';

function patchGLPrototype(prototype, type, cb, blockClass, mirror, win) {
    var e_1, _a;
    var handlers = [];
    var props = Object.getOwnPropertyNames(prototype);
    var _loop_1 = function (prop) {
        try {
            if (typeof prototype[prop] !== 'function') {
                return "continue";
            }
            var restoreHandler = patch(prototype, prop, function (original) {
                return function () {
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    var result = original.apply(this, args);
                    saveWebGLVar(result, win, prototype);
                    if (!isBlocked(this.canvas, blockClass)) {
                        var id = mirror.getId(this.canvas);
                        var recordArgs = serializeArgs(__spreadArray([], __read(args), false), win, prototype);
                        var mutation = {
                            type: type,
                            property: prop,
                            args: recordArgs,
                        };
                        cb(this.canvas, mutation);
                    }
                    return result;
                };
            });
            handlers.push(restoreHandler);
        }
        catch (_b) {
            var hookHandler = hookSetter(prototype, prop, {
                set: function (v) {
                    cb(this.canvas, {
                        type: type,
                        property: prop,
                        args: [v],
                        setter: true,
                    });
                },
            });
            handlers.push(hookHandler);
        }
    };
    try {
        for (var props_1 = __values(props), props_1_1 = props_1.next(); !props_1_1.done; props_1_1 = props_1.next()) {
            var prop = props_1_1.value;
            _loop_1(prop);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (props_1_1 && !props_1_1.done && (_a = props_1.return)) _a.call(props_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return handlers;
}
function initCanvasWebGLMutationObserver(cb, win, blockClass, mirror) {
    var handlers = [];
    handlers.push.apply(handlers, __spreadArray([], __read(patchGLPrototype(win.WebGLRenderingContext.prototype, CanvasContext.WebGL, cb, blockClass, mirror, win)), false));
    if (typeof win.WebGL2RenderingContext !== 'undefined') {
        handlers.push.apply(handlers, __spreadArray([], __read(patchGLPrototype(win.WebGL2RenderingContext.prototype, CanvasContext.WebGL2, cb, blockClass, mirror, win)), false));
    }
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}

export default initCanvasWebGLMutationObserver;
