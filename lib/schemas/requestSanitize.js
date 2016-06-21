var schema = {
    type:'object',
    properties: {
        protocol: {
            type: 'string',
            optional: false,
            def: 'http'
        },
        method: {
            type: 'string',
            optional: false,
            def: 'GET'
        },
        endpoint: {
            type: 'string',
            optional: false,
            def: ''
        },
        query: {
            type: 'string',
            optional: false,
            def: ''
        },
        headers: {
            type: 'object',
            optional: false,
            def: {}
        },
        body: {
            type: ['string', 'object'],
            optional: false,
            def: ''
        },
        cookies: {
          type: 'object',
          optional: false,
          def: {}
        }
    }
};

module.exports = schema;
