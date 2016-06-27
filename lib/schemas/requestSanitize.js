const schema = {
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
        qs: {
            type: 'object',
            optional: true
        },
        headers: {
            type: 'object',
            optional: false,
            def: {}
        },
        body: {
            type: ['string', 'object'],
            optional: true,
        },
        form: {
            type: 'object',
            optional: true
        },
        formData: {
            type: 'object',
            optional: true
        },
        cookies: {
          type: 'object',
          optional: false,
          def: {}
        }
    }
};

module.exports = schema;
