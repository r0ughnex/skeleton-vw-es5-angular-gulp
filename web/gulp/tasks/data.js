'use strict';

// -------------------------------------
//   Gulp - Data
// -------------------------------------
/**
    * @name data
    * @desc The js file that contains the functions
            for compiling data for the app.
**/

// -------------
// DEPENDENCIES
// -------------
// BASE
var gulp = require('gulp');
var gulpif = require('gulp-if');
var runSequence = require('run-sequence');

var replace = require('gulp-replace');
var rimraf = require('gulp-rimraf');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var debug = require('gulp-debug');
var gutil = require('gulp-util');

// DATA
var prettyData = require('gulp-pretty-data');

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../config.js').getConfig();
var watchers = require('../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// DATA - MAIN TASK
// ----------------------------------------
gulp.task('data', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'data:default',
        'data:watch',
        callback
    );
});

// 0. DATA - DEFAULT TASK
gulp.task('data:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'data:clean',
        'data:custom',
        'data:files',
        'data:copy',
        callback
    );
});

// 1. DATA - CLEAN
gulp.task('data:clean', function () {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.data // all files
    ];

    // add deploy folders / files into
    // source in deployment mode
    if(config.mode.isDeploy) {
        source.push(config.files.root.deploy + config.files.data); // all files
    }

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. DATA - CUSTOM
gulp.task('data:custom', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.data + '**/*.xml', // xml files
        config.files.root.dev + config.files.data + '**/*.json' // json files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.data;

    // @name _needsMinification
    // @desc conditional function that determines if minification is required for the given file
    // @param {Vinyl} file - the node js vinyl file object that requires minification or not
    // @return {Boolean} needsMinification - true or false, based on conditional checks
    function _needsMinification(file) {
        // only proceed if the config flag has been set
        if(!config.mode.isProd) { return false; }

        // only proceed if custom json templates exist
        if(!Array.isArray(config.json_custom) // check if the array is valid
        || !config.json_custom.length) { return false; } // no json templates

        // get the path of the given file to check
        var filePath = file.path;

        // default boolean flag to indicate if minification
        // of data is required for the given json file or not
        // (note: by default json files need minification)
        var needsMinification = true;

        // if the file path contains the
        // name of a json_custom template
        config.json_custom.some(function(name) {
            // replacing the slahes are important due to path differences in different os
            if(filePath.includes(name) || filePath.includes(name.replace(/\//g, "\\"))) {
                // should not be minified because
                // json templates might contain
                // placeholders or shortcodes
                needsMinification = false;
            }

            // to short circuit the some loop,
            // only proceed if the minification
            // flag has not been reset to false
            return (needsMinification === false);
        });

        // all the other json
        // files can be ignored
        return needsMinification;

        /*
        if(filePath.includes("/user/") || filePath.includes("\\user\\") ||
           filePath.includes("/content/") || filePath.includes("\\content\\") ||
           filePath.includes("/template/") || filePath.includes("\\template\\")) {
            // should not be minified because katzion
            // cannot seem to handle minifed json data
            return false;
        }

        // all other json files should
        // be minified in production mode
        else {  return true; } */
    }

    //  return task stream
    return gulp.src(source)
        // conditionally minify the json and xml files
        .pipe(gulpif(_needsMinification, prettyData({ type: 'minify' })))

        // output the json, xml files
        .pipe(gulp.dest(destination));
});

// 3. DATA - FILES
gulp.task('data:files', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.data + 'files/*.*' // all files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.data + 'files/';

    //  return task stream
    return gulp.src(source)

        // output the other files
        .pipe(gulp.dest(destination));
});

// 4. DATA - COPY
gulp.task('data:copy', function() {
    // only copy files when in deployment mode
    if(!config.mode.isDeploy) { return false; }

    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.data + '**/*.*' // all files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.data;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});


// 5. DATA - WATCH
gulp.task('data:watch', function() {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.data + '**/*.*' // all files
    ];

    // push watcher into the main
    // array, and return the new size
    return watchers.push(gulp.watch(
        source,  // files to watch for
        ['data:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
