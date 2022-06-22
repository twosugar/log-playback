import { __assign } from '../../ext/tslib/tslib.es6.js';
import { initMutationObserver, initScrollObserver } from './observer.js';
import { patch } from '../utils.js';

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

export { ShadowDomManager };
