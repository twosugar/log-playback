import record from './record/index.js';
export { default as record } from './record/index.js';
export { Replayer } from './replay/index.js';
import * as utils from './utils.js';
export { utils };
export { _mirror as mirror } from './utils.js';
export { EventType, IncrementalSource, MouseInteractions, ReplayerEvents } from './types.js';

var addCustomEvent = record.addCustomEvent;
var freezePage = record.freezePage;

export { addCustomEvent, freezePage };
