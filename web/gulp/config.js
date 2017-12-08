'use strict';

// -------------------------------------
//   Gulp - Config
// -------------------------------------
/**
    * @name config
    * @desc The main js file that contains the
            gulp config options for the app.
**/

// -----------------------
// GLOBAL CONFIG VARIABLE
// -----------------------
var config = {
    // -------------------
    // OLD CONFIG OPTIONS
    // -------------------
    // flags for gulp mode
    // (and mode options)
    mode: {
        isProd: false,   // turn production mode on/off,
        isDeploy: false, // turn deployment mode on/off

        isMapped: true,  // turn creating source maps on/off
        isWatched: true, // turn watchers on files, assets on/off
        isStripped: false, // turn stripping comments, logs on/off

        hasPHP: false, // turn creating php index file on/off
        hasASPX: true, // turn creating aspx index file on/off
        hasPartial: false // turn creating partial _index file on/off
    },

    // files to exclude while
    // wiring dependencies
    // (uses regex)
    exclude: [],

    // base href for the app
    // used in the index.html
    href: {
        dev: "/",  // for development files
        prod: "/", // for compiled production files
        deploy: "/build/", // for compiled deployment files

        php: "/skeleton-vw-es5-angular-gulp/", // for the genrated php index file
        aspx: "/skeleton-vw-es5-angular-gulp/" // for the generated aspx index file
    },

    // locations of source
    // files and folders
    files: {
        // root
        root: {
            dev: "src/",   // for development files
            prod: "dist/", // for compiled production files
            deploy: "build/", // for compiled deployment files

            php: "",  // for the genrated php index file
            aspx: "", // for the generated aspx index file
            index: "index.html" // the main default index html file
        },

        // for html
        html: {
            main: "index.html", // index file
            views: "static/views/", // for views
            templates: "static/templates/" // for templates
        },

        // for styles
        styles: {
            sass: "sass/", // for sass
            main: "sass/app.scss", // the main sass file

            css: "css/", // for compiled css
            dependencies: "css/dependencies/" // for compiled dependencies
        },

        // for scripts
        scripts: {
            js: "js/", // for js
            main: "js/app.js", // the main js file
            config: "js/config.js", // the config js file
            dependencies: "js/dependencies/" // for compiled dependencies
        },

        // for data
        data: "data/",

        // for assets
        assets: {
            fonts : "assets/fonts/",  // for fonts
            icons : "assets/icons/",  // for icons
            images: "assets/images/", // for images
            videos: "assets/videos/"  // for videos
        }
    },

    // options to be used
    // while creating fonts
    // from the given svg icons
    icons: {
        name: "icons-volkswagen-app", // the font name
        fileName: "_icons.scss", // icon file name
        className: "icon", // scss class prefix

        formats: ['svg', 'ttf', 'eot', 'woff'], // font formats
        fontPath: "../assets/fonts/", // relative font path
        stylePath: "../../sass/base/" // relative scss path
    },

    // option for the webserver used to serve
    // files in local / deploy environment
    server: {
        open: true, // flag to open browser
        port: 8000, // port of the webserver
        https: false, // flag to use https in the url
        livereload: false // flag for reloading browser
    },

    // -------------------
    // NEW CONFIG OPTIONS
    // -------------------
    options: {
        // setting hasDOMColors to true, generates a dominant-colors.json
        // file which contains the extracted dominant color for each
        // image in the format { key: value } as { imageName: color }
        // (note: so it is important that the image names are unique)
        hasDOMColors: true, // turn extracting dominant colors from images on/off
        hasCSSThemes: false // turn generation of css theme styles from data on/off
    },

    // folders referenced using a relative
    // path in the bower.json file, and were
    // injected while wiring dependencies that
    // may require stripping and minification
    // (note: these can also contain filenames)
    bower_custom: [
        "/lory/", "/swiper/",
        "/whitewater/", "/youtube-iframe-api/",
        "/plugin-inline-video/dependencies/", "/plugin-inline-video/"
    ],

    // folders that contain csutom json templates
    // with placeholders that must not be minified
    // (note: these can also contain filenames)
    json_custom: [
        "/user/",    // user templates
        "/content/", // content templates
        "/template/" // the main templates
    ]
};

// -------------------------------
// GLOBAL ARRAY TO STORE WATCHERS
// -------------------------------
var watchers = [];

// -----------------------------------------
// OBJECTS ? FUNCTION EXPOSED TO THE MODULE
// -----------------------------------------
module.exports = {
    // function to get the
    // config json object
    getConfig: function() {
        return config;
    },

    // function to get the
    // watchers array
    getWatchers: function() {
        return watchers;
    }
};

// ----------------------------------------------------------------------
// ----------------------------------------------------------------------
