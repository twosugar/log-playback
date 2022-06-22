import { __spreadArray, __read } from '../../../ext/tslib/tslib.es6.js';
import { decode } from '../../../../../ext/base64-arraybuffer/dist/base64-arraybuffer.es5.js';
import { CanvasContext } from '../../types.js';

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
function getContext(target, type) {
    try {
        if (type === CanvasContext.WebGL) {
            return (target.getContext('webgl') || target.getContext('experimental-webgl'));
        }
        return target.getContext('webgl2');
    }
    catch (e) {
        return null;
    }
}
var WebGLVariableConstructorsNames = [
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
];
function saveToWebGLVarMap(ctx, result) {
    if (!(result === null || result === void 0 ? void 0 : result.constructor))
        return;
    var name = result.constructor.name;
    if (!WebGLVariableConstructorsNames.includes(name))
        return;
    var variables = variableListFor(ctx, name);
    if (!variables.includes(result))
        variables.push(result);
}
function deserializeArg(imageMap, ctx) {
    return function (arg) {
        if (arg && typeof arg === 'object' && 'rr_type' in arg) {
            if ('index' in arg) {
                var name_1 = arg.rr_type, index = arg.index;
                return variableListFor(ctx, name_1)[index];
            }
            else if ('args' in arg) {
                var name_2 = arg.rr_type, args = arg.args;
                var ctor = window[name_2];
                return new (ctor.bind.apply(ctor, __spreadArray([void 0], __read(args.map(deserializeArg(imageMap, ctx))), false)))();
            }
            else if ('base64' in arg) {
                return decode(arg.base64);
            }
            else if ('src' in arg) {
                var image = imageMap.get(arg.src);
                if (image) {
                    return image;
                }
                else {
                    var image_1 = new Image();
                    image_1.src = arg.src;
                    imageMap.set(arg.src, image_1);
                    return image_1;
                }
            }
        }
        else if (Array.isArray(arg)) {
            return arg.map(deserializeArg(imageMap, ctx));
        }
        return arg;
    };
}
function webglMutation(_a) {
    var mutation = _a.mutation, target = _a.target, type = _a.type, imageMap = _a.imageMap, errorHandler = _a.errorHandler;
    try {
        var ctx = getContext(target, type);
        if (!ctx)
            return;
        if (mutation.setter) {
            ctx[mutation.property] = mutation.args[0];
            return;
        }
        var original = ctx[mutation.property];
        var args = mutation.args.map(deserializeArg(imageMap, ctx));
        var result = original.apply(ctx, args);
        saveToWebGLVarMap(ctx, result);
        var debugMode = false;
        if (debugMode) {
            if (mutation.property === 'compileShader') {
                if (!ctx.getShaderParameter(args[0], ctx.COMPILE_STATUS))
                    console.warn('something went wrong in replay', ctx.getShaderInfoLog(args[0]));
            }
            else if (mutation.property === 'linkProgram') {
                ctx.validateProgram(args[0]);
                if (!ctx.getProgramParameter(args[0], ctx.LINK_STATUS))
                    console.warn('something went wrong in replay', ctx.getProgramInfoLog(args[0]));
            }
            var webglError = ctx.getError();
            if (webglError !== ctx.NO_ERROR) {
                console.warn.apply(console, __spreadArray(['WEBGL ERROR',
                    webglError,
                    'on command:',
                    mutation.property], __read(args), false));
            }
        }
    }
    catch (error) {
        errorHandler(mutation, error);
    }
}

export default webglMutation;
export { deserializeArg, variableListFor };
