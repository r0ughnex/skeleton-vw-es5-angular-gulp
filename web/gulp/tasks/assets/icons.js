'use strict';

// -------------------------------------
//   Gulp - Icons
// -------------------------------------
/**
    * @name icons
    * @desc The js file that contains the functions
            for compiling icons for the app.
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

// ICONS
var iconfont = require('gulp-iconfont');
var iconfontCss = require('gulp-iconfont-css');

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../../config.js').getConfig();
var watchers = require('../../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// ICONS - MAIN TASK
// ----------------------------------------
gulp.task('assets:icons', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'icons:default',
        'icons:watch',
        callback
    );
});

// 0. ICONS - DEFAULT TASK
gulp.task('icons:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'icons:clean',
        'icons:create',
        callback
    );
});

// 1. ICONS - CLEAN
gulp.task('icons:clean', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.fonts + config.icons.name + '.svg', // svg file
        config.files.root.dev + config.files.assets.fonts + config.icons.name + '.ttf', // ttf file
        config.files.root.dev + config.files.assets.fonts + config.icons.name + '.eot', // eot file
        config.files.root.dev + config.files.assets.fonts + config.icons.name + '.woff',  // woff file
        config.files.root.dev + config.files.assets.fonts + config.icons.name + '.woff2', // woff2 file
        config.files.root.dev + config.files.styles + config.icons.fileName // generated style file
    ];

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. ICONS - CUSTOM
gulp.task('icons:create', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.icons + '**/*.svg' // svg files
    ];

    // destination folder for the task
    // (icon font files are created in the source)
    var destination = config.files.root.dev + config.files.assets.fonts;

    //  return task stream
    return gulp.src(source)

        // create css for the icon fonts
        .pipe(iconfontCss({
            fontName: config.icons.name,
            fontPath: config.icons.fontPath,
            cssClass: config.icons.className,
            targetPath: config.icons.stylePath + config.icons.fileName
        }))

        // convert icons to font
        .pipe(iconfont({
            timestamp: 0, normalize: true,
            fontHeight: 1001, prependUnicode: true,
            fontName: config.icons.name, formats: config.icons.formats
        }))

        // output the icon font files
        .pipe(gulp.dest(destination));
});

// 3. ICONS - WATCH
gulp.task('icons:watch', function() {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.icons + '**/*.*' // all files
    ];

    // push watcher into the main
    // array, and return the new size
    return watchers.push(gulp.watch(
        source,  // files to watch for
        ['icons:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
