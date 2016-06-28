const schema = {
    type:'object',
    properties: {
        protocol: {
            optional: false,
            def: 'http'
        },
        method: {
            optional: false,
            def: 'GET'
        },
        headers: {
            optional: false,
            def: {}
        }
    }
};

module.exports = schema;
