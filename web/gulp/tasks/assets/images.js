'use strict';

// -------------------------------------
//   Gulp - Images
// -------------------------------------
/**
    * @name images
    * @desc The js file that contains the functions
            for optimizing images for the app.
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

// IMAGES
var jimp = require('jimp');
var imagemin = require('gulp-imagemin');
var colorThief = require('color-thief-jimp');

// FILES
var q = require('q');
var fs = require('fs');
var jsonfile = require('jsonfile');
var sortObj = require('sort-object');
fs.readdirRecursive = require('recursive-readdir');

// -------------------
// GET CONFIG OPTIONS
// -------------------
var config = require('../../config.js').getConfig();
var watchers = require('../../config.js').getWatchers();

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
// ----------------------------------------
// IMAGES - MAIN TASK
// ----------------------------------------
gulp.task('assets:images', function(callback) {
    // run the default task first,
    // and then the watch task, and
    // finally the callback on complete
    return runSequence(
        'images:default',
        'images:watch',
        callback
    );
});

// 0. IMAGES - DEFAULT TASK
gulp.task('images:default', function(callback) {
    // run all tasks in sequence
    // and the callback on complete
    return runSequence(
        'images:clean',
        'images:color',
        'images:optimize',
        'images:copy',
        callback
    );
});

// 1. IMAGES - CLEAN
gulp.task('images:clean', function () {
    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.assets.images // all files
    ];

    // add deploy folders / files into
    // source in deployment mode
    if(config.mode.isDeploy) {
       source.push(config.files.root.deploy + config.files.assets.images); // all files
    }

    //  return task stream
    return gulp.src(source, { read: false })

        // clean the folders / files
        .pipe(rimraf({ force: true }));
});

// 2. IMAGES - COLOR
gulp.task('images:color', function () {
    // source folders / files for the task
    var source = config.files.root.dev + config.files.assets.images;

    // destination folder for the task
    var destination = config.files.root.dev + config.files.data + 'dominant-colors.json';

    // create a deferred promise object
    var deferred = q.defer();

    // only proceed if the hasDOMColors boolean flag has been set
    var hasDOMColors = config.options.hasDOMColors; // get the flag
    if(typeof hasDOMColors !== "boolean" || !hasDOMColors) {
        // resolve the promise with false
        deferred.resolve(false);
    }

    // the object that holds all the dominant colors
    // in the format key: value as { imageName: color }
    // (note: it is important that the image names are unique)
    var colors = {};

    // custom function to check if the given image name is valid
    // @param {String} name - name of the image to be perform the check on
    // @params (Boolean} - true or false depending on validity of name given
    fs.isImage = function(name) {
        // dominant colors should only ever
        // be used as a background color on
        // non-transparent *.jpg, *.gif images
        if((name.includes('.jpg') /* // is a *.jpg image
         || name.includes('.png') */ // is a *.png image
         || name.includes('.gif'))   // is a *.gif image
         && !name.includes('layout') // image used for layout
         && !name.includes('transparent')) { // is transparent
            return true;
        } else { return false; }
    }

    // custom function to write the json object
    // into a file and resolve the promise
    // @param {Object} obj - json object written into the file
    // @params (String} - dest - the destination path/name of the file
    fs.resolve = function(obj, dest) {
        // sort the original obj
        // and create a new copy
        var objCopy = sortObj(obj);

        // write the object into a json data file
        jsonfile.writeFile(dest, objCopy, {spaces: 4}, function(writeError) {
            if(writeError) { console.error(writeError); } // write errors
            deferred.resolve(true); // resolve the promise with true
        });
    };

    // get all the image files in the source
    fs.readdirRecursive(source, function(readDirError, imageNames) {
        // count to keep track of read images
        var imagesRead = 0;

        // filter the image names to only include
        // valid image names to prevent runtime errors
        var filteredNames = [];
        imageNames.forEach(function(imageName, index) {
            // replace all \' to '/' and push valid
            // image names into the filtered array
            imageName = imageName.replace(/\\/g, '/');
            if(fs.isImage(imageName)) { filteredNames.push(imageName); }
        });

        // loop through all the images
        filteredNames.forEach(function(imagePath, index) {
            // get the relative image path
            imagePath = './' + imagePath;
            var imageName = imagePath.split('/').reverse()[0];

            // read the image in the given path
            jimp.read(imagePath, function (readImageError, image) {
                // try
                try {
                    // get the dominant color of the image
                    var color = 'rgb(' + colorThief.getColor(image) + ')';

                    imagesRead++; // increase read count
                    colors[imageName] = color; // push color into object

                    // if all images have been read  write the
                    // object into a file and resolve the promise
                    if(imagesRead == (filteredNames.length)) {
                        fs.resolve(colors, destination);
                    }
                }

                // on error
                catch(error) {
                    imagesRead++; // increase read count
                    console.log(imageName + ': ' + error);

                    // if all images have been read  write the
                    // object into a file and resolve the promise
                    if(imagesRead == (filteredNames.length)) {
                        fs.resolve(colors, destination);
                    }
                }
            }); // jimp.read end
        }); // imagesNames.forEach end
    }); // fs.readdir end

    // return the deferred promise
    return deferred.promise;
});


// 3. IMAGES - OPTIMIZE
gulp.task('images:optimize', function () {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.images + '**/*.ico', // ico files
        config.files.root.dev + config.files.assets.images + '**/*.jpg', // jpg files
        config.files.root.dev + config.files.assets.images + '**/*.png', // png files
        config.files.root.dev + config.files.assets.images + '**/*.gif', // gif files
        config.files.root.dev + config.files.assets.images + '**/*.svg'  // svg files
    ];

    // destination folder for the task (note: to ensure source images are not overwritten)
    var destination = config.files.root.prod + config.files.assets.images;

    //  return task stream
    return gulp.src(source)

        // minify and optimize all the image files
        // (note: only required in production mode)
        .pipe(gulpif(config.mode.isProd, imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true,
            multipass: true
        })))

        // output the minified image files
        .pipe(gulp.dest(destination));
});


// 4. IMAGES - COPY
gulp.task('images:copy', function() {
    // only copy files when in deployment mode
    if(!config.mode.isDeploy) { return false; }

    // source folders / files for the task
    var source = [
        config.files.root.prod + config.files.assets.images + '**/*.*' // all files
    ];

    // destination folder for the task
    var destination = config.files.root.deploy + config.files.assets.images;

    // return task stream
    return gulp.src(source)

        // copy files to new folder (in deployment mode)
        .pipe(gulpif(config.mode.isDeploy, gulp.dest(destination)));
});


// 5. IMAGES - WATCH
gulp.task('images:watch', function() {
    // source folders / files for the task
    var source = [
        config.files.root.dev + config.files.assets.images + '**/*.*' // all files
    ];

    // push watcher into the main
    // array, and return the new size
    return watchers.push(gulp.watch(
        source,  // files to watch for
        ['images:default'] // tasks to run on change
    ));
});

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
