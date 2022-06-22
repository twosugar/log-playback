import { __values, __spreadArray, __read } from '../../../../ext/tslib/tslib.es6.js';
import { CanvasContext } from '../../../types.js';
import { patch, isBlocked, hookSetter } from '../../../utils.js';

function initCanvas2DMutationObserver(cb, win, blockClass, mirror) {
    var e_1, _a;
    var handlers = [];
    var props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
    var _loop_1 = function (prop) {
        try {
            if (typeof win.CanvasRenderingContext2D.prototype[prop] !== 'function') {
                return "continue";
            }
            var restoreHandler = patch(win.CanvasRenderingContext2D.prototype, prop, function (original) {
                return function () {
                    var _this = this;
                    var args = [];
                    for (var _i = 0; _i < arguments.length; _i++) {
                        args[_i] = arguments[_i];
                    }
                    if (!isBlocked(this.canvas, blockClass)) {
                        setTimeout(function () {
                            var recordArgs = __spreadArray([], __read(args), false);
                            if (prop === 'drawImage') {
                                if (recordArgs[0] &&
                                    recordArgs[0] instanceof HTMLCanvasElement) {
                                    var canvas = recordArgs[0];
                                    var ctx = canvas.getContext('2d');
                                    var imgd = ctx === null || ctx === void 0 ? void 0 : ctx.getImageData(0, 0, canvas.width, canvas.height);
                                    var pix = imgd === null || imgd === void 0 ? void 0 : imgd.data;
                                    recordArgs[0] = JSON.stringify(pix);
                                }
                            }
                            cb(_this.canvas, {
                                type: CanvasContext['2D'],
                                property: prop,
                                args: recordArgs,
                            });
                        }, 0);
                    }
                    return original.apply(this, args);
                };
            });
            handlers.push(restoreHandler);
        }
        catch (_b) {
            var hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, {
                set: function (v) {
                    cb(this.canvas, {
                        type: CanvasContext['2D'],
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
        for (var props2D_1 = __values(props2D), props2D_1_1 = props2D_1.next(); !props2D_1_1.done; props2D_1_1 = props2D_1.next()) {
            var prop = props2D_1_1.value;
            _loop_1(prop);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (props2D_1_1 && !props2D_1_1.done && (_a = props2D_1.return)) _a.call(props2D_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return function () {
        handlers.forEach(function (h) { return h(); });
    };
}

export default initCanvas2DMutationObserver;
