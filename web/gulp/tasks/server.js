'use strict';

// -------------------------------------
//   Gulp - Server
// -------------------------------------
/**
    * @name server
    * @desc The js file that contains the functions
            for running servers for the app.
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

// SERVER
var webserver = require('gulp-webserver');
var open = require('gulp-open');

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../config.js').getConfig();
var watchers = require('../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// SERVER - MAIN TASK
// ----------------------------------------
gulp.task('serve', function() {
    // file to fall back to
    // (relative to webserver root)
    // (changes depending on gulp mode)
    var fallback = !config.mode.isDeploy ?
                    config.files.root.prod + config.files.html.main:
                    config.files.root.deploy + config.files.html.main;

    //  return task stream
    return gulp.src('./')

        // serve the index file in a web server
        // (if not in deployment mode)
        .pipe(webserver({
            fallback: fallback, // fallback file for the server
            open: config.server.open, // flag to open the browser

            port: config.server.port, // port of the webserver
            https: config.server.https, // flag to use https in the url

            livereload: {
                enable: config.server.livereload, // flag for reloading browser
                filter: function(fileName) {
                    // livereload is disabled on html files
                    // so as to allow access to the main
                    // index.html file, for other tasks
                    if(fileName.includes(".html")) {
                        return false;
                    }

                    // enabled for all other files
                    // (note: after the index.html
                    // is regenerated, livereload
                    // is then triggered manually)
                    else { return true; }
                }
            }
        }));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
