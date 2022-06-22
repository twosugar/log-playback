import { CanvasContext } from '../../types.js';
import webglMutation from './webgl.js';
import canvasMutation$1 from './2d.js';

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

export default canvasMutation;
