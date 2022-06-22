import { __values } from '../ext/tslib/tslib.es6.js';
import { IncrementalSource } from './types.js';
import { IGNORED_NODE, isShadowRoot, NodeType } from '../../rrweb-snapshot/es/rrweb-snapshot.js';

function on(type, fn, target) {
    if (target === void 0) { target = document; }
    var options = { capture: true, passive: true };
    target.addEventListener(type, fn, options);
    return function () { return target.removeEventListener(type, fn, options); };
}
function createMirror() {
    return {
        map: {},
        getId: function (n) {
            if (!n || !n.__sn) {
                return -1;
            }
            return n.__sn.id;
        },
        getNode: function (id) {
            return this.map[id] || null;
        },
        removeNodeFromMap: function (n) {
            var _this = this;
            var id = n.__sn && n.__sn.id;
            delete this.map[id];
            if (n.childNodes) {
                n.childNodes.forEach(function (child) {
                    return _this.removeNodeFromMap(child);
                });
            }
        },
        has: function (id) {
            return this.map.hasOwnProperty(id);
        },
        reset: function () {
            this.map = {};
        },
    };
}
var DEPARTED_MIRROR_ACCESS_WARNING = 'Please stop import mirror directly. Instead of that,' +
    '\r\n' +
    'now you can use replayer.getMirror() to access the mirror instance of a replayer,' +
    '\r\n' +
    'or you can use record.mirror to access the mirror instance during recording.';
var _mirror = {
    map: {},
    getId: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return -1;
    },
    getNode: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return null;
    },
    removeNodeFromMap: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
    has: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        return false;
    },
    reset: function () {
        console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
};
if (typeof window !== 'undefined' && window.Proxy && window.Reflect) {
    _mirror = new Proxy(_mirror, {
        get: function (target, prop, receiver) {
            if (prop === 'map') {
                console.error(DEPARTED_MIRROR_ACCESS_WARNING);
            }
            return Reflect.get(target, prop, receiver);
        },
    });
}
function throttle(func, wait, options) {
    if (options === void 0) { options = {}; }
    var timeout = null;
    var previous = 0;
    return function (arg) {
        var now = Date.now();
        if (!previous && options.leading === false) {
            previous = now;
        }
        var remaining = wait - (now - previous);
        var context = this;
        var args = arguments;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
        }
        else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(function () {
                previous = options.leading === false ? 0 : Date.now();
                timeout = null;
                func.apply(context, args);
            }, remaining);
        }
    };
}
function hookSetter(target, key, d, isRevoked, win) {
    if (win === void 0) { win = window; }
    var original = win.Object.getOwnPropertyDescriptor(target, key);
    win.Object.defineProperty(target, key, isRevoked
        ? d
        : {
            set: function (value) {
                var _this = this;
                setTimeout(function () {
                    d.set.call(_this, value);
                }, 0);
                if (original && original.set) {
                    original.set.call(this, value);
                }
            },
        });
    return function () { return hookSetter(target, key, original || {}, true); };
}
function patch(source, name, replacement) {
    try {
        if (!(name in source)) {
            return function () { };
        }
        var original_1 = source[name];
        var wrapped = replacement(original_1);
        if (typeof wrapped === 'function') {
            wrapped.prototype = wrapped.prototype || {};
            Object.defineProperties(wrapped, {
                __rrweb_original__: {
                    enumerable: false,
                    value: original_1,
                },
            });
        }
        source[name] = wrapped;
        return function () {
            source[name] = original_1;
        };
    }
    catch (_a) {
        return function () { };
    }
}
function getWindowHeight() {
    return (window.innerHeight ||
        (document.documentElement && document.documentElement.clientHeight) ||
        (document.body && document.body.clientHeight));
}
function getWindowWidth() {
    return (window.innerWidth ||
        (document.documentElement && document.documentElement.clientWidth) ||
        (document.body && document.body.clientWidth));
}
function isBlocked(node, blockClass) {
    if (!node) {
        return false;
    }
    if (node.nodeType === node.ELEMENT_NODE) {
        var needBlock_1 = false;
        if (typeof blockClass === 'string') {
            if (node.closest !== undefined) {
                return node.closest('.' + blockClass) !== null;
            }
            else {
                needBlock_1 = node.classList.contains(blockClass);
            }
        }
        else {
            node.classList.forEach(function (className) {
                if (blockClass.test(className)) {
                    needBlock_1 = true;
                }
            });
        }
        return needBlock_1 || isBlocked(node.parentNode, blockClass);
    }
    if (node.nodeType === node.TEXT_NODE) {
        return isBlocked(node.parentNode, blockClass);
    }
    return isBlocked(node.parentNode, blockClass);
}
function isIgnored(n) {
    if ('__sn' in n) {
        return n.__sn.id === IGNORED_NODE;
    }
    return false;
}
function isAncestorRemoved(target, mirror) {
    if (isShadowRoot(target)) {
        return false;
    }
    var id = mirror.getId(target);
    if (!mirror.has(id)) {
        return true;
    }
    if (target.parentNode &&
        target.parentNode.nodeType === target.DOCUMENT_NODE) {
        return false;
    }
    if (!target.parentNode) {
        return true;
    }
    return isAncestorRemoved(target.parentNode, mirror);
}
function isTouchEvent(event) {
    return Boolean(event.changedTouches);
}
function polyfill(win) {
    if (win === void 0) { win = window; }
    if ('NodeList' in win && !win.NodeList.prototype.forEach) {
        win.NodeList.prototype.forEach = Array.prototype
            .forEach;
    }
    if ('DOMTokenList' in win && !win.DOMTokenList.prototype.forEach) {
        win.DOMTokenList.prototype.forEach = Array.prototype
            .forEach;
    }
    if (!Node.prototype.contains) {
        Node.prototype.contains = function contains(node) {
            if (!(0 in arguments)) {
                throw new TypeError('1 argument is required');
            }
            do {
                if (this === node) {
                    return true;
                }
            } while ((node = node && node.parentNode));
            return false;
        };
    }
}
var TreeIndex = (function () {
    function TreeIndex() {
        this.reset();
    }
    TreeIndex.prototype.add = function (mutation) {
        var parentTreeNode = this.indexes.get(mutation.parentId);
        var treeNode = {
            id: mutation.node.id,
            mutation: mutation,
            children: [],
            texts: [],
            attributes: [],
        };
        if (!parentTreeNode) {
            this.tree[treeNode.id] = treeNode;
        }
        else {
            treeNode.parent = parentTreeNode;
            parentTreeNode.children[treeNode.id] = treeNode;
        }
        this.indexes.set(treeNode.id, treeNode);
    };
    TreeIndex.prototype.remove = function (mutation, mirror) {
        var _this = this;
        var parentTreeNode = this.indexes.get(mutation.parentId);
        var treeNode = this.indexes.get(mutation.id);
        var deepRemoveFromMirror = function (id) {
            _this.removeIdSet.add(id);
            var node = mirror.getNode(id);
            node === null || node === void 0 ? void 0 : node.childNodes.forEach(function (childNode) {
                if ('__sn' in childNode) {
                    deepRemoveFromMirror(childNode.__sn.id);
                }
            });
        };
        var deepRemoveFromTreeIndex = function (node) {
            _this.removeIdSet.add(node.id);
            Object.values(node.children).forEach(function (n) { return deepRemoveFromTreeIndex(n); });
            var _treeNode = _this.indexes.get(node.id);
            if (_treeNode) {
                var _parentTreeNode = _treeNode.parent;
                if (_parentTreeNode) {
                    delete _treeNode.parent;
                    delete _parentTreeNode.children[_treeNode.id];
                    _this.indexes.delete(mutation.id);
                }
            }
        };
        if (!treeNode) {
            this.removeNodeMutations.push(mutation);
            deepRemoveFromMirror(mutation.id);
        }
        else if (!parentTreeNode) {
            delete this.tree[treeNode.id];
            this.indexes.delete(treeNode.id);
            deepRemoveFromTreeIndex(treeNode);
        }
        else {
            delete treeNode.parent;
            delete parentTreeNode.children[treeNode.id];
            this.indexes.delete(mutation.id);
            deepRemoveFromTreeIndex(treeNode);
        }
    };
    TreeIndex.prototype.text = function (mutation) {
        var treeNode = this.indexes.get(mutation.id);
        if (treeNode) {
            treeNode.texts.push(mutation);
        }
        else {
            this.textMutations.push(mutation);
        }
    };
    TreeIndex.prototype.attribute = function (mutation) {
        var treeNode = this.indexes.get(mutation.id);
        if (treeNode) {
            treeNode.attributes.push(mutation);
        }
        else {
            this.attributeMutations.push(mutation);
        }
    };
    TreeIndex.prototype.scroll = function (d) {
        this.scrollMap.set(d.id, d);
    };
    TreeIndex.prototype.input = function (d) {
        this.inputMap.set(d.id, d);
    };
    TreeIndex.prototype.flush = function () {
        var e_1, _a, e_2, _b;
        var _this = this;
        var _c = this, tree = _c.tree, removeNodeMutations = _c.removeNodeMutations, textMutations = _c.textMutations, attributeMutations = _c.attributeMutations;
        var batchMutationData = {
            source: IncrementalSource.Mutation,
            removes: removeNodeMutations,
            texts: textMutations,
            attributes: attributeMutations,
            adds: [],
        };
        var walk = function (treeNode, removed) {
            if (removed) {
                _this.removeIdSet.add(treeNode.id);
            }
            batchMutationData.texts = batchMutationData.texts
                .concat(removed ? [] : treeNode.texts)
                .filter(function (m) { return !_this.removeIdSet.has(m.id); });
            batchMutationData.attributes = batchMutationData.attributes
                .concat(removed ? [] : treeNode.attributes)
                .filter(function (m) { return !_this.removeIdSet.has(m.id); });
            if (!_this.removeIdSet.has(treeNode.id) &&
                !_this.removeIdSet.has(treeNode.mutation.parentId) &&
                !removed) {
                batchMutationData.adds.push(treeNode.mutation);
                if (treeNode.children) {
                    Object.values(treeNode.children).forEach(function (n) { return walk(n, false); });
                }
            }
            else {
                Object.values(treeNode.children).forEach(function (n) { return walk(n, true); });
            }
        };
        Object.values(tree).forEach(function (n) { return walk(n, false); });
        try {
            for (var _d = __values(this.scrollMap.keys()), _e = _d.next(); !_e.done; _e = _d.next()) {
                var id = _e.value;
                if (this.removeIdSet.has(id)) {
                    this.scrollMap.delete(id);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
            }
            finally { if (e_1) throw e_1.error; }
        }
        try {
            for (var _f = __values(this.inputMap.keys()), _g = _f.next(); !_g.done; _g = _f.next()) {
                var id = _g.value;
                if (this.removeIdSet.has(id)) {
                    this.inputMap.delete(id);
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_g && !_g.done && (_b = _f.return)) _b.call(_f);
            }
            finally { if (e_2) throw e_2.error; }
        }
        var scrollMap = new Map(this.scrollMap);
        var inputMap = new Map(this.inputMap);
        this.reset();
        return {
            mutationData: batchMutationData,
            scrollMap: scrollMap,
            inputMap: inputMap,
        };
    };
    TreeIndex.prototype.reset = function () {
        this.tree = [];
        this.indexes = new Map();
        this.removeNodeMutations = [];
        this.textMutations = [];
        this.attributeMutations = [];
        this.removeIdSet = new Set();
        this.scrollMap = new Map();
        this.inputMap = new Map();
    };
    TreeIndex.prototype.idRemoved = function (id) {
        return this.removeIdSet.has(id);
    };
    return TreeIndex;
}());
function queueToResolveTrees(queue) {
    var e_3, _a;
    var queueNodeMap = {};
    var putIntoMap = function (m, parent) {
        var nodeInTree = {
            value: m,
            parent: parent,
            children: [],
        };
        queueNodeMap[m.node.id] = nodeInTree;
        return nodeInTree;
    };
    var queueNodeTrees = [];
    try {
        for (var queue_1 = __values(queue), queue_1_1 = queue_1.next(); !queue_1_1.done; queue_1_1 = queue_1.next()) {
            var mutation = queue_1_1.value;
            var nextId = mutation.nextId, parentId = mutation.parentId;
            if (nextId && nextId in queueNodeMap) {
                var nextInTree = queueNodeMap[nextId];
                if (nextInTree.parent) {
                    var idx = nextInTree.parent.children.indexOf(nextInTree);
                    nextInTree.parent.children.splice(idx, 0, putIntoMap(mutation, nextInTree.parent));
                }
                else {
                    var idx = queueNodeTrees.indexOf(nextInTree);
                    queueNodeTrees.splice(idx, 0, putIntoMap(mutation, null));
                }
                continue;
            }
            if (parentId in queueNodeMap) {
                var parentInTree = queueNodeMap[parentId];
                parentInTree.children.push(putIntoMap(mutation, parentInTree));
                continue;
            }
            queueNodeTrees.push(putIntoMap(mutation, null));
        }
    }
    catch (e_3_1) { e_3 = { error: e_3_1 }; }
    finally {
        try {
            if (queue_1_1 && !queue_1_1.done && (_a = queue_1.return)) _a.call(queue_1);
        }
        finally { if (e_3) throw e_3.error; }
    }
    return queueNodeTrees;
}
function iterateResolveTree(tree, cb) {
    cb(tree.value);
    for (var i = tree.children.length - 1; i >= 0; i--) {
        iterateResolveTree(tree.children[i], cb);
    }
}
function isIframeINode(node) {
    if ('__sn' in node) {
        return (node.__sn.type === NodeType.Element && node.__sn.tagName === 'iframe');
    }
    return false;
}
function getBaseDimension(node, rootIframe) {
    var _a, _b;
    var frameElement = (_b = (_a = node.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) === null || _b === void 0 ? void 0 : _b.frameElement;
    if (!frameElement || frameElement === rootIframe) {
        return {
            x: 0,
            y: 0,
            relativeScale: 1,
            absoluteScale: 1,
        };
    }
    var frameDimension = frameElement.getBoundingClientRect();
    var frameBaseDimension = getBaseDimension(frameElement, rootIframe);
    var relativeScale = frameDimension.height / frameElement.clientHeight;
    return {
        x: frameDimension.x * frameBaseDimension.relativeScale +
            frameBaseDimension.x,
        y: frameDimension.y * frameBaseDimension.relativeScale +
            frameBaseDimension.y,
        relativeScale: relativeScale,
        absoluteScale: frameBaseDimension.absoluteScale * relativeScale,
    };
}
function hasShadowRoot(n) {
    return Boolean(n === null || n === void 0 ? void 0 : n.shadowRoot);
}

export { TreeIndex, _mirror, createMirror, getBaseDimension, getWindowHeight, getWindowWidth, hasShadowRoot, hookSetter, isAncestorRemoved, isBlocked, isIframeINode, isIgnored, isTouchEvent, iterateResolveTree, on, patch, polyfill, queueToResolveTrees, throttle };
