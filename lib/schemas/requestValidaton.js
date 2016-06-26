var schema = {
    type:'object',
    properties: {
        protocol: {
            type: 'string',
            optional: true
        },
        method: {
            type: 'string',
            optional: true
        },
        endpoint: {
            type: 'string',
            optional: true
        },
        query: {
            type: 'object',
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
                            { type: ['object', 'array'], optional: true }
                        ]
                    },
                }
            }
        }
    }
};

module.exports = schema;
