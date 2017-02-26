'use strict';

module.exports = function (grunt) {
    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Automatically load required Grunt tasks
    require('jit-grunt')(grunt, {
        useminPrepare: 'grunt-usemin'
    });

    // Define the configuration for all the tasks
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        // Make sure code styles are up to par and there are no obvious mistakes
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                reporter: require('jshint-stylish')
            },

            all: {
                src: [
                    'Gruntfile.js',
                    'dev/scripts/{,*/}*.js'
                ]
            }
        },

        copy: {
            dist: {
                cwd: 'dev',
                    src: [ '**','!styles/**/*.css','!scripts/**/*.js' ],
                    dest: 'public',
                    expand: true
            },

            fonts: {
                files: [
                    {
                        //for bootstrap fonts
                        expand: true,
                        cwd: 'bower_components/bootstrap/dist',
                        src: 'fonts/*',
                        dest: 'public'
                    }, {
                        //for font-awesome
                        expand: true,
                        dot: true,
                        cwd: 'bower_components/font-awesome',
                        src: ['fonts/*.*'],
                        dest: 'public'
                    }
                ]
            }
        },

        clean: {
            build: {
                src: [ 'public/']
            }
        },


        useminPrepare: {
            html: 'dev/index.html',
            options: {
                dest: 'public'
            }
        },

        // Concat
        concat: {
            options: {
                separator: ';'
            },

            // dist configuration is provided by useminPrepare
            dist: {}
        },

        // Uglify
        uglify: {
            // dist configuration is provided by useminPrepare
            dist: {}
        },

        cssmin: {
            dist: {}
        },

        // Filerev
        filerev: {
            options: {
                encoding: 'utf8',
                    algorithm: 'md5',
                    length: 20
            },

            release: {
                // filerev:release hashes(md5) all assets (images, js and css )
                // in dist directory
                files: [{
                    src: [
                        'public/scripts/*.js',
                        'public/styles/*.css',
                    ]
                }]
            }
        },

        // Usemin
        // Replaces all assets with their revved version in html and css files.
        // options.assetDirs contains the directories for finding the assets
        // according to their relative paths
        usemin: {
            html: ['public/*.html'],
                css: ['public/styles/*.css'],
                options: {
                assetsDirs: ['public', 'public/styles']
            }
        }
    });

    grunt.registerTask('build', [
        'clean',
        'jshint',
        'useminPrepare',
        'concat',
        'cssmin',
        'uglify',
        'copy',
        'filerev',
        'usemin'
    ]);

    grunt.registerTask('default',['build']);
};