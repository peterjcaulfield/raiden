const config = {
    requests: {
        foo: {
            config: 'foo config' 
        },
        bar: {
            config: 'bar config' 
        },
        baz: {
            config: 'baz config' 
        }
    },
    envs: {
        foo: 'foo.com',
        bar: 'bar.com',
        default: 'baz.com'
    }
};

module.exports = config;
