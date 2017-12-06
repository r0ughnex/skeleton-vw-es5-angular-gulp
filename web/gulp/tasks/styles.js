'use strict';

// -------------------------------------
//   Gulp - Styles
// -------------------------------------
/**
    * @name styles
    * @desc The js file that contains the functions
            for compiling styles for the app.
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
var sass = require('gulp-sass');
var bless = require('gulp-bless');
var cleancss = require('gulp-clean-css');
var autoprefixer = require('gulp-autoprefixer');
var stripCssComments = require('gulp-strip-css-comments');

var sourcemaps = require('gulp-sourcemaps');
var wiredep = require('wiredep');

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../config.js').getConfig();
var watchers = require('../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// STYLES - MAIN TASK
// ----------------------------------------
gulp.task('styles', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'styles:default',
        'styles:watch',
        callback
    );
});

// 0. STYLES - DEFAULT TASK
gulp.task('styles:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'styles:clean',
        'styles:dependencies',
        'styles:app',
        'styles:bless',
        'styles:copy',
        callback
    );
});

// 1. STYLES - CLEAN
gulp.task('styles:clean', function () {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.styles.css, // app files
        config.files.root.prod + config.files.styles.dependencies // dependency files
    ];

    // add deploy folders / files into
    // source in deployment mode
    if(config.mode.isDeploy) {
        source.push(config.files.root.deploy + config.files.styles.css); // app files
        source.push(config.files.root.deploy + config.files.styles.dependencies); // dependency files
    }

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. STYLES - DEPENDENCIES
gulp.task('styles:dependencies', function () {
    // get all necessary dependencies
    // from bower in specified order
    var dependencies = wiredep({
        directory: 'bower_components', // root folder
        dependencies: true, // include dependencies
        devDependencies: false, // remove dev dependencies
        exclude: config.exclude // exclude from dependencies
    });

    // destination folder for the task
    var destination = config.files.root.prod + config.files.styles.dependencies;

    // return false if no
    // css dependencies exist
    if(!dependencies.css) { return false; }

    // else use the dependencies
    // and return task stream
    else { return gulp.src(dependencies.css)

        // create source map for the files
        .pipe(gulpif(config.mode.isMapped, sourcemaps.init()))

        .pipe(concat('dependencies.css')) // combine all css files
        .pipe(gulp.dest(destination)) // output the combined css file

        .pipe(gulpif(config.mode.isProd, cleancss())) // minify the prefixed css file
        .pipe(rename({ suffix: '.min' })) // add a .min suffix for the minified file

        .pipe(gulpif(config.mode.isMapped, sourcemaps.write('./'))) // create source maps
        .pipe(gulp.dest(destination)); // output the minified css file
    }
});

// 3. STYLES - APP
gulp.task('styles:app', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.styles.main // main app file
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.styles.css;

    //  return task stream
    return gulp.src(source)

        // create source map for the files
        .pipe(gulpif(config.mode.isMapped, sourcemaps.init()))

        // config options for
        // the output css files
        .pipe(sass({
            // can be compressed, nested, expanded
            outputStyle: config.mode.isProd ? 'compressed': 'expanded',
            precision: 6 // precesion of decimal values, default is 5
        }))

        .pipe(autoprefixer('> 0%')) // add vendor specific prefixes
        .pipe(gulp.dest(destination)) // output the prefixed css file

        /*.pipe(gulpif(config.mode.isProd, cleancss()))*/ // minify the css file (done with bless)
        .pipe(rename({ suffix: '.min' })) // add a .min suffix for the minified file

        .pipe(gulpif(config.mode.isMapped, sourcemaps.write('./'))) // create source maps
        .pipe(gulp.dest(destination)); // output the minified css file
});

// 4. STYLES - BLESS
gulp.task('styles:bless', function() {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.styles.css + '**/*min.css', // app files
        config.files.root.prod + config.files.styles.dependencies + '**/*min.css' // dependency files
    ];

    // return task stream
    return gulp.src(source, { base: './' })

        // strip comments from the css files
        .pipe(gulpif(config.mode.isStripped, stripCssComments({
            preserve: false // remove all comments
        })))

        .pipe(bless()) // bless the css files
        .pipe(gulpif(config.mode.isProd, cleancss())) // minify the css files

        // output blessed files in the
        // same folder, under the same name
        .pipe(gulp.dest('./'));
});

// 5. STYLES - COPY
gulp.task('styles:copy', function() {
    // only copy files when
    // in deployment mode
    if(!config.mode.isDeploy) {
        return false;
    }

    // run all tasks in squence
    return runSequence(
        'styles:copy:app', // copy app files
        'styles:copy:dependencies' // copy dependency files
    );
});

// 5.1. STYLES - COPY - APP
gulp.task('styles:copy:app', function() {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.styles.css + '**/*.*' // app files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.styles.css;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});

// 5.2. STYLES - COPY - DEPENDENCIES
gulp.task('styles:copy:dependencies', function() {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.styles.dependencies + '**/*.*' // dependency files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.styles.dependencies;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});

// 6. STYLES - WATCH
gulp.task('styles:watch', function() {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.styles.sass + '**/*.*' // app files
    ];

    // push watcher into the main
    // array, and return the new size
    return watchers.push(gulp.watch(
        source,  // files to watch for
        ['styles:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
