const schema = {
    type: 'object',
    properties: {
        reqfile: {
            type: 'string',
            pattern: /.+\.yml$/,
            error: 'must be the name of a .yml file',
            optional: true
        }
    }
};

module.exports = schema;
