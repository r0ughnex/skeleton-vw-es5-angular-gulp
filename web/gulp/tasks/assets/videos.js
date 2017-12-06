'use strict';

// -------------------------------------
//   Gulp - Videos
// -------------------------------------
/**
    * @name videos
    * @desc The js file that contains the functions
            for optimizing videos for the app.
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
var config = require('../../config.js').getConfig();
var watchers = require('../../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// VIDEOS - MAIN TASK
// ----------------------------------------
gulp.task('assets:videos', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'videos:default',
        'videos:watch',
        callback
    );
});

// 0. VIDEOS - DEFAULT TASK
gulp.task('videos:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'videos:clean',
        'videos:custom',
        'videos:data',
        'videos:copy',
        callback
    );
});

// 1. VIDEOS - CLEAN
gulp.task('videos:clean', function () {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.assets.videos // all files
    ];

    // add deploy folders / files into
    // source in deployment mode
    if(config.mode.isDeploy) {
       source.push(config.files.root.deploy + config.files.assets.videos); // all files
    }

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. VIDEOS - CUSTOM
gulp.task('videos:custom', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.videos + '**/*.mp4',  // mp4 files
        config.files.root.dev + config.files.assets.videos + '**/*.ogg',  // ogg files
        config.files.root.dev + config.files.assets.videos + '**/*.webm', // webm files

        config.files.root.dev + config.files.assets.videos + '**/*.jpg', // jpg files
        config.files.root.dev + config.files.assets.videos + '**/*.png', // png files
        config.files.root.dev + config.files.assets.videos + '**/*.gif'  // gif files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.assets.videos;

    //  return task stream
    return gulp.src(source)

        // output the font files
        .pipe(gulp.dest(destination));
});

// 3. VIDEOS - DATA
gulp.task('videos:data', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.videos + '**/*.xml', // video xml files
        config.files.root.dev + config.files.assets.videos + '**/*.json' // video json files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.assets.videos;

    //  return task stream
    return gulp.src(source)
        // minify the json, xml files
        .pipe(gulpif(config.mode.isProd, prettyData({ type: 'minify' })))

        // output the json, xml files
        .pipe(gulp.dest(destination));
});

// 4. VIDEOS - COPY
gulp.task('videos:copy', function() {
    // only copy files when in deployment mode
    if(!config.mode.isDeploy) { return false; }

    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.assets.videos + '**/*.*' // all files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.assets.videos;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});


// 5. VIDEOS - WATCH
gulp.task('videos:watch', function() {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.videos + '**/*.*' // all files
    ];

    // push watcher into the main
    // array, and return the new size
    return watchers.push(gulp.watch(
        source,  // files to watch for
        ['videos:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
