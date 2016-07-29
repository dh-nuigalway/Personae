'use strict';
module.exports = function(grunt) {

    // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  var config = {
      app: 'app',
      dist: 'personae',
      name: 'personae'
  };

  grunt.initConfig({
    config: config,
    jshint: {
      options: {
        // jshintrc: '.jshintrc'
      },
      all: [
        'Gruntfile.js',
        'js/*.js',
        '!js/main.min.js'
      ]
    }, 
    less: {
      dist: {
        files: {
          '<%= config.dist %>/css/style.css': [
            '<%= config.app %>/less/style.less'
          ]
        },
        options: {
          compress: true,
          // LESS source map
          // To enable, set sourceMap to true and update sourceMapRootpath based on your install
          sourceMap: false
        }
      },
      server: {        
        files: {
          '<%= config.app %>/css/style.css': [
            '<%= config.app %>/less/style.less'
          ]
        }
      }
    },
    uglify: {
      dist: {
        files: {
          '<%= config.dist %>/js/vendor.min.js': [
              'bower_components/jquery/dist/jquery.js',
              'bower_components/bootstrap/dist/js/bootstrap.min.js',
              'bower_components/d3/d3.js',
              'bower_components/underscore/underscore.js'              
          ],
          // <%= config.dist %>/js/<%= config.name %>.min.js': 'js/*.js'
          '<%= config.dist %>/js/<%= config.name %>.min.js': [
            '<%= config.app %>/js/plugins.js',
            '<%= config.app %>/js/main.js'
          ]
        },
        options: {
          // JS source map: to enable, uncomment the lines below and update sourceMappingURL based on your install
          // sourceMap: 'js/dist/<%= config.name %>.min.js.map',
          // sourceMappingURL: '/js/dist/<%= config.name %>.min.js.map'
        }
      },
      server:{
        files: {
          '.tmp/js/vendor.min.js': [
              'bower_components/jquery/dist/jquery.js',
              'bower_components/bootstrap/dist/js/bootstrap.min.js',
              'bower_components/d3/d3.js',
              'bower_components/underscore/underscore.js'              
          ],
          // <%= config.dist %>/js/<%= config.name %>.min.js': 'js/*.js'
          '.tmp/js/<%= config.name %>.min.js': [
            '<%= config.app %>/js/plugins.js',
            '<%= config.app %>/js/main.js'
          ]
        }
      }
    },
    imagemin: {                          // Task
      dynamic: {                         // Another target
        files: [{
          expand: true,                  // Enable dynamic expansion
          cwd: '<%= config.app %>/images/',         // Src matches are relative to this path
          src: ['{,*/}*.{png,jpg,jpeg,gif,svg}'],   // Actual patterns to match
          dest: '<%= config.dist %>/images/'     // Destination path prefix
        }]     
      }
    },
    copy: {
      dist: {
        files:[{
          expand: true,
          cwd: 'bower_components/bootstrap/dist',
          src: 'fonts/*',
          dest: '<%= config.dist %>'
        },
        {
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            '*.{ico,png,txt}',
            'images/{,*/}*.webp',
            '{,*/}*.html',
            'styles/fonts/{,*/}*.*',
            'data/*.*',
            'js/tip-non-es6.js'
          ]
        }
        ]
      },
      styles: {
        expand: true,
        dot: true,
        cwd: '<%= config.app %>/css',
        dest: '.tmp/css/',
        src: '{,*/}*.css'
      }
    },
    watch: {
      less: {
        files: [
          '<%= config.app %>/less/*.less'
        ],
        tasks: ['less', 'copy:styles'],
        options: {
          livereload: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      js: {
        files: ['<%= config.app %>/js/{,*/}*.js'],
        tasks: ['uglify'],
        options: {
          livereload: true
        }
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/{,*/}*.html',
          '.tmp/css/{,*/}*.css',
          '<%= config.app %>/images/{,*/}*'
        ]
      }
    },
    
    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        open: true,
        livereload: 35729,
        // Change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect().use('/fonts', connect.static('<%= config.app %>/bower_components/bootstrap/dist/fonts')),
              connect.static(config.app)
            ];
          }
        }
      },
      test: {
        options: {
          open: false,
          port: 9001,
          middleware: function(connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use('/bower_components', connect.static('./bower_components')),
              connect().use('/fonts', connect.static('./bower_components/bootstrap/dist/fonts')),
              connect.static(config.app)
            ];
          }
        }
      },
      dist: {
        options: {
          base: '<%= config.dist %>',
          livereload: false
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      },
      server: '.tmp'
    },
  });

  // Load tasks 
  // grunt.loadNpmTasks('grunt-contrib-clean');
  // grunt.loadNpmTasks('grunt-contrib-jshint');
  // grunt.loadNpmTasks('grunt-contrib-uglify');
  // grunt.loadNpmTasks('grunt-contrib-watch');
  // grunt.loadNpmTasks('grunt-contrib-less');
  // grunt.loadNpmTasks('grunt-contrib-imagemin');
  // grunt.loadNpmTasks('grunt-contrib-copy');


  grunt.registerTask('serve', 'start the server and preview your app, --allow-remote for remote access', function (target) {
    if (grunt.option('allow-remote')) {
      grunt.config.set('connect.options.hostname', '0.0.0.0');
    }
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
      'clean:server',
      // 'wiredep',
      'less:server',
      'copy:styles',
      'uglify:server',
      // 'autoprefixer',
      'connect:livereload',
      'watch'
    ]);
  });


  // Register tasks
  grunt.registerTask('default', [
    'clean',
    'less',
    'imagemin',
    'copy',
    'uglify'
  ]);

  grunt.registerTask('dev', [
    'watch'
  ]);

};