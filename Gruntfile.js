module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  var path = require('path');

  var config = grunt.util._.extend({},
    require('load-grunt-config')(grunt, {
        configPath: path.join(__dirname, 'grunt/tasks/options'),
        loadGruntTasks: false,
        init: false
      })
  );

  grunt.loadTasks('grunt/tasks');
  
  grunt.initConfig(config);   
};
