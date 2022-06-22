import { __rest } from '../../../../ext/tslib/tslib.es6.js';
import initCanvas2DMutationObserver from './2d.js';
import initCanvasContextObserver from './canvas.js';
import initCanvasWebGLMutationObserver from './webgl.js';

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

export { CanvasManager };
