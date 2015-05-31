module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({

        globalConfig: {
            sourceDir: 'src',
            buildDir: 'dist',
            buildTarget: grunt.option('target') || 'dev'
        },

        clean: {
            dev: [],
            dist: ['<%= globalConfig.buildDir %>'],
            afterDist: ['<%= globalConfig.buildDir %>/app.css']
        },

        jshint: {
            /* http://jshint.com/docs/options/ */
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'gruntfile.js', 'src/js/**/*.js']
        },
        jscs: {
            all: {
                src: ['gruntfile.js', 'src/js/**/*.js'],
                options: {
                    config: '.jscsrc'
                }
            }
        },

        less: {
            build: {
                options: {
                    paths: ['<%= globalConfig.sourceDir %>/less']
                },
                files: {
                    '<%= globalConfig.buildDir %>/app.css': '<%= globalConfig.sourceDir %>/less/main.less'
                }
            }
        },
        uglify: {
            options: {
                mangle: false
            },
            dist: {
                files: {
                    '<%= globalConfig.buildDir %>/index.js': ['<%= globalConfig.sourceDir %>/js/print.js'],
                    '<%= globalConfig.buildDir %>/libs.js': [
                        '<%= globalConfig.sourceDir %>/lib/jquery/jquery.min.js'
                    ]
                }
            }
        },
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= globalConfig.buildDir %>',
                    src: ['*.css', '!*.min.css'],
                    dest: '<%= globalConfig.buildDir %>',
                    ext: '.min.css'
                }]
            }
        },
        copy: {
            files: {
                expand: true,
                src: ['manifest.json'],
                cwd: '<%= globalConfig.sourceDir %>',
                dest: '<%= globalConfig.buildDir %>'
            }
        }
    });
    // Automatically load all modules which start with "grunt-*" pattern
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('compile', [
        'jshint',
        'jscs']);

    grunt.registerTask('dist', [
        'clean',
        'compile',
        'less:build',
        'cssmin',
        'uglify',
        'copy:files',
        'clean:afterDist'
    ]);
};
