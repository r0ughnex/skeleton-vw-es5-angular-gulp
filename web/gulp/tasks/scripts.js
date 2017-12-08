'use strict';

// -------------------------------------
//   Gulp - Scripts
// -------------------------------------
/**
    * @name scripts
    * @desc The js file that contains the functions
            for compiling scripts for the app.
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

// SCRIPTS
var stream = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

var browserify  = require('browserify');
var gulpBrowser = require("gulp-browser");

var uglify = require('gulp-uglify');
var replace = require('gulp-replace');
var ngAnnotate = require('gulp-ng-annotate');
var stripDebug = require('gulp-strip-debug');

var sourcemaps = require('gulp-sourcemaps');
var notify = require('gulp-notify');
var wiredep = require('wiredep');

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../config.js').getConfig();
var watchers = require('../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// SCRIPTS - MAIN TASK
// ----------------------------------------
gulp.task('scripts', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'scripts:default',
        'scripts:watch',
        callback
    );
});

// 0. SCRIPTS - DEFAULT TASK
gulp.task('scripts:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'scripts:clean',
        'scripts:dependencies',
        'scripts:replace',
        'scripts:app',
        'scripts:workers',
        'scripts:copy',
        callback
    );
});

// 1. SCRIPTS - CLEAN
gulp.task('scripts:clean', function () {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.scripts.js, // app files
        config.files.root.prod + config.files.scripts.dependencies // dependency files
    ];

    // add deploy folders / files into
    // source in deployment mode
    if(config.mode.isDeploy) {
        source.push(config.files.root.deploy + config.files.scripts.js); // app files
        source.push(config.files.root.deploy + config.files.scripts.dependencies); // dependency files
    }

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. SCRIPTS - DEPENDENCIES
gulp.task('scripts:dependencies', function () {
    // get all necessary dependencies
    // from bower in specified order
    var dependencies = wiredep({
        directory: 'bower_components', // root folder
        dependencies: true, // include dependencies
        devDependencies: false, // remove dev dependencies
        exclude: config.exclude // exclude from dependencies
    });

    // destination folder for the task
    var destination = config.files.root.prod + config.files.scripts.dependencies;
    var stripCountMaxm =  0; // the max no.of of files that require stripping of logs
    var stripCountCurr = -1; // no.of files that have been set to be stripped of logs

    // @name _needsStripping
    // @desc conditional function that determines if stripping of logs is required for the given file
    // @param {Vinyl} file - the node js vinyl file object that requires stripping of logs or not
    // @return {Boolean} needsStripping - true or false, based on conditional checks
    function _needsStripping(file) {
        // only proceed if the config flag has been set
        if(!config.mode.isStripped) { return false; }

        // only proceed if the current count is less than max
        if(stripCountCurr >= stripCountMaxm) { return false; }

        // only proceed if custom plugins exist
        if(!Array.isArray(config.bower_custom)
        || !config.bower_custom.length) { return false; } // no custom plugins
        else { stripCountMaxm = config.bower_custom.length; } // set the maximum

        // check if the current strip count is valid
        if(stripCountCurr < 0) { stripCountCurr++; }

        // get the path of the given file to check
        var filePath = file.path;

        // default boolean flag to indicate if stripping
        // of logs is required for the given file or not
        // (note: by default plugins don't need stripping)
        var needsStripping = false;

        // if the file path contains the
        // name of a bower_custom plugin
        config.bower_custom.some(function(name) {
            // replacing the slahes are important due to path differences in different os
            if(filePath.includes(name) || filePath.includes(name.replace(/\//g, "\\"))) {
                // should be stripped because custom
                // plugins might contain console
                // logs in their source files
                needsStripping = true;
                stripCountCurr++;
            }

            // to short circuit the some loop,
            // only proceed if the stripping flag
            // has not been set to true, or if the
            // the count is above max allowed limit
            return (needsStripping === true ||
                    stripCountCurr >= stripCountMaxm);
        });

        // all the other dependencies under
        // bower_components can be ignored
        return needsStripping;
    }

    // return false if no
    // js dependencies exist
    if(!dependencies.js) { return false; }

    // else use the dependencies
    // and return task stream
    else { return gulp.src(dependencies.js)

        // create source map for the files
        .pipe(gulpif(config.mode.isMapped, sourcemaps.init()))

        // conditionally strip console logs and alerts
        .pipe(gulpif(_needsStripping, stripDebug()))

        .pipe(concat('dependencies.js')) // combine all js files
        .pipe(gulp.dest(destination)) // output the combined js file

        .pipe(gulpif(config.mode.isProd, uglify())) // minify the combined file
        .pipe(rename({ suffix: '.min' })) // add a .min suffix for the minified file

        .pipe(gulpif(config.mode.isMapped, sourcemaps.write('./'))) // create source maps
        .pipe(gulp.dest(destination)); // output the minified js file
    }
});

// 3. SCRIPTS - REPLACE
gulp.task('scripts:replace', function(){
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.scripts.main, // main app file
        config.files.root.dev + config.files.scripts.config // config app file
    ];

    // destination folder for the task
    var destination = config.files.root.dev + config.files.scripts.js;

    //  return task stream
    return gulp.src(source)

        // turn production mode on/off in the app
        .pipe(gulpif(config.mode.isProd, replace('isProd = false', 'isProd = true')))
        .pipe(gulpif(!config.mode.isProd, replace('isProd = true', 'isProd = false')))

        // turn deployment mode on/off in the app
        .pipe(gulpif(config.mode.isDeploy, replace('isDeploy = false', 'isDeploy = true')))
        .pipe(gulpif(!config.mode.isDeploy, replace('isDeploy = true', 'isDeploy = false')))

        // turn debug info mode on/off in the app
        .pipe(gulpif(config.mode.isProd, replace('$compileProvider.debugInfoEnabled(true)', '$compileProvider.debugInfoEnabled(false)')))
        .pipe(gulpif(!config.mode.isProd, replace('$compileProvider.debugInfoEnabled(false)', '$compileProvider.debugInfoEnabled(true)')))

        // output file to the same folder
        .pipe(gulp.dest(destination));
});

// 4. SCRIPTS - APP
gulp.task('scripts:app', function () {
    // source folders / files for the task
    var source = config.files.root.dev + config.files.scripts.main // main app file
    var name = source.split('/');
    name = name[name.length - 1];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.scripts.js;

    // compile all require statements
    return browserify(source)

        // combine all js files
        .bundle().on('error', function(error){
            // output a error message
            notify({
                title: 'Gulp Task Error',
                message: '(' + error.plugin + '): ' + error.message
            }).write(error);

            // emit the end event
            // to properly end the task
            this.emit('end');
        })

        // return task stream
        .pipe(stream(name))
        .pipe(buffer())

        // create source map for the files
        .pipe(gulpif(config.mode.isMapped, sourcemaps.init()))

        // output the combined js file
        .pipe(gulp.dest(destination))
        .pipe(gulpif(config.mode.isProd, ngAnnotate())) // annotate the combined js file
        .pipe(gulpif(config.mode.isProd, replace('"ngInject"; ', ''))) // replace annotate tags
        .pipe(gulpif(config.mode.isProd, replace('"ngInject";', ''))) // replace annotate tags

        .pipe(gulpif(config.mode.isProd, uglify())) // minify the combined file
        .pipe(rename({ suffix: '.min' })) // add a .min suffix for the minified file

        .pipe(gulpif(config.mode.isStripped, stripDebug())) // strip console logs and alerts
        .pipe(gulpif(config.mode.isMapped, sourcemaps.write('./'))) // create source maps
        .pipe(gulp.dest(destination)); // output the minified js file
});

// 5. SCRIPTS - Workers
gulp.task('scripts:workers', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.scripts.js + '**/*.worker*' // worker files
    ];

    // destination folder for the task
    var destination = config.files.root.prod + config.files.scripts.js;

    // return task stream
    return gulp.src(source) /*
        // compile all require statements
        // note: not required for workers
        .pipe(gulpBrowser.browserify())

        // create source map for the files
        // note: not required for workers
        .pipe(gulpif(config.mode.isMapped, sourcemaps.init())) */

        // output the combined js file
        .pipe(gulp.dest(destination))

        .pipe(gulpif(config.mode.isProd, uglify())) // minify the combined file
        .pipe(rename({ suffix: '.min' })) // add a .min suffix for the minified file

        .pipe(gulpif(config.mode.isStripped, stripDebug())) /* // strip console logs and alerts
        .pipe(gulpif(config.mode.isMapped, sourcemaps.write('./'))) // create source maps */
        .pipe(gulp.dest(destination)); // output the minified js file
});

// 6. SCRIPTS - COPY
gulp.task('scripts:copy', function() {
    // only copy files when
    // in deployment mode
    if(!config.mode.isDeploy) {
        return false;
    }

    // run all tasks in squence
    return runSequence(
        'scripts:copy:app', // copy app files
        'scripts:copy:dependencies' // copy dependency files
    );
});

// 6.1. SCRIPTS - COPY - APP
gulp.task('scripts:copy:app', function() {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.scripts.js + '**/*.*' // app files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.scripts.js;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});

// 6.2. SCRIPTS - COPY - DEPENDENCIES
gulp.task('scripts:copy:dependencies', function() {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.scripts.dependencies + '**/*.*' // dependency files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.scripts.dependencies;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});

// 7. SCRIPTS - WATCH
gulp.task('scripts:watch', function() {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.scripts.js + '**/*.*' // app files
    ];

    // push watcher into the main
    // array, and return the new size
    return watchers.push(gulp.watch(
        source,  // files to watch for
        ['scripts:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
