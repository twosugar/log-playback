import { __values } from '../../../../ext/tslib/tslib.es6.js';

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

export { stringify };
