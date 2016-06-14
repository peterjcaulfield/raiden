var schema = {
    type:'object',
    properties: {
        method: {
            type: 'string',
            optional: true,
            def: ''
        },
        endpoint: {
            type: 'string',
            optional: true,
            def: ''
        },
        query: {
            type: 'string',
            optional: true,
            def: ''
        },
        headers: {
            type: 'object',
            optional: true,
            def: {}
        },
        body: {
            type: ['string', 'object'],
            optional: true,
            def: ''
        }
    }
};

module.exports = schema;

