var gulp = require('gulp'),
	es = require('event-stream'),
	fs = require('fs'),

	assert = require('assert'),
	del = require('del'),

	objectAssign = require('object-assign'),
	iconfont = require('gulp-iconfont'),
	iconfontCss = require('../');

var fontName = 'Icons',
	resultsDir = __dirname + '/results';

function run(type, dest, options) {
	var config = objectAssign({
			path: type,
			fontName: fontName,
			fontPath: '../fonts/',
			cssClass: 'custom-icon',
			targetPath: '../css/_icons.' + type
		}, options);

	return gulp.src(__dirname + '/fixtures/icons/*.svg')
		.pipe(iconfontCss(config).on('error', function(err) {
			console.log(err);
		}))
		.pipe(iconfont({
			fontName: fontName,
			formats: ['woff', 'svg'],
			timestamp: 1438703262
		}))
		.pipe(gulp.dest(dest + '/fonts/'));
}

function cleanUp(dest, done) {
	del(dest).then(function() {
		done();
	});
}

function testType(type, name) {
	it('should generate ' + name + ' file and fonts', function(done) {
		var dest = resultsDir + '_' + type;

		run(type, dest)
			.pipe(es.wait(function() {
				assert.equal(
					fs.readFileSync(dest + '/css/_icons.' + type, 'utf8'),
					fs.readFileSync(__dirname + '/expected/type/css/_icons.' + type, 'utf8')
				);

				assert.equal(
					fs.readFileSync(dest + '/fonts/Icons.woff', 'utf8'),
					fs.readFileSync(__dirname + '/expected/type/fonts/Icons.woff', 'utf8')
				);

				assert.equal(
					fs.readFileSync(dest + '/fonts/Icons.svg', 'utf8'),
					fs.readFileSync(__dirname + '/expected/type/fonts/Icons.svg', 'utf8')
				);

				cleanUp(dest, done);
			}));
	});
}

function testCodepointFirst() {
	it('glyphs should start with custom code point', function(done) {
		var dest = resultsDir + '_codepoint_first';

		run('css', dest, {
			firstGlyph: 0xE002
		})
			.pipe(es.wait(function() {
				assert.equal(
					fs.readFileSync(dest + '/css/_icons.css', 'utf8'),
					fs.readFileSync(__dirname + '/expected/codepoint_first/css/_icons.css', 'utf8')
				);

				assert.equal(
					fs.readFileSync(dest + '/fonts/Icons.svg', 'utf8'),
					fs.readFileSync(__dirname + '/expected/codepoint_first/fonts/Icons.svg', 'utf8')
				);

				del(dest).then(function() {
					done();
				});
			}));
	});
}

function testCodepointFixed() {
	it('glyphs should start with custom code point', function(done) {
		var dest = resultsDir + '_codepoint_first';

		run('css', dest, {
			fixedCodepoints: {
				github: 0xE010,
				twitter: 0xE020
			}
		})
			.pipe(es.wait(function() {
				assert.equal(
					fs.readFileSync(dest + '/css/_icons.css', 'utf8'),
					fs.readFileSync(__dirname + '/expected/codepoint_fixed/css/_icons.css', 'utf8')
				);

				assert.equal(
					fs.readFileSync(dest + '/fonts/Icons.svg', 'utf8'),
					fs.readFileSync(__dirname + '/expected/codepoint_fixed/fonts/Icons.svg', 'utf8')
				);

				del(dest).then(function() {
					done();
				});
			}));
	});
}

describe('gulp-iconfont-css', function() {
	testType('scss', 'SCSS');
	testType('less', 'Less');
	testType('css', 'CSS');

	testCodepointFirst();
	testCodepointFixed();
});
