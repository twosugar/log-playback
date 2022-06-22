import { __values } from '../../ext/tslib/tslib.es6.js';
import { isShadowRoot, maskInputValue, transformAttribute, needMaskingText, IGNORED_NODE, serializeNodeWithId } from '../../../rrweb-snapshot/es/rrweb-snapshot.js';
import { isIgnored, isBlocked, isAncestorRemoved, isIframeINode, hasShadowRoot } from '../utils.js';

function isNodeInLinkedList(n) {
    return '__ln' in n;
}
var DoubleLinkedList = (function () {
    function DoubleLinkedList() {
        this.length = 0;
        this.head = null;
    }
    DoubleLinkedList.prototype.get = function (position) {
        if (position >= this.length) {
            throw new Error('Position outside of list range');
        }
        var current = this.head;
        for (var index = 0; index < position; index++) {
            current = (current === null || current === void 0 ? void 0 : current.next) || null;
        }
        return current;
    };
    DoubleLinkedList.prototype.addNode = function (n) {
        var node = {
            value: n,
            previous: null,
            next: null,
        };
        n.__ln = node;
        if (n.previousSibling && isNodeInLinkedList(n.previousSibling)) {
            var current = n.previousSibling.__ln.next;
            node.next = current;
            node.previous = n.previousSibling.__ln;
            n.previousSibling.__ln.next = node;
            if (current) {
                current.previous = node;
            }
        }
        else if (n.nextSibling &&
            isNodeInLinkedList(n.nextSibling) &&
            n.nextSibling.__ln.previous) {
            var current = n.nextSibling.__ln.previous;
            node.previous = current;
            node.next = n.nextSibling.__ln;
            n.nextSibling.__ln.previous = node;
            if (current) {
                current.next = node;
            }
        }
        else {
            if (this.head) {
                this.head.previous = node;
            }
            node.next = this.head;
            this.head = node;
        }
        this.length++;
    };
    DoubleLinkedList.prototype.removeNode = function (n) {
        var current = n.__ln;
        if (!this.head) {
            return;
        }
        if (!current.previous) {
            this.head = current.next;
            if (this.head) {
                this.head.previous = null;
            }
        }
        else {
            current.previous.next = current.next;
            if (current.next) {
                current.next.previous = current.previous;
            }
        }
        if (n.__ln) {
            delete n.__ln;
        }
        this.length--;
    };
    return DoubleLinkedList;
}());
var moveKey = function (id, parentId) { return "".concat(id, "@").concat(parentId); };
function isINode(n) {
    return '__sn' in n;
}
var MutationBuffer = (function () {
    function MutationBuffer() {
        var _this = this;
        this.frozen = false;
        this.locked = false;
        this.texts = [];
        this.attributes = [];
        this.removes = [];
        this.mapRemoves = [];
        this.movedMap = {};
        this.addedSet = new Set();
        this.movedSet = new Set();
        this.droppedSet = new Set();
        this.processMutations = function (mutations) {
            mutations.forEach(_this.processMutation);
            _this.emit();
        };
        this.emit = function () {
            var e_1, _a, e_2, _b;
            if (_this.frozen || _this.locked) {
                return;
            }
            var adds = [];
            var addList = new DoubleLinkedList();
            var getNextId = function (n) {
                var ns = n;
                var nextId = IGNORED_NODE;
                while (nextId === IGNORED_NODE) {
                    ns = ns && ns.nextSibling;
                    nextId = ns && _this.mirror.getId(ns);
                }
                return nextId;
            };
            var pushAdd = function (n) {
                var _a, _b, _c, _d, _e;
                var shadowHost = n.getRootNode
                    ? (_a = n.getRootNode()) === null || _a === void 0 ? void 0 : _a.host
                    : null;
                var rootShadowHost = shadowHost;
                while ((_c = (_b = rootShadowHost === null || rootShadowHost === void 0 ? void 0 : rootShadowHost.getRootNode) === null || _b === void 0 ? void 0 : _b.call(rootShadowHost)) === null || _c === void 0 ? void 0 : _c.host)
                    rootShadowHost =
                        ((_e = (_d = rootShadowHost === null || rootShadowHost === void 0 ? void 0 : rootShadowHost.getRootNode) === null || _d === void 0 ? void 0 : _d.call(rootShadowHost)) === null || _e === void 0 ? void 0 : _e.host) ||
                            null;
                var notInDoc = !_this.doc.contains(n) &&
                    (rootShadowHost === null || !_this.doc.contains(rootShadowHost));
                if (!n.parentNode || notInDoc) {
                    return;
                }
                var parentId = isShadowRoot(n.parentNode)
                    ? _this.mirror.getId(shadowHost)
                    : _this.mirror.getId(n.parentNode);
                var nextId = getNextId(n);
                if (parentId === -1 || nextId === -1) {
                    return addList.addNode(n);
                }
                var sn = serializeNodeWithId(n, {
                    doc: _this.doc,
                    map: _this.mirror.map,
                    blockClass: _this.blockClass,
                    blockSelector: _this.blockSelector,
                    maskTextClass: _this.maskTextClass,
                    maskTextSelector: _this.maskTextSelector,
                    skipChild: true,
                    inlineStylesheet: _this.inlineStylesheet,
                    maskInputOptions: _this.maskInputOptions,
                    maskTextFn: _this.maskTextFn,
                    maskInputFn: _this.maskInputFn,
                    slimDOMOptions: _this.slimDOMOptions,
                    recordCanvas: _this.recordCanvas,
                    inlineImages: _this.inlineImages,
                    onSerialize: function (currentN) {
                        if (isIframeINode(currentN)) {
                            _this.iframeManager.addIframe(currentN);
                        }
                        if (hasShadowRoot(n)) {
                            _this.shadowDomManager.addShadowRoot(n.shadowRoot, document);
                        }
                    },
                    onIframeLoad: function (iframe, childSn) {
                        _this.iframeManager.attachIframe(iframe, childSn);
                        _this.shadowDomManager.observeAttachShadow(iframe);
                    },
                });
                if (sn) {
                    adds.push({
                        parentId: parentId,
                        nextId: nextId,
                        node: sn,
                    });
                }
            };
            while (_this.mapRemoves.length) {
                _this.mirror.removeNodeFromMap(_this.mapRemoves.shift());
            }
            try {
                for (var _c = __values(_this.movedSet), _d = _c.next(); !_d.done; _d = _c.next()) {
                    var n = _d.value;
                    if (isParentRemoved(_this.removes, n, _this.mirror) &&
                        !_this.movedSet.has(n.parentNode)) {
                        continue;
                    }
                    pushAdd(n);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                }
                finally { if (e_1) throw e_1.error; }
            }
            try {
                for (var _e = __values(_this.addedSet), _f = _e.next(); !_f.done; _f = _e.next()) {
                    var n = _f.value;
                    if (!isAncestorInSet(_this.droppedSet, n) &&
                        !isParentRemoved(_this.removes, n, _this.mirror)) {
                        pushAdd(n);
                    }
                    else if (isAncestorInSet(_this.movedSet, n)) {
                        pushAdd(n);
                    }
                    else {
                        _this.droppedSet.add(n);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                }
                finally { if (e_2) throw e_2.error; }
            }
            var candidate = null;
            while (addList.length) {
                var node = null;
                if (candidate) {
                    var parentId = _this.mirror.getId(candidate.value.parentNode);
                    var nextId = getNextId(candidate.value);
                    if (parentId !== -1 && nextId !== -1) {
                        node = candidate;
                    }
                }
                if (!node) {
                    for (var index = addList.length - 1; index >= 0; index--) {
                        var _node = addList.get(index);
                        if (_node) {
                            var parentId = _this.mirror.getId(_node.value.parentNode);
                            var nextId = getNextId(_node.value);
                            if (parentId !== -1 && nextId !== -1) {
                                node = _node;
                                break;
                            }
                        }
                    }
                }
                if (!node) {
                    while (addList.head) {
                        addList.removeNode(addList.head.value);
                    }
                    break;
                }
                candidate = node.previous;
                addList.removeNode(node.value);
                pushAdd(node.value);
            }
            var payload = {
                texts: _this.texts
                    .map(function (text) { return ({
                    id: _this.mirror.getId(text.node),
                    value: text.value,
                }); })
                    .filter(function (text) { return _this.mirror.has(text.id); }),
                attributes: _this.attributes
                    .map(function (attribute) { return ({
                    id: _this.mirror.getId(attribute.node),
                    attributes: attribute.attributes,
                }); })
                    .filter(function (attribute) { return _this.mirror.has(attribute.id); }),
                removes: _this.removes,
                adds: adds,
            };
            if (!payload.texts.length &&
                !payload.attributes.length &&
                !payload.removes.length &&
                !payload.adds.length) {
                return;
            }
            _this.texts = [];
            _this.attributes = [];
            _this.removes = [];
            _this.addedSet = new Set();
            _this.movedSet = new Set();
            _this.droppedSet = new Set();
            _this.movedMap = {};
            _this.mutationCb(payload);
        };
        this.processMutation = function (m) {
            var e_3, _a, e_4, _b;
            if (isIgnored(m.target)) {
                return;
            }
            switch (m.type) {
                case 'characterData': {
                    var value = m.target.textContent;
                    if (!isBlocked(m.target, _this.blockClass) && value !== m.oldValue) {
                        _this.texts.push({
                            value: needMaskingText(m.target, _this.maskTextClass, _this.maskTextSelector) && value
                                ? _this.maskTextFn
                                    ? _this.maskTextFn(value)
                                    : value.replace(/[\S]/g, '*')
                                : value,
                            node: m.target,
                        });
                    }
                    break;
                }
                case 'attributes': {
                    var target = m.target;
                    var value = m.target.getAttribute(m.attributeName);
                    if (m.attributeName === 'value') {
                        value = maskInputValue({
                            maskInputOptions: _this.maskInputOptions,
                            tagName: m.target.tagName,
                            type: m.target.getAttribute('type'),
                            value: value,
                            maskInputFn: _this.maskInputFn,
                        });
                    }
                    if (isBlocked(m.target, _this.blockClass) || value === m.oldValue) {
                        return;
                    }
                    var item = _this.attributes.find(function (a) { return a.node === m.target; });
                    if (!item) {
                        item = {
                            node: m.target,
                            attributes: {},
                        };
                        _this.attributes.push(item);
                    }
                    if (m.attributeName === 'style') {
                        var old = _this.doc.createElement('span');
                        if (m.oldValue) {
                            old.setAttribute('style', m.oldValue);
                        }
                        if (item.attributes.style === undefined ||
                            item.attributes.style === null) {
                            item.attributes.style = {};
                        }
                        var styleObj = item.attributes.style;
                        try {
                            for (var _c = __values(Array.from(target.style)), _d = _c.next(); !_d.done; _d = _c.next()) {
                                var pname = _d.value;
                                var newValue = target.style.getPropertyValue(pname);
                                var newPriority = target.style.getPropertyPriority(pname);
                                if (newValue !== old.style.getPropertyValue(pname) ||
                                    newPriority !== old.style.getPropertyPriority(pname)) {
                                    if (newPriority === '') {
                                        styleObj[pname] = newValue;
                                    }
                                    else {
                                        styleObj[pname] = [newValue, newPriority];
                                    }
                                }
                            }
                        }
                        catch (e_3_1) { e_3 = { error: e_3_1 }; }
                        finally {
                            try {
                                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
                            }
                            finally { if (e_3) throw e_3.error; }
                        }
                        try {
                            for (var _e = __values(Array.from(old.style)), _f = _e.next(); !_f.done; _f = _e.next()) {
                                var pname = _f.value;
                                if (target.style.getPropertyValue(pname) === '') {
                                    styleObj[pname] = false;
                                }
                            }
                        }
                        catch (e_4_1) { e_4 = { error: e_4_1 }; }
                        finally {
                            try {
                                if (_f && !_f.done && (_b = _e.return)) _b.call(_e);
                            }
                            finally { if (e_4) throw e_4.error; }
                        }
                    }
                    else {
                        item.attributes[m.attributeName] = transformAttribute(_this.doc, m.target.tagName, m.attributeName, value);
                    }
                    break;
                }
                case 'childList': {
                    m.addedNodes.forEach(function (n) { return _this.genAdds(n, m.target); });
                    m.removedNodes.forEach(function (n) {
                        var nodeId = _this.mirror.getId(n);
                        var parentId = isShadowRoot(m.target)
                            ? _this.mirror.getId(m.target.host)
                            : _this.mirror.getId(m.target);
                        if (isBlocked(m.target, _this.blockClass) || isIgnored(n)) {
                            return;
                        }
                        if (_this.addedSet.has(n)) {
                            deepDelete(_this.addedSet, n);
                            _this.droppedSet.add(n);
                        }
                        else if (_this.addedSet.has(m.target) && nodeId === -1) ;
                        else if (isAncestorRemoved(m.target, _this.mirror)) ;
                        else if (_this.movedSet.has(n) &&
                            _this.movedMap[moveKey(nodeId, parentId)]) {
                            deepDelete(_this.movedSet, n);
                        }
                        else {
                            _this.removes.push({
                                parentId: parentId,
                                id: nodeId,
                                isShadow: isShadowRoot(m.target) ? true : undefined,
                            });
                        }
                        _this.mapRemoves.push(n);
                    });
                    break;
                }
            }
        };
        this.genAdds = function (n, target) {
            if (target && isBlocked(target, _this.blockClass)) {
                return;
            }
            if (isINode(n)) {
                if (isIgnored(n)) {
                    return;
                }
                _this.movedSet.add(n);
                var targetId = null;
                if (target && isINode(target)) {
                    targetId = target.__sn.id;
                }
                if (targetId) {
                    _this.movedMap[moveKey(n.__sn.id, targetId)] = true;
                }
            }
            else {
                _this.addedSet.add(n);
                _this.droppedSet.delete(n);
            }
            if (!isBlocked(n, _this.blockClass))
                n.childNodes.forEach(function (childN) { return _this.genAdds(childN); });
        };
    }
    MutationBuffer.prototype.init = function (options) {
        var _this = this;
        [
            'mutationCb',
            'blockClass',
            'blockSelector',
            'maskTextClass',
            'maskTextSelector',
            'inlineStylesheet',
            'maskInputOptions',
            'maskTextFn',
            'maskInputFn',
            'recordCanvas',
            'inlineImages',
            'slimDOMOptions',
            'doc',
            'mirror',
            'iframeManager',
            'shadowDomManager',
            'canvasManager',
        ].forEach(function (key) {
            _this[key] = options[key];
        });
    };
    MutationBuffer.prototype.freeze = function () {
        this.frozen = true;
        this.canvasManager.freeze();
    };
    MutationBuffer.prototype.unfreeze = function () {
        this.frozen = false;
        this.canvasManager.unfreeze();
        this.emit();
    };
    MutationBuffer.prototype.isFrozen = function () {
        return this.frozen;
    };
    MutationBuffer.prototype.lock = function () {
        this.locked = true;
        this.canvasManager.lock();
    };
    MutationBuffer.prototype.unlock = function () {
        this.locked = false;
        this.canvasManager.unlock();
        this.emit();
    };
    MutationBuffer.prototype.reset = function () {
        this.shadowDomManager.reset();
        this.canvasManager.reset();
    };
    return MutationBuffer;
}());
function deepDelete(addsSet, n) {
    addsSet.delete(n);
    n.childNodes.forEach(function (childN) { return deepDelete(addsSet, childN); });
}
function isParentRemoved(removes, n, mirror) {
    var parentNode = n.parentNode;
    if (!parentNode) {
        return false;
    }
    var parentId = mirror.getId(parentNode);
    if (removes.some(function (r) { return r.id === parentId; })) {
        return true;
    }
    return isParentRemoved(removes, parentNode, mirror);
}
function isAncestorInSet(set, n) {
    var parentNode = n.parentNode;
    if (!parentNode) {
        return false;
    }
    if (set.has(parentNode)) {
        return true;
    }
    return isAncestorInSet(set, parentNode);
}

export default MutationBuffer;
