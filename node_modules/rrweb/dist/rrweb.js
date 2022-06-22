var rrweb = (function (exports) {
    'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __values(o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var NodeType;
    (function (NodeType) {
        NodeType[NodeType["Document"] = 0] = "Document";
        NodeType[NodeType["DocumentType"] = 1] = "DocumentType";
        NodeType[NodeType["Element"] = 2] = "Element";
        NodeType[NodeType["Text"] = 3] = "Text";
        NodeType[NodeType["CDATA"] = 4] = "CDATA";
        NodeType[NodeType["Comment"] = 5] = "Comment";
    })(NodeType || (NodeType = {}));

    function isElement(n) {
        return n.nodeType === n.ELEMENT_NODE;
    }
    function isShadowRoot(n) {
        var _a;
        var host = (_a = n) === null || _a === void 0 ? void 0 : _a.host;
        return Boolean(host && host.shadowRoot && host.shadowRoot === n);
    }
    function maskInputValue(_a) {
        var maskInputOptions = _a.maskInputOptions, tagName = _a.tagName, type = _a.type, value = _a.value, maskInputFn = _a.maskInputFn;
        var text = value || '';
        if (maskInputOptions[tagName.toLowerCase()] ||
            maskInputOptions[type]) {
            if (maskInputFn) {
                text = maskInputFn(text);
            }
            else {
                text = '*'.repeat(text.length);
            }
        }
        return text;
    }
    var ORIGINAL_ATTRIBUTE_NAME = '__rrweb_original__';
    function is2DCanvasBlank(canvas) {
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return true;
        var chunkSize = 50;
        for (var x = 0; x < canvas.width; x += chunkSize) {
            for (var y = 0; y < canvas.height; y += chunkSize) {
                var getImageData = ctx.getImageData;
                var originalGetImageData = ORIGINAL_ATTRIBUTE_NAME in getImageData
                    ? getImageData[ORIGINAL_ATTRIBUTE_NAME]
                    : getImageData;
                var pixelBuffer = new Uint32Array(originalGetImageData.call(ctx, x, y, Math.min(chunkSize, canvas.width - x), Math.min(chunkSize, canvas.height - y)).data.buffer);
                if (pixelBuffer.some(function (pixel) { return pixel !== 0; }))
                    return false;
            }
        }
        return true;
    }

    var _id = 1;
    var tagNameRegex = new RegExp('[^a-z0-9-_:]');
    var IGNORED_NODE = -2;
    function genId() {
        return _id++;
    }
    function getValidTagName(element) {
        if (element instanceof HTMLFormElement) {
            return 'form';
        }
        var processedTagName = element.tagName.toLowerCase().trim();
        if (tagNameRegex.test(processedTagName)) {
            return 'div';
        }
        return processedTagName;
    }
    function getCssRulesString(s) {
        try {
            var rules = s.rules || s.cssRules;
            return rules ? Array.from(rules).map(getCssRuleString).join('') : null;
        }
        catch (error) {
            return null;
        }
    }
    function getCssRuleString(rule) {
        var cssStringified = rule.cssText;
        if (isCSSImportRule(rule)) {
            try {
                cssStringified = getCssRulesString(rule.styleSheet) || cssStringified;
            }
            catch (_a) {
            }
        }
        return cssStringified;
    }
    function isCSSImportRule(rule) {
        return 'styleSheet' in rule;
    }
    function stringifyStyleSheet(sheet) {
        return sheet.cssRules
            ? Array.from(sheet.cssRules)
                .map(function (rule) { return rule.cssText || ''; })
                .join('')
            : '';
    }
    function extractOrigin(url) {
        var origin = '';
        if (url.indexOf('//') > -1) {
            origin = url.split('/').slice(0, 3).join('/');
        }
        else {
            origin = url.split('/')[0];
        }
        origin = origin.split('?')[0];
        return origin;
    }
    var canvasService;
    var canvasCtx;
    var URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
    var RELATIVE_PATH = /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/|#).*/;
    var DATA_URI = /^(data:)([^,]*),(.*)/i;
    function absoluteToStylesheet(cssText, href) {
        return (cssText || '').replace(URL_IN_CSS_REF, function (origin, quote1, path1, quote2, path2, path3) {
            var filePath = path1 || path2 || path3;
            var maybeQuote = quote1 || quote2 || '';
            if (!filePath) {
                return origin;
            }
            if (!RELATIVE_PATH.test(filePath)) {
                return "url(" + maybeQuote + filePath + maybeQuote + ")";
            }
            if (DATA_URI.test(filePath)) {
                return "url(" + maybeQuote + filePath + maybeQuote + ")";
            }
            if (filePath[0] === '/') {
                return "url(" + maybeQuote + (extractOrigin(href) + filePath) + maybeQuote + ")";
            }
            var stack = href.split('/');
            var parts = filePath.split('/');
            stack.pop();
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var part = parts_1[_i];
                if (part === '.') {
                    continue;
                }
                else if (part === '..') {
                    stack.pop();
                }
                else {
                    stack.push(part);
                }
            }
            return "url(" + maybeQuote + stack.join('/') + maybeQuote + ")";
        });
    }
    var SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
    var SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
    function getAbsoluteSrcsetString(doc, attributeValue) {
        if (attributeValue.trim() === '') {
            return attributeValue;
        }
        var pos = 0;
        function collectCharacters(regEx) {
            var chars;
            var match = regEx.exec(attributeValue.substring(pos));
            if (match) {
                chars = match[0];
                pos += chars.length;
                return chars;
            }
            return '';
        }
        var output = [];
        while (true) {
            collectCharacters(SRCSET_COMMAS_OR_SPACES);
            if (pos >= attributeValue.length) {
                break;
            }
            var url = collectCharacters(SRCSET_NOT_SPACES);
            if (url.slice(-1) === ',') {
                url = absoluteToDoc(doc, url.substring(0, url.length - 1));
                output.push(url);
            }
            else {
                var descriptorsStr = '';
                url = absoluteToDoc(doc, url);
                var inParens = false;
                while (true) {
                    var c = attributeValue.charAt(pos);
                    if (c === '') {
                        output.push((url + descriptorsStr).trim());
                        break;
                    }
                    else if (!inParens) {
                        if (c === ',') {
                            pos += 1;
                            output.push((url + descriptorsStr).trim());
                            break;
                        }
                        else if (c === '(') {
                            inParens = true;
                        }
                    }
                    else {
                        if (c === ')') {
                            inParens = false;
                        }
                    }
                    descriptorsStr += c;
                    pos += 1;
                }
            }
        }
        return output.join(', ');
    }
    function absoluteToDoc(doc, attributeValue) {
        if (!attributeValue || attributeValue.trim() === '') {
            return attributeValue;
        }
        var a = doc.createElement('a');
        a.href = attributeValue;
        return a.href;
    }
    function isSVGElement(el) {
        return Boolean(el.tagName === 'svg' || el.ownerSVGElement);
    }
    function getHref() {
        var a = document.createElement('a');
        a.href = '';
        return a.href;
    }
    function transformAttribute(doc, tagName, name, value) {
        if (name === 'src' || (name === 'href' && value)) {
            return absoluteToDoc(doc, value);
        }
        else if (name === 'xlink:href' && value && value[0] !== '#') {
            return absoluteToDoc(doc, value);
        }
        else if (name === 'background' &&
            value &&
            (tagName === 'table' || tagName === 'td' || tagName === 'th')) {
            return absoluteToDoc(doc, value);
        }
        else if (name === 'srcset' && value) {
            return getAbsoluteSrcsetString(doc, value);
        }
        else if (name === 'style' && value) {
            return absoluteToStylesheet(value, getHref());
        }
        else if (tagName === 'object' && name === 'data' && value) {
            return absoluteToDoc(doc, value);
        }
        else {
            return value;
        }
    }
    function _isBlockedElement(element, blockClass, blockSelector) {
        if (typeof blockClass === 'string') {
            if (element.classList.contains(blockClass)) {
                return true;
            }
        }
        else {
            for (var eIndex = 0; eIndex < element.classList.length; eIndex++) {
                var className = element.classList[eIndex];
                if (blockClass.test(className)) {
                    return true;
                }
            }
        }
        if (blockSelector) {
            return element.matches(blockSelector);
        }
        return false;
    }
    function needMaskingText(node, maskTextClass, maskTextSelector) {
        if (!node) {
            return false;
        }
        if (node.nodeType === node.ELEMENT_NODE) {
            if (typeof maskTextClass === 'string') {
                if (node.classList.contains(maskTextClass)) {
                    return true;
                }
            }
            else {
                for (var eIndex = 0; eIndex < node.classList.length; eIndex++) {
                    var className = node.classList[eIndex];
                    if (maskTextClass.test(className)) {
                        return true;
                    }
                }
            }
            if (maskTextSelector) {
                if (node.matches(maskTextSelector)) {
                    return true;
                }
            }
            return needMaskingText(node.parentNode, maskTextClass, maskTextSelector);
        }
        if (node.nodeType === node.TEXT_NODE) {
            return needMaskingText(node.parentNode, maskTextClass, maskTextSelector);
        }
        return needMaskingText(node.parentNode, maskTextClass, maskTextSelector);
    }
    function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
        var win = iframeEl.contentWindow;
        if (!win) {
            return;
        }
        var fired = false;
        var readyState;
        try {
            readyState = win.document.readyState;
        }
        catch (error) {
            return;
        }
        if (readyState !== 'complete') {
            var timer_1 = setTimeout(function () {
                if (!fired) {
                    listener();
                    fired = true;
                }
            }, iframeLoadTimeout);
            iframeEl.addEventListener('load', function () {
                clearTimeout(timer_1);
                fired = true;
                listener();
            });
            return;
        }
        var blankUrl = 'about:blank';
        if (win.location.href !== blankUrl ||
            iframeEl.src === blankUrl ||
            iframeEl.src === '') {
            setTimeout(listener, 0);
            return;
        }
        iframeEl.addEventListener('load', listener);
    }
    function serializeNode(n, options) {
        var _a;
        var doc = options.doc, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, inlineStylesheet = options.inlineStylesheet, _b = options.maskInputOptions, maskInputOptions = _b === void 0 ? {} : _b, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, _c = options.dataURLOptions, dataURLOptions = _c === void 0 ? {} : _c, inlineImages = options.inlineImages, recordCanvas = options.recordCanvas, keepIframeSrcFn = options.keepIframeSrcFn;
        var rootId;
        if (doc.__sn) {
            var docId = doc.__sn.id;
            rootId = docId === 1 ? undefined : docId;
        }
        switch (n.nodeType) {
            case n.DOCUMENT_NODE:
                if (n.compatMode !== 'CSS1Compat') {
                    return {
                        type: NodeType.Document,
                        childNodes: [],
                        compatMode: n.compatMode,
                        rootId: rootId
                    };
                }
                else {
                    return {
                        type: NodeType.Document,
                        childNodes: [],
                        rootId: rootId
                    };
                }
            case n.DOCUMENT_TYPE_NODE:
                return {
                    type: NodeType.DocumentType,
                    name: n.name,
                    publicId: n.publicId,
                    systemId: n.systemId,
                    rootId: rootId
                };
            case n.ELEMENT_NODE:
                var needBlock = _isBlockedElement(n, blockClass, blockSelector);
                var tagName = getValidTagName(n);
                var attributes_1 = {};
                for (var _i = 0, _d = Array.from(n.attributes); _i < _d.length; _i++) {
                    var _e = _d[_i], name_1 = _e.name, value = _e.value;
                    attributes_1[name_1] = transformAttribute(doc, tagName, name_1, value);
                }
                if (tagName === 'link' && inlineStylesheet) {
                    var stylesheet = Array.from(doc.styleSheets).find(function (s) {
                        return s.href === n.href;
                    });
                    var cssText = null;
                    if (stylesheet) {
                        cssText = getCssRulesString(stylesheet);
                    }
                    if (cssText) {
                        delete attributes_1.rel;
                        delete attributes_1.href;
                        attributes_1._cssText = absoluteToStylesheet(cssText, stylesheet.href);
                    }
                }
                if (tagName === 'style' &&
                    n.sheet &&
                    !(n.innerText ||
                        n.textContent ||
                        '').trim().length) {
                    var cssText = getCssRulesString(n.sheet);
                    if (cssText) {
                        attributes_1._cssText = absoluteToStylesheet(cssText, getHref());
                    }
                }
                if (tagName === 'input' ||
                    tagName === 'textarea' ||
                    tagName === 'select') {
                    var value = n.value;
                    if (attributes_1.type !== 'radio' &&
                        attributes_1.type !== 'checkbox' &&
                        attributes_1.type !== 'submit' &&
                        attributes_1.type !== 'button' &&
                        value) {
                        attributes_1.value = maskInputValue({
                            type: attributes_1.type,
                            tagName: tagName,
                            value: value,
                            maskInputOptions: maskInputOptions,
                            maskInputFn: maskInputFn
                        });
                    }
                    else if (n.checked) {
                        attributes_1.checked = n.checked;
                    }
                }
                if (tagName === 'option') {
                    if (n.selected && !maskInputOptions['select']) {
                        attributes_1.selected = true;
                    }
                    else {
                        delete attributes_1.selected;
                    }
                }
                if (tagName === 'canvas' && recordCanvas) {
                    if (n.__context === '2d') {
                        if (!is2DCanvasBlank(n)) {
                            attributes_1.rr_dataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
                        }
                    }
                    else if (!('__context' in n)) {
                        var canvasDataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
                        var blankCanvas = document.createElement('canvas');
                        blankCanvas.width = n.width;
                        blankCanvas.height = n.height;
                        var blankCanvasDataURL = blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality);
                        if (canvasDataURL !== blankCanvasDataURL) {
                            attributes_1.rr_dataURL = canvasDataURL;
                        }
                    }
                }
                if (tagName === 'img' && inlineImages) {
                    if (!canvasService) {
                        canvasService = doc.createElement('canvas');
                        canvasCtx = canvasService.getContext('2d');
                    }
                    var image_1 = n;
                    var oldValue_1 = image_1.crossOrigin;
                    image_1.crossOrigin = 'anonymous';
                    var recordInlineImage = function () {
                        try {
                            canvasService.width = image_1.naturalWidth;
                            canvasService.height = image_1.naturalHeight;
                            canvasCtx.drawImage(image_1, 0, 0);
                            attributes_1.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
                        }
                        catch (err) {
                            console.warn("Cannot inline img src=" + image_1.currentSrc + "! Error: " + err);
                        }
                        oldValue_1
                            ? (attributes_1.crossOrigin = oldValue_1)
                            : delete attributes_1.crossOrigin;
                    };
                    if (image_1.complete && image_1.naturalWidth !== 0)
                        recordInlineImage();
                    else
                        image_1.onload = recordInlineImage;
                }
                if (tagName === 'audio' || tagName === 'video') {
                    attributes_1.rr_mediaState = n.paused
                        ? 'paused'
                        : 'played';
                    attributes_1.rr_mediaCurrentTime = n.currentTime;
                }
                if (n.scrollLeft) {
                    attributes_1.rr_scrollLeft = n.scrollLeft;
                }
                if (n.scrollTop) {
                    attributes_1.rr_scrollTop = n.scrollTop;
                }
                if (needBlock) {
                    var _f = n.getBoundingClientRect(), width = _f.width, height = _f.height;
                    attributes_1 = {
                        "class": attributes_1["class"],
                        rr_width: width + "px",
                        rr_height: height + "px"
                    };
                }
                if (tagName === 'iframe' && !keepIframeSrcFn(attributes_1.src)) {
                    if (!n.contentDocument) {
                        attributes_1.rr_src = attributes_1.src;
                    }
                    delete attributes_1.src;
                }
                return {
                    type: NodeType.Element,
                    tagName: tagName,
                    attributes: attributes_1,
                    childNodes: [],
                    isSVG: isSVGElement(n) || undefined,
                    needBlock: needBlock,
                    rootId: rootId
                };
            case n.TEXT_NODE:
                var parentTagName = n.parentNode && n.parentNode.tagName;
                var textContent = n.textContent;
                var isStyle = parentTagName === 'STYLE' ? true : undefined;
                var isScript = parentTagName === 'SCRIPT' ? true : undefined;
                if (isStyle && textContent) {
                    try {
                        if (n.nextSibling || n.previousSibling) {
                        }
                        else if ((_a = n.parentNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) {
                            textContent = stringifyStyleSheet(n.parentNode.sheet);
                        }
                    }
                    catch (err) {
                        console.warn("Cannot get CSS styles from text's parentNode. Error: " + err, n);
                    }
                    textContent = absoluteToStylesheet(textContent, getHref());
                }
                if (isScript) {
                    textContent = 'SCRIPT_PLACEHOLDER';
                }
                if (!isStyle &&
                    !isScript &&
                    needMaskingText(n, maskTextClass, maskTextSelector) &&
                    textContent) {
                    textContent = maskTextFn
                        ? maskTextFn(textContent)
                        : textContent.replace(/[\S]/g, '*');
                }
                return {
                    type: NodeType.Text,
                    textContent: textContent || '',
                    isStyle: isStyle,
                    rootId: rootId
                };
            case n.CDATA_SECTION_NODE:
                return {
                    type: NodeType.CDATA,
                    textContent: '',
                    rootId: rootId
                };
            case n.COMMENT_NODE:
                return {
                    type: NodeType.Comment,
                    textContent: n.textContent || '',
                    rootId: rootId
                };
            default:
                return false;
        }
    }
    function lowerIfExists(maybeAttr) {
        if (maybeAttr === undefined) {
            return '';
        }
        else {
            return maybeAttr.toLowerCase();
        }
    }
    function slimDOMExcluded(sn, slimDOMOptions) {
        if (slimDOMOptions.comment && sn.type === NodeType.Comment) {
            return true;
        }
        else if (sn.type === NodeType.Element) {
            if (slimDOMOptions.script &&
                (sn.tagName === 'script' ||
                    (sn.tagName === 'link' &&
                        sn.attributes.rel === 'preload' &&
                        sn.attributes.as === 'script') ||
                    (sn.tagName === 'link' &&
                        sn.attributes.rel === 'prefetch' &&
                        typeof sn.attributes.href === 'string' &&
                        sn.attributes.href.endsWith('.js')))) {
                return true;
            }
            else if (slimDOMOptions.headFavicon &&
                ((sn.tagName === 'link' && sn.attributes.rel === 'shortcut icon') ||
                    (sn.tagName === 'meta' &&
                        (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) ||
                            lowerIfExists(sn.attributes.name) === 'application-name' ||
                            lowerIfExists(sn.attributes.rel) === 'icon' ||
                            lowerIfExists(sn.attributes.rel) === 'apple-touch-icon' ||
                            lowerIfExists(sn.attributes.rel) === 'shortcut icon')))) {
                return true;
            }
            else if (sn.tagName === 'meta') {
                if (slimDOMOptions.headMetaDescKeywords &&
                    lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
                    return true;
                }
                else if (slimDOMOptions.headMetaSocial &&
                    (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) ||
                        lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) ||
                        lowerIfExists(sn.attributes.name) === 'pinterest')) {
                    return true;
                }
                else if (slimDOMOptions.headMetaRobots &&
                    (lowerIfExists(sn.attributes.name) === 'robots' ||
                        lowerIfExists(sn.attributes.name) === 'googlebot' ||
                        lowerIfExists(sn.attributes.name) === 'bingbot')) {
                    return true;
                }
                else if (slimDOMOptions.headMetaHttpEquiv &&
                    sn.attributes['http-equiv'] !== undefined) {
                    return true;
                }
                else if (slimDOMOptions.headMetaAuthorship &&
                    (lowerIfExists(sn.attributes.name) === 'author' ||
                        lowerIfExists(sn.attributes.name) === 'generator' ||
                        lowerIfExists(sn.attributes.name) === 'framework' ||
                        lowerIfExists(sn.attributes.name) === 'publisher' ||
                        lowerIfExists(sn.attributes.name) === 'progid' ||
                        lowerIfExists(sn.attributes.property).match(/^article:/) ||
                        lowerIfExists(sn.attributes.property).match(/^product:/))) {
                    return true;
                }
                else if (slimDOMOptions.headMetaVerification &&
                    (lowerIfExists(sn.attributes.name) === 'google-site-verification' ||
                        lowerIfExists(sn.attributes.name) === 'yandex-verification' ||
                        lowerIfExists(sn.attributes.name) === 'csrf-token' ||
                        lowerIfExists(sn.attributes.name) === 'p:domain_verify' ||
                        lowerIfExists(sn.attributes.name) === 'verify-v1' ||
                        lowerIfExists(sn.attributes.name) === 'verification' ||
                        lowerIfExists(sn.attributes.name) === 'shopify-checkout-api-token')) {
                    return true;
                }
            }
        }
        return false;
    }
    function serializeNodeWithId(n, options) {
        var doc = options.doc, map = options.map, blockClass = options.blockClass, blockSelector = options.blockSelector, maskTextClass = options.maskTextClass, maskTextSelector = options.maskTextSelector, _a = options.skipChild, skipChild = _a === void 0 ? false : _a, _b = options.inlineStylesheet, inlineStylesheet = _b === void 0 ? true : _b, _c = options.maskInputOptions, maskInputOptions = _c === void 0 ? {} : _c, maskTextFn = options.maskTextFn, maskInputFn = options.maskInputFn, slimDOMOptions = options.slimDOMOptions, _d = options.dataURLOptions, dataURLOptions = _d === void 0 ? {} : _d, _e = options.inlineImages, inlineImages = _e === void 0 ? false : _e, _f = options.recordCanvas, recordCanvas = _f === void 0 ? false : _f, onSerialize = options.onSerialize, onIframeLoad = options.onIframeLoad, _g = options.iframeLoadTimeout, iframeLoadTimeout = _g === void 0 ? 5000 : _g, _h = options.keepIframeSrcFn, keepIframeSrcFn = _h === void 0 ? function () { return false; } : _h;
        var _j = options.preserveWhiteSpace, preserveWhiteSpace = _j === void 0 ? true : _j;
        var _serializedNode = serializeNode(n, {
            doc: doc,
            blockClass: blockClass,
            blockSelector: blockSelector,
            maskTextClass: maskTextClass,
            maskTextSelector: maskTextSelector,
            inlineStylesheet: inlineStylesheet,
            maskInputOptions: maskInputOptions,
            maskTextFn: maskTextFn,
            maskInputFn: maskInputFn,
            dataURLOptions: dataURLOptions,
            inlineImages: inlineImages,
            recordCanvas: recordCanvas,
            keepIframeSrcFn: keepIframeSrcFn
        });
        if (!_serializedNode) {
            console.warn(n, 'not serialized');
            return null;
        }
        var id;
        if ('__sn' in n) {
            id = n.__sn.id;
        }
        else if (slimDOMExcluded(_serializedNode, slimDOMOptions) ||
            (!preserveWhiteSpace &&
                _serializedNode.type === NodeType.Text &&
                !_serializedNode.isStyle &&
                !_serializedNode.textContent.replace(/^\s+|\s+$/gm, '').length)) {
            id = IGNORED_NODE;
        }
        else {
            id = genId();
        }
        var serializedNode = Object.assign(_serializedNode, { id: id });
        n.__sn = serializedNode;
        if (id === IGNORED_NODE) {
            return null;
        }
        map[id] = n;
        if (onSerialize) {
            onSerialize(n);
        }
        var recordChild = !skipChild;
        if (serializedNode.type === NodeType.Element) {
            recordChild = recordChild && !serializedNode.needBlock;
            delete serializedNode.needBlock;
            if (n.shadowRoot)
                serializedNode.isShadowHost = true;
        }
        if ((serializedNode.type === NodeType.Document ||
            serializedNode.type === NodeType.Element) &&
            recordChild) {
            if (slimDOMOptions.headWhitespace &&
                _serializedNode.type === NodeType.Element &&
                _serializedNode.tagName === 'head') {
                preserveWhiteSpace = false;
            }
            var bypassOptions = {
                doc: doc,
                map: map,
                blockClass: blockClass,
                blockSelector: blockSelector,
                maskTextClass: maskTextClass,
                maskTextSelector: maskTextSelector,
                skipChild: skipChild,
                inlineStylesheet: inlineStylesheet,
                maskInputOptions: maskInputOptions,
                maskTextFn: maskTextFn,
                maskInputFn: maskInputFn,
                slimDOMOptions: slimDOMOptions,
                dataURLOptions: dataURLOptions,
                inlineImages: inlineImages,
                recordCanvas: recordCanvas,
                preserveWhiteSpace: preserveWhiteSpace,
                onSerialize: onSerialize,
                onIframeLoad: onIframeLoad,
                iframeLoadTimeout: iframeLoadTimeout,
                keepIframeSrcFn: keepIframeSrcFn
            };
            for (var _i = 0, _k = Array.from(n.childNodes); _i < _k.length; _i++) {
                var childN = _k[_i];
                var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
                if (serializedChildNode) {
                    serializedNode.childNodes.push(serializedChildNode);
                }
            }
            if (isElement(n) && n.shadowRoot) {
                for (var _l = 0, _m = Array.from(n.shadowRoot.childNodes); _l < _m.length; _l++) {
                    var childN = _m[_l];
                    var serializedChildNode = serializeNodeWithId(childN, bypassOptions);
                    if (serializedChildNode) {
                        serializedChildNode.isShadow = true;
                        serializedNode.childNodes.push(serializedChildNode);
                    }
                }
            }
        }
        if (n.parentNode && isShadowRoot(n.parentNode)) {
            serializedNode.isShadow = true;
        }
        if (serializedNode.type === NodeType.Element &&
            serializedNode.tagName === 'iframe') {
            onceIframeLoaded(n, function () {
                var iframeDoc = n.contentDocument;
                if (iframeDoc && onIframeLoad) {
                    var serializedIframeNode = serializeNodeWithId(iframeDoc, {
                        doc: iframeDoc,
                        map: map,
                        blockClass: blockClass,
                        blockSelector: blockSelector,
                        maskTextClass: maskTextClass,
                        maskTextSelector: maskTextSelector,
                        skipChild: false,
                        inlineStylesheet: inlineStylesheet,
                        maskInputOptions: maskInputOptions,
                        maskTextFn: maskTextFn,
                        maskInputFn: maskInputFn,
                        slimDOMOptions: slimDOMOptions,
                        dataURLOptions: dataURLOptions,
                        inlineImages: inlineImages,
                        recordCanvas: recordCanvas,
                        preserveWhiteSpace: preserveWhiteSpace,
                        onSerialize: onSerialize,
                        onIframeLoad: onIframeLoad,
                        iframeLoadTimeout: iframeLoadTimeout,
                        keepIframeSrcFn: keepIframeSrcFn
                    });
                    if (serializedIframeNode) {
                        onIframeLoad(n, serializedIframeNode);
                    }
                }
            }, iframeLoadTimeout);
        }
        return serializedNode;
    }
    function snapshot(n, options) {
        var _a = options || {}, _b = _a.blockClass, blockClass = _b === void 0 ? 'rr-block' : _b, _c = _a.blockSelector, blockSelector = _c === void 0 ? null : _c, _d = _a.maskTextClass, maskTextClass = _d === void 0 ? 'rr-mask' : _d, _e = _a.maskTextSelector, maskTextSelector = _e === void 0 ? null : _e, _f = _a.inlineStylesheet, inlineStylesheet = _f === void 0 ? true : _f, _g = _a.inlineImages, inlineImages = _g === void 0 ? false : _g, _h = _a.recordCanvas, recordCanvas = _h === void 0 ? false : _h, _j = _a.maskAllInputs, maskAllInputs = _j === void 0 ? false : _j, maskTextFn = _a.maskTextFn, maskInputFn = _a.maskInputFn, _k = _a.slimDOM, slimDOM = _k === void 0 ? false : _k, dataURLOptions = _a.dataURLOptions, preserveWhiteSpace = _a.preserveWhiteSpace, onSerialize = _a.onSerialize, onIframeLoad = _a.onIframeLoad, iframeLoadTimeout = _a.iframeLoadTimeout, _l = _a.keepIframeSrcFn, keepIframeSrcFn = _l === void 0 ? function () { return false; } : _l;
        var idNodeMap = {};
        var maskInputOptions = maskAllInputs === true
            ? {
                color: true,
                date: true,
                'datetime-local': true,
                email: true,
                month: true,
                number: true,
                range: true,
                search: true,
                tel: true,
                text: true,
                time: true,
                url: true,
                week: true,
                textarea: true,
                select: true,
                password: true
            }
            : maskAllInputs === false
                ? {
                    password: true
                }
                : maskAllInputs;
        var slimDOMOptions = slimDOM === true || slimDOM === 'all'
            ?
                {
                    script: true,
                    comment: true,
                    headFavicon: true,
                    headWhitespace: true,
                    headMetaDescKeywords: slimDOM === 'all',
                    headMetaSocial: true,
                    headMetaRobots: true,
                    headMetaHttpEquiv: true,
                    headMetaAuthorship: true,
                    headMetaVerification: true
                }
            : slimDOM === false
                ? {}
                : slimDOM;
        return [
            serializeNodeWithId(n, {
                doc: n,
                map: idNodeMap,
                blockClass: blockClass,
                blockSelector: blockSelector,
                maskTextClass: maskTextClass,
                maskTextSelector: maskTextSelector,
                skipChild: false,
                inlineStylesheet: inlineStylesheet,
                maskInputOptions: maskInputOptions,
                maskTextFn: maskTextFn,
                maskInputFn: maskInputFn,
                slimDOMOptions: slimDOMOptions,
                dataURLOptions: dataURLOptions,
                inlineImages: inlineImages,
                recordCanvas: recordCanvas,
                preserveWhiteSpace: preserveWhiteSpace,
                onSerialize: onSerialize,
                onIframeLoad: onIframeLoad,
                iframeLoadTimeout: iframeLoadTimeout,
                keepIframeSrcFn: keepIframeSrcFn
            }),
            idNodeMap,
        ];
    }

    var commentre = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
    function parse(css, options) {
        if (options === void 0) { options = {}; }
        var lineno = 1;
        var column = 1;
        function updatePosition(str) {
            var lines = str.match(/\n/g);
            if (lines) {
                lineno += lines.length;
            }
            var i = str.lastIndexOf('\n');
            column = i === -1 ? column + str.length : str.length - i;
        }
        function position() {
            var start = { line: lineno, column: column };
            return function (node) {
                node.position = new Position(start);
                whitespace();
                return node;
            };
        }
        var Position = (function () {
            function Position(start) {
                this.start = start;
                this.end = { line: lineno, column: column };
                this.source = options.source;
            }
            return Position;
        }());
        Position.prototype.content = css;
        var errorsList = [];
        function error(msg) {
            var err = new Error(options.source + ':' + lineno + ':' + column + ': ' + msg);
            err.reason = msg;
            err.filename = options.source;
            err.line = lineno;
            err.column = column;
            err.source = css;
            if (options.silent) {
                errorsList.push(err);
            }
            else {
                throw err;
            }
        }
        function stylesheet() {
            var rulesList = rules();
            return {
                type: 'stylesheet',
                stylesheet: {
                    source: options.source,
                    rules: rulesList,
                    parsingErrors: errorsList
                }
            };
        }
        function open() {
            return match(/^{\s*/);
        }
        function close() {
            return match(/^}/);
        }
        function rules() {
            var node;
            var rules = [];
            whitespace();
            comments(rules);
            while (css.length && css.charAt(0) !== '}' && (node = atrule() || rule())) {
                if (node !== false) {
                    rules.push(node);
                    comments(rules);
                }
            }
            return rules;
        }
        function match(re) {
            var m = re.exec(css);
            if (!m) {
                return;
            }
            var str = m[0];
            updatePosition(str);
            css = css.slice(str.length);
            return m;
        }
        function whitespace() {
            match(/^\s*/);
        }
        function comments(rules) {
            if (rules === void 0) { rules = []; }
            var c;
            while ((c = comment())) {
                if (c !== false) {
                    rules.push(c);
                }
                c = comment();
            }
            return rules;
        }
        function comment() {
            var pos = position();
            if ('/' !== css.charAt(0) || '*' !== css.charAt(1)) {
                return;
            }
            var i = 2;
            while ('' !== css.charAt(i) &&
                ('*' !== css.charAt(i) || '/' !== css.charAt(i + 1))) {
                ++i;
            }
            i += 2;
            if ('' === css.charAt(i - 1)) {
                return error('End of comment missing');
            }
            var str = css.slice(2, i - 2);
            column += 2;
            updatePosition(str);
            css = css.slice(i);
            column += 2;
            return pos({
                type: 'comment',
                comment: str
            });
        }
        function selector() {
            var m = match(/^([^{]+)/);
            if (!m) {
                return;
            }
            return trim(m[0])
                .replace(/\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*\/+/g, '')
                .replace(/"(?:\\"|[^"])*"|'(?:\\'|[^'])*'/g, function (m) {
                return m.replace(/,/g, '\u200C');
            })
                .split(/\s*(?![^(]*\)),\s*/)
                .map(function (s) {
                return s.replace(/\u200C/g, ',');
            });
        }
        function declaration() {
            var pos = position();
            var propMatch = match(/^(\*?[-#\/\*\\\w]+(\[[0-9a-z_-]+\])?)\s*/);
            if (!propMatch) {
                return;
            }
            var prop = trim(propMatch[0]);
            if (!match(/^:\s*/)) {
                return error("property missing ':'");
            }
            var val = match(/^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^\)]*?\)|[^};])+)/);
            var ret = pos({
                type: 'declaration',
                property: prop.replace(commentre, ''),
                value: val ? trim(val[0]).replace(commentre, '') : ''
            });
            match(/^[;\s]*/);
            return ret;
        }
        function declarations() {
            var decls = [];
            if (!open()) {
                return error("missing '{'");
            }
            comments(decls);
            var decl;
            while ((decl = declaration())) {
                if (decl !== false) {
                    decls.push(decl);
                    comments(decls);
                }
                decl = declaration();
            }
            if (!close()) {
                return error("missing '}'");
            }
            return decls;
        }
        function keyframe() {
            var m;
            var vals = [];
            var pos = position();
            while ((m = match(/^((\d+\.\d+|\.\d+|\d+)%?|[a-z]+)\s*/))) {
                vals.push(m[1]);
                match(/^,\s*/);
            }
            if (!vals.length) {
                return;
            }
            return pos({
                type: 'keyframe',
                values: vals,
                declarations: declarations()
            });
        }
        function atkeyframes() {
            var pos = position();
            var m = match(/^@([-\w]+)?keyframes\s*/);
            if (!m) {
                return;
            }
            var vendor = m[1];
            m = match(/^([-\w]+)\s*/);
            if (!m) {
                return error('@keyframes missing name');
            }
            var name = m[1];
            if (!open()) {
                return error("@keyframes missing '{'");
            }
            var frame;
            var frames = comments();
            while ((frame = keyframe())) {
                frames.push(frame);
                frames = frames.concat(comments());
            }
            if (!close()) {
                return error("@keyframes missing '}'");
            }
            return pos({
                type: 'keyframes',
                name: name,
                vendor: vendor,
                keyframes: frames
            });
        }
        function atsupports() {
            var pos = position();
            var m = match(/^@supports *([^{]+)/);
            if (!m) {
                return;
            }
            var supports = trim(m[1]);
            if (!open()) {
                return error("@supports missing '{'");
            }
            var style = comments().concat(rules());
            if (!close()) {
                return error("@supports missing '}'");
            }
            return pos({
                type: 'supports',
                supports: supports,
                rules: style
            });
        }
        function athost() {
            var pos = position();
            var m = match(/^@host\s*/);
            if (!m) {
                return;
            }
            if (!open()) {
                return error("@host missing '{'");
            }
            var style = comments().concat(rules());
            if (!close()) {
                return error("@host missing '}'");
            }
            return pos({
                type: 'host',
                rules: style
            });
        }
        function atmedia() {
            var pos = position();
            var m = match(/^@media *([^{]+)/);
            if (!m) {
                return;
            }
            var media = trim(m[1]);
            if (!open()) {
                return error("@media missing '{'");
            }
            var style = comments().concat(rules());
            if (!close()) {
                return error("@media missing '}'");
            }
            return pos({
                type: 'media',
                media: media,
                rules: style
            });
        }
        function atcustommedia() {
            var pos = position();
            var m = match(/^@custom-media\s+(--[^\s]+)\s*([^{;]+);/);
            if (!m) {
                return;
            }
            return pos({
                type: 'custom-media',
                name: trim(m[1]),
                media: trim(m[2])
            });
        }
        function atpage() {
            var pos = position();
            var m = match(/^@page */);
            if (!m) {
                return;
            }
            var sel = selector() || [];
            if (!open()) {
                return error("@page missing '{'");
            }
            var decls = comments();
            var decl;
            while ((decl = declaration())) {
                decls.push(decl);
                decls = decls.concat(comments());
            }
            if (!close()) {
                return error("@page missing '}'");
            }
            return pos({
                type: 'page',
                selectors: sel,
                declarations: decls
            });
        }
        function atdocument() {
            var pos = position();
            var m = match(/^@([-\w]+)?document *([^{]+)/);
            if (!m) {
                return;
            }
            var vendor = trim(m[1]);
            var doc = trim(m[2]);
            if (!open()) {
                return error("@document missing '{'");
            }
            var style = comments().concat(rules());
            if (!close()) {
                return error("@document missing '}'");
            }
            return pos({
                type: 'document',
                document: doc,
                vendor: vendor,
                rules: style
            });
        }
        function atfontface() {
            var pos = position();
            var m = match(/^@font-face\s*/);
            if (!m) {
                return;
            }
            if (!open()) {
                return error("@font-face missing '{'");
            }
            var decls = comments();
            var decl;
            while ((decl = declaration())) {
                decls.push(decl);
                decls = decls.concat(comments());
            }
            if (!close()) {
                return error("@font-face missing '}'");
            }
            return pos({
                type: 'font-face',
                declarations: decls
            });
        }
        var atimport = _compileAtrule('import');
        var atcharset = _compileAtrule('charset');
        var atnamespace = _compileAtrule('namespace');
        function _compileAtrule(name) {
            var re = new RegExp('^@' + name + '\\s*([^;]+);');
            return function () {
                var pos = position();
                var m = match(re);
                if (!m) {
                    return;
                }
                var ret = { type: name };
                ret[name] = m[1].trim();
                return pos(ret);
            };
        }
        function atrule() {
            if (css[0] !== '@') {
                return;
            }
            return (atkeyframes() ||
                atmedia() ||
                atcustommedia() ||
                atsupports() ||
                atimport() ||
                atcharset() ||
                atnamespace() ||
                atdocument() ||
                atpage() ||
                athost() ||
                atfontface());
        }
        function rule() {
            var pos = position();
            var sel = selector();
            if (!sel) {
                return error('selector missing');
            }
            comments();
            return pos({
                type: 'rule',
                selectors: sel,
                declarations: declarations()
            });
        }
        return addParent(stylesheet());
    }
    function trim(str) {
        return str ? str.replace(/^\s+|\s+$/g, '') : '';
    }
    function addParent(obj, parent) {
        var isNode = obj && typeof obj.type === 'string';
        var childParent = isNode ? obj : parent;
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var k = _a[_i];
            var value = obj[k];
            if (Array.isArray(value)) {
                value.forEach(function (v) {
                    addParent(v, childParent);
                });
            }
            else if (value && typeof value === 'object') {
                addParent(value, childParent);
            }
        }
        if (isNode) {
            Object.defineProperty(obj, 'parent', {
                configurable: true,
                writable: true,
                enumerable: false,
                value: parent || null
            });
        }
        return obj;
    }

    var tagMap = {
        script: 'noscript',
        altglyph: 'altGlyph',
        altglyphdef: 'altGlyphDef',
        altglyphitem: 'altGlyphItem',
        animatecolor: 'animateColor',
        animatemotion: 'animateMotion',
        animatetransform: 'animateTransform',
        clippath: 'clipPath',
        feblend: 'feBlend',
        fecolormatrix: 'feColorMatrix',
        fecomponenttransfer: 'feComponentTransfer',
        fecomposite: 'feComposite',
        feconvolvematrix: 'feConvolveMatrix',
        fediffuselighting: 'feDiffuseLighting',
        fedisplacementmap: 'feDisplacementMap',
        fedistantlight: 'feDistantLight',
        fedropshadow: 'feDropShadow',
        feflood: 'feFlood',
        fefunca: 'feFuncA',
        fefuncb: 'feFuncB',
        fefuncg: 'feFuncG',
        fefuncr: 'feFuncR',
        fegaussianblur: 'feGaussianBlur',
        feimage: 'feImage',
        femerge: 'feMerge',
        femergenode: 'feMergeNode',
        femorphology: 'feMorphology',
        feoffset: 'feOffset',
        fepointlight: 'fePointLight',
        fespecularlighting: 'feSpecularLighting',
        fespotlight: 'feSpotLight',
        fetile: 'feTile',
        feturbulence: 'feTurbulence',
        foreignobject: 'foreignObject',
        glyphref: 'glyphRef',
        lineargradient: 'linearGradient',
        radialgradient: 'radialGradient'
    };
    function getTagName(n) {
        var tagName = tagMap[n.tagName] ? tagMap[n.tagName] : n.tagName;
        if (tagName === 'link' && n.attributes._cssText) {
            tagName = 'style';
        }
        return tagName;
    }
    function escapeRegExp(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    var HOVER_SELECTOR = /([^\\]):hover/;
    var HOVER_SELECTOR_GLOBAL = new RegExp(HOVER_SELECTOR.source, 'g');
    function addHoverClass(cssText, cache) {
        var cachedStyle = cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.get(cssText);
        if (cachedStyle)
            return cachedStyle;
        var ast = parse(cssText, {
            silent: true
        });
        if (!ast.stylesheet) {
            return cssText;
        }
        var selectors = [];
        ast.stylesheet.rules.forEach(function (rule) {
            if ('selectors' in rule) {
                (rule.selectors || []).forEach(function (selector) {
                    if (HOVER_SELECTOR.test(selector)) {
                        selectors.push(selector);
                    }
                });
            }
        });
        if (selectors.length === 0) {
            return cssText;
        }
        var selectorMatcher = new RegExp(selectors
            .filter(function (selector, index) { return selectors.indexOf(selector) === index; })
            .sort(function (a, b) { return b.length - a.length; })
            .map(function (selector) {
            return escapeRegExp(selector);
        })
            .join('|'), 'g');
        var result = cssText.replace(selectorMatcher, function (selector) {
            var newSelector = selector.replace(HOVER_SELECTOR_GLOBAL, '$1.\\:hover');
            return selector + ", " + newSelector;
        });
        cache === null || cache === void 0 ? void 0 : cache.stylesWithHoverClass.set(cssText, result);
        return result;
    }
    function createCache() {
        var stylesWithHoverClass = new Map();
        return {
            stylesWithHoverClass: stylesWithHoverClass
        };
    }
    function buildNode(n, options) {
        var doc = options.doc, hackCss = options.hackCss, cache = options.cache;
        switch (n.type) {
            case NodeType.Document:
                return doc.implementation.createDocument(null, '', null);
            case NodeType.DocumentType:
                return doc.implementation.createDocumentType(n.name || 'html', n.publicId, n.systemId);
            case NodeType.Element:
                var tagName = getTagName(n);
                var node_1;
                if (n.isSVG) {
                    node_1 = doc.createElementNS('http://www.w3.org/2000/svg', tagName);
                }
                else {
                    node_1 = doc.createElement(tagName);
                }
                var _loop_1 = function (name_1) {
                    if (!n.attributes.hasOwnProperty(name_1)) {
                        return "continue";
                    }
                    var value = n.attributes[name_1];
                    if (tagName === 'option' && name_1 === 'selected' && value === false) {
                        return "continue";
                    }
                    value =
                        typeof value === 'boolean' || typeof value === 'number' ? '' : value;
                    if (!name_1.startsWith('rr_')) {
                        var isTextarea = tagName === 'textarea' && name_1 === 'value';
                        var isRemoteOrDynamicCss = tagName === 'style' && name_1 === '_cssText';
                        if (isRemoteOrDynamicCss && hackCss) {
                            value = addHoverClass(value, cache);
                        }
                        if (isTextarea || isRemoteOrDynamicCss) {
                            var child = doc.createTextNode(value);
                            for (var _i = 0, _a = Array.from(node_1.childNodes); _i < _a.length; _i++) {
                                var c = _a[_i];
                                if (c.nodeType === node_1.TEXT_NODE) {
                                    node_1.removeChild(c);
                                }
                            }
                            node_1.appendChild(child);
                            return "continue";
                        }
                        try {
                            if (n.isSVG && name_1 === 'xlink:href') {
                                node_1.setAttributeNS('http://www.w3.org/1999/xlink', name_1, value);
                            }
                            else if (name_1 === 'onload' ||
                                name_1 === 'onclick' ||
                                name_1.substring(0, 7) === 'onmouse') {
                                node_1.setAttribute('_' + name_1, value);
                            }
                            else if (tagName === 'meta' &&
                                n.attributes['http-equiv'] === 'Content-Security-Policy' &&
                                name_1 === 'content') {
                                node_1.setAttribute('csp-content', value);
                                return "continue";
                            }
                            else if (tagName === 'link' &&
                                n.attributes.rel === 'preload' &&
                                n.attributes.as === 'script') {
                            }
                            else if (tagName === 'link' &&
                                n.attributes.rel === 'prefetch' &&
                                typeof n.attributes.href === 'string' &&
                                n.attributes.href.endsWith('.js')) {
                            }
                            else if (tagName === 'img' &&
                                n.attributes.srcset &&
                                n.attributes.rr_dataURL) {
                                node_1.setAttribute('rrweb-original-srcset', n.attributes.srcset);
                            }
                            else {
                                node_1.setAttribute(name_1, value);
                            }
                        }
                        catch (error) {
                        }
                    }
                    else {
                        if (tagName === 'canvas' && name_1 === 'rr_dataURL') {
                            var image_1 = document.createElement('img');
                            image_1.src = value;
                            image_1.onload = function () {
                                var ctx = node_1.getContext('2d');
                                if (ctx) {
                                    ctx.drawImage(image_1, 0, 0, image_1.width, image_1.height);
                                }
                            };
                        }
                        else if (tagName === 'img' && name_1 === 'rr_dataURL') {
                            var image = node_1;
                            if (!image.currentSrc.startsWith('data:')) {
                                image.setAttribute('rrweb-original-src', n.attributes.src);
                                image.src = value;
                            }
                        }
                        if (name_1 === 'rr_width') {
                            node_1.style.width = value;
                        }
                        else if (name_1 === 'rr_height') {
                            node_1.style.height = value;
                        }
                        else if (name_1 === 'rr_mediaCurrentTime') {
                            node_1.currentTime = n.attributes
                                .rr_mediaCurrentTime;
                        }
                        else if (name_1 === 'rr_mediaState') {
                            switch (value) {
                                case 'played':
                                    node_1
                                        .play()["catch"](function (e) { return console.warn('media playback error', e); });
                                    break;
                                case 'paused':
                                    node_1.pause();
                                    break;
                            }
                        }
                    }
                };
                for (var name_1 in n.attributes) {
                    _loop_1(name_1);
                }
                if (n.isShadowHost) {
                    if (!node_1.shadowRoot) {
                        node_1.attachShadow({ mode: 'open' });
                    }
                    else {
                        while (node_1.shadowRoot.firstChild) {
                            node_1.shadowRoot.removeChild(node_1.shadowRoot.firstChild);
                        }
                    }
                }
                return node_1;
            case NodeType.Text:
                return doc.createTextNode(n.isStyle && hackCss
                    ? addHoverClass(n.textContent, cache)
                    : n.textContent);
            case NodeType.CDATA:
                return doc.createCDATASection(n.textContent);
            case NodeType.Comment:
                return doc.createComment(n.textContent);
            default:
                return null;
        }
    }
    function buildNodeWithSN(n, options) {
        var doc = options.doc, map = options.map, _a = options.skipChild, skipChild = _a === void 0 ? false : _a, _b = options.hackCss, hackCss = _b === void 0 ? true : _b, afterAppend = options.afterAppend, cache = options.cache;
        var node = buildNode(n, { doc: doc, hackCss: hackCss, cache: cache });
        if (!node) {
            return null;
        }
        if (n.rootId) {
            console.assert(map[n.rootId] === doc, 'Target document should has the same root id.');
        }
        if (n.type === NodeType.Document) {
            doc.close();
            doc.open();
            if (n.compatMode === 'BackCompat' &&
                n.childNodes &&
                n.childNodes[0].type !== NodeType.DocumentType) {
                if (n.childNodes[0].type === NodeType.Element &&
                    'xmlns' in n.childNodes[0].attributes &&
                    n.childNodes[0].attributes.xmlns === 'http://www.w3.org/1999/xhtml') {
                    doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "">');
                }
                else {
                    doc.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN" "">');
                }
            }
            node = doc;
        }
        node.__sn = n;
        map[n.id] = node;
        if ((n.type === NodeType.Document || n.type === NodeType.Element) &&
            !skipChild) {
            for (var _i = 0, _c = n.childNodes; _i < _c.length; _i++) {
                var childN = _c[_i];
                var childNode = buildNodeWithSN(childN, {
                    doc: doc,
                    map: map,
                    skipChild: false,
                    hackCss: hackCss,
                    afterAppend: afterAppend,
                    cache: cache
                });
                if (!childNode) {
                    console.warn('Failed to rebuild', childN);
                    continue;
                }
                if (childN.isShadow && isElement(node) && node.shadowRoot) {
                    node.shadowRoot.appendChild(childNode);
                }
                else {
                    node.appendChild(childNode);
                }
                if (afterAppend) {
                    afterAppend(childNode);
                }
            }
        }
        return node;
    }
    function visit(idNodeMap, onVisit) {
        function walk(node) {
            onVisit(node);
        }
        for (var key in idNodeMap) {
            if (idNodeMap[key]) {
                walk(idNodeMap[key]);
            }
        }
    }
    function handleScroll(node) {
        var n = node.__sn;
        if (n.type !== NodeType.Element) {
            return;
        }
        var el = node;
        for (var name_2 in n.attributes) {
            if (!(n.attributes.hasOwnProperty(name_2) && name_2.startsWith('rr_'))) {
                continue;
            }
            var value = n.attributes[name_2];
            if (name_2 === 'rr_scrollLeft') {
                el.scrollLeft = value;
            }
            if (name_2 === 'rr_scrollTop') {
                el.scrollTop = value;
            }
        }
    }
    function rebuild(n, options) {
        var doc = options.doc, onVisit = options.onVisit, _a = options.hackCss, hackCss = _a === void 0 ? true : _a, afterAppend = options.afterAppend, cache = options.cache;
        var idNodeMap = {};
        var node = buildNodeWithSN(n, {
            doc: doc,
            map: idNodeMap,
            skipChild: false,
            hackCss: hackCss,
            afterAppend: afterAppend,
            cache: cache
        });
        visit(idNodeMap, function (visitedNode) {
            if (onVisit) {
                onVisit(visitedNode);
            }
            handleScroll(visitedNode);
        });
        return [node, idNodeMap];
    }

    exports.EventType = void 0;
    (function (EventType) {
        EventType[EventType["DomContentLoaded"] = 0] = "DomContentLoaded";
        EventType[EventType["Load"] = 1] = "Load";
        EventType[EventType["FullSnapshot"] = 2] = "FullSnapshot";
        EventType[EventType["IncrementalSnapshot"] = 3] = "IncrementalSnapshot";
        EventType[EventType["Meta"] = 4] = "Meta";
        EventType[EventType["Custom"] = 5] = "Custom";
        EventType[EventType["Plugin"] = 6] = "Plugin";
    })(exports.EventType || (exports.EventType = {}));
    exports.IncrementalSource = void 0;
    (function (IncrementalSource) {
        IncrementalSource[IncrementalSource["Mutation"] = 0] = "Mutation";
        IncrementalSource[IncrementalSource["MouseMove"] = 1] = "MouseMove";
        IncrementalSource[IncrementalSource["MouseInteraction"] = 2] = "MouseInteraction";
        IncrementalSource[IncrementalSource["Scroll"] = 3] = "Scroll";
        IncrementalSource[IncrementalSource["ViewportResize"] = 4] = "ViewportResize";
        IncrementalSource[IncrementalSource["Input"] = 5] = "Input";
        IncrementalSource[IncrementalSource["TouchMove"] = 6] = "TouchMove";
        IncrementalSource[IncrementalSource["MediaInteraction"] = 7] = "MediaInteraction";
        IncrementalSource[IncrementalSource["StyleSheetRule"] = 8] = "StyleSheetRule";
        IncrementalSource[IncrementalSource["CanvasMutation"] = 9] = "CanvasMutation";
        IncrementalSource[IncrementalSource["Font"] = 10] = "Font";
        IncrementalSource[IncrementalSource["Log"] = 11] = "Log";
        IncrementalSource[IncrementalSource["Drag"] = 12] = "Drag";
        IncrementalSource[IncrementalSource["StyleDeclaration"] = 13] = "StyleDeclaration";
    })(exports.IncrementalSource || (exports.IncrementalSource = {}));
    exports.MouseInteractions = void 0;
    (function (MouseInteractions) {
        MouseInteractions[MouseInteractions["MouseUp"] = 0] = "MouseUp";
        MouseInteractions[MouseInteractions["MouseDown"] = 1] = "MouseDown";
        MouseInteractions[MouseInteractions["Click"] = 2] = "Click";
        MouseInteractions[MouseInteractions["ContextMenu"] = 3] = "ContextMenu";
        MouseInteractions[MouseInteractions["DblClick"] = 4] = "DblClick";
        MouseInteractions[MouseInteractions["Focus"] = 5] = "Focus";
        MouseInteractions[MouseInteractions["Blur"] = 6] = "Blur";
        MouseInteractions[MouseInteractions["TouchStart"] = 7] = "TouchStart";
        MouseInteractions[MouseInteractions["TouchMove_Departed"] = 8] = "TouchMove_Departed";
        MouseInteractions[MouseInteractions["TouchEnd"] = 9] = "TouchEnd";
        MouseInteractions[MouseInteractions["TouchCancel"] = 10] = "TouchCancel";
    })(exports.MouseInteractions || (exports.MouseInteractions = {}));
    var CanvasContext;
    (function (CanvasContext) {
        CanvasContext[CanvasContext["2D"] = 0] = "2D";
        CanvasContext[CanvasContext["WebGL"] = 1] = "WebGL";
        CanvasContext[CanvasContext["WebGL2"] = 2] = "WebGL2";
    })(CanvasContext || (CanvasContext = {}));
    var MediaInteractions;
    (function (MediaInteractions) {
        MediaInteractions[MediaInteractions["Play"] = 0] = "Play";
        MediaInteractions[MediaInteractions["Pause"] = 1] = "Pause";
        MediaInteractions[MediaInteractions["Seeked"] = 2] = "Seeked";
        MediaInteractions[MediaInteractions["VolumeChange"] = 3] = "VolumeChange";
    })(MediaInteractions || (MediaInteractions = {}));
    exports.ReplayerEvents = void 0;
    (function (ReplayerEvents) {
        ReplayerEvents["Start"] = "start";
        ReplayerEvents["Pause"] = "pause";
        ReplayerEvents["Resume"] = "resume";
        ReplayerEvents["Resize"] = "resize";
        ReplayerEvents["Finish"] = "finish";
        ReplayerEvents["FullsnapshotRebuilded"] = "fullsnapshot-rebuilded";
        ReplayerEvents["LoadStylesheetStart"] = "load-stylesheet-start";
        ReplayerEvents["LoadStylesheetEnd"] = "load-stylesheet-end";
        ReplayerEvents["SkipStart"] = "skip-start";
        ReplayerEvents["SkipEnd"] = "skip-end";
        ReplayerEvents["MouseInteraction"] = "mouse-interaction";
        ReplayerEvents["EventCast"] = "event-cast";
        ReplayerEvents["CustomEvent"] = "custom-event";
        ReplayerEvents["Flush"] = "flush";
        ReplayerEvents["StateChange"] = "state-change";
        ReplayerEvents["PlayBack"] = "play-back";
    })(exports.ReplayerEvents || (exports.ReplayerEvents = {}));

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
    exports.mirror = {
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
        exports.mirror = new Proxy(exports.mirror, {
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
    function polyfill$1(win) {
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
                source: exports.IncrementalSource.Mutation,
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

    var utils = /*#__PURE__*/Object.freeze({
        __proto__: null,
        on: on,
        createMirror: createMirror,
        get _mirror () { return exports.mirror; },
        throttle: throttle,
        hookSetter: hookSetter,
        patch: patch,
        getWindowHeight: getWindowHeight,
        getWindowWidth: getWindowWidth,
        isBlocked: isBlocked,
        isIgnored: isIgnored,
        isAncestorRemoved: isAncestorRemoved,
        isTouchEvent: isTouchEvent,
        polyfill: polyfill$1,
        TreeIndex: TreeIndex,
        queueToResolveTrees: queueToResolveTrees,
        iterateResolveTree: iterateResolveTree,
        isIframeINode: isIframeINode,
        getBaseDimension: getBaseDimension,
        hasShadowRoot: hasShadowRoot
    });

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

    var mutationBuffers = [];
    var isCSSGroupingRuleSupported = typeof CSSGroupingRule !== 'undefined';
    var isCSSMediaRuleSupported = typeof CSSMediaRule !== 'undefined';
    var isCSSSupportsRuleSupported = typeof CSSSupportsRule !== 'undefined';
    var isCSSConditionRuleSupported = typeof CSSConditionRule !== 'undefined';
    function getEventTarget(event) {
        try {
            if ('composedPath' in event) {
                var path = event.composedPath();
                if (path.length) {
                    return path[0];
                }
            }
            else if ('path' in event && event.path.length) {
                return event.path[0];
            }
            return event.target;
        }
        catch (_a) {
            return event.target;
        }
    }
    function initMutationObserver(options, rootEl) {
        var _a, _b;
        var mutationBuffer = new MutationBuffer();
        mutationBuffers.push(mutationBuffer);
        mutationBuffer.init(options);
        var mutationObserverCtor = window.MutationObserver ||
            window.__rrMutationObserver;
        var angularZoneSymbol = (_b = (_a = window === null || window === void 0 ? void 0 : window.Zone) === null || _a === void 0 ? void 0 : _a.__symbol__) === null || _b === void 0 ? void 0 : _b.call(_a, 'MutationObserver');
        if (angularZoneSymbol &&
            window[angularZoneSymbol]) {
            mutationObserverCtor = window[angularZoneSymbol];
        }
        var observer = new mutationObserverCtor(mutationBuffer.processMutations.bind(mutationBuffer));
        observer.observe(rootEl, {
            attributes: true,
            attributeOldValue: true,
            characterData: true,
            characterDataOldValue: true,
            childList: true,
            subtree: true,
        });
        return observer;
    }
    function initMoveObserver(_a) {
        var mousemoveCb = _a.mousemoveCb, sampling = _a.sampling, doc = _a.doc, mirror = _a.mirror;
        if (sampling.mousemove === false) {
            return function () { };
        }
        var threshold = typeof sampling.mousemove === 'number' ? sampling.mousemove : 50;
        var callbackThreshold = typeof sampling.mousemoveCallback === 'number'
            ? sampling.mousemoveCallback
            : 500;
        var positions = [];
        var timeBaseline;
        var wrappedCb = throttle(function (source) {
            var totalOffset = Date.now() - timeBaseline;
            mousemoveCb(positions.map(function (p) {
                p.timeOffset -= totalOffset;
                return p;
            }), source);
            positions = [];
            timeBaseline = null;
        }, callbackThreshold);
        var updatePosition = throttle(function (evt) {
            var target = getEventTarget(evt);
            var _a = isTouchEvent(evt)
                ? evt.changedTouches[0]
                : evt, clientX = _a.clientX, clientY = _a.clientY;
            if (!timeBaseline) {
                timeBaseline = Date.now();
            }
            positions.push({
                x: clientX,
                y: clientY,
                id: mirror.getId(target),
                timeOffset: Date.now() - timeBaseline,
            });
            wrappedCb(typeof DragEvent !== 'undefined' && evt instanceof DragEvent
                ? exports.IncrementalSource.Drag
                : evt instanceof MouseEvent
                    ? exports.IncrementalSource.MouseMove
                    : exports.IncrementalSource.TouchMove);
        }, threshold, {
            trailing: false,
        });
        var handlers = [
            on('mousemove', updatePosition, doc),
            on('touchmove', updatePosition, doc),
            on('drag', updatePosition, doc),
        ];
        return function () {
            handlers.forEach(function (h) { return h(); });
        };
    }
    function initMouseInteractionObserver(_a) {
        var mouseInteractionCb = _a.mouseInteractionCb, doc = _a.doc, mirror = _a.mirror, blockClass = _a.blockClass, sampling = _a.sampling;
        if (sampling.mouseInteraction === false) {
            return function () { };
        }
        var disableMap = sampling.mouseInteraction === true ||
            sampling.mouseInteraction === undefined
            ? {}
            : sampling.mouseInteraction;
        var handlers = [];
        var getHandler = function (eventKey) {
            return function (event) {
                var target = getEventTarget(event);
                if (isBlocked(target, blockClass)) {
                    return;
                }
                var e = isTouchEvent(event) ? event.changedTouches[0] : event;
                if (!e) {
                    return;
                }
                var id = mirror.getId(target);
                var clientX = e.clientX, clientY = e.clientY;
                mouseInteractionCb({
                    type: exports.MouseInteractions[eventKey],
                    id: id,
                    x: clientX,
                    y: clientY,
                });
            };
        };
        Object.keys(exports.MouseInteractions)
            .filter(function (key) {
            return Number.isNaN(Number(key)) &&
                !key.endsWith('_Departed') &&
                disableMap[key] !== false;
        })
            .forEach(function (eventKey) {
            var eventName = eventKey.toLowerCase();
            var handler = getHandler(eventKey);
            handlers.push(on(eventName, handler, doc));
        });
        return function () {
            handlers.forEach(function (h) { return h(); });
        };
    }
    function initScrollObserver(_a) {
        var scrollCb = _a.scrollCb, doc = _a.doc, mirror = _a.mirror, blockClass = _a.blockClass, sampling = _a.sampling;
        var updatePosition = throttle(function (evt) {
            var target = getEventTarget(evt);
            if (!target || isBlocked(target, blockClass)) {
                return;
            }
            var id = mirror.getId(target);
            if (target === doc) {
                var scrollEl = (doc.scrollingElement || doc.documentElement);
                scrollCb({
                    id: id,
                    x: scrollEl.scrollLeft,
                    y: scrollEl.scrollTop,
                });
            }
            else {
                scrollCb({
                    id: id,
                    x: target.scrollLeft,
                    y: target.scrollTop,
                });
            }
        }, sampling.scroll || 100);
        return on('scroll', updatePosition, doc);
    }
    function initViewportResizeObserver(_a) {
        var viewportResizeCb = _a.viewportResizeCb;
        var lastH = -1;
        var lastW = -1;
        var updateDimension = throttle(function () {
            var height = getWindowHeight();
            var width = getWindowWidth();
            if (lastH !== height || lastW !== width) {
                viewportResizeCb({
                    width: Number(width),
                    height: Number(height),
                });
                lastH = height;
                lastW = width;
            }
        }, 200);
        return on('resize', updateDimension, window);
    }
    function wrapEventWithUserTriggeredFlag(v, enable) {
        var value = __assign({}, v);
        if (!enable)
            delete value.userTriggered;
        return value;
    }
    var INPUT_TAGS = ['INPUT', 'TEXTAREA', 'SELECT'];
    var lastInputValueMap = new WeakMap();
    function initInputObserver(_a) {
        var inputCb = _a.inputCb, doc = _a.doc, mirror = _a.mirror, blockClass = _a.blockClass, ignoreClass = _a.ignoreClass, maskInputOptions = _a.maskInputOptions, maskInputFn = _a.maskInputFn, sampling = _a.sampling, userTriggeredOnInput = _a.userTriggeredOnInput;
        function eventHandler(event) {
            var target = getEventTarget(event);
            var userTriggered = event.isTrusted;
            if (target && target.tagName === 'OPTION')
                target = target.parentElement;
            if (!target ||
                !target.tagName ||
                INPUT_TAGS.indexOf(target.tagName) < 0 ||
                isBlocked(target, blockClass)) {
                return;
            }
            var type = target.type;
            if (target.classList.contains(ignoreClass)) {
                return;
            }
            var text = target.value;
            var isChecked = false;
            if (type === 'radio' || type === 'checkbox') {
                isChecked = target.checked;
            }
            else if (maskInputOptions[target.tagName.toLowerCase()] ||
                maskInputOptions[type]) {
                text = maskInputValue({
                    maskInputOptions: maskInputOptions,
                    tagName: target.tagName,
                    type: type,
                    value: text,
                    maskInputFn: maskInputFn,
                });
            }
            cbWithDedup(target, wrapEventWithUserTriggeredFlag({ text: text, isChecked: isChecked, userTriggered: userTriggered }, userTriggeredOnInput));
            var name = target.name;
            if (type === 'radio' && name && isChecked) {
                doc
                    .querySelectorAll("input[type=\"radio\"][name=\"".concat(name, "\"]"))
                    .forEach(function (el) {
                    if (el !== target) {
                        cbWithDedup(el, wrapEventWithUserTriggeredFlag({
                            text: el.value,
                            isChecked: !isChecked,
                            userTriggered: false,
                        }, userTriggeredOnInput));
                    }
                });
            }
        }
        function cbWithDedup(target, v) {
            var lastInputValue = lastInputValueMap.get(target);
            if (!lastInputValue ||
                lastInputValue.text !== v.text ||
                lastInputValue.isChecked !== v.isChecked) {
                lastInputValueMap.set(target, v);
                var id = mirror.getId(target);
                inputCb(__assign(__assign({}, v), { id: id }));
            }
        }
        var events = sampling.input === 'last' ? ['change'] : ['input', 'change'];
        var handlers = events.map(function (eventName) { return on(eventName, eventHandler, doc); });
        var propertyDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
        var hookProperties = [
            [HTMLInputElement.prototype, 'value'],
            [HTMLInputElement.prototype, 'checked'],
            [HTMLSelectElement.prototype, 'value'],
            [HTMLTextAreaElement.prototype, 'value'],
            [HTMLSelectElement.prototype, 'selectedIndex'],
            [HTMLOptionElement.prototype, 'selected'],
        ];
        if (propertyDescriptor && propertyDescriptor.set) {
            handlers.push.apply(handlers, __spreadArray([], __read(hookProperties.map(function (p) {
                return hookSetter(p[0], p[1], {
                    set: function () {
                        eventHandler({ target: this });
                    },
                });
            })), false));
        }
        return function () {
            handlers.forEach(function (h) { return h(); });
        };
    }
    function getNestedCSSRulePositions(rule) {
        var positions = [];
        function recurse(childRule, pos) {
            if ((isCSSGroupingRuleSupported &&
                childRule.parentRule instanceof CSSGroupingRule) ||
                (isCSSMediaRuleSupported &&
                    childRule.parentRule instanceof CSSMediaRule) ||
                (isCSSSupportsRuleSupported &&
                    childRule.parentRule instanceof CSSSupportsRule) ||
                (isCSSConditionRuleSupported &&
                    childRule.parentRule instanceof CSSConditionRule)) {
                var rules = Array.from(childRule.parentRule.cssRules);
                var index = rules.indexOf(childRule);
                pos.unshift(index);
            }
            else {
                var rules = Array.from(childRule.parentStyleSheet.cssRules);
                var index = rules.indexOf(childRule);
                pos.unshift(index);
            }
            return pos;
        }
        return recurse(rule, positions);
    }
    function initStyleSheetObserver(_a, _b) {
        var styleSheetRuleCb = _a.styleSheetRuleCb, mirror = _a.mirror;
        var win = _b.win;
        var insertRule = win.CSSStyleSheet.prototype.insertRule;
        win.CSSStyleSheet.prototype.insertRule = function (rule, index) {
            var id = mirror.getId(this.ownerNode);
            if (id !== -1) {
                styleSheetRuleCb({
                    id: id,
                    adds: [{ rule: rule, index: index }],
                });
            }
            return insertRule.apply(this, arguments);
        };
        var deleteRule = win.CSSStyleSheet.prototype.deleteRule;
        win.CSSStyleSheet.prototype.deleteRule = function (index) {
            var id = mirror.getId(this.ownerNode);
            if (id !== -1) {
                styleSheetRuleCb({
                    id: id,
                    removes: [{ index: index }],
                });
            }
            return deleteRule.apply(this, arguments);
        };
        var supportedNestedCSSRuleTypes = {};
        if (isCSSGroupingRuleSupported) {
            supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
        }
        else {
            if (isCSSMediaRuleSupported) {
                supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
            }
            if (isCSSConditionRuleSupported) {
                supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
            }
            if (isCSSSupportsRuleSupported) {
                supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
            }
        }
        var unmodifiedFunctions = {};
        Object.entries(supportedNestedCSSRuleTypes).forEach(function (_a) {
            var _b = __read(_a, 2), typeKey = _b[0], type = _b[1];
            unmodifiedFunctions[typeKey] = {
                insertRule: type.prototype.insertRule,
                deleteRule: type.prototype.deleteRule,
            };
            type.prototype.insertRule = function (rule, index) {
                var id = mirror.getId(this.parentStyleSheet.ownerNode);
                if (id !== -1) {
                    styleSheetRuleCb({
                        id: id,
                        adds: [
                            {
                                rule: rule,
                                index: __spreadArray(__spreadArray([], __read(getNestedCSSRulePositions(this)), false), [
                                    index || 0,
                                ], false),
                            },
                        ],
                    });
                }
                return unmodifiedFunctions[typeKey].insertRule.apply(this, arguments);
            };
            type.prototype.deleteRule = function (index) {
                var id = mirror.getId(this.parentStyleSheet.ownerNode);
                if (id !== -1) {
                    styleSheetRuleCb({
                        id: id,
                        removes: [{ index: __spreadArray(__spreadArray([], __read(getNestedCSSRulePositions(this)), false), [index], false) }],
                    });
                }
                return unmodifiedFunctions[typeKey].deleteRule.apply(this, arguments);
            };
        });
        return function () {
            win.CSSStyleSheet.prototype.insertRule = insertRule;
            win.CSSStyleSheet.prototype.deleteRule = deleteRule;
            Object.entries(supportedNestedCSSRuleTypes).forEach(function (_a) {
                var _b = __read(_a, 2), typeKey = _b[0], type = _b[1];
                type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
                type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
            });
        };
    }
    function initStyleDeclarationObserver(_a, _b) {
        var styleDeclarationCb = _a.styleDeclarationCb, mirror = _a.mirror;
        var win = _b.win;
        var setProperty = win.CSSStyleDeclaration.prototype.setProperty;
        win.CSSStyleDeclaration.prototype.setProperty = function (property, value, priority) {
            var _a, _b;
            var id = mirror.getId((_b = (_a = this.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet) === null || _b === void 0 ? void 0 : _b.ownerNode);
            if (id !== -1) {
                styleDeclarationCb({
                    id: id,
                    set: {
                        property: property,
                        value: value,
                        priority: priority,
                    },
                    index: getNestedCSSRulePositions(this.parentRule),
                });
            }
            return setProperty.apply(this, arguments);
        };
        var removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
        win.CSSStyleDeclaration.prototype.removeProperty = function (property) {
            var _a, _b;
            var id = mirror.getId((_b = (_a = this.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet) === null || _b === void 0 ? void 0 : _b.ownerNode);
            if (id !== -1) {
                styleDeclarationCb({
                    id: id,
                    remove: {
                        property: property,
                    },
                    index: getNestedCSSRulePositions(this.parentRule),
                });
            }
            return removeProperty.apply(this, arguments);
        };
        return function () {
            win.CSSStyleDeclaration.prototype.setProperty = setProperty;
            win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
        };
    }
    function initMediaInteractionObserver(_a) {
        var mediaInteractionCb = _a.mediaInteractionCb, blockClass = _a.blockClass, mirror = _a.mirror, sampling = _a.sampling;
        var handler = function (type) {
            return throttle(function (event) {
                var target = getEventTarget(event);
                if (!target || isBlocked(target, blockClass)) {
                    return;
                }
                var _a = target, currentTime = _a.currentTime, volume = _a.volume, muted = _a.muted;
                mediaInteractionCb({
                    type: type,
                    id: mirror.getId(target),
                    currentTime: currentTime,
                    volume: volume,
                    muted: muted,
                });
            }, sampling.media || 500);
        };
        var handlers = [
            on('play', handler(0)),
            on('pause', handler(1)),
            on('seeked', handler(2)),
            on('volumechange', handler(3)),
        ];
        return function () {
            handlers.forEach(function (h) { return h(); });
        };
    }
    function initFontObserver(_a) {
        var fontCb = _a.fontCb, doc = _a.doc;
        var win = doc.defaultView;
        if (!win) {
            return function () { };
        }
        var handlers = [];
        var fontMap = new WeakMap();
        var originalFontFace = win.FontFace;
        win.FontFace = function FontFace(family, source, descriptors) {
            var fontFace = new originalFontFace(family, source, descriptors);
            fontMap.set(fontFace, {
                family: family,
                buffer: typeof source !== 'string',
                descriptors: descriptors,
                fontSource: typeof source === 'string'
                    ? source
                    :
                        JSON.stringify(Array.from(new Uint8Array(source))),
            });
            return fontFace;
        };
        var restoreHandler = patch(doc.fonts, 'add', function (original) {
            return function (fontFace) {
                setTimeout(function () {
                    var p = fontMap.get(fontFace);
                    if (p) {
                        fontCb(p);
                        fontMap.delete(fontFace);
                    }
                }, 0);
                return original.apply(this, [fontFace]);
            };
        });
        handlers.push(function () {
            win.FontFace = originalFontFace;
        });
        handlers.push(restoreHandler);
        return function () {
            handlers.forEach(function (h) { return h(); });
        };
    }
    function mergeHooks(o, hooks) {
        var mutationCb = o.mutationCb, mousemoveCb = o.mousemoveCb, mouseInteractionCb = o.mouseInteractionCb, scrollCb = o.scrollCb, viewportResizeCb = o.viewportResizeCb, inputCb = o.inputCb, mediaInteractionCb = o.mediaInteractionCb, styleSheetRuleCb = o.styleSheetRuleCb, styleDeclarationCb = o.styleDeclarationCb, canvasMutationCb = o.canvasMutationCb, fontCb = o.fontCb;
        o.mutationCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.mutation) {
                hooks.mutation.apply(hooks, __spreadArray([], __read(p), false));
            }
            mutationCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.mousemoveCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.mousemove) {
                hooks.mousemove.apply(hooks, __spreadArray([], __read(p), false));
            }
            mousemoveCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.mouseInteractionCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.mouseInteraction) {
                hooks.mouseInteraction.apply(hooks, __spreadArray([], __read(p), false));
            }
            mouseInteractionCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.scrollCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.scroll) {
                hooks.scroll.apply(hooks, __spreadArray([], __read(p), false));
            }
            scrollCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.viewportResizeCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.viewportResize) {
                hooks.viewportResize.apply(hooks, __spreadArray([], __read(p), false));
            }
            viewportResizeCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.inputCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.input) {
                hooks.input.apply(hooks, __spreadArray([], __read(p), false));
            }
            inputCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.mediaInteractionCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.mediaInteaction) {
                hooks.mediaInteaction.apply(hooks, __spreadArray([], __read(p), false));
            }
            mediaInteractionCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.styleSheetRuleCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.styleSheetRule) {
                hooks.styleSheetRule.apply(hooks, __spreadArray([], __read(p), false));
            }
            styleSheetRuleCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.styleDeclarationCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.styleDeclaration) {
                hooks.styleDeclaration.apply(hooks, __spreadArray([], __read(p), false));
            }
            styleDeclarationCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.canvasMutationCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.canvasMutation) {
                hooks.canvasMutation.apply(hooks, __spreadArray([], __read(p), false));
            }
            canvasMutationCb.apply(void 0, __spreadArray([], __read(p), false));
        };
        o.fontCb = function () {
            var p = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                p[_i] = arguments[_i];
            }
            if (hooks.font) {
                hooks.font.apply(hooks, __spreadArray([], __read(p), false));
            }
            fontCb.apply(void 0, __spreadArray([], __read(p), false));
        };
    }
    function initObservers(o, hooks) {
        var e_1, _a;
        if (hooks === void 0) { hooks = {}; }
        var currentWindow = o.doc.defaultView;
        if (!currentWindow) {
            return function () { };
        }
        mergeHooks(o, hooks);
        var mutationObserver = initMutationObserver(o, o.doc);
        var mousemoveHandler = initMoveObserver(o);
        var mouseInteractionHandler = initMouseInteractionObserver(o);
        var scrollHandler = initScrollObserver(o);
        var viewportResizeHandler = initViewportResizeObserver(o);
        var inputHandler = initInputObserver(o);
        var mediaInteractionHandler = initMediaInteractionObserver(o);
        var styleSheetObserver = initStyleSheetObserver(o, { win: currentWindow });
        var styleDeclarationObserver = initStyleDeclarationObserver(o, {
            win: currentWindow,
        });
        var fontObserver = o.collectFonts ? initFontObserver(o) : function () { };
        var pluginHandlers = [];
        try {
            for (var _b = __values(o.plugins), _c = _b.next(); !_c.done; _c = _b.next()) {
                var plugin = _c.value;
                pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return function () {
            mutationBuffers.forEach(function (b) { return b.reset(); });
            mutationObserver.disconnect();
            mousemoveHandler();
            mouseInteractionHandler();
            scrollHandler();
            viewportResizeHandler();
            inputHandler();
            mediaInteractionHandler();
            styleSheetObserver();
            styleDeclarationObserver();
            fontObserver();
            pluginHandlers.forEach(function (h) { return h(); });
        };
    }

    var IframeManager = (function () {
        function IframeManager(options) {
            this.iframes = new WeakMap();
            this.mutationCb = options.mutationCb;
        }
        IframeManager.prototype.addIframe = function (iframeEl) {
            this.iframes.set(iframeEl, true);
        };
        IframeManager.prototype.addLoadListener = function (cb) {
            this.loadListener = cb;
        };
        IframeManager.prototype.attachIframe = function (iframeEl, childSn) {
            var _a;
            this.mutationCb({
                adds: [
                    {
                        parentId: iframeEl.__sn.id,
                        nextId: null,
                        node: childSn,
                    },
                ],
                removes: [],
                texts: [],
                attributes: [],
                isAttachIframe: true,
            });
            (_a = this.loadListener) === null || _a === void 0 ? void 0 : _a.call(this, iframeEl);
        };
        return IframeManager;
    }());

    var ShadowDomManager = (function () {
        function ShadowDomManager(options) {
            this.restorePatches = [];
            this.mutationCb = options.mutationCb;
            this.scrollCb = options.scrollCb;
            this.bypassOptions = options.bypassOptions;
            this.mirror = options.mirror;
            var manager = this;
            this.restorePatches.push(patch(HTMLElement.prototype, 'attachShadow', function (original) {
                return function () {
                    var shadowRoot = original.apply(this, arguments);
                    if (this.shadowRoot)
                        manager.addShadowRoot(this.shadowRoot, this.ownerDocument);
                    return shadowRoot;
                };
            }));
        }
        ShadowDomManager.prototype.addShadowRoot = function (shadowRoot, doc) {
            initMutationObserver(__assign(__assign({}, this.bypassOptions), { doc: doc, mutationCb: this.mutationCb, mirror: this.mirror, shadowDomManager: this }), shadowRoot);
            initScrollObserver(__assign(__assign({}, this.bypassOptions), { scrollCb: this.scrollCb, doc: shadowRoot, mirror: this.mirror }));
        };
        ShadowDomManager.prototype.observeAttachShadow = function (iframeElement) {
            if (iframeElement.contentWindow) {
                var manager_1 = this;
                this.restorePatches.push(patch(iframeElement.contentWindow.HTMLElement.prototype, 'attachShadow', function (original) {
                    return function () {
                        var shadowRoot = original.apply(this, arguments);
                        if (this.shadowRoot)
                            manager_1.addShadowRoot(this.shadowRoot, iframeElement.contentDocument);
                        return shadowRoot;
                    };
                }));
            }
        };
        ShadowDomManager.prototype.reset = function () {
            this.restorePatches.forEach(function (restorePatch) { return restorePatch(); });
        };
        return ShadowDomManager;
    }());

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

    /*
     * base64-arraybuffer 1.0.1 <https://github.com/niklasvh/base64-arraybuffer>
     * Copyright (c) 2021 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    // Use a lookup table to find the index.
    var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
    for (var i$1 = 0; i$1 < chars.length; i$1++) {
        lookup[chars.charCodeAt(i$1)] = i$1;
    }
    var encode = function (arraybuffer) {
        var bytes = new Uint8Array(arraybuffer), i, len = bytes.length, base64 = '';
        for (i = 0; i < len; i += 3) {
            base64 += chars[bytes[i] >> 2];
            base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
            base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
            base64 += chars[bytes[i + 2] & 63];
        }
        if (len % 3 === 2) {
            base64 = base64.substring(0, base64.length - 1) + '=';
        }
        else if (len % 3 === 1) {
            base64 = base64.substring(0, base64.length - 2) + '==';
        }
        return base64;
    };
    var decode = function (base64) {
        var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
        if (base64[base64.length - 1] === '=') {
            bufferLength--;
            if (base64[base64.length - 2] === '=') {
                bufferLength--;
            }
        }
        var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
        for (i = 0; i < len; i += 4) {
            encoded1 = lookup[base64.charCodeAt(i)];
            encoded2 = lookup[base64.charCodeAt(i + 1)];
            encoded3 = lookup[base64.charCodeAt(i + 2)];
            encoded4 = lookup[base64.charCodeAt(i + 3)];
            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
        }
        return arraybuffer;
    };

    var webGLVarMap$1 = new Map();
    function variableListFor$1(ctx, ctor) {
        var contextMap = webGLVarMap$1.get(ctx);
        if (!contextMap) {
            contextMap = new Map();
            webGLVarMap$1.set(ctx, contextMap);
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
        var list = variableListFor$1(ctx, name);
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

    var CanvasManager = (function () {
        function CanvasManager(options) {
            this.pendingCanvasMutations = new Map();
            this.rafStamps = { latestId: 0, invokeId: null };
            this.frozen = false;
            this.locked = false;
            this.processMutation = function (target, mutation) {
                var newFrame = this.rafStamps.invokeId &&
                    this.rafStamps.latestId !== this.rafStamps.invokeId;
                if (newFrame || !this.rafStamps.invokeId)
                    this.rafStamps.invokeId = this.rafStamps.latestId;
                if (!this.pendingCanvasMutations.has(target)) {
                    this.pendingCanvasMutations.set(target, []);
                }
                this.pendingCanvasMutations.get(target).push(mutation);
            };
            this.mutationCb = options.mutationCb;
            this.mirror = options.mirror;
            if (options.recordCanvas === true)
                this.initCanvasMutationObserver(options.win, options.blockClass);
        }
        CanvasManager.prototype.reset = function () {
            this.pendingCanvasMutations.clear();
            this.resetObservers && this.resetObservers();
        };
        CanvasManager.prototype.freeze = function () {
            this.frozen = true;
        };
        CanvasManager.prototype.unfreeze = function () {
            this.frozen = false;
        };
        CanvasManager.prototype.lock = function () {
            this.locked = true;
        };
        CanvasManager.prototype.unlock = function () {
            this.locked = false;
        };
        CanvasManager.prototype.initCanvasMutationObserver = function (win, blockClass) {
            this.startRAFTimestamping();
            this.startPendingCanvasMutationFlusher();
            var canvasContextReset = initCanvasContextObserver(win, blockClass);
            var canvas2DReset = initCanvas2DMutationObserver(this.processMutation.bind(this), win, blockClass, this.mirror);
            var canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(this.processMutation.bind(this), win, blockClass, this.mirror);
            this.resetObservers = function () {
                canvasContextReset();
                canvas2DReset();
                canvasWebGL1and2Reset();
            };
        };
        CanvasManager.prototype.startPendingCanvasMutationFlusher = function () {
            var _this = this;
            requestAnimationFrame(function () { return _this.flushPendingCanvasMutations(); });
        };
        CanvasManager.prototype.startRAFTimestamping = function () {
            var _this = this;
            var setLatestRAFTimestamp = function (timestamp) {
                _this.rafStamps.latestId = timestamp;
                requestAnimationFrame(setLatestRAFTimestamp);
            };
            requestAnimationFrame(setLatestRAFTimestamp);
        };
        CanvasManager.prototype.flushPendingCanvasMutations = function () {
            var _this = this;
            this.pendingCanvasMutations.forEach(function (values, canvas) {
                var id = _this.mirror.getId(canvas);
                _this.flushPendingCanvasMutationFor(canvas, id);
            });
            requestAnimationFrame(function () { return _this.flushPendingCanvasMutations(); });
        };
        CanvasManager.prototype.flushPendingCanvasMutationFor = function (canvas, id) {
            if (this.frozen || this.locked) {
                return;
            }
            var valuesWithType = this.pendingCanvasMutations.get(canvas);
            if (!valuesWithType || id === -1)
                return;
            var values = valuesWithType.map(function (value) {
                value.type; var rest = __rest(value, ["type"]);
                return rest;
            });
            var type = valuesWithType[0].type;
            this.mutationCb({ id: id, type: type, commands: values });
            this.pendingCanvasMutations.delete(canvas);
        };
        return CanvasManager;
    }());

    function wrapEvent(e) {
        return __assign(__assign({}, e), { timestamp: Date.now() });
    }
    var wrappedEmit;
    var takeFullSnapshot;
    var mirror = createMirror();
    function record(options) {
        if (options === void 0) { options = {}; }
        var emit = options.emit, checkoutEveryNms = options.checkoutEveryNms, checkoutEveryNth = options.checkoutEveryNth, _a = options.blockClass, blockClass = _a === void 0 ? 'rr-block' : _a, _b = options.blockSelector, blockSelector = _b === void 0 ? null : _b, _c = options.ignoreClass, ignoreClass = _c === void 0 ? 'rr-ignore' : _c, _d = options.maskTextClass, maskTextClass = _d === void 0 ? 'rr-mask' : _d, _e = options.maskTextSelector, maskTextSelector = _e === void 0 ? null : _e, _f = options.inlineStylesheet, inlineStylesheet = _f === void 0 ? true : _f, maskAllInputs = options.maskAllInputs, _maskInputOptions = options.maskInputOptions, _slimDOMOptions = options.slimDOMOptions, maskInputFn = options.maskInputFn, maskTextFn = options.maskTextFn, hooks = options.hooks, packFn = options.packFn, _g = options.sampling, sampling = _g === void 0 ? {} : _g, mousemoveWait = options.mousemoveWait, _h = options.recordCanvas, recordCanvas = _h === void 0 ? false : _h, _j = options.userTriggeredOnInput, userTriggeredOnInput = _j === void 0 ? false : _j, _k = options.collectFonts, collectFonts = _k === void 0 ? false : _k, _l = options.inlineImages, inlineImages = _l === void 0 ? false : _l, plugins = options.plugins, _m = options.keepIframeSrcFn, keepIframeSrcFn = _m === void 0 ? function () { return false; } : _m;
        if (!emit) {
            throw new Error('emit function is required');
        }
        if (mousemoveWait !== undefined && sampling.mousemove === undefined) {
            sampling.mousemove = mousemoveWait;
        }
        var maskInputOptions = maskAllInputs === true
            ? {
                color: true,
                date: true,
                'datetime-local': true,
                email: true,
                month: true,
                number: true,
                range: true,
                search: true,
                tel: true,
                text: true,
                time: true,
                url: true,
                week: true,
                textarea: true,
                select: true,
                password: true,
            }
            : _maskInputOptions !== undefined
                ? _maskInputOptions
                : { password: true };
        var slimDOMOptions = _slimDOMOptions === true || _slimDOMOptions === 'all'
            ? {
                script: true,
                comment: true,
                headFavicon: true,
                headWhitespace: true,
                headMetaSocial: true,
                headMetaRobots: true,
                headMetaHttpEquiv: true,
                headMetaVerification: true,
                headMetaAuthorship: _slimDOMOptions === 'all',
                headMetaDescKeywords: _slimDOMOptions === 'all',
            }
            : _slimDOMOptions
                ? _slimDOMOptions
                : {};
        polyfill$1();
        var lastFullSnapshotEvent;
        var incrementalSnapshotCount = 0;
        var eventProcessor = function (e) {
            var e_1, _a;
            try {
                for (var _b = __values(plugins || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var plugin = _c.value;
                    if (plugin.eventProcessor) {
                        e = plugin.eventProcessor(e);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (packFn) {
                e = packFn(e);
            }
            return e;
        };
        wrappedEmit = function (e, isCheckout) {
            var _a;
            if (((_a = mutationBuffers[0]) === null || _a === void 0 ? void 0 : _a.isFrozen()) &&
                e.type !== exports.EventType.FullSnapshot &&
                !(e.type === exports.EventType.IncrementalSnapshot &&
                    e.data.source === exports.IncrementalSource.Mutation)) {
                mutationBuffers.forEach(function (buf) { return buf.unfreeze(); });
            }
            emit(eventProcessor(e), isCheckout);
            if (e.type === exports.EventType.FullSnapshot) {
                lastFullSnapshotEvent = e;
                incrementalSnapshotCount = 0;
            }
            else if (e.type === exports.EventType.IncrementalSnapshot) {
                if (e.data.source === exports.IncrementalSource.Mutation &&
                    e.data.isAttachIframe) {
                    return;
                }
                incrementalSnapshotCount++;
                var exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
                var exceedTime = checkoutEveryNms &&
                    e.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
                if (exceedCount || exceedTime) {
                    takeFullSnapshot(true);
                }
            }
        };
        var wrappedMutationEmit = function (m) {
            wrappedEmit(wrapEvent({
                type: exports.EventType.IncrementalSnapshot,
                data: __assign({ source: exports.IncrementalSource.Mutation }, m),
            }));
        };
        var wrappedScrollEmit = function (p) {
            return wrappedEmit(wrapEvent({
                type: exports.EventType.IncrementalSnapshot,
                data: __assign({ source: exports.IncrementalSource.Scroll }, p),
            }));
        };
        var wrappedCanvasMutationEmit = function (p) {
            return wrappedEmit(wrapEvent({
                type: exports.EventType.IncrementalSnapshot,
                data: __assign({ source: exports.IncrementalSource.CanvasMutation }, p),
            }));
        };
        var iframeManager = new IframeManager({
            mutationCb: wrappedMutationEmit,
        });
        var canvasManager = new CanvasManager({
            recordCanvas: recordCanvas,
            mutationCb: wrappedCanvasMutationEmit,
            win: window,
            blockClass: blockClass,
            mirror: mirror,
        });
        var shadowDomManager = new ShadowDomManager({
            mutationCb: wrappedMutationEmit,
            scrollCb: wrappedScrollEmit,
            bypassOptions: {
                blockClass: blockClass,
                blockSelector: blockSelector,
                maskTextClass: maskTextClass,
                maskTextSelector: maskTextSelector,
                inlineStylesheet: inlineStylesheet,
                maskInputOptions: maskInputOptions,
                maskTextFn: maskTextFn,
                maskInputFn: maskInputFn,
                recordCanvas: recordCanvas,
                inlineImages: inlineImages,
                sampling: sampling,
                slimDOMOptions: slimDOMOptions,
                iframeManager: iframeManager,
                canvasManager: canvasManager,
            },
            mirror: mirror,
        });
        takeFullSnapshot = function (isCheckout) {
            var _a, _b, _c, _d;
            if (isCheckout === void 0) { isCheckout = false; }
            wrappedEmit(wrapEvent({
                type: exports.EventType.Meta,
                data: {
                    href: window.location.href,
                    width: getWindowWidth(),
                    height: getWindowHeight(),
                },
            }), isCheckout);
            mutationBuffers.forEach(function (buf) { return buf.lock(); });
            var _e = __read(snapshot(document, {
                blockClass: blockClass,
                blockSelector: blockSelector,
                maskTextClass: maskTextClass,
                maskTextSelector: maskTextSelector,
                inlineStylesheet: inlineStylesheet,
                maskAllInputs: maskInputOptions,
                maskTextFn: maskTextFn,
                slimDOM: slimDOMOptions,
                recordCanvas: recordCanvas,
                inlineImages: inlineImages,
                onSerialize: function (n) {
                    if (isIframeINode(n)) {
                        iframeManager.addIframe(n);
                    }
                    if (hasShadowRoot(n)) {
                        shadowDomManager.addShadowRoot(n.shadowRoot, document);
                    }
                },
                onIframeLoad: function (iframe, childSn) {
                    iframeManager.attachIframe(iframe, childSn);
                    shadowDomManager.observeAttachShadow(iframe);
                },
                keepIframeSrcFn: keepIframeSrcFn,
            }), 2), node = _e[0], idNodeMap = _e[1];
            if (!node) {
                return console.warn('Failed to snapshot the document');
            }
            mirror.map = idNodeMap;
            wrappedEmit(wrapEvent({
                type: exports.EventType.FullSnapshot,
                data: {
                    node: node,
                    initialOffset: {
                        left: window.pageXOffset !== undefined
                            ? window.pageXOffset
                            : (document === null || document === void 0 ? void 0 : document.documentElement.scrollLeft) ||
                                ((_b = (_a = document === null || document === void 0 ? void 0 : document.body) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.scrollLeft) ||
                                (document === null || document === void 0 ? void 0 : document.body.scrollLeft) ||
                                0,
                        top: window.pageYOffset !== undefined
                            ? window.pageYOffset
                            : (document === null || document === void 0 ? void 0 : document.documentElement.scrollTop) ||
                                ((_d = (_c = document === null || document === void 0 ? void 0 : document.body) === null || _c === void 0 ? void 0 : _c.parentElement) === null || _d === void 0 ? void 0 : _d.scrollTop) ||
                                (document === null || document === void 0 ? void 0 : document.body.scrollTop) ||
                                0,
                    },
                },
            }));
            mutationBuffers.forEach(function (buf) { return buf.unlock(); });
        };
        try {
            var handlers_1 = [];
            handlers_1.push(on('DOMContentLoaded', function () {
                wrappedEmit(wrapEvent({
                    type: exports.EventType.DomContentLoaded,
                    data: {},
                }));
            }));
            var observe_1 = function (doc) {
                var _a;
                return initObservers({
                    mutationCb: wrappedMutationEmit,
                    mousemoveCb: function (positions, source) {
                        return wrappedEmit(wrapEvent({
                            type: exports.EventType.IncrementalSnapshot,
                            data: {
                                source: source,
                                positions: positions,
                            },
                        }));
                    },
                    mouseInteractionCb: function (d) {
                        return wrappedEmit(wrapEvent({
                            type: exports.EventType.IncrementalSnapshot,
                            data: __assign({ source: exports.IncrementalSource.MouseInteraction }, d),
                        }));
                    },
                    scrollCb: wrappedScrollEmit,
                    viewportResizeCb: function (d) {
                        return wrappedEmit(wrapEvent({
                            type: exports.EventType.IncrementalSnapshot,
                            data: __assign({ source: exports.IncrementalSource.ViewportResize }, d),
                        }));
                    },
                    inputCb: function (v) {
                        return wrappedEmit(wrapEvent({
                            type: exports.EventType.IncrementalSnapshot,
                            data: __assign({ source: exports.IncrementalSource.Input }, v),
                        }));
                    },
                    mediaInteractionCb: function (p) {
                        return wrappedEmit(wrapEvent({
                            type: exports.EventType.IncrementalSnapshot,
                            data: __assign({ source: exports.IncrementalSource.MediaInteraction }, p),
                        }));
                    },
                    styleSheetRuleCb: function (r) {
                        return wrappedEmit(wrapEvent({
                            type: exports.EventType.IncrementalSnapshot,
                            data: __assign({ source: exports.IncrementalSource.StyleSheetRule }, r),
                        }));
                    },
                    styleDeclarationCb: function (r) {
                        return wrappedEmit(wrapEvent({
                            type: exports.EventType.IncrementalSnapshot,
                            data: __assign({ source: exports.IncrementalSource.StyleDeclaration }, r),
                        }));
                    },
                    canvasMutationCb: wrappedCanvasMutationEmit,
                    fontCb: function (p) {
                        return wrappedEmit(wrapEvent({
                            type: exports.EventType.IncrementalSnapshot,
                            data: __assign({ source: exports.IncrementalSource.Font }, p),
                        }));
                    },
                    blockClass: blockClass,
                    ignoreClass: ignoreClass,
                    maskTextClass: maskTextClass,
                    maskTextSelector: maskTextSelector,
                    maskInputOptions: maskInputOptions,
                    inlineStylesheet: inlineStylesheet,
                    sampling: sampling,
                    recordCanvas: recordCanvas,
                    inlineImages: inlineImages,
                    userTriggeredOnInput: userTriggeredOnInput,
                    collectFonts: collectFonts,
                    doc: doc,
                    maskInputFn: maskInputFn,
                    maskTextFn: maskTextFn,
                    blockSelector: blockSelector,
                    slimDOMOptions: slimDOMOptions,
                    mirror: mirror,
                    iframeManager: iframeManager,
                    shadowDomManager: shadowDomManager,
                    canvasManager: canvasManager,
                    plugins: ((_a = plugins === null || plugins === void 0 ? void 0 : plugins.filter(function (p) { return p.observer; })) === null || _a === void 0 ? void 0 : _a.map(function (p) { return ({
                        observer: p.observer,
                        options: p.options,
                        callback: function (payload) {
                            return wrappedEmit(wrapEvent({
                                type: exports.EventType.Plugin,
                                data: {
                                    plugin: p.name,
                                    payload: payload,
                                },
                            }));
                        },
                    }); })) || [],
                }, hooks);
            };
            iframeManager.addLoadListener(function (iframeEl) {
                handlers_1.push(observe_1(iframeEl.contentDocument));
            });
            var init_1 = function () {
                takeFullSnapshot();
                handlers_1.push(observe_1(document));
            };
            if (document.readyState === 'interactive' ||
                document.readyState === 'complete') {
                init_1();
            }
            else {
                handlers_1.push(on('load', function () {
                    wrappedEmit(wrapEvent({
                        type: exports.EventType.Load,
                        data: {},
                    }));
                    init_1();
                }, window));
            }
            return function () {
                handlers_1.forEach(function (h) { return h(); });
            };
        }
        catch (error) {
            console.warn(error);
        }
    }
    record.addCustomEvent = function (tag, payload) {
        if (!wrappedEmit) {
            throw new Error('please add custom event after start recording');
        }
        wrappedEmit(wrapEvent({
            type: exports.EventType.Custom,
            data: {
                tag: tag,
                payload: payload,
            },
        }));
    };
    record.freezePage = function () {
        mutationBuffers.forEach(function (buf) { return buf.freeze(); });
    };
    record.takeFullSnapshot = function (isCheckout) {
        if (!takeFullSnapshot) {
            throw new Error('please take full snapshot after start recording');
        }
        takeFullSnapshot(isCheckout);
    };
    record.mirror = mirror;

    //      
    // An event handler can take an optional event argument
    // and should not return a value
                                              
                                                                   

    // An array of all currently registered event handlers for a type
                                                
                                                                
    // A map of event types and their corresponding event handlers.
                            
                                     
                                       
      

    /** Mitt: Tiny (~200b) functional event emitter / pubsub.
     *  @name mitt
     *  @returns {Mitt}
     */
    function mitt$1(all                 ) {
    	all = all || Object.create(null);

    	return {
    		/**
    		 * Register an event handler for the given type.
    		 *
    		 * @param  {String} type	Type of event to listen for, or `"*"` for all events
    		 * @param  {Function} handler Function to call in response to given event
    		 * @memberOf mitt
    		 */
    		on: function on(type        , handler              ) {
    			(all[type] || (all[type] = [])).push(handler);
    		},

    		/**
    		 * Remove an event handler for the given type.
    		 *
    		 * @param  {String} type	Type of event to unregister `handler` from, or `"*"`
    		 * @param  {Function} handler Handler function to remove
    		 * @memberOf mitt
    		 */
    		off: function off(type        , handler              ) {
    			if (all[type]) {
    				all[type].splice(all[type].indexOf(handler) >>> 0, 1);
    			}
    		},

    		/**
    		 * Invoke all handlers for the given type.
    		 * If present, `"*"` handlers are invoked after type-matched handlers.
    		 *
    		 * @param {String} type  The event type to invoke
    		 * @param {Any} [evt]  Any value (object is recommended and powerful), passed to each handler
    		 * @memberOf mitt
    		 */
    		emit: function emit(type        , evt     ) {
    			(all[type] || []).slice().map(function (handler) { handler(evt); });
    			(all['*'] || []).slice().map(function (handler) { handler(type, evt); });
    		}
    	};
    }

    var mittProxy = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': mitt$1
    });

    function polyfill(w, d) {
        if (w === void 0) { w = window; }
        if (d === void 0) { d = document; }
        if ('scrollBehavior' in d.documentElement.style &&
            w.__forceSmoothScrollPolyfill__ !== true) {
            return;
        }
        var Element = w.HTMLElement || w.Element;
        var SCROLL_TIME = 468;
        var original = {
            scroll: w.scroll || w.scrollTo,
            scrollBy: w.scrollBy,
            elementScroll: Element.prototype.scroll || scrollElement,
            scrollIntoView: Element.prototype.scrollIntoView,
        };
        var now = w.performance && w.performance.now
            ? w.performance.now.bind(w.performance)
            : Date.now;
        function isMicrosoftBrowser(userAgent) {
            var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];
            return new RegExp(userAgentPatterns.join('|')).test(userAgent);
        }
        var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;
        function scrollElement(x, y) {
            this.scrollLeft = x;
            this.scrollTop = y;
        }
        function ease(k) {
            return 0.5 * (1 - Math.cos(Math.PI * k));
        }
        function shouldBailOut(firstArg) {
            if (firstArg === null ||
                typeof firstArg !== 'object' ||
                firstArg.behavior === undefined ||
                firstArg.behavior === 'auto' ||
                firstArg.behavior === 'instant') {
                return true;
            }
            if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
                return false;
            }
            throw new TypeError('behavior member of ScrollOptions ' +
                firstArg.behavior +
                ' is not a valid value for enumeration ScrollBehavior.');
        }
        function hasScrollableSpace(el, axis) {
            if (axis === 'Y') {
                return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
            }
            if (axis === 'X') {
                return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
            }
        }
        function canOverflow(el, axis) {
            var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];
            return overflowValue === 'auto' || overflowValue === 'scroll';
        }
        function isScrollable(el) {
            var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
            var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');
            return isScrollableY || isScrollableX;
        }
        function findScrollableParent(el) {
            while (el !== d.body && isScrollable(el) === false) {
                el = el.parentNode || el.host;
            }
            return el;
        }
        function step(context) {
            var time = now();
            var value;
            var currentX;
            var currentY;
            var elapsed = (time - context.startTime) / SCROLL_TIME;
            elapsed = elapsed > 1 ? 1 : elapsed;
            value = ease(elapsed);
            currentX = context.startX + (context.x - context.startX) * value;
            currentY = context.startY + (context.y - context.startY) * value;
            context.method.call(context.scrollable, currentX, currentY);
            if (currentX !== context.x || currentY !== context.y) {
                w.requestAnimationFrame(step.bind(w, context));
            }
        }
        function smoothScroll(el, x, y) {
            var scrollable;
            var startX;
            var startY;
            var method;
            var startTime = now();
            if (el === d.body) {
                scrollable = w;
                startX = w.scrollX || w.pageXOffset;
                startY = w.scrollY || w.pageYOffset;
                method = original.scroll;
            }
            else {
                scrollable = el;
                startX = el.scrollLeft;
                startY = el.scrollTop;
                method = scrollElement;
            }
            step({
                scrollable: scrollable,
                method: method,
                startTime: startTime,
                startX: startX,
                startY: startY,
                x: x,
                y: y,
            });
        }
        w.scroll = w.scrollTo = function () {
            if (arguments[0] === undefined) {
                return;
            }
            if (shouldBailOut(arguments[0]) === true) {
                original.scroll.call(w, arguments[0].left !== undefined
                    ? arguments[0].left
                    : typeof arguments[0] !== 'object'
                        ? arguments[0]
                        : w.scrollX || w.pageXOffset, arguments[0].top !== undefined
                    ? arguments[0].top
                    : arguments[1] !== undefined
                        ? arguments[1]
                        : w.scrollY || w.pageYOffset);
                return;
            }
            smoothScroll.call(w, d.body, arguments[0].left !== undefined
                ? ~~arguments[0].left
                : w.scrollX || w.pageXOffset, arguments[0].top !== undefined
                ? ~~arguments[0].top
                : w.scrollY || w.pageYOffset);
        };
        w.scrollBy = function () {
            if (arguments[0] === undefined) {
                return;
            }
            if (shouldBailOut(arguments[0])) {
                original.scrollBy.call(w, arguments[0].left !== undefined
                    ? arguments[0].left
                    : typeof arguments[0] !== 'object'
                        ? arguments[0]
                        : 0, arguments[0].top !== undefined
                    ? arguments[0].top
                    : arguments[1] !== undefined
                        ? arguments[1]
                        : 0);
                return;
            }
            smoothScroll.call(w, d.body, ~~arguments[0].left + (w.scrollX || w.pageXOffset), ~~arguments[0].top + (w.scrollY || w.pageYOffset));
        };
        Element.prototype.scroll = Element.prototype.scrollTo = function () {
            if (arguments[0] === undefined) {
                return;
            }
            if (shouldBailOut(arguments[0]) === true) {
                if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
                    throw new SyntaxError('Value could not be converted');
                }
                original.elementScroll.call(this, arguments[0].left !== undefined
                    ? ~~arguments[0].left
                    : typeof arguments[0] !== 'object'
                        ? ~~arguments[0]
                        : this.scrollLeft, arguments[0].top !== undefined
                    ? ~~arguments[0].top
                    : arguments[1] !== undefined
                        ? ~~arguments[1]
                        : this.scrollTop);
                return;
            }
            var left = arguments[0].left;
            var top = arguments[0].top;
            smoothScroll.call(this, this, typeof left === 'undefined' ? this.scrollLeft : ~~left, typeof top === 'undefined' ? this.scrollTop : ~~top);
        };
        Element.prototype.scrollBy = function () {
            if (arguments[0] === undefined) {
                return;
            }
            if (shouldBailOut(arguments[0]) === true) {
                original.elementScroll.call(this, arguments[0].left !== undefined
                    ? ~~arguments[0].left + this.scrollLeft
                    : ~~arguments[0] + this.scrollLeft, arguments[0].top !== undefined
                    ? ~~arguments[0].top + this.scrollTop
                    : ~~arguments[1] + this.scrollTop);
                return;
            }
            this.scroll({
                left: ~~arguments[0].left + this.scrollLeft,
                top: ~~arguments[0].top + this.scrollTop,
                behavior: arguments[0].behavior,
            });
        };
        Element.prototype.scrollIntoView = function () {
            if (shouldBailOut(arguments[0]) === true) {
                original.scrollIntoView.call(this, arguments[0] === undefined ? true : arguments[0]);
                return;
            }
            var scrollableParent = findScrollableParent(this);
            var parentRects = scrollableParent.getBoundingClientRect();
            var clientRects = this.getBoundingClientRect();
            if (scrollableParent !== d.body) {
                smoothScroll.call(this, scrollableParent, scrollableParent.scrollLeft + clientRects.left - parentRects.left, scrollableParent.scrollTop + clientRects.top - parentRects.top);
                if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
                    w.scrollBy({
                        left: parentRects.left,
                        top: parentRects.top,
                        behavior: 'smooth',
                    });
                }
            }
            else {
                w.scrollBy({
                    left: clientRects.left,
                    top: clientRects.top,
                    behavior: 'smooth',
                });
            }
        };
    }

    var Timer = (function () {
        function Timer(actions, speed) {
            if (actions === void 0) { actions = []; }
            this.timeOffset = 0;
            this.raf = null;
            this.actions = actions;
            this.speed = speed;
        }
        Timer.prototype.addAction = function (action) {
            var index = this.findActionIndex(action);
            this.actions.splice(index, 0, action);
        };
        Timer.prototype.addActions = function (actions) {
            this.actions = this.actions.concat(actions);
        };
        Timer.prototype.start = function () {
            this.timeOffset = 0;
            var lastTimestamp = performance.now();
            var actions = this.actions;
            var self = this;
            function check() {
                var time = performance.now();
                self.timeOffset += (time - lastTimestamp) * self.speed;
                lastTimestamp = time;
                while (actions.length) {
                    var action = actions[0];
                    if (self.timeOffset >= action.delay) {
                        actions.shift();
                        action.doAction();
                    }
                    else {
                        break;
                    }
                }
                if (actions.length > 0 || self.liveMode) {
                    self.raf = requestAnimationFrame(check);
                }
            }
            this.raf = requestAnimationFrame(check);
        };
        Timer.prototype.clear = function () {
            if (this.raf) {
                cancelAnimationFrame(this.raf);
                this.raf = null;
            }
            this.actions.length = 0;
        };
        Timer.prototype.setSpeed = function (speed) {
            this.speed = speed;
        };
        Timer.prototype.toggleLiveMode = function (mode) {
            this.liveMode = mode;
        };
        Timer.prototype.isActive = function () {
            return this.raf !== null;
        };
        Timer.prototype.findActionIndex = function (action) {
            var start = 0;
            var end = this.actions.length - 1;
            while (start <= end) {
                var mid = Math.floor((start + end) / 2);
                if (this.actions[mid].delay < action.delay) {
                    start = mid + 1;
                }
                else if (this.actions[mid].delay > action.delay) {
                    end = mid - 1;
                }
                else {
                    return mid + 1;
                }
            }
            return start;
        };
        return Timer;
    }());
    function addDelay(event, baselineTime) {
        if (event.type === exports.EventType.IncrementalSnapshot &&
            event.data.source === exports.IncrementalSource.MouseMove) {
            var firstOffset = event.data.positions[0].timeOffset;
            var firstTimestamp = event.timestamp + firstOffset;
            event.delay = firstTimestamp - baselineTime;
            return firstTimestamp - baselineTime;
        }
        event.delay = event.timestamp - baselineTime;
        return event.delay;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    function t(t,n){var e="function"==typeof Symbol&&t[Symbol.iterator];if(!e)return t;var r,o,i=e.call(t),a=[];try{for(;(void 0===n||n-- >0)&&!(r=i.next()).done;)a.push(r.value);}catch(t){o={error:t};}finally{try{r&&!r.done&&(e=i.return)&&e.call(i);}finally{if(o)throw o.error}}return a}var n;!function(t){t[t.NotStarted=0]="NotStarted",t[t.Running=1]="Running",t[t.Stopped=2]="Stopped";}(n||(n={}));var e={type:"xstate.init"};function r(t){return void 0===t?[]:[].concat(t)}function o(t){return {type:"xstate.assign",assignment:t}}function i(t,n){return "string"==typeof(t="string"==typeof t&&n&&n[t]?n[t]:t)?{type:t}:"function"==typeof t?{type:t.name,exec:t}:t}function a(t){return function(n){return t===n}}function u(t){return "string"==typeof t?{type:t}:t}function c(t,n){return {value:t,context:n,actions:[],changed:!1,matches:a(t)}}function f(t,n,e){var r=n,o=!1;return [t.filter((function(t){if("xstate.assign"===t.type){o=!0;var n=Object.assign({},r);return "function"==typeof t.assignment?n=t.assignment(r,e):Object.keys(t.assignment).forEach((function(o){n[o]="function"==typeof t.assignment[o]?t.assignment[o](r,e):t.assignment[o];})),r=n,!1}return !0})),r,o]}function s(n,o){void 0===o&&(o={});var s=t(f(r(n.states[n.initial].entry).map((function(t){return i(t,o.actions)})),n.context,e),2),l=s[0],v=s[1],y={config:n,_options:o,initialState:{value:n.initial,actions:l,context:v,matches:a(n.initial)},transition:function(e,o){var s,l,v="string"==typeof e?{value:e,context:n.context}:e,p=v.value,g=v.context,d=u(o),x=n.states[p];if(x.on){var m=r(x.on[d.type]);try{for(var h=function(t){var n="function"==typeof Symbol&&Symbol.iterator,e=n&&t[n],r=0;if(e)return e.call(t);if(t&&"number"==typeof t.length)return {next:function(){return t&&r>=t.length&&(t=void 0),{value:t&&t[r++],done:!t}}};throw new TypeError(n?"Object is not iterable.":"Symbol.iterator is not defined.")}(m),b=h.next();!b.done;b=h.next()){var S=b.value;if(void 0===S)return c(p,g);var w="string"==typeof S?{target:S}:S,j=w.target,E=w.actions,R=void 0===E?[]:E,N=w.cond,O=void 0===N?function(){return !0}:N,_=void 0===j,k=null!=j?j:p,T=n.states[k];if(O(g,d)){var q=t(f((_?r(R):[].concat(x.exit,R,T.entry).filter((function(t){return t}))).map((function(t){return i(t,y._options.actions)})),g,d),3),z=q[0],A=q[1],B=q[2],C=null!=j?j:p;return {value:C,context:A,actions:z,changed:j!==p||z.length>0||B,matches:a(C)}}}}catch(t){s={error:t};}finally{try{b&&!b.done&&(l=h.return)&&l.call(h);}finally{if(s)throw s.error}}}return c(p,g)}};return y}var l=function(t,n){return t.actions.forEach((function(e){var r=e.exec;return r&&r(t.context,n)}))};function v(t){var r=t.initialState,o=n.NotStarted,i=new Set,c={_machine:t,send:function(e){o===n.Running&&(r=t.transition(r,e),l(r,u(e)),i.forEach((function(t){return t(r)})));},subscribe:function(t){return i.add(t),t(r),{unsubscribe:function(){return i.delete(t)}}},start:function(i){if(i){var u="object"==typeof i?i:{context:t.config.context,value:i};r={value:u.value,actions:[],context:u.context,matches:a(u.value)};}return o=n.Running,l(r,e),c},stop:function(){return o=n.Stopped,i.clear(),c},get state(){return r},get status(){return o}};return c}

    function discardPriorSnapshots(events, baselineTime) {
        for (var idx = events.length - 1; idx >= 0; idx--) {
            var event_1 = events[idx];
            if (event_1.type === exports.EventType.Meta) {
                if (event_1.timestamp <= baselineTime) {
                    return events.slice(idx);
                }
            }
        }
        return events;
    }
    function createPlayerService(context, _a) {
        var getCastFn = _a.getCastFn, applyEventsSynchronously = _a.applyEventsSynchronously, emitter = _a.emitter;
        var playerMachine = s({
            id: 'player',
            context: context,
            initial: 'paused',
            states: {
                playing: {
                    on: {
                        PAUSE: {
                            target: 'paused',
                            actions: ['pause'],
                        },
                        CAST_EVENT: {
                            target: 'playing',
                            actions: 'castEvent',
                        },
                        END: {
                            target: 'paused',
                            actions: ['resetLastPlayedEvent', 'pause'],
                        },
                        ADD_EVENT: {
                            target: 'playing',
                            actions: ['addEvent'],
                        },
                    },
                },
                paused: {
                    on: {
                        PLAY: {
                            target: 'playing',
                            actions: ['recordTimeOffset', 'play'],
                        },
                        CAST_EVENT: {
                            target: 'paused',
                            actions: 'castEvent',
                        },
                        TO_LIVE: {
                            target: 'live',
                            actions: ['startLive'],
                        },
                        ADD_EVENT: {
                            target: 'paused',
                            actions: ['addEvent'],
                        },
                    },
                },
                live: {
                    on: {
                        ADD_EVENT: {
                            target: 'live',
                            actions: ['addEvent'],
                        },
                        CAST_EVENT: {
                            target: 'live',
                            actions: ['castEvent'],
                        },
                    },
                },
            },
        }, {
            actions: {
                castEvent: o({
                    lastPlayedEvent: function (ctx, event) {
                        if (event.type === 'CAST_EVENT') {
                            return event.payload.event;
                        }
                        return ctx.lastPlayedEvent;
                    },
                }),
                recordTimeOffset: o(function (ctx, event) {
                    var timeOffset = ctx.timeOffset;
                    if ('payload' in event && 'timeOffset' in event.payload) {
                        timeOffset = event.payload.timeOffset;
                    }
                    return __assign(__assign({}, ctx), { timeOffset: timeOffset, baselineTime: ctx.events[0].timestamp + timeOffset });
                }),
                play: function (ctx) {
                    var e_1, _a, e_2, _b;
                    var _c;
                    var timer = ctx.timer, events = ctx.events, baselineTime = ctx.baselineTime, lastPlayedEvent = ctx.lastPlayedEvent;
                    timer.clear();
                    try {
                        for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
                            var event_2 = events_1_1.value;
                            addDelay(event_2, baselineTime);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (events_1_1 && !events_1_1.done && (_a = events_1.return)) _a.call(events_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                    var neededEvents = discardPriorSnapshots(events, baselineTime);
                    var lastPlayedTimestamp = lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.timestamp;
                    if ((lastPlayedEvent === null || lastPlayedEvent === void 0 ? void 0 : lastPlayedEvent.type) === exports.EventType.IncrementalSnapshot &&
                        lastPlayedEvent.data.source === exports.IncrementalSource.MouseMove) {
                        lastPlayedTimestamp =
                            lastPlayedEvent.timestamp +
                                ((_c = lastPlayedEvent.data.positions[0]) === null || _c === void 0 ? void 0 : _c.timeOffset);
                    }
                    if (baselineTime < (lastPlayedTimestamp || 0)) {
                        emitter.emit(exports.ReplayerEvents.PlayBack);
                    }
                    var syncEvents = new Array();
                    var actions = new Array();
                    var _loop_1 = function (event_3) {
                        if (lastPlayedTimestamp &&
                            lastPlayedTimestamp < baselineTime &&
                            (event_3.timestamp <= lastPlayedTimestamp ||
                                event_3 === lastPlayedEvent)) {
                            return "continue";
                        }
                        if (event_3.timestamp < baselineTime) {
                            syncEvents.push(event_3);
                        }
                        else {
                            var castFn_1 = getCastFn(event_3, false);
                            actions.push({
                                doAction: function () {
                                    castFn_1();
                                },
                                delay: event_3.delay,
                            });
                        }
                    };
                    try {
                        for (var neededEvents_1 = __values(neededEvents), neededEvents_1_1 = neededEvents_1.next(); !neededEvents_1_1.done; neededEvents_1_1 = neededEvents_1.next()) {
                            var event_3 = neededEvents_1_1.value;
                            _loop_1(event_3);
                        }
                    }
                    catch (e_2_1) { e_2 = { error: e_2_1 }; }
                    finally {
                        try {
                            if (neededEvents_1_1 && !neededEvents_1_1.done && (_b = neededEvents_1.return)) _b.call(neededEvents_1);
                        }
                        finally { if (e_2) throw e_2.error; }
                    }
                    applyEventsSynchronously(syncEvents);
                    emitter.emit(exports.ReplayerEvents.Flush);
                    timer.addActions(actions);
                    timer.start();
                },
                pause: function (ctx) {
                    ctx.timer.clear();
                },
                resetLastPlayedEvent: o(function (ctx) {
                    return __assign(__assign({}, ctx), { lastPlayedEvent: null });
                }),
                startLive: o({
                    baselineTime: function (ctx, event) {
                        ctx.timer.toggleLiveMode(true);
                        ctx.timer.start();
                        if (event.type === 'TO_LIVE' && event.payload.baselineTime) {
                            return event.payload.baselineTime;
                        }
                        return Date.now();
                    },
                }),
                addEvent: o(function (ctx, machineEvent) {
                    var baselineTime = ctx.baselineTime, timer = ctx.timer, events = ctx.events;
                    if (machineEvent.type === 'ADD_EVENT') {
                        var event_4 = machineEvent.payload.event;
                        addDelay(event_4, baselineTime);
                        var end = events.length - 1;
                        if (!events[end] || events[end].timestamp <= event_4.timestamp) {
                            events.push(event_4);
                        }
                        else {
                            var insertionIndex = -1;
                            var start = 0;
                            while (start <= end) {
                                var mid = Math.floor((start + end) / 2);
                                if (events[mid].timestamp <= event_4.timestamp) {
                                    start = mid + 1;
                                }
                                else {
                                    end = mid - 1;
                                }
                            }
                            if (insertionIndex === -1) {
                                insertionIndex = start;
                            }
                            events.splice(insertionIndex, 0, event_4);
                        }
                        var isSync = event_4.timestamp < baselineTime;
                        var castFn_2 = getCastFn(event_4, isSync);
                        if (isSync) {
                            castFn_2();
                        }
                        else if (timer.isActive()) {
                            timer.addAction({
                                doAction: function () {
                                    castFn_2();
                                },
                                delay: event_4.delay,
                            });
                        }
                    }
                    return __assign(__assign({}, ctx), { events: events });
                }),
            },
        });
        return v(playerMachine);
    }
    function createSpeedService(context) {
        var speedMachine = s({
            id: 'speed',
            context: context,
            initial: 'normal',
            states: {
                normal: {
                    on: {
                        FAST_FORWARD: {
                            target: 'skipping',
                            actions: ['recordSpeed', 'setSpeed'],
                        },
                        SET_SPEED: {
                            target: 'normal',
                            actions: ['setSpeed'],
                        },
                    },
                },
                skipping: {
                    on: {
                        BACK_TO_NORMAL: {
                            target: 'normal',
                            actions: ['restoreSpeed'],
                        },
                        SET_SPEED: {
                            target: 'normal',
                            actions: ['setSpeed'],
                        },
                    },
                },
            },
        }, {
            actions: {
                setSpeed: function (ctx, event) {
                    if ('payload' in event) {
                        ctx.timer.setSpeed(event.payload.speed);
                    }
                },
                recordSpeed: o({
                    normalSpeed: function (ctx) { return ctx.timer.speed; },
                }),
                restoreSpeed: function (ctx) {
                    ctx.timer.setSpeed(ctx.normalSpeed);
                },
            },
        });
        return v(speedMachine);
    }

    var rules = function (blockClass) { return [
        ".".concat(blockClass, " { background: currentColor }"),
        'noscript { display: none !important; }',
    ]; };

    var StyleRuleType;
    (function (StyleRuleType) {
        StyleRuleType[StyleRuleType["Insert"] = 0] = "Insert";
        StyleRuleType[StyleRuleType["Remove"] = 1] = "Remove";
        StyleRuleType[StyleRuleType["Snapshot"] = 2] = "Snapshot";
        StyleRuleType[StyleRuleType["SetProperty"] = 3] = "SetProperty";
        StyleRuleType[StyleRuleType["RemoveProperty"] = 4] = "RemoveProperty";
    })(StyleRuleType || (StyleRuleType = {}));
    function getNestedRule(rules, position) {
        var rule = rules[position[0]];
        if (position.length === 1) {
            return rule;
        }
        else {
            return getNestedRule(rule.cssRules[position[1]]
                .cssRules, position.slice(2));
        }
    }
    function getPositionsAndIndex(nestedIndex) {
        var positions = __spreadArray([], __read(nestedIndex), false);
        var index = positions.pop();
        return { positions: positions, index: index };
    }
    function applyVirtualStyleRulesToNode(storedRules, styleNode) {
        var sheet = styleNode.sheet;
        if (!sheet) {
            return;
        }
        storedRules.forEach(function (rule) {
            if (rule.type === StyleRuleType.Insert) {
                try {
                    if (Array.isArray(rule.index)) {
                        var _a = getPositionsAndIndex(rule.index), positions = _a.positions, index = _a.index;
                        var nestedRule = getNestedRule(sheet.cssRules, positions);
                        nestedRule.insertRule(rule.cssText, index);
                    }
                    else {
                        sheet.insertRule(rule.cssText, rule.index);
                    }
                }
                catch (e) {
                }
            }
            else if (rule.type === StyleRuleType.Remove) {
                try {
                    if (Array.isArray(rule.index)) {
                        var _b = getPositionsAndIndex(rule.index), positions = _b.positions, index = _b.index;
                        var nestedRule = getNestedRule(sheet.cssRules, positions);
                        nestedRule.deleteRule(index || 0);
                    }
                    else {
                        sheet.deleteRule(rule.index);
                    }
                }
                catch (e) {
                }
            }
            else if (rule.type === StyleRuleType.Snapshot) {
                restoreSnapshotOfStyleRulesToNode(rule.cssTexts, styleNode);
            }
            else if (rule.type === StyleRuleType.SetProperty) {
                var nativeRule = getNestedRule(sheet.cssRules, rule.index);
                nativeRule.style.setProperty(rule.property, rule.value, rule.priority);
            }
            else if (rule.type === StyleRuleType.RemoveProperty) {
                var nativeRule = getNestedRule(sheet.cssRules, rule.index);
                nativeRule.style.removeProperty(rule.property);
            }
        });
    }
    function restoreSnapshotOfStyleRulesToNode(cssTexts, styleNode) {
        var _a;
        try {
            var existingRules = Array.from(((_a = styleNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) || []).map(function (rule) { return rule.cssText; });
            var existingRulesReversed = Object.entries(existingRules).reverse();
            var lastMatch_1 = existingRules.length;
            existingRulesReversed.forEach(function (_a) {
                var _b;
                var _c = __read(_a, 2), index = _c[0], rule = _c[1];
                var indexOf = cssTexts.indexOf(rule);
                if (indexOf === -1 || indexOf > lastMatch_1) {
                    try {
                        (_b = styleNode.sheet) === null || _b === void 0 ? void 0 : _b.deleteRule(Number(index));
                    }
                    catch (e) {
                    }
                }
                lastMatch_1 = indexOf;
            });
            cssTexts.forEach(function (cssText, index) {
                var _a, _b, _c;
                try {
                    if (((_b = (_a = styleNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules[index]) === null || _b === void 0 ? void 0 : _b.cssText) !== cssText) {
                        (_c = styleNode.sheet) === null || _c === void 0 ? void 0 : _c.insertRule(cssText, index);
                    }
                }
                catch (e) {
                }
            });
        }
        catch (e) {
        }
    }
    function storeCSSRules(parentElement, virtualStyleRulesMap) {
        var _a;
        try {
            var cssTexts = Array.from(((_a = parentElement.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) || []).map(function (rule) { return rule.cssText; });
            virtualStyleRulesMap.set(parentElement, [
                {
                    type: StyleRuleType.Snapshot,
                    cssTexts: cssTexts,
                },
            ]);
        }
        catch (e) {
        }
    }

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

    function canvasMutation$1(_a) {
        var event = _a.event, mutation = _a.mutation, target = _a.target, imageMap = _a.imageMap, errorHandler = _a.errorHandler;
        try {
            var ctx = target.getContext('2d');
            if (mutation.setter) {
                ctx[mutation.property] = mutation.args[0];
                return;
            }
            var original = ctx[mutation.property];
            if (mutation.property === 'drawImage' &&
                typeof mutation.args[0] === 'string') {
                var image = imageMap.get(event);
                mutation.args[0] = image;
                original.apply(ctx, mutation.args);
            }
            else {
                original.apply(ctx, mutation.args);
            }
        }
        catch (error) {
            errorHandler(mutation, error);
        }
    }

    function canvasMutation(_a) {
        var event = _a.event, mutation = _a.mutation, target = _a.target, imageMap = _a.imageMap, errorHandler = _a.errorHandler;
        try {
            var mutations = 'commands' in mutation ? mutation.commands : [mutation];
            if ([CanvasContext.WebGL, CanvasContext.WebGL2].includes(mutation.type)) {
                return mutations.forEach(function (command) {
                    webglMutation({
                        mutation: command,
                        type: mutation.type,
                        target: target,
                        imageMap: imageMap,
                        errorHandler: errorHandler,
                    });
                });
            }
            return mutations.forEach(function (command) {
                canvasMutation$1({
                    event: event,
                    mutation: command,
                    target: target,
                    imageMap: imageMap,
                    errorHandler: errorHandler,
                });
            });
        }
        catch (error) {
            errorHandler(mutation, error);
        }
    }

    var SKIP_TIME_THRESHOLD = 10 * 1000;
    var SKIP_TIME_INTERVAL = 5 * 1000;
    var mitt = mitt$1 || mittProxy;
    var REPLAY_CONSOLE_PREFIX = '[replayer]';
    var defaultMouseTailConfig = {
        duration: 500,
        lineCap: 'round',
        lineWidth: 3,
        strokeStyle: 'red',
    };
    function indicatesTouchDevice(e) {
        return (e.type == exports.EventType.IncrementalSnapshot &&
            (e.data.source == exports.IncrementalSource.TouchMove ||
                (e.data.source == exports.IncrementalSource.MouseInteraction &&
                    e.data.type == exports.MouseInteractions.TouchStart)));
    }
    var Replayer = (function () {
        function Replayer(events, config) {
            var _this = this;
            this.mouseTail = null;
            this.tailPositions = [];
            this.emitter = mitt();
            this.legacy_missingNodeRetryMap = {};
            this.cache = createCache();
            this.imageMap = new Map();
            this.mirror = createMirror();
            this.firstFullSnapshot = null;
            this.newDocumentQueue = [];
            this.mousePos = null;
            this.touchActive = null;
            if (!(config === null || config === void 0 ? void 0 : config.liveMode) && events.length < 2) {
                throw new Error('Replayer need at least 2 events.');
            }
            var defaultConfig = {
                speed: 1,
                maxSpeed: 360,
                root: document.body,
                loadTimeout: 0,
                skipInactive: false,
                showWarning: true,
                showDebug: false,
                blockClass: 'rr-block',
                liveMode: false,
                insertStyleRules: [],
                triggerFocus: true,
                UNSAFE_replayCanvas: false,
                pauseAnimation: true,
                mouseTail: defaultMouseTailConfig,
            };
            this.config = Object.assign({}, defaultConfig, config);
            this.handleResize = this.handleResize.bind(this);
            this.getCastFn = this.getCastFn.bind(this);
            this.applyEventsSynchronously = this.applyEventsSynchronously.bind(this);
            this.emitter.on(exports.ReplayerEvents.Resize, this.handleResize);
            this.setupDom();
            this.treeIndex = new TreeIndex();
            this.fragmentParentMap = new Map();
            this.elementStateMap = new Map();
            this.virtualStyleRulesMap = new Map();
            this.emitter.on(exports.ReplayerEvents.Flush, function () {
                var e_1, _a, e_2, _b, e_3, _c, e_4, _d;
                var _e = _this.treeIndex.flush(), scrollMap = _e.scrollMap, inputMap = _e.inputMap, mutationData = _e.mutationData;
                _this.fragmentParentMap.forEach(function (parent, frag) {
                    return _this.restoreRealParent(frag, parent);
                });
                try {
                    for (var _f = __values(mutationData.texts), _g = _f.next(); !_g.done; _g = _f.next()) {
                        var d = _g.value;
                        _this.applyText(d, mutationData);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_g && !_g.done && (_a = _f.return)) _a.call(_f);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                try {
                    for (var _h = __values(_this.virtualStyleRulesMap.keys()), _j = _h.next(); !_j.done; _j = _h.next()) {
                        var node = _j.value;
                        _this.restoreNodeSheet(node);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_j && !_j.done && (_b = _h.return)) _b.call(_h);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
                _this.fragmentParentMap.clear();
                _this.elementStateMap.clear();
                _this.virtualStyleRulesMap.clear();
                try {
                    for (var _k = __values(scrollMap.values()), _l = _k.next(); !_l.done; _l = _k.next()) {
                        var d = _l.value;
                        _this.applyScroll(d, true);
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (_l && !_l.done && (_c = _k.return)) _c.call(_k);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                try {
                    for (var _m = __values(inputMap.values()), _o = _m.next(); !_o.done; _o = _m.next()) {
                        var d = _o.value;
                        _this.applyInput(d);
                    }
                }
                catch (e_4_1) { e_4 = { error: e_4_1 }; }
                finally {
                    try {
                        if (_o && !_o.done && (_d = _m.return)) _d.call(_m);
                    }
                    finally { if (e_4) throw e_4.error; }
                }
            });
            this.emitter.on(exports.ReplayerEvents.PlayBack, function () {
                _this.firstFullSnapshot = null;
                _this.mirror.reset();
            });
            var timer = new Timer([], (config === null || config === void 0 ? void 0 : config.speed) || defaultConfig.speed);
            this.service = createPlayerService({
                events: events
                    .map(function (e) {
                    if (config && config.unpackFn) {
                        return config.unpackFn(e);
                    }
                    return e;
                })
                    .sort(function (a1, a2) { return a1.timestamp - a2.timestamp; }),
                timer: timer,
                timeOffset: 0,
                baselineTime: 0,
                lastPlayedEvent: null,
            }, {
                getCastFn: this.getCastFn,
                applyEventsSynchronously: this.applyEventsSynchronously,
                emitter: this.emitter,
            });
            this.service.start();
            this.service.subscribe(function (state) {
                _this.emitter.emit(exports.ReplayerEvents.StateChange, {
                    player: state,
                });
            });
            this.speedService = createSpeedService({
                normalSpeed: -1,
                timer: timer,
            });
            this.speedService.start();
            this.speedService.subscribe(function (state) {
                _this.emitter.emit(exports.ReplayerEvents.StateChange, {
                    speed: state,
                });
            });
            var firstMeta = this.service.state.context.events.find(function (e) { return e.type === exports.EventType.Meta; });
            var firstFullsnapshot = this.service.state.context.events.find(function (e) { return e.type === exports.EventType.FullSnapshot; });
            if (firstMeta) {
                var _a = firstMeta.data, width_1 = _a.width, height_1 = _a.height;
                setTimeout(function () {
                    _this.emitter.emit(exports.ReplayerEvents.Resize, {
                        width: width_1,
                        height: height_1,
                    });
                }, 0);
            }
            if (firstFullsnapshot) {
                setTimeout(function () {
                    if (_this.firstFullSnapshot) {
                        return;
                    }
                    _this.firstFullSnapshot = firstFullsnapshot;
                    _this.rebuildFullSnapshot(firstFullsnapshot);
                    _this.iframe.contentWindow.scrollTo(firstFullsnapshot.data.initialOffset);
                }, 1);
            }
            if (this.service.state.context.events.find(indicatesTouchDevice)) {
                this.mouse.classList.add('touch-device');
            }
        }
        Object.defineProperty(Replayer.prototype, "timer", {
            get: function () {
                return this.service.state.context.timer;
            },
            enumerable: false,
            configurable: true
        });
        Replayer.prototype.on = function (event, handler) {
            this.emitter.on(event, handler);
            return this;
        };
        Replayer.prototype.off = function (event, handler) {
            this.emitter.off(event, handler);
            return this;
        };
        Replayer.prototype.setConfig = function (config) {
            var _this = this;
            Object.keys(config).forEach(function (key) {
                _this.config[key] = config[key];
            });
            if (!this.config.skipInactive) {
                this.backToNormal();
            }
            if (typeof config.speed !== 'undefined') {
                this.speedService.send({
                    type: 'SET_SPEED',
                    payload: {
                        speed: config.speed,
                    },
                });
            }
            if (typeof config.mouseTail !== 'undefined') {
                if (config.mouseTail === false) {
                    if (this.mouseTail) {
                        this.mouseTail.style.display = 'none';
                    }
                }
                else {
                    if (!this.mouseTail) {
                        this.mouseTail = document.createElement('canvas');
                        this.mouseTail.width = Number.parseFloat(this.iframe.width);
                        this.mouseTail.height = Number.parseFloat(this.iframe.height);
                        this.mouseTail.classList.add('replayer-mouse-tail');
                        this.wrapper.insertBefore(this.mouseTail, this.iframe);
                    }
                    this.mouseTail.style.display = 'inherit';
                }
            }
        };
        Replayer.prototype.getMetaData = function () {
            var firstEvent = this.service.state.context.events[0];
            var lastEvent = this.service.state.context.events[this.service.state.context.events.length - 1];
            return {
                startTime: firstEvent.timestamp,
                endTime: lastEvent.timestamp,
                totalTime: lastEvent.timestamp - firstEvent.timestamp,
            };
        };
        Replayer.prototype.getCurrentTime = function () {
            return this.timer.timeOffset + this.getTimeOffset();
        };
        Replayer.prototype.getTimeOffset = function () {
            var _a = this.service.state.context, baselineTime = _a.baselineTime, events = _a.events;
            return baselineTime - events[0].timestamp;
        };
        Replayer.prototype.getMirror = function () {
            return this.mirror;
        };
        Replayer.prototype.play = function (timeOffset) {
            var _a;
            if (timeOffset === void 0) { timeOffset = 0; }
            if (this.service.state.matches('paused')) {
                this.service.send({ type: 'PLAY', payload: { timeOffset: timeOffset } });
            }
            else {
                this.service.send({ type: 'PAUSE' });
                this.service.send({ type: 'PLAY', payload: { timeOffset: timeOffset } });
            }
            (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('html')[0].classList.remove('rrweb-paused');
            this.emitter.emit(exports.ReplayerEvents.Start);
        };
        Replayer.prototype.pause = function (timeOffset) {
            var _a;
            if (timeOffset === undefined && this.service.state.matches('playing')) {
                this.service.send({ type: 'PAUSE' });
            }
            if (typeof timeOffset === 'number') {
                this.play(timeOffset);
                this.service.send({ type: 'PAUSE' });
            }
            (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.getElementsByTagName('html')[0].classList.add('rrweb-paused');
            this.emitter.emit(exports.ReplayerEvents.Pause);
        };
        Replayer.prototype.resume = function (timeOffset) {
            if (timeOffset === void 0) { timeOffset = 0; }
            console.warn("The 'resume' will be departed in 1.0. Please use 'play' method which has the same interface.");
            this.play(timeOffset);
            this.emitter.emit(exports.ReplayerEvents.Resume);
        };
        Replayer.prototype.startLive = function (baselineTime) {
            this.service.send({ type: 'TO_LIVE', payload: { baselineTime: baselineTime } });
        };
        Replayer.prototype.addEvent = function (rawEvent) {
            var _this = this;
            var event = this.config.unpackFn
                ? this.config.unpackFn(rawEvent)
                : rawEvent;
            if (indicatesTouchDevice(event)) {
                this.mouse.classList.add('touch-device');
            }
            Promise.resolve().then(function () {
                return _this.service.send({ type: 'ADD_EVENT', payload: { event: event } });
            });
        };
        Replayer.prototype.enableInteract = function () {
            this.iframe.setAttribute('scrolling', 'auto');
            this.iframe.style.pointerEvents = 'auto';
        };
        Replayer.prototype.disableInteract = function () {
            this.iframe.setAttribute('scrolling', 'no');
            this.iframe.style.pointerEvents = 'none';
        };
        Replayer.prototype.resetCache = function () {
            this.cache = createCache();
        };
        Replayer.prototype.setupDom = function () {
            this.wrapper = document.createElement('div');
            this.wrapper.classList.add('replayer-wrapper');
            this.config.root.appendChild(this.wrapper);
            this.mouse = document.createElement('div');
            this.mouse.classList.add('replayer-mouse');
            this.wrapper.appendChild(this.mouse);
            if (this.config.mouseTail !== false) {
                this.mouseTail = document.createElement('canvas');
                this.mouseTail.classList.add('replayer-mouse-tail');
                this.mouseTail.style.display = 'inherit';
                this.wrapper.appendChild(this.mouseTail);
            }
            this.iframe = document.createElement('iframe');
            var attributes = ['allow-same-origin'];
            if (this.config.UNSAFE_replayCanvas) {
                attributes.push('allow-scripts');
            }
            this.iframe.style.display = 'none';
            this.iframe.setAttribute('sandbox', attributes.join(' '));
            this.disableInteract();
            this.wrapper.appendChild(this.iframe);
            if (this.iframe.contentWindow && this.iframe.contentDocument) {
                polyfill(this.iframe.contentWindow, this.iframe.contentDocument);
                polyfill$1(this.iframe.contentWindow);
            }
        };
        Replayer.prototype.handleResize = function (dimension) {
            var e_5, _a;
            this.iframe.style.display = 'inherit';
            try {
                for (var _b = __values([this.mouseTail, this.iframe]), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var el = _c.value;
                    if (!el) {
                        continue;
                    }
                    el.setAttribute('width', String(dimension.width));
                    el.setAttribute('height', String(dimension.height));
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
            }
        };
        Replayer.prototype.applyEventsSynchronously = function (events) {
            var e_6, _a;
            try {
                for (var events_1 = __values(events), events_1_1 = events_1.next(); !events_1_1.done; events_1_1 = events_1.next()) {
                    var event_1 = events_1_1.value;
                    switch (event_1.type) {
                        case exports.EventType.DomContentLoaded:
                        case exports.EventType.Load:
                        case exports.EventType.Custom:
                            continue;
                        case exports.EventType.FullSnapshot:
                        case exports.EventType.Meta:
                        case exports.EventType.Plugin:
                            break;
                        case exports.EventType.IncrementalSnapshot:
                            switch (event_1.data.source) {
                                case exports.IncrementalSource.MediaInteraction:
                                    continue;
                                default:
                                    break;
                            }
                            break;
                        default:
                            break;
                    }
                    var castFn = this.getCastFn(event_1, true);
                    castFn();
                }
            }
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (events_1_1 && !events_1_1.done && (_a = events_1.return)) _a.call(events_1);
                }
                finally { if (e_6) throw e_6.error; }
            }
            if (this.mousePos) {
                this.moveAndHover(this.mousePos.x, this.mousePos.y, this.mousePos.id, true, this.mousePos.debugData);
            }
            this.mousePos = null;
            if (this.touchActive === true) {
                this.mouse.classList.add('touch-active');
            }
            else if (this.touchActive === false) {
                this.mouse.classList.remove('touch-active');
            }
            this.touchActive = null;
        };
        Replayer.prototype.getCastFn = function (event, isSync) {
            var _this = this;
            if (isSync === void 0) { isSync = false; }
            var castFn;
            switch (event.type) {
                case exports.EventType.DomContentLoaded:
                case exports.EventType.Load:
                    break;
                case exports.EventType.Custom:
                    castFn = function () {
                        _this.emitter.emit(exports.ReplayerEvents.CustomEvent, event);
                    };
                    break;
                case exports.EventType.Meta:
                    castFn = function () {
                        return _this.emitter.emit(exports.ReplayerEvents.Resize, {
                            width: event.data.width,
                            height: event.data.height,
                        });
                    };
                    break;
                case exports.EventType.FullSnapshot:
                    castFn = function () {
                        if (_this.firstFullSnapshot) {
                            if (_this.firstFullSnapshot === event) {
                                _this.firstFullSnapshot = true;
                                return;
                            }
                        }
                        else {
                            _this.firstFullSnapshot = true;
                        }
                        _this.rebuildFullSnapshot(event, isSync);
                        _this.iframe.contentWindow.scrollTo(event.data.initialOffset);
                    };
                    break;
                case exports.EventType.IncrementalSnapshot:
                    castFn = function () {
                        var e_7, _a;
                        _this.applyIncremental(event, isSync);
                        if (isSync) {
                            return;
                        }
                        if (event === _this.nextUserInteractionEvent) {
                            _this.nextUserInteractionEvent = null;
                            _this.backToNormal();
                        }
                        if (_this.config.skipInactive && !_this.nextUserInteractionEvent) {
                            try {
                                for (var _b = __values(_this.service.state.context.events), _c = _b.next(); !_c.done; _c = _b.next()) {
                                    var _event = _c.value;
                                    if (_event.timestamp <= event.timestamp) {
                                        continue;
                                    }
                                    if (_this.isUserInteraction(_event)) {
                                        if (_event.delay - event.delay >
                                            SKIP_TIME_THRESHOLD *
                                                _this.speedService.state.context.timer.speed) {
                                            _this.nextUserInteractionEvent = _event;
                                        }
                                        break;
                                    }
                                }
                            }
                            catch (e_7_1) { e_7 = { error: e_7_1 }; }
                            finally {
                                try {
                                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                                }
                                finally { if (e_7) throw e_7.error; }
                            }
                            if (_this.nextUserInteractionEvent) {
                                var skipTime = _this.nextUserInteractionEvent.delay - event.delay;
                                var payload = {
                                    speed: Math.min(Math.round(skipTime / SKIP_TIME_INTERVAL), _this.config.maxSpeed),
                                };
                                _this.speedService.send({ type: 'FAST_FORWARD', payload: payload });
                                _this.emitter.emit(exports.ReplayerEvents.SkipStart, payload);
                            }
                        }
                    };
                    break;
            }
            var wrappedCastFn = function () {
                var e_8, _a;
                if (castFn) {
                    castFn();
                }
                try {
                    for (var _b = __values(_this.config.plugins || []), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var plugin = _c.value;
                        plugin.handler(event, isSync, { replayer: _this });
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
                _this.service.send({ type: 'CAST_EVENT', payload: { event: event } });
                var last_index = _this.service.state.context.events.length - 1;
                if (event === _this.service.state.context.events[last_index]) {
                    var finish_1 = function () {
                        if (last_index < _this.service.state.context.events.length - 1) {
                            return;
                        }
                        _this.backToNormal();
                        _this.service.send('END');
                        _this.emitter.emit(exports.ReplayerEvents.Finish);
                    };
                    if (event.type === exports.EventType.IncrementalSnapshot &&
                        event.data.source === exports.IncrementalSource.MouseMove &&
                        event.data.positions.length) {
                        setTimeout(function () {
                            finish_1();
                        }, Math.max(0, -event.data.positions[0].timeOffset + 50));
                    }
                    else {
                        finish_1();
                    }
                }
                _this.emitter.emit(exports.ReplayerEvents.EventCast, event);
            };
            return wrappedCastFn;
        };
        Replayer.prototype.rebuildFullSnapshot = function (event, isSync) {
            var e_9, _a;
            var _this = this;
            if (isSync === void 0) { isSync = false; }
            if (!this.iframe.contentDocument) {
                return console.warn('Looks like your replayer has been destroyed.');
            }
            if (Object.keys(this.legacy_missingNodeRetryMap).length) {
                console.warn('Found unresolved missing node map', this.legacy_missingNodeRetryMap);
            }
            this.legacy_missingNodeRetryMap = {};
            var collected = [];
            this.mirror.map = rebuild(event.data.node, {
                doc: this.iframe.contentDocument,
                afterAppend: function (builtNode) {
                    _this.collectIframeAndAttachDocument(collected, builtNode);
                },
                cache: this.cache,
            })[1];
            var _loop_1 = function (mutationInQueue, builtNode) {
                this_1.attachDocumentToIframe(mutationInQueue, builtNode);
                this_1.newDocumentQueue = this_1.newDocumentQueue.filter(function (m) { return m !== mutationInQueue; });
            };
            var this_1 = this;
            try {
                for (var collected_1 = __values(collected), collected_1_1 = collected_1.next(); !collected_1_1.done; collected_1_1 = collected_1.next()) {
                    var _b = collected_1_1.value, mutationInQueue = _b.mutationInQueue, builtNode = _b.builtNode;
                    _loop_1(mutationInQueue, builtNode);
                }
            }
            catch (e_9_1) { e_9 = { error: e_9_1 }; }
            finally {
                try {
                    if (collected_1_1 && !collected_1_1.done && (_a = collected_1.return)) _a.call(collected_1);
                }
                finally { if (e_9) throw e_9.error; }
            }
            var _c = this.iframe.contentDocument, documentElement = _c.documentElement, head = _c.head;
            this.insertStyleRules(documentElement, head);
            if (!this.service.state.matches('playing')) {
                this.iframe.contentDocument
                    .getElementsByTagName('html')[0]
                    .classList.add('rrweb-paused');
            }
            this.emitter.emit(exports.ReplayerEvents.FullsnapshotRebuilded, event);
            if (!isSync) {
                this.waitForStylesheetLoad();
            }
            if (this.config.UNSAFE_replayCanvas) {
                this.preloadAllImages();
            }
        };
        Replayer.prototype.insertStyleRules = function (documentElement, head) {
            var styleEl = document.createElement('style');
            documentElement.insertBefore(styleEl, head);
            var injectStylesRules = rules(this.config.blockClass).concat(this.config.insertStyleRules);
            if (this.config.pauseAnimation) {
                injectStylesRules.push('html.rrweb-paused *, html.rrweb-paused *:before, html.rrweb-paused *:after { animation-play-state: paused !important; }');
            }
            for (var idx = 0; idx < injectStylesRules.length; idx++) {
                styleEl.sheet.insertRule(injectStylesRules[idx], idx);
            }
        };
        Replayer.prototype.attachDocumentToIframe = function (mutation, iframeEl) {
            var e_10, _a;
            var _this = this;
            var collected = [];
            if (!iframeEl.contentDocument) {
                var parent_1 = iframeEl.parentNode;
                while (parent_1) {
                    if (this.fragmentParentMap.has(parent_1)) {
                        var frag = parent_1;
                        var realParent = this.fragmentParentMap.get(frag);
                        this.restoreRealParent(frag, realParent);
                        break;
                    }
                    parent_1 = parent_1.parentNode;
                }
            }
            buildNodeWithSN(mutation.node, {
                doc: iframeEl.contentDocument,
                map: this.mirror.map,
                hackCss: true,
                skipChild: false,
                afterAppend: function (builtNode) {
                    _this.collectIframeAndAttachDocument(collected, builtNode);
                    if (builtNode.__sn.type === NodeType.Element &&
                        builtNode.__sn.tagName.toUpperCase() === 'HTML') {
                        var _a = iframeEl.contentDocument, documentElement = _a.documentElement, head = _a.head;
                        _this.insertStyleRules(documentElement, head);
                    }
                },
                cache: this.cache,
            });
            var _loop_2 = function (mutationInQueue, builtNode) {
                this_2.attachDocumentToIframe(mutationInQueue, builtNode);
                this_2.newDocumentQueue = this_2.newDocumentQueue.filter(function (m) { return m !== mutationInQueue; });
            };
            var this_2 = this;
            try {
                for (var collected_2 = __values(collected), collected_2_1 = collected_2.next(); !collected_2_1.done; collected_2_1 = collected_2.next()) {
                    var _b = collected_2_1.value, mutationInQueue = _b.mutationInQueue, builtNode = _b.builtNode;
                    _loop_2(mutationInQueue, builtNode);
                }
            }
            catch (e_10_1) { e_10 = { error: e_10_1 }; }
            finally {
                try {
                    if (collected_2_1 && !collected_2_1.done && (_a = collected_2.return)) _a.call(collected_2);
                }
                finally { if (e_10) throw e_10.error; }
            }
        };
        Replayer.prototype.collectIframeAndAttachDocument = function (collected, builtNode) {
            if (isIframeINode(builtNode)) {
                var mutationInQueue = this.newDocumentQueue.find(function (m) { return m.parentId === builtNode.__sn.id; });
                if (mutationInQueue) {
                    collected.push({ mutationInQueue: mutationInQueue, builtNode: builtNode });
                }
            }
        };
        Replayer.prototype.waitForStylesheetLoad = function () {
            var _this = this;
            var _a;
            var head = (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.head;
            if (head) {
                var unloadSheets_1 = new Set();
                var timer_1;
                var beforeLoadState_1 = this.service.state;
                var stateHandler_1 = function () {
                    beforeLoadState_1 = _this.service.state;
                };
                this.emitter.on(exports.ReplayerEvents.Start, stateHandler_1);
                this.emitter.on(exports.ReplayerEvents.Pause, stateHandler_1);
                var unsubscribe_1 = function () {
                    _this.emitter.off(exports.ReplayerEvents.Start, stateHandler_1);
                    _this.emitter.off(exports.ReplayerEvents.Pause, stateHandler_1);
                };
                head
                    .querySelectorAll('link[rel="stylesheet"]')
                    .forEach(function (css) {
                    if (!css.sheet) {
                        unloadSheets_1.add(css);
                        css.addEventListener('load', function () {
                            unloadSheets_1.delete(css);
                            if (unloadSheets_1.size === 0 && timer_1 !== -1) {
                                if (beforeLoadState_1.matches('playing')) {
                                    _this.play(_this.getCurrentTime());
                                }
                                _this.emitter.emit(exports.ReplayerEvents.LoadStylesheetEnd);
                                if (timer_1) {
                                    clearTimeout(timer_1);
                                }
                                unsubscribe_1();
                            }
                        });
                    }
                });
                if (unloadSheets_1.size > 0) {
                    this.service.send({ type: 'PAUSE' });
                    this.emitter.emit(exports.ReplayerEvents.LoadStylesheetStart);
                    timer_1 = setTimeout(function () {
                        if (beforeLoadState_1.matches('playing')) {
                            _this.play(_this.getCurrentTime());
                        }
                        timer_1 = -1;
                        unsubscribe_1();
                    }, this.config.loadTimeout);
                }
            }
        };
        Replayer.prototype.hasImageArg = function (args) {
            var e_11, _a;
            try {
                for (var args_1 = __values(args), args_1_1 = args_1.next(); !args_1_1.done; args_1_1 = args_1.next()) {
                    var arg = args_1_1.value;
                    if (!arg || typeof arg !== 'object') {
                    }
                    else if ('rr_type' in arg && 'args' in arg) {
                        if (this.hasImageArg(arg.args))
                            return true;
                    }
                    else if ('rr_type' in arg && arg.rr_type === 'HTMLImageElement') {
                        return true;
                    }
                    else if (arg instanceof Array) {
                        if (this.hasImageArg(arg))
                            return true;
                    }
                }
            }
            catch (e_11_1) { e_11 = { error: e_11_1 }; }
            finally {
                try {
                    if (args_1_1 && !args_1_1.done && (_a = args_1.return)) _a.call(args_1);
                }
                finally { if (e_11) throw e_11.error; }
            }
            return false;
        };
        Replayer.prototype.getImageArgs = function (args) {
            var e_12, _a;
            var images = [];
            try {
                for (var args_2 = __values(args), args_2_1 = args_2.next(); !args_2_1.done; args_2_1 = args_2.next()) {
                    var arg = args_2_1.value;
                    if (!arg || typeof arg !== 'object') {
                    }
                    else if ('rr_type' in arg && 'args' in arg) {
                        images.push.apply(images, __spreadArray([], __read(this.getImageArgs(arg.args)), false));
                    }
                    else if ('rr_type' in arg && arg.rr_type === 'HTMLImageElement') {
                        images.push(arg.src);
                    }
                    else if (arg instanceof Array) {
                        images.push.apply(images, __spreadArray([], __read(this.getImageArgs(arg)), false));
                    }
                }
            }
            catch (e_12_1) { e_12 = { error: e_12_1 }; }
            finally {
                try {
                    if (args_2_1 && !args_2_1.done && (_a = args_2.return)) _a.call(args_2);
                }
                finally { if (e_12) throw e_12.error; }
            }
            return images;
        };
        Replayer.prototype.preloadAllImages = function () {
            var e_13, _a;
            var _this = this;
            this.service.state;
            var stateHandler = function () {
                _this.service.state;
            };
            this.emitter.on(exports.ReplayerEvents.Start, stateHandler);
            this.emitter.on(exports.ReplayerEvents.Pause, stateHandler);
            var _loop_3 = function (event_2) {
                if (event_2.type === exports.EventType.IncrementalSnapshot &&
                    event_2.data.source === exports.IncrementalSource.CanvasMutation)
                    if ('commands' in event_2.data) {
                        event_2.data.commands.forEach(function (c) { return _this.preloadImages(c, event_2); });
                    }
                    else {
                        this_3.preloadImages(event_2.data, event_2);
                    }
            };
            var this_3 = this;
            try {
                for (var _b = __values(this.service.state.context.events), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var event_2 = _c.value;
                    _loop_3(event_2);
                }
            }
            catch (e_13_1) { e_13 = { error: e_13_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_13) throw e_13.error; }
            }
        };
        Replayer.prototype.preloadImages = function (data, event) {
            var _this = this;
            if (data.property === 'drawImage' &&
                typeof data.args[0] === 'string' &&
                !this.imageMap.has(event)) {
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                var imgd = ctx === null || ctx === void 0 ? void 0 : ctx.createImageData(canvas.width, canvas.height);
                imgd === null || imgd === void 0 ? void 0 : imgd.data;
                JSON.parse(data.args[0]);
                ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(imgd, 0, 0);
            }
            else if (this.hasImageArg(data.args)) {
                this.getImageArgs(data.args).forEach(function (url) {
                    var image = new Image();
                    image.src = url;
                    _this.imageMap.set(url, image);
                });
            }
        };
        Replayer.prototype.applyIncremental = function (e, isSync) {
            var _this = this;
            var _a, _b;
            var d = e.data;
            switch (d.source) {
                case exports.IncrementalSource.Mutation: {
                    if (isSync) {
                        d.adds.forEach(function (m) { return _this.treeIndex.add(m); });
                        d.texts.forEach(function (m) {
                            var target = _this.mirror.getNode(m.id);
                            var parent = target === null || target === void 0 ? void 0 : target.parentNode;
                            if (parent && _this.virtualStyleRulesMap.has(parent))
                                _this.virtualStyleRulesMap.delete(parent);
                            _this.treeIndex.text(m);
                        });
                        d.attributes.forEach(function (m) { return _this.treeIndex.attribute(m); });
                        d.removes.forEach(function (m) { return _this.treeIndex.remove(m, _this.mirror); });
                    }
                    try {
                        this.applyMutation(d, isSync);
                    }
                    catch (error) {
                        this.warn("Exception in mutation ".concat(error.message || error), d);
                    }
                    break;
                }
                case exports.IncrementalSource.Drag:
                case exports.IncrementalSource.TouchMove:
                case exports.IncrementalSource.MouseMove:
                    if (isSync) {
                        var lastPosition = d.positions[d.positions.length - 1];
                        this.mousePos = {
                            x: lastPosition.x,
                            y: lastPosition.y,
                            id: lastPosition.id,
                            debugData: d,
                        };
                    }
                    else {
                        d.positions.forEach(function (p) {
                            var action = {
                                doAction: function () {
                                    _this.moveAndHover(p.x, p.y, p.id, isSync, d);
                                },
                                delay: p.timeOffset +
                                    e.timestamp -
                                    _this.service.state.context.baselineTime,
                            };
                            _this.timer.addAction(action);
                        });
                        this.timer.addAction({
                            doAction: function () { },
                            delay: e.delay - ((_a = d.positions[0]) === null || _a === void 0 ? void 0 : _a.timeOffset),
                        });
                    }
                    break;
                case exports.IncrementalSource.MouseInteraction: {
                    if (d.id === -1) {
                        break;
                    }
                    var event_3 = new Event(exports.MouseInteractions[d.type].toLowerCase());
                    var target = this.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    this.emitter.emit(exports.ReplayerEvents.MouseInteraction, {
                        type: d.type,
                        target: target,
                    });
                    var triggerFocus = this.config.triggerFocus;
                    switch (d.type) {
                        case exports.MouseInteractions.Blur:
                            if ('blur' in target) {
                                target.blur();
                            }
                            break;
                        case exports.MouseInteractions.Focus:
                            if (triggerFocus && target.focus) {
                                target.focus({
                                    preventScroll: true,
                                });
                            }
                            break;
                        case exports.MouseInteractions.Click:
                        case exports.MouseInteractions.TouchStart:
                        case exports.MouseInteractions.TouchEnd:
                            if (isSync) {
                                if (d.type === exports.MouseInteractions.TouchStart) {
                                    this.touchActive = true;
                                }
                                else if (d.type === exports.MouseInteractions.TouchEnd) {
                                    this.touchActive = false;
                                }
                                this.mousePos = {
                                    x: d.x,
                                    y: d.y,
                                    id: d.id,
                                    debugData: d,
                                };
                            }
                            else {
                                if (d.type === exports.MouseInteractions.TouchStart) {
                                    this.tailPositions.length = 0;
                                }
                                this.moveAndHover(d.x, d.y, d.id, isSync, d);
                                if (d.type === exports.MouseInteractions.Click) {
                                    this.mouse.classList.remove('active');
                                    void this.mouse.offsetWidth;
                                    this.mouse.classList.add('active');
                                }
                                else if (d.type === exports.MouseInteractions.TouchStart) {
                                    void this.mouse.offsetWidth;
                                    this.mouse.classList.add('touch-active');
                                }
                                else if (d.type === exports.MouseInteractions.TouchEnd) {
                                    this.mouse.classList.remove('touch-active');
                                }
                            }
                            break;
                        case exports.MouseInteractions.TouchCancel:
                            if (isSync) {
                                this.touchActive = false;
                            }
                            else {
                                this.mouse.classList.remove('touch-active');
                            }
                            break;
                        default:
                            target.dispatchEvent(event_3);
                    }
                    break;
                }
                case exports.IncrementalSource.Scroll: {
                    if (d.id === -1) {
                        break;
                    }
                    if (isSync) {
                        this.treeIndex.scroll(d);
                        break;
                    }
                    this.applyScroll(d, false);
                    break;
                }
                case exports.IncrementalSource.ViewportResize:
                    this.emitter.emit(exports.ReplayerEvents.Resize, {
                        width: d.width,
                        height: d.height,
                    });
                    break;
                case exports.IncrementalSource.Input: {
                    if (d.id === -1) {
                        break;
                    }
                    if (isSync) {
                        this.treeIndex.input(d);
                        break;
                    }
                    this.applyInput(d);
                    break;
                }
                case exports.IncrementalSource.MediaInteraction: {
                    var target = this.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    var mediaEl = target;
                    try {
                        if (d.currentTime) {
                            mediaEl.currentTime = d.currentTime;
                        }
                        if (d.volume) {
                            mediaEl.volume = d.volume;
                        }
                        if (d.muted) {
                            mediaEl.muted = d.muted;
                        }
                        if (d.type === 1) {
                            mediaEl.pause();
                        }
                        if (d.type === 0) {
                            mediaEl.play();
                        }
                    }
                    catch (error) {
                        if (this.config.showWarning) {
                            console.warn("Failed to replay media interactions: ".concat(error.message || error));
                        }
                    }
                    break;
                }
                case exports.IncrementalSource.StyleSheetRule: {
                    var target = this.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    var styleEl = target;
                    var parent_2 = target.parentNode;
                    var usingVirtualParent_1 = this.fragmentParentMap.has(parent_2);
                    var styleSheet_1 = usingVirtualParent_1 ? null : styleEl.sheet;
                    var rules_1;
                    if (!styleSheet_1) {
                        if (this.virtualStyleRulesMap.has(target)) {
                            rules_1 = this.virtualStyleRulesMap.get(target);
                        }
                        else {
                            rules_1 = [];
                            this.virtualStyleRulesMap.set(target, rules_1);
                        }
                    }
                    if (d.adds) {
                        d.adds.forEach(function (_a) {
                            var rule = _a.rule, nestedIndex = _a.index;
                            if (styleSheet_1) {
                                try {
                                    if (Array.isArray(nestedIndex)) {
                                        var _b = getPositionsAndIndex(nestedIndex), positions = _b.positions, index = _b.index;
                                        var nestedRule = getNestedRule(styleSheet_1.cssRules, positions);
                                        nestedRule.insertRule(rule, index);
                                    }
                                    else {
                                        var index = nestedIndex === undefined
                                            ? undefined
                                            : Math.min(nestedIndex, styleSheet_1.cssRules.length);
                                        styleSheet_1.insertRule(rule, index);
                                    }
                                }
                                catch (e) {
                                }
                            }
                            else {
                                rules_1 === null || rules_1 === void 0 ? void 0 : rules_1.push({
                                    cssText: rule,
                                    index: nestedIndex,
                                    type: StyleRuleType.Insert,
                                });
                            }
                        });
                    }
                    if (d.removes) {
                        d.removes.forEach(function (_a) {
                            var nestedIndex = _a.index;
                            if (usingVirtualParent_1) {
                                rules_1 === null || rules_1 === void 0 ? void 0 : rules_1.push({ index: nestedIndex, type: StyleRuleType.Remove });
                            }
                            else {
                                try {
                                    if (Array.isArray(nestedIndex)) {
                                        var _b = getPositionsAndIndex(nestedIndex), positions = _b.positions, index = _b.index;
                                        var nestedRule = getNestedRule(styleSheet_1.cssRules, positions);
                                        nestedRule.deleteRule(index || 0);
                                    }
                                    else {
                                        styleSheet_1 === null || styleSheet_1 === void 0 ? void 0 : styleSheet_1.deleteRule(nestedIndex);
                                    }
                                }
                                catch (e) {
                                }
                            }
                        });
                    }
                    break;
                }
                case exports.IncrementalSource.StyleDeclaration: {
                    var target = this.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    var styleEl = target;
                    var parent_3 = target.parentNode;
                    var usingVirtualParent = this.fragmentParentMap.has(parent_3);
                    var styleSheet = usingVirtualParent ? null : styleEl.sheet;
                    var rules = [];
                    if (!styleSheet) {
                        if (this.virtualStyleRulesMap.has(target)) {
                            rules = this.virtualStyleRulesMap.get(target);
                        }
                        else {
                            rules = [];
                            this.virtualStyleRulesMap.set(target, rules);
                        }
                    }
                    if (d.set) {
                        if (styleSheet) {
                            var rule = getNestedRule(styleSheet.rules, d.index);
                            rule.style.setProperty(d.set.property, d.set.value, d.set.priority);
                        }
                        else {
                            rules.push(__assign({ type: StyleRuleType.SetProperty, index: d.index }, d.set));
                        }
                    }
                    if (d.remove) {
                        if (styleSheet) {
                            var rule = getNestedRule(styleSheet.rules, d.index);
                            rule.style.removeProperty(d.remove.property);
                        }
                        else {
                            rules.push(__assign({ type: StyleRuleType.RemoveProperty, index: d.index }, d.remove));
                        }
                    }
                    break;
                }
                case exports.IncrementalSource.CanvasMutation: {
                    if (!this.config.UNSAFE_replayCanvas) {
                        return;
                    }
                    var target = this.mirror.getNode(d.id);
                    if (!target) {
                        return this.debugNodeNotFound(d, d.id);
                    }
                    canvasMutation({
                        event: e,
                        mutation: d,
                        target: target,
                        imageMap: this.imageMap,
                        errorHandler: this.warnCanvasMutationFailed.bind(this),
                    });
                    break;
                }
                case exports.IncrementalSource.Font: {
                    try {
                        var fontFace = new FontFace(d.family, d.buffer ? new Uint8Array(JSON.parse(d.fontSource)) : d.fontSource, d.descriptors);
                        (_b = this.iframe.contentDocument) === null || _b === void 0 ? void 0 : _b.fonts.add(fontFace);
                    }
                    catch (error) {
                        if (this.config.showWarning) {
                            console.warn(error);
                        }
                    }
                    break;
                }
            }
        };
        Replayer.prototype.applyMutation = function (d, useVirtualParent) {
            var e_14, _a;
            var _this = this;
            d.removes.forEach(function (mutation) {
                var target = _this.mirror.getNode(mutation.id);
                if (!target) {
                    if (d.removes.find(function (r) { return r.id === mutation.parentId; })) {
                        return;
                    }
                    return _this.warnNodeNotFound(d, mutation.id);
                }
                if (_this.virtualStyleRulesMap.has(target)) {
                    _this.virtualStyleRulesMap.delete(target);
                }
                var parent = _this.mirror.getNode(mutation.parentId);
                if (!parent) {
                    return _this.warnNodeNotFound(d, mutation.parentId);
                }
                if (mutation.isShadow && hasShadowRoot(parent)) {
                    parent = parent.shadowRoot;
                }
                _this.mirror.removeNodeFromMap(target);
                if (parent) {
                    var realTarget = null;
                    var realParent = '__sn' in parent ? _this.fragmentParentMap.get(parent) : undefined;
                    if (realParent && realParent.contains(target)) {
                        parent = realParent;
                    }
                    else if (_this.fragmentParentMap.has(target)) {
                        realTarget = _this.fragmentParentMap.get(target);
                        _this.fragmentParentMap.delete(target);
                        target = realTarget;
                    }
                    try {
                        parent.removeChild(target);
                    }
                    catch (error) {
                        if (error instanceof DOMException) {
                            _this.warn('parent could not remove child in mutation', parent, realParent, target, realTarget, d);
                        }
                        else {
                            throw error;
                        }
                    }
                }
            });
            var legacy_missingNodeMap = __assign({}, this.legacy_missingNodeRetryMap);
            var queue = [];
            var nextNotInDOM = function (mutation) {
                var next = null;
                if (mutation.nextId) {
                    next = _this.mirror.getNode(mutation.nextId);
                }
                if (mutation.nextId !== null &&
                    mutation.nextId !== undefined &&
                    mutation.nextId !== -1 &&
                    !next) {
                    return true;
                }
                return false;
            };
            var appendNode = function (mutation) {
                var e_15, _a;
                var _b, _c;
                if (!_this.iframe.contentDocument) {
                    return console.warn('Looks like your replayer has been destroyed.');
                }
                var parent = _this.mirror.getNode(mutation.parentId);
                if (!parent) {
                    if (mutation.node.type === NodeType.Document) {
                        return _this.newDocumentQueue.push(mutation);
                    }
                    return queue.push(mutation);
                }
                var parentInDocument = null;
                if (_this.iframe.contentDocument.contains) {
                    parentInDocument = _this.iframe.contentDocument.contains(parent);
                }
                else if (_this.iframe.contentDocument.body.contains) {
                    parentInDocument = _this.iframe.contentDocument.body.contains(parent);
                }
                var hasIframeChild = ((_c = (_b = parent).getElementsByTagName) === null || _c === void 0 ? void 0 : _c.call(_b, 'iframe').length) > 0;
                if (useVirtualParent &&
                    parentInDocument &&
                    !isIframeINode(parent) &&
                    !hasIframeChild) {
                    var virtualParent = document.createDocumentFragment();
                    _this.mirror.map[mutation.parentId] = virtualParent;
                    _this.fragmentParentMap.set(virtualParent, parent);
                    _this.storeState(parent);
                    while (parent.firstChild) {
                        virtualParent.appendChild(parent.firstChild);
                    }
                    parent = virtualParent;
                }
                if (mutation.node.isShadow) {
                    if (!hasShadowRoot(parent)) {
                        parent.attachShadow({ mode: 'open' });
                        parent = parent.shadowRoot;
                    }
                    else
                        parent = parent.shadowRoot;
                }
                var previous = null;
                var next = null;
                if (mutation.previousId) {
                    previous = _this.mirror.getNode(mutation.previousId);
                }
                if (mutation.nextId) {
                    next = _this.mirror.getNode(mutation.nextId);
                }
                if (nextNotInDOM(mutation)) {
                    return queue.push(mutation);
                }
                if (mutation.node.rootId && !_this.mirror.getNode(mutation.node.rootId)) {
                    return;
                }
                var targetDoc = mutation.node.rootId
                    ? _this.mirror.getNode(mutation.node.rootId)
                    : _this.iframe.contentDocument;
                if (isIframeINode(parent)) {
                    _this.attachDocumentToIframe(mutation, parent);
                    return;
                }
                var target = buildNodeWithSN(mutation.node, {
                    doc: targetDoc,
                    map: _this.mirror.map,
                    skipChild: true,
                    hackCss: true,
                    cache: _this.cache,
                });
                if (mutation.previousId === -1 || mutation.nextId === -1) {
                    legacy_missingNodeMap[mutation.node.id] = {
                        node: target,
                        mutation: mutation,
                    };
                    return;
                }
                if ('__sn' in parent &&
                    parent.__sn.type === NodeType.Element &&
                    parent.__sn.tagName === 'textarea' &&
                    mutation.node.type === NodeType.Text) {
                    try {
                        for (var _d = __values(Array.from(parent.childNodes)), _e = _d.next(); !_e.done; _e = _d.next()) {
                            var c = _e.value;
                            if (c.nodeType === parent.TEXT_NODE) {
                                parent.removeChild(c);
                            }
                        }
                    }
                    catch (e_15_1) { e_15 = { error: e_15_1 }; }
                    finally {
                        try {
                            if (_e && !_e.done && (_a = _d.return)) _a.call(_d);
                        }
                        finally { if (e_15) throw e_15.error; }
                    }
                }
                if (previous && previous.nextSibling && previous.nextSibling.parentNode) {
                    parent.insertBefore(target, previous.nextSibling);
                }
                else if (next && next.parentNode) {
                    parent.contains(next)
                        ? parent.insertBefore(target, next)
                        : parent.insertBefore(target, null);
                }
                else {
                    if (parent === targetDoc) {
                        while (targetDoc.firstChild) {
                            targetDoc.removeChild(targetDoc.firstChild);
                        }
                    }
                    parent.appendChild(target);
                }
                if (isIframeINode(target)) {
                    var mutationInQueue_1 = _this.newDocumentQueue.find(function (m) { return m.parentId === target.__sn.id; });
                    if (mutationInQueue_1) {
                        _this.attachDocumentToIframe(mutationInQueue_1, target);
                        _this.newDocumentQueue = _this.newDocumentQueue.filter(function (m) { return m !== mutationInQueue_1; });
                    }
                }
                if (mutation.previousId || mutation.nextId) {
                    _this.legacy_resolveMissingNode(legacy_missingNodeMap, parent, target, mutation);
                }
            };
            d.adds.forEach(function (mutation) {
                appendNode(mutation);
            });
            var startTime = Date.now();
            while (queue.length) {
                var resolveTrees = queueToResolveTrees(queue);
                queue.length = 0;
                if (Date.now() - startTime > 500) {
                    this.warn('Timeout in the loop, please check the resolve tree data:', resolveTrees);
                    break;
                }
                try {
                    for (var resolveTrees_1 = (e_14 = void 0, __values(resolveTrees)), resolveTrees_1_1 = resolveTrees_1.next(); !resolveTrees_1_1.done; resolveTrees_1_1 = resolveTrees_1.next()) {
                        var tree = resolveTrees_1_1.value;
                        var parent_4 = this.mirror.getNode(tree.value.parentId);
                        if (!parent_4) {
                            this.debug('Drop resolve tree since there is no parent for the root node.', tree);
                        }
                        else {
                            iterateResolveTree(tree, function (mutation) {
                                appendNode(mutation);
                            });
                        }
                    }
                }
                catch (e_14_1) { e_14 = { error: e_14_1 }; }
                finally {
                    try {
                        if (resolveTrees_1_1 && !resolveTrees_1_1.done && (_a = resolveTrees_1.return)) _a.call(resolveTrees_1);
                    }
                    finally { if (e_14) throw e_14.error; }
                }
            }
            if (Object.keys(legacy_missingNodeMap).length) {
                Object.assign(this.legacy_missingNodeRetryMap, legacy_missingNodeMap);
            }
            d.texts.forEach(function (mutation) {
                var target = _this.mirror.getNode(mutation.id);
                if (!target) {
                    if (d.removes.find(function (r) { return r.id === mutation.id; })) {
                        return;
                    }
                    return _this.warnNodeNotFound(d, mutation.id);
                }
                if (_this.fragmentParentMap.has(target)) {
                    target = _this.fragmentParentMap.get(target);
                }
                target.textContent = mutation.value;
            });
            d.attributes.forEach(function (mutation) {
                var target = _this.mirror.getNode(mutation.id);
                if (!target) {
                    if (d.removes.find(function (r) { return r.id === mutation.id; })) {
                        return;
                    }
                    return _this.warnNodeNotFound(d, mutation.id);
                }
                if (_this.fragmentParentMap.has(target)) {
                    target = _this.fragmentParentMap.get(target);
                }
                for (var attributeName in mutation.attributes) {
                    if (typeof attributeName === 'string') {
                        var value = mutation.attributes[attributeName];
                        if (value === null) {
                            target.removeAttribute(attributeName);
                        }
                        else if (typeof value === 'string') {
                            try {
                                target.setAttribute(attributeName, value);
                            }
                            catch (error) {
                                if (_this.config.showWarning) {
                                    console.warn('An error occurred may due to the checkout feature.', error);
                                }
                            }
                        }
                        else if (attributeName === 'style') {
                            var styleValues = value;
                            var targetEl = target;
                            for (var s in styleValues) {
                                if (styleValues[s] === false) {
                                    targetEl.style.removeProperty(s);
                                }
                                else if (styleValues[s] instanceof Array) {
                                    var svp = styleValues[s];
                                    targetEl.style.setProperty(s, svp[0], svp[1]);
                                }
                                else {
                                    var svs = styleValues[s];
                                    targetEl.style.setProperty(s, svs);
                                }
                            }
                        }
                    }
                }
            });
        };
        Replayer.prototype.applyScroll = function (d, isSync) {
            var target = this.mirror.getNode(d.id);
            if (!target) {
                return this.debugNodeNotFound(d, d.id);
            }
            if (target === this.iframe.contentDocument) {
                this.iframe.contentWindow.scrollTo({
                    top: d.y,
                    left: d.x,
                    behavior: isSync ? 'auto' : 'smooth',
                });
            }
            else if (target.__sn.type === NodeType.Document) {
                target.defaultView.scrollTo({
                    top: d.y,
                    left: d.x,
                    behavior: isSync ? 'auto' : 'smooth',
                });
            }
            else {
                try {
                    target.scrollTop = d.y;
                    target.scrollLeft = d.x;
                }
                catch (error) {
                }
            }
        };
        Replayer.prototype.applyInput = function (d) {
            var target = this.mirror.getNode(d.id);
            if (!target) {
                return this.debugNodeNotFound(d, d.id);
            }
            try {
                target.checked = d.isChecked;
                target.value = d.text;
            }
            catch (error) {
            }
        };
        Replayer.prototype.applyText = function (d, mutation) {
            var target = this.mirror.getNode(d.id);
            if (!target) {
                return this.debugNodeNotFound(mutation, d.id);
            }
            try {
                target.textContent = d.value;
            }
            catch (error) {
            }
        };
        Replayer.prototype.legacy_resolveMissingNode = function (map, parent, target, targetMutation) {
            var previousId = targetMutation.previousId, nextId = targetMutation.nextId;
            var previousInMap = previousId && map[previousId];
            var nextInMap = nextId && map[nextId];
            if (previousInMap) {
                var _a = previousInMap, node = _a.node, mutation = _a.mutation;
                parent.insertBefore(node, target);
                delete map[mutation.node.id];
                delete this.legacy_missingNodeRetryMap[mutation.node.id];
                if (mutation.previousId || mutation.nextId) {
                    this.legacy_resolveMissingNode(map, parent, node, mutation);
                }
            }
            if (nextInMap) {
                var _b = nextInMap, node = _b.node, mutation = _b.mutation;
                parent.insertBefore(node, target.nextSibling);
                delete map[mutation.node.id];
                delete this.legacy_missingNodeRetryMap[mutation.node.id];
                if (mutation.previousId || mutation.nextId) {
                    this.legacy_resolveMissingNode(map, parent, node, mutation);
                }
            }
        };
        Replayer.prototype.moveAndHover = function (x, y, id, isSync, debugData) {
            var target = this.mirror.getNode(id);
            if (!target) {
                return this.debugNodeNotFound(debugData, id);
            }
            var base = getBaseDimension(target, this.iframe);
            var _x = x * base.absoluteScale + base.x;
            var _y = y * base.absoluteScale + base.y;
            this.mouse.style.left = "".concat(_x, "px");
            this.mouse.style.top = "".concat(_y, "px");
            if (!isSync) {
                this.drawMouseTail({ x: _x, y: _y });
            }
            this.hoverElements(target);
        };
        Replayer.prototype.drawMouseTail = function (position) {
            var _this = this;
            if (!this.mouseTail) {
                return;
            }
            var _a = this.config.mouseTail === true
                ? defaultMouseTailConfig
                : Object.assign({}, defaultMouseTailConfig, this.config.mouseTail), lineCap = _a.lineCap, lineWidth = _a.lineWidth, strokeStyle = _a.strokeStyle, duration = _a.duration;
            var draw = function () {
                if (!_this.mouseTail) {
                    return;
                }
                var ctx = _this.mouseTail.getContext('2d');
                if (!ctx || !_this.tailPositions.length) {
                    return;
                }
                ctx.clearRect(0, 0, _this.mouseTail.width, _this.mouseTail.height);
                ctx.beginPath();
                ctx.lineWidth = lineWidth;
                ctx.lineCap = lineCap;
                ctx.strokeStyle = strokeStyle;
                ctx.moveTo(_this.tailPositions[0].x, _this.tailPositions[0].y);
                _this.tailPositions.forEach(function (p) { return ctx.lineTo(p.x, p.y); });
                ctx.stroke();
            };
            this.tailPositions.push(position);
            draw();
            setTimeout(function () {
                _this.tailPositions = _this.tailPositions.filter(function (p) { return p !== position; });
                draw();
            }, duration / this.speedService.state.context.timer.speed);
        };
        Replayer.prototype.hoverElements = function (el) {
            var _a;
            (_a = this.iframe.contentDocument) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.\\:hover').forEach(function (hoveredEl) {
                hoveredEl.classList.remove(':hover');
            });
            var currentEl = el;
            while (currentEl) {
                if (currentEl.classList) {
                    currentEl.classList.add(':hover');
                }
                currentEl = currentEl.parentElement;
            }
        };
        Replayer.prototype.isUserInteraction = function (event) {
            if (event.type !== exports.EventType.IncrementalSnapshot) {
                return false;
            }
            return (event.data.source > exports.IncrementalSource.Mutation &&
                event.data.source <= exports.IncrementalSource.Input);
        };
        Replayer.prototype.backToNormal = function () {
            this.nextUserInteractionEvent = null;
            if (this.speedService.state.matches('normal')) {
                return;
            }
            this.speedService.send({ type: 'BACK_TO_NORMAL' });
            this.emitter.emit(exports.ReplayerEvents.SkipEnd, {
                speed: this.speedService.state.context.normalSpeed,
            });
        };
        Replayer.prototype.restoreRealParent = function (frag, parent) {
            this.mirror.map[parent.__sn.id] = parent;
            if (parent.__sn.type === NodeType.Element &&
                parent.__sn.tagName === 'textarea' &&
                frag.textContent) {
                parent.value = frag.textContent;
            }
            parent.appendChild(frag);
            this.restoreState(parent);
        };
        Replayer.prototype.storeState = function (parent) {
            var e_16, _a;
            if (parent) {
                if (parent.nodeType === parent.ELEMENT_NODE) {
                    var parentElement = parent;
                    if (parentElement.scrollLeft || parentElement.scrollTop) {
                        this.elementStateMap.set(parent, {
                            scroll: [parentElement.scrollLeft, parentElement.scrollTop],
                        });
                    }
                    if (parentElement.tagName === 'STYLE')
                        storeCSSRules(parentElement, this.virtualStyleRulesMap);
                    var children = parentElement.children;
                    try {
                        for (var _b = __values(Array.from(children)), _c = _b.next(); !_c.done; _c = _b.next()) {
                            var child = _c.value;
                            this.storeState(child);
                        }
                    }
                    catch (e_16_1) { e_16 = { error: e_16_1 }; }
                    finally {
                        try {
                            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                        }
                        finally { if (e_16) throw e_16.error; }
                    }
                }
            }
        };
        Replayer.prototype.restoreState = function (parent) {
            var e_17, _a;
            if (parent.nodeType === parent.ELEMENT_NODE) {
                var parentElement = parent;
                if (this.elementStateMap.has(parent)) {
                    var storedState = this.elementStateMap.get(parent);
                    if (storedState.scroll) {
                        parentElement.scrollLeft = storedState.scroll[0];
                        parentElement.scrollTop = storedState.scroll[1];
                    }
                    this.elementStateMap.delete(parent);
                }
                var children = parentElement.children;
                try {
                    for (var _b = __values(Array.from(children)), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var child = _c.value;
                        this.restoreState(child);
                    }
                }
                catch (e_17_1) { e_17 = { error: e_17_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_17) throw e_17.error; }
                }
            }
        };
        Replayer.prototype.restoreNodeSheet = function (node) {
            var storedRules = this.virtualStyleRulesMap.get(node);
            if (node.nodeName !== 'STYLE') {
                return;
            }
            if (!storedRules) {
                return;
            }
            var styleNode = node;
            applyVirtualStyleRulesToNode(storedRules, styleNode);
        };
        Replayer.prototype.warnNodeNotFound = function (d, id) {
            if (this.treeIndex.idRemoved(id)) {
                this.warn("Node with id '".concat(id, "' was previously removed. "), d);
            }
            else {
                this.warn("Node with id '".concat(id, "' not found. "), d);
            }
        };
        Replayer.prototype.warnCanvasMutationFailed = function (d, error) {
            this.warn("Has error on canvas update", error, 'canvas mutation:', d);
        };
        Replayer.prototype.debugNodeNotFound = function (d, id) {
            if (this.treeIndex.idRemoved(id)) {
                this.debug(REPLAY_CONSOLE_PREFIX, "Node with id '".concat(id, "' was previously removed. "), d);
            }
            else {
                this.debug(REPLAY_CONSOLE_PREFIX, "Node with id '".concat(id, "' not found. "), d);
            }
        };
        Replayer.prototype.warn = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!this.config.showWarning) {
                return;
            }
            console.warn.apply(console, __spreadArray([REPLAY_CONSOLE_PREFIX], __read(args), false));
        };
        Replayer.prototype.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (!this.config.showDebug) {
                return;
            }
            console.log.apply(console, __spreadArray([REPLAY_CONSOLE_PREFIX], __read(args), false));
        };
        return Replayer;
    }());

    var addCustomEvent = record.addCustomEvent;
    var freezePage = record.freezePage;

    exports.Replayer = Replayer;
    exports.addCustomEvent = addCustomEvent;
    exports.freezePage = freezePage;
    exports.record = record;
    exports.utils = utils;

    Object.defineProperty(exports, '__esModule', { value: true });

    return exports;

}({}));
