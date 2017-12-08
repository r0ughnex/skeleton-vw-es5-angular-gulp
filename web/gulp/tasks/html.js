'use strict';

// -------------------------------------
//   Gulp - Html
// -------------------------------------
/**
    * @name html
    * @desc The js file that contains the functions
            for compiling html for the app.
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

// STYLES
var cleancss = require('gulp-clean-css');
var stripCssComments = require('gulp-strip-css-comments');

// HTML
var fileinclude = require('gulp-file-include');
var minifyHTML = require('gulp-minify-html');

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../config.js').getConfig();
var watchers = require('../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// HTML - MAIN TASK
// ----------------------------------------
gulp.task('html', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'html:default',
        'html:watch',
        callback
    );
});

// 0. HTML - DEFAULT TASK
gulp.task('html:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'html:clean',
        'html:views',
        'html:views:css',
        'html:templates',
        'html:templates:css',
        'html:copy',
        callback
    );
});

// 1. HTML - CLEAN
gulp.task('html:clean', function () {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.html.views, // view files
        config.files.root.prod + config.files.html.templates // template files
    ];

    // add deploy folders / files into
    // source in deployment mode
    if(config.mode.isDeploy) {
        source.push(config.files.root.deploy + config.files.html.views); // view files
        source.push(config.files.root.deploy + config.files.html.templates); // template files
    }

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. HTML - VIEWS
gulp.task('html:views', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.html.views + '**/*.html' // view files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.html.views;

    //  return task stream
    return gulp.src(source)
        // include all the patials
        .pipe(fileinclude({ prefix: '@@', basepath: '@file', indent: true }))

        // minify the html files
        .pipe(gulpif(config.mode.isProd, minifyHTML({
            conditionals: true, empty: true, spare: true
        })))

        // output the minified html files
        .pipe(gulp.dest(destination));
});

// 2.1 HTML - VIEWS
gulp.task('html:views:css', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.html.views + '**/*.css' // view files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.html.views;

    //  return task stream
    return gulp.src(source)
        // minify the css files
        /* .pipe(gulpif(config.mode.isProd, cleancss())) */

        // note: we use minify html to minify css files
        // so as to ensure that angular placeholders and
        // bindings are not removed from the minified files
        .pipe(gulpif(config.mode.isProd, minifyHTML({
            conditionals: true, empty: true, spare: true
        })))

        // strip comments from the css files
        .pipe(gulpif(config.mode.isStripped, stripCssComments({
            preserve: false // remove all comments
        })))

        // output the minified html files
        .pipe(gulp.dest(destination));
});

// 3. HTML - TEMPLATES
gulp.task('html:templates', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.html.templates + '**/*.html' // view files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.html.templates;

    //  return task stream
    return gulp.src(source)
        // include all the patials
        .pipe(fileinclude({ prefix: '@@', basepath: '@file', indent: true }))

        // minify the html files
        .pipe(gulpif(config.mode.isProd, minifyHTML({
            conditionals: true, empty: true, spare: true
        })))

        // output the minified html files
        .pipe(gulp.dest(destination));
});

// 3.1 HTML - TEMPLATES
gulp.task('html:templates:css', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.html.templates + '**/*.css' // view files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.html.templates;

    //  return task stream
    return gulp.src(source)
        // minify the css files
        /* .pipe(gulpif(config.mode.isProd, cleancss())) */

        // note: we use minify html to minify css files
        // so as to ensure that angular placeholders and
        // bindings are not removed from the minified files
        .pipe(gulpif(config.mode.isProd, minifyHTML({
            conditionals: true, empty: true, spare: true
        })))

        // strip comments from the css files
        .pipe(gulpif(config.mode.isStripped, stripCssComments({
            preserve: false // remove all comments
        })))

        // output the minified html files
        .pipe(gulp.dest(destination));
});


// 4. HTML - COPY
gulp.task('html:copy', function() {
    // only copy files when
    // in deployment mode
    if(!config.mode.isDeploy) {
        return false;
    }

    // run all tasks in squence
    return runSequence(
        'html:copy:views', // copy view files
        'html:copy:templates'  // copy template files
    );
});

// 4.1. HTML - COPY - VIEWS
gulp.task('html:copy:views', function() {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.html.views + '**/*.*' // view files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.html.views;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});

// 4.2. HTML - COPY - DEPENDENCIES
gulp.task('html:copy:templates', function() {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.html.templates + '**/*.*' // template files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.html.templates;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});

// 5. HTML - WATCH
gulp.task('html:watch', function() {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.html.main, // main file
        config.files.root.dev + config.files.html.views + '**/*.*', // view files
        config.files.root.dev + config.files.html.templates + '**/*.*' // template files
    ];

    // push watcher into the main
    // array, and return the new size
    return watchers.push(gulp.watch(
        source,  // files to watch for
        ['html:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
