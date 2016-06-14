var schema = {
    type:'object',
    properties: {
        method: {
            type: 'string',
            optional: true
        },
        endpoint: {
            type: 'string',
            optional: true
        },
        query: {
            type: 'string',
            optional: true
        },
        headers: {
            type: 'object',
            optional: true
        },
        body: {
            type: ['string', 'object'],
            optional: true
        },
        transforms: {
            type: 'array',
            optional: true,
            items: {
                type: 'object',
                properties: {
                    key: {
                        type: 'string'
                    },
                    transform: {
                        type: 'array',
                        items: [
                            { type: 'string' },
                            { type: 'object', optional: true }
                        ]
                    },
                }
            }
        }
    }
}

module.exports = schema;
