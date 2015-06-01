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
            afterDist: ['<%= globalConfig.buildDir %>/app.css',
                '<%= globalConfig.buildDir %>/index.js',
                '<%= globalConfig.buildDir %>/print.js']
        },

        less: {
            build: {
                options: {
                    relativeUrls: true
                },
                files: {
                    '<%= globalConfig.buildDir %>/app.css': '<%= globalConfig.sourceDir %>/less/main.less'
                }
            }
        },
        concat: {
            dev: {
                files: {
                    '<%= globalConfig.buildDir %>/print.js': [
                        '<%= globalConfig.sourceDir %>/js/app.js',
                        '<%= globalConfig.sourceDir %>/js/components/**/*.js',
                        '<%= globalConfig.sourceDir %>/js/inject.js'
                    ]
                }
            },
            templates: {
                files: {
                    '<%= globalConfig.buildDir %>/templates.html': [
                        '<%= globalConfig.sourceDir %>/html/templates.html'
                    ]
                }

            },
            post: {
                files: {
                    '<%= globalConfig.buildDir %>/print.min.js': [
                        //'<%= globalConfig.sourceDir %>/lib/jquery/dist/jquery.js',
                        '<%= globalConfig.sourceDir %>/lib/angular/angular.js',
                        '<%= globalConfig.buildDir %>/print.min.js'
                    ]
                }
            }
        },
        uglify: {
            options: {
                mangle: false,
                beautify: true
            },
            dist: {
                files: {
                    '<%= globalConfig.buildDir %>/index.min.js': ['<%= globalConfig.sourceDir %>/js/index.js'],
                    '<%= globalConfig.buildDir %>/print.min.js': ['<%= globalConfig.buildDir %>/print.js']
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
            },
            icons: {
                expand: true,
                src: ['**/*.png'],
                cwd: '<%= globalConfig.sourceDir %>/icons',
                dest: '<%= globalConfig.buildDir %>'
            }
        }
    });
    // Automatically load all modules which start with "grunt-*" pattern
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.registerTask('dist', [
        'clean',
        'less:build',
        'cssmin',
        'concat:dev',
        'uglify',
        'copy:files',
        'copy:icons',
        'concat:post',
        'concat:templates',
        'clean:afterDist'
    ]);
};
