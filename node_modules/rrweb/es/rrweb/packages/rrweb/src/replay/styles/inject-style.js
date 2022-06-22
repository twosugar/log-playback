var rules = function (blockClass) { return [
    ".".concat(blockClass, " { background: currentColor }"),
    'noscript { display: none !important; }',
]; };

export default rules;
