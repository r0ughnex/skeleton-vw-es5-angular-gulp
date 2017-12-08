'use strict';

// -------------------------------------
//   Gulp - Index
// -------------------------------------
/**
    * @name index
    * @desc The js file that contains the functions
            for compiling the index file for the app.
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

// HTML
var fileinclude = require('gulp-file-include');
var minifyHTML = require('gulp-minify-html');
var stripCode = require('gulp-strip-code');

// INDEX
var wiredep = require('wiredep').stream;
var inject = require('gulp-inject');

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../config.js').getConfig();
var watchers = require('../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// INDEX - MAIN TASK
// ----------------------------------------
gulp.task('index', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'index:default',
        'index:watch',
        callback
    );
});

// 0. INDEX - DEFAULT TASK
gulp.task('index:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'index:clean',
        'index:wire',
        'index:replace',
        'index:copy',
        'index:aspx',
        'index:php',
        callback
    );
});

// 1. INDEX - CLEAN
gulp.task('index:clean', function () {
    // create an object for the source
    // folders and files for the task
    var file = {
        html: { main: null, partial: null }, // index html files
        aspx: { main: null, partial: null }, // index aspx files
        php: { main: null, partial: null }   // index php files
    };

    // populate the object with the source
    // folders and files for the task
    file.html.main = config.files.html.main // index html file
    file.aspx.main = file.html.main.replace('.html', '.aspx'); // index aspx file
    file.php.main  = file.html.main.replace('.html', '.php');  // index php file
    file.html.partial = file.html.main.replace('.html', '_partial.html'); // index html partial
    file.aspx.partial = file.aspx.main.replace('.aspx', '_partial.aspx'); // index aspx partial
    file.php.partial  = file.php.main.replace('.php', '_partial.php');    // index php partial

    // source folders / files for the task
    var source = [
        config.files.root.prod + file.html.main // index html file
    ];

    // add deploy folders / files into
    // source in deployment mode
    if(config.mode.isDeploy) {
        source.push(config.files.root.deploy + file.html.main); // index html file
        source.push(config.files.root.deploy + file.aspx.main); // index aspx file
        source.push(config.files.root.deploy + file.php.main);  // index php file
        source.push(config.files.root.deploy + file.html.partial); // index html partial
        source.push(config.files.root.deploy + file.aspx.partial); // index aspx partial
        source.push(config.files.root.deploy + file.php.partial);  // index php partial
    }

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. INDEX - WIRE
gulp.task('index:wire', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.html.main // index file
    ];

    // destination folder for the task
    var destination = config.files.root.prod;

    // script/style files that need to be indexed
    // (changes depending on gulp mode)
    var scripts = [], styles = [];

    // dev mode (and not deploy mode)
    if(!config.mode.isProd && !config.mode.isDeploy) {
        // styles (ignore dependancies and minified files)
        styles.push('!' + config.files.root.prod + config.files.styles.dependencies + '**/*.css'); // dependency files
        styles.push('!' + config.files.root.prod + config.files.styles.dependencies + '**/*.min.css'); // dependency files

        styles.push(config.files.root.prod + config.files.styles.css + '**/*.css'); // app files
        styles.push('!' + config.files.root.prod + config.files.styles.css + '**/*.min.css'); // app files

        // scripts (ignore dependancies and minified files)
        scripts.push('!' + config.files.root.prod + config.files.scripts.dependencies + '**/*.js'); // dependency files
        scripts.push('!' + config.files.root.prod + config.files.scripts.dependencies + '**/*.min.js'); // dependency files

        scripts.push(config.files.root.prod + config.files.scripts.js + '**/*.js'); // app files
        scripts.push('!' + config.files.root.prod + config.files.scripts.js + '**/*.min.js'); // app files
    }

    // prod mode (or dev in deploy mode)
    else {
        // styles (with dependancies and minified files)
        styles.push(config.files.root.prod + config.files.styles.dependencies + '**/*.min.css'); //minified dependency files
        styles.push(config.files.root.prod + config.files.styles.css + '**/*.min.css'); // minified app files

        // scripts (with dependancies and minified files)
        scripts.push(config.files.root.prod + config.files.scripts.dependencies + '**/*.min.js'); // minified dependency files
        scripts.push(config.files.root.prod + config.files.scripts.js + '**/*.min.js'); // minified app files
    }

    //  return task stream
    return gulp.src(source)

        // wire the dependencies
        .pipe(wiredep({
            directory: 'bower_components', // root folder
            dependencies: !config.mode.isProd && !config.mode.isDeploy, // include dependencies
            devDependencies: false, // remove dev dependencies
            exclude: config.exclude // exclude from dependencies
        }))

        // index scripts and styles
        .pipe(inject(gulp.src(styles.concat(scripts), {read: false})))

        // include all the patials
        .pipe(fileinclude({ prefix: '@@', basepath: '@file', indent: true }))

        // minify the index file
        .pipe(gulpif(config.mode.isProd, minifyHTML({
            conditionals: true, empty: true, spare: true
        })))

        // output the indexed/minified index file
        .pipe(gulp.dest(destination));
});

// 3. INDEX - REPLACE
gulp.task('index:replace', function() {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.html.main // index file
    ];

    // destination folder for the task
    var destination = config.files.root.prod;

    // various file paths for the tasks
    // (href, images, videos, css, js)
    var path = {
        dev: {
            href: '<base href="' + config.href.dev + '">', // base href
            images:  config.files.root.dev + config.files.assets.images, // images
            videos:  config.files.root.dev + config.files.assets.videos // videos
        },

        prod: {
            href: '<base href="' + config.href.prod + '">', // base href
            images:  config.files.root.prod + config.files.assets.images, // images
            videos:  config.files.root.prod + config.files.assets.videos // videos
        },

        deploy: {
            href: '<base href="' + config.href.deploy + '">', // base href
            images:  '' + config.files.assets.images, // images
            videos:  '' + config.files.assets.videos // videos
        }
    };

    // return task stream
    return gulp.src(source)

        // change the all the file paths from dev
        // to prod and then from prod to deploy
        .pipe(replace(path.dev.images, path.prod.images))
        .pipe(replace(path.dev.videos, path.prod.videos))
        .pipe(gulpif(config.mode.isDeploy, replace(path.prod.images, path.deploy.images)))
        .pipe(gulpif(config.mode.isDeploy, replace(path.prod.videos, path.deploy.videos)))

        // change the href base path from dev
        // to prod and then from prod to deploy
        .pipe(replace(path.dev.href, path.prod.href))
        .pipe(gulpif(config.mode.isDeploy, replace(path.prod.href, path.deploy.href)))

        // copy files to new folder
        .pipe(gulp.dest(destination));
});

// 4. INDEX - COPY
gulp.task('index:copy', function() {
    // only copy files when in deployment mode
    if(!config.mode.isDeploy) { return false; }

    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.html.main // index file
    ];

    // destination folder for the task
    var destination = config.files.root.deploy;

    // return task stream
    return gulp.src(source)

        // replace the '/dist/'absolute  paths used by
        // the js, css files with their relative path
        .pipe(replace('/' + config.files.root.prod, ''))

        // copy the files to the new folder
        .pipe(gulp.dest(destination))

        /* if the has partial flag has not been set */
        // remove strip code placeholder comments from the main files
        .pipe(gulpif(!config.mode.hasPartial, replace('<!-- [if /* remove:start */] -->', '')))
        .pipe(gulpif(!config.mode.hasPartial, replace('<!-- [if /* remove:end */] -->', '')))
        .pipe(gulpif(!config.mode.hasPartial, replace('<!--[if /* remove:start */]-->', '')))
        .pipe(gulpif(!config.mode.hasPartial, replace('<!--[if /* remove:end */]-->', '')))
        .pipe(gulpif(!config.mode.hasPartial, gulp.dest(destination)))

        /* if the has partial flag has been set */
        // strip code between the given placeholder
        // comments to generate the partial files
        .pipe(gulpif(config.mode.hasPartial, stripCode({
            start_comment: 'remove:start', // <!-- [if /* remove:start */] -->
            end_comment: 'remove:end' // <!-- [if /* remove:end */] -->
        })))

        // remove strip code leftover comments  from the partial files
        .pipe(gulpif(config.mode.hasPartial, replace('<!-- [if] -->', '')))
        .pipe(gulpif(config.mode.hasPartial, replace('<!--[if]-->', '')))

        // rename the partial files and write them to the same folder
        .pipe(gulpif(config.mode.hasPartial, rename({ suffix: '_partial' })))
        .pipe(gulpif(config.mode.hasPartial, gulp.dest(destination)));
});

// 5. INDEX - ASPX
gulp.task('index:aspx', function() {
   // only create aspx files when in deployment
    // mode and when hasASPX flag is set to true
    if(!config.mode.isDeploy || !config.mode.hasASPX) { return false; }

    // source folders / files for the task
    var source = [
        config.files.root.deploy + '*.html' // html files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy;

    // various file paths for the tasks
    // (href, images, videos, css, js)
    var path = {
        deploy: {
            href: '<base href="' + config.href.deploy + '">', // base href
            images:  '' + config.files.assets.images, // images
            videos:  '' + config.files.assets.videos, // videos
            styles:  '' + config.files.styles.css, // styles
            scripts: '' + config.files.scripts.js  // scripts
        },

        aspx: {
            href: '<base href="' + config.href.aspx + '">',  // base href
            images:  config.files.root.php + config.files.assets.images, // images
            videos:  config.files.root.php + config.files.assets.videos, // videos
            styles:  config.files.root.php + config.files.styles.css, // styles
            scripts: config.files.root.php + config.files.scripts.js  // scripts
        }
    };

    // base href paths for the task
    var hrefPaths = {
        aspx: '<base href="' + config.href.aspx + '">', // php - relative path
        deploy: '<base href="' + config.href.deploy + '">' // deploy - relative path
    };

    // return task stream
    return gulp.src(source)

        // change all the file paths from deploy to php
        .pipe(replace(path.deploy.images, path.aspx.images))
        .pipe(replace(path.deploy.videos, path.aspx.videos))
        .pipe(replace(path.deploy.styles, path.aspx.styles))
        .pipe(replace(path.deploy.scripts, path.aspx.scripts))

        // change href base path from deploy to aspx
        // create the aspx files in the same folder
        .pipe(replace(path.deploy.href, path.aspx.href))
        .pipe(rename({ extname: '.aspx' }))
        .pipe(gulp.dest(destination));
});

// 6. INDEX - PHP
gulp.task('index:php', function() {
    // only create php files when in deployment
    // mode and when hasPHP flag is set to true
    if(!config.mode.isDeploy || !config.mode.hasPHP) { return false; }

    // source folders / files for the task
    var source = [
        config.files.root.deploy + '*.html' // html files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy;

    // various file paths for the tasks
    // (href, images, videos, css, js)
    var path = {
        deploy: {
            href: '<base href="' + config.href.deploy + '">', // base href
            images:  '' + config.files.assets.images, // images
            videos:  '' + config.files.assets.videos, // videos
            styles:  '' + config.files.styles.css, // styles
            scripts: '' + config.files.scripts.js  // scripts
        },

        php: {
            href: '<base href="' + config.href.php + '">',  // base href
            images:  config.files.root.php + config.files.assets.images, // images
            videos:  config.files.root.php + config.files.assets.videos, // videos
            styles:  config.files.root.php + config.files.styles.css, // styles
            scripts: config.files.root.php + config.files.scripts.js  // scripts
        }
    };

    // base href paths for the task
    var hrefPaths = {
        php: '<base href="' + config.href.php + '">', // php - relative path
        deploy: '<base href="' + config.href.deploy + '">' // deploy - relative path
    };

    // return task stream
    return gulp.src(source)

        // change all the file paths from deploy to php
        .pipe(replace(path.deploy.images, path.php.images))
        .pipe(replace(path.deploy.videos, path.php.videos))
        .pipe(replace(path.deploy.styles, path.php.styles))
        .pipe(replace(path.deploy.scripts, path.php.scripts))

        // change href base path from deploy to php
        // create the php files in the same folder
        .pipe(replace(path.deploy.href, path.php.href))
        .pipe(rename({ extname: '.php' }))
        .pipe(gulp.dest(destination));
});

// 7. INDEX - WATCH
gulp.task('index:watch', function() {
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
        ['index:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
