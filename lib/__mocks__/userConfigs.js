class Config {
    constructor(props) {
        this._config = props; 
    }

    get(key) {
        if (key) return this._config[key];

        return this._config;
    }
}



module.exports = {
    requests: new Config({
        foo: 'foo config',
        bar: 'bar config',
        baz: 'baz config',
        invalid: { error: 'invalid request' }
    }),    
    envs: new Config({
        foo: 'foo.com',
        bar: 'bar.com',
        baz: 'baz.com'
    })
};
