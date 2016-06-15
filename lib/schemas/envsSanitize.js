var schema = {
    type:'object',
    properties: {
        default: {
            type: 'string',
            optional: true,
            def: '127.0.0.1'
        }
    }
};

module.exports = schema;
