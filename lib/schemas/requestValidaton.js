const schema = {
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
        qs: {
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
        form: {
            type: 'object',
            optional: true
        },
        formData: {
            type: 'object',
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
                        type: 'object',
                        properties: {
                            method: {
                                type: 'string'
                            },
                            args: {
                                type: 'object',
                                optional: true
                            },
                            prefix: {
                                type: 'string',
                                optional: true
                            },
                            suffix: {
                                type: 'string',
                                optional: true
                            }
                        }
                    },
                }
            }
        }
    }
};

module.exports = schema;
