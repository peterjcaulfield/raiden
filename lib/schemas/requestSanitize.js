var schema = {
    type:'object',
    properties: {
        protocol: {
            type: 'string',
            optional: true,
            def: 'http'
        },
        method: {
            type: 'string',
            optional: true,
            def: 'GET'
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
