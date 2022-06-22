import { __spreadArray, __read } from '../../../../ext/tslib/tslib.es6.js';
import { encode } from '../../../../../../ext/base64-arraybuffer/dist/base64-arraybuffer.es5.js';

var webGLVarMap = new Map();
function variableListFor(ctx, ctor) {
    var contextMap = webGLVarMap.get(ctx);
    if (!contextMap) {
        contextMap = new Map();
        webGLVarMap.set(ctx, contextMap);
    }
    if (!contextMap.has(ctor)) {
        contextMap.set(ctor, []);
    }
    return contextMap.get(ctor);
}
var saveWebGLVar = function (value, win, ctx) {
    if (!value ||
        !(isInstanceOfWebGLObject(value, win) || typeof value === 'object'))
        return;
    var name = value.constructor.name;
    var list = variableListFor(ctx, name);
    var index = list.indexOf(value);
    if (index === -1) {
        index = list.length;
        list.push(value);
    }
    return index;
};
function serializeArg(value, win, ctx) {
    if (value instanceof Array) {
        return value.map(function (arg) { return serializeArg(arg, win, ctx); });
    }
    else if (value === null) {
        return value;
    }
    else if (value instanceof Float32Array ||
        value instanceof Float64Array ||
        value instanceof Int32Array ||
        value instanceof Uint32Array ||
        value instanceof Uint8Array ||
        value instanceof Uint16Array ||
        value instanceof Int16Array ||
        value instanceof Int8Array ||
        value instanceof Uint8ClampedArray) {
        var name_1 = value.constructor.name;
        return {
            rr_type: name_1,
            args: [Object.values(value)],
        };
    }
    else if (value instanceof ArrayBuffer) {
        var name_2 = value.constructor.name;
        var base64 = encode(value);
        return {
            rr_type: name_2,
            base64: base64,
        };
    }
    else if (value instanceof DataView) {
        var name_3 = value.constructor.name;
        return {
            rr_type: name_3,
            args: [
                serializeArg(value.buffer, win, ctx),
                value.byteOffset,
                value.byteLength,
            ],
        };
    }
    else if (value instanceof HTMLImageElement) {
        var name_4 = value.constructor.name;
        var src = value.src;
        return {
            rr_type: name_4,
            src: src,
        };
    }
    else if (value instanceof ImageData) {
        var name_5 = value.constructor.name;
        return {
            rr_type: name_5,
            args: [serializeArg(value.data, win, ctx), value.width, value.height],
        };
    }
    else if (isInstanceOfWebGLObject(value, win) || typeof value === 'object') {
        var name_6 = value.constructor.name;
        var index = saveWebGLVar(value, win, ctx);
        return {
            rr_type: name_6,
            index: index,
        };
    }
    return value;
}
var serializeArgs = function (args, win, ctx) {
    return __spreadArray([], __read(args), false).map(function (arg) { return serializeArg(arg, win, ctx); });
};
var isInstanceOfWebGLObject = function (value, win) {
    var webGLConstructorNames = [
        'WebGLActiveInfo',
        'WebGLBuffer',
        'WebGLFramebuffer',
        'WebGLProgram',
        'WebGLRenderbuffer',
        'WebGLShader',
        'WebGLShaderPrecisionFormat',
        'WebGLTexture',
        'WebGLUniformLocation',
        'WebGLVertexArrayObject',
        'WebGLVertexArrayObjectOES',
    ];
    var supportedWebGLConstructorNames = webGLConstructorNames.filter(function (name) { return typeof win[name] === 'function'; });
    return Boolean(supportedWebGLConstructorNames.find(function (name) { return value instanceof win[name]; }));
};

export { isInstanceOfWebGLObject, saveWebGLVar, serializeArg, serializeArgs, variableListFor };
