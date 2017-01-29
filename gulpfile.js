/*****************************************************************************
	REQUIREMENTS (no package file, install these yourself for now)
******************************************************************************/

var gulp = require('gulp');
var exec = require('child_process').exec;
var htmlmin = require('gulp-htmlmin');
var uglify = require("gulp-uglify");
var concat = require('gulp-concat');
var fs = require('fs');
var zip = require('gulp-zip');
var babel = require('gulp-babel');
var util = require('gulp-util');
var inlinesource = require('gulp-inline-source');
var inject = require('gulp-inject');
var series = require('stream-series');
var print = require('gulp-print');

/*****************************************************************************
 * Source files 
******************************************************************************/

// all js files needed, in order of inclusion
var jsfiles = [
	//'source/js/*.js'
	'source/js/Base.js',  
	'source/js/Sports.js', 
	'source/js/NBA.js', 
	//'source/js/NFLoff.js',
	//'source/js/NFLnews.js', 
	'source/js/Links.js', 
	//'source/js/bookmarksBar.js',
	'source/js/widget.js',
	'source/js/sport.js',
	'source/js/NHL.js',
	'source/js/MLB.js',
	'source/js/NFL_new.js',
	'source/js/pageHandler.js',
	'source/js/googleAnalytics.js'
];

// ES6 files need to be put through babel before they can be uglified
var jsfilesES6 = [
	'source/js/widget.js',
	'source/js/sport.js',
	'source/js/NHL.js',
	'source/js/MLB.js',
	'source/js/NFL_new.js',
	//'source/js/bookmarksBar.js',
];

// libraries to be included, in order
var libs = [
	'source/libs/jquery-2.1.4.min.js',
	//'source/libs/jquery-ui.min.js', // used to be needed because of $.highlight
	//'source/libs/bootstrap-3.3.5-dist/js/bootstrap.min.js',
	'source/libs/tether.min.js',
	'source/libs/bootstrap-4.0.0-dist/js/bootstrap.min.js',
	//'source/libs/bootstrap_custom/js/bootstrap.min.js',
	//'source/libs/mdl/material.min.js',
	'source/libs/jquery.xml2json.js',
	//'source/libs/countdown.min.js',
	'source/libs/handlebars.runtimev4.0.5.min.js',
];

// css files, will be inlined
var cssFiles = [
	//'source/libs/bootstrap-3.3.5-dist/css/bootstrap.min.css',
	'source/libs/bootstrap-4.0.0-dist/css/bootstrap.min.css',
	//'source/libs/mdl/material.min.css',
];


/*****************************************************************************
 * Copy included files into /src/ where they are part of the dev loaded 
 * extension in Chrome
******************************************************************************/

function moveLibs () {
	return gulp.src(libs)
	.pipe(concat('libs.min.js'))
	.pipe(gulp.dest('Chrome/src/'));
};

function moveJS() {
	return gulp.src(jsfiles)
	.pipe(gulp.dest('Chrome/src/'));
};

function moveCSS() {
	return gulp.src(cssFiles)
	.pipe(gulp.dest('Chrome/src/'));
};

function moveHTML() {
	var myJsFiles = ['Chrome/src/libs.min.js', 'Chrome/src/templates.js'];

	// inject (  src([], {read: false})   , optionsForInject    )
	return gulp.src('source/new_tab.html')
		.pipe(inject(
			gulp.src( myJsFiles.concat(jsfiles), 
			{
				read: false, 
			})//.pipe(print())
			, {
				ignorePath: ['source/js/', 'source/libs/', 'source/libs/bootstrap-4.0.0-dist/js/',
				'Chrome/src/'], 
				addRootSlash: false
			}
		))
		.pipe(inject(
			gulp.src(cssFiles, 
			{
				read: false, 
				//'cwd': __dirname + '/Chrome/src'
			}), 
			{
				ignorePath: 'source/libs/bootstrap-4.0.0-dist/css/', 
				addRootSlash: false
			}
		))
		.pipe(gulp.dest('Chrome/src/'));
};

/*****************************************************************************
 * Transform source files into ones that will go into production
******************************************************************************/

function handlebars(cb) {
	return exec('handlebars -m ./source/templates/> ./Chrome/src/templates.js', 
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
	});
};

function minifyHTML() {

	var libsToInclude = ['Chrome/src/libs.min.js', 'Chrome/src/templates.js', 'Chrome/src/app.min.js'];

	return gulp.src('source/new_tab.html')
		.pipe(inlinesource())
		.pipe(inject(
			gulp.src(libsToInclude, 
				{read: false})//.pipe(print())
				,{
					ignorePath: 'Chrome/src/', 
					addRootSlash: false
				})
		)
		.pipe(htmlmin({
			collapseWhitespace: true, 
			removeComments: true,
			minifyCSS: true,
			//removeStyleLinkTypeAttributes: true,
			//removeScriptTypeAttributes: true
		}))
	.pipe(gulp.dest('Chrome/src/'))
};

function uglifyJS() {
	return gulp.src(jsfiles)
		.pipe(babel({
			only: jsfilesES6,
			presets: ['es2015']
		}))
		.pipe(concat('app.min.js'))
		.pipe(uglify().on('error', util.log))
		.pipe(gulp.dest('Chrome/src/'));
};

function concatLibs() {
	// libraries are already minified, so just combine
	return gulp.src(libs)
		.pipe(concat('libs.min.js'))
		.pipe(gulp.dest('Chrome/src/'));
};

/*****************************************************************************
 * Gulp tasks that can be called from cl or Visual Studio Code
******************************************************************************/

// no effeciency steps, can see error lines, etc.
gulp.task('dev', gulp.series(handlebars, moveLibs, moveJS, moveCSS, moveHTML, function watch() {
	gulp.watch(['./source/templates/*.handlebars'], handlebars);
	gulp.watch(jsfiles, moveJS);
	gulp.watch(['./source/*.html'], moveHTML);
}));

// full effeciency workflow
gulp.task('compress', gulp.series(handlebars, concatLibs, uglifyJS, minifyHTML, function watch() {
	gulp.watch(['./source/templates/*.handlebars'], handlebars);
	gulp.watch(jsfiles, uglifyJS);
	gulp.watch(['./source/*.html'], minifyHTML);
}));

gulp.task('default', gulp.series('dev'));

// zips the extension with the name of current version # from the manifest file
gulp.task('release', function() {
	var json = JSON.parse(fs.readFileSync('./Chrome/manifest.json'));
	var file_name = json.version.split('.').join('_');

	console.log(file_name);

	return gulp.src('Chrome/**')
		.pipe(zip(file_name+'.zip'))
		.pipe(gulp.dest('.'));
});

// TODO: right now have to run dev/compress twice after cleaning
gulp.task('clean', function(cb) {
	// everything built goes into /src
	exec('rm Chrome/src/*', 
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
	});

	console.log('cleaned Chrome/src/');
});