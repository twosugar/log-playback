function canvasMutation(_a) {
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

export default canvasMutation;
