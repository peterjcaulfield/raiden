const userConfigs = {
    requests: {
        get: (key) => {
            if (key === 'invalid') {
                return {
                    error: 'invalid request'
                } 
            } else {
                return `${key} config`;    
            }
        }
    },
    envs: {
        get: () => { return 'foo.com'; }
    }
};

module.exports = userConfigs;
