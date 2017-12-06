'use strict';

// -------------------------------------
//   Gulp - Fonts
// -------------------------------------
/**
    * @name fonts
    * @desc The js file that contains the functions
            for compiling fonts for the app.
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

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../../config.js').getConfig();
var watchers = require('../../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// FONTS - MAIN TASK
// ----------------------------------------
gulp.task('assets:fonts', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'fonts:default',
        'fonts:watch',
        callback
    );
});

// 0. FONTS - DEFAULT TASK
gulp.task('fonts:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'fonts:clean',
        'fonts:custom',
        'fonts:copy',
        callback
    );
});

// 1. FONTS - CLEAN
gulp.task('fonts:clean', function () {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.assets.fonts // all files
    ];

    // add deploy folders / files into
    // source in deployment mode
    if(config.mode.isDeploy) {
       source.push(config.files.root.deploy + config.files.assets.fonts); // all files
    }

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. FONTS - CUSTOM
gulp.task('fonts:custom', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.fonts + '**/*.svg', // svg files
        config.files.root.dev + config.files.assets.fonts + '**/*.ttf', // ttf files
        config.files.root.dev + config.files.assets.fonts + '**/*.eot', // eot files
        config.files.root.dev + config.files.assets.fonts + '**/*.woff', // woff files
        config.files.root.dev + config.files.assets.fonts + '**/*.woff2' // woff2 files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.assets.fonts;

    //  return task stream
    return gulp.src(source)

        // output the font files
        .pipe(gulp.dest(destination));
});


// 3. FONTS - COPY
gulp.task('fonts:copy', function() {
    // only copy files when in deployment mode
    if(!config.mode.isDeploy) { return false; }

    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.assets.fonts + '**/*.*' // all files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.assets.fonts;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});


// 4. FONTS - WATCH
gulp.task('fonts:watch', function() {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.fonts + '**/*.*' // all files
    ];

    // push watcher into the main
    // array, and return the new size
    return watchers.push(gulp.watch(
        source,  // files to watch for
        ['fonts:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
