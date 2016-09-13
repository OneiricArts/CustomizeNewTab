/******************************************************************************
*******************************************************************************
	REQUIREMENTS (no package file, install these yourself for now)
*******************************************************************************
******************************************************************************/

var gulp = require('gulp');
var exec = require('child_process').exec;
var htmlmin = require('gulp-htmlmin');
var uglify = require("gulp-uglify");
var concat = require('gulp-concat');
var fs = require('fs');
const zip = require('gulp-zip');
var babel = require('gulp-babel');
var util = require('gulp-util');
var inlinesource = require('gulp-inline-source');
var inject = require('gulp-inject');
var series = require('stream-series');
var print = require('gulp-print');


/******************************************************************************
*******************************************************************************
	Centralized lists of files used in multiple places
*******************************************************************************
******************************************************************************/

/* 
	used in 'compress' and 'watch'
	should only watch files i will actually compress
*/
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

var libs = [
	'source/libs/jquery-2.1.4.min.js',
	//'source/libs/jquery-ui.min.js', // used to be needed because of $.highlight
	'source/libs/bootstrap-3.3.5-dist/js/bootstrap.min.js',
	//'source/libs/bootstrap_custom/js/bootstrap.min.js',
	//'source/libs/mdl/material.min.js',
	//'source/libs/jquery.xml2json.js',
	//'source/libs/countdown.min.js',
	'source/libs/handlebars.runtimev4.0.5.min.js',
];

var jsfilesES6 = [
	'source/js/widget.js',
	'source/js/sport.js',
	'source/js/NHL.js',
	'source/js/MLB.js',
	'source/js/NFL_new.js',
	//'source/js/bookmarksBar.js',
]

var cssFiles = [
	'source/libs/bootstrap-3.3.5-dist/css/bootstrap.min.css',
	//'source/libs/mdl/material.min.css',
];


//gulp.task('default', ['minify', 'handlebars', 'compress', 'concatLibs']);

gulp.task('handlebars', function(cb) {
	return exec('handlebars -m ./source/templates/> ./Chrome/src/templates.js', 
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
	});
});

/******************************************************************************
*******************************************************************************
	DEV MODE
		- no uglify/minification/etc.
*******************************************************************************
******************************************************************************/

gulp.task('moveLibs', function() {
	gulp.src(libs)
	.pipe(concat('libs.min.js'))
	.pipe(gulp.dest('Chrome/src/'));
});

gulp.task('moveJS', function() {
	gulp.src(jsfiles)
	.pipe(gulp.dest('Chrome/src/'));
});

gulp.task('moveCSS', function() {
	gulp.src(cssFiles)
	.pipe(gulp.dest('Chrome/src/'));
});

gulp.task('moveHTML', function() {
	var myJsFiles = ['Chrome/src/libs.min.js', 'Chrome/src/templates.js'];

	// inject (  src([], {read: false})   , optionsForInject    )
	gulp.src('source/new_tab.html')
		.pipe(inject(
			gulp.src( myJsFiles.concat(jsfiles), 
			{
				read: false, 
			})//.pipe(print())
			, {
				ignorePath: ['source/js/', 'source/libs/', 'source/libs/bootstrap-3.3.5-dist/js/',
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
				ignorePath: 'source/libs/bootstrap-3.3.5-dist/css/', 
				addRootSlash: false
			}
		))
		.pipe(gulp.dest('Chrome/src/'));
});

gulp.task('dev', ['handlebars', 'moveLibs', 'moveJS', 'moveCSS', 'moveHTML'], function() {
	gulp.watch(['./source/templates/*.handlebars'], ['handlebars']);
	gulp.watch(jsfiles, ['moveJS']);
	gulp.watch(['./source/*.html'], ['moveHTML']);
});


/******************************************************************************
*******************************************************************************
	MINIFIED BUILD. 
		This is what is actually shipped. 
		Useful in testing performance.
*******************************************************************************
******************************************************************************/

gulp.task('minifyHTML', function() {

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
});

gulp.task('minifyJs', function() {
	return gulp.src(jsfiles)
		.pipe(babel({
			only: jsfilesES6,
			presets: ['es2015']
		}))
		.pipe(concat('app.min.js'))
		.pipe(uglify().on('error', util.log))
		.pipe(gulp.dest('Chrome/src/'));
});

// libraries are already minified, so just combine
gulp.task('concatLibs', function() {
	return gulp.src(libs)
		.pipe(concat('libs.min.js'))
		.pipe(gulp.dest('Chrome/src/'));
});

gulp.task('compress', ['handlebars', 'concatLibs', 'minifyJs', 'minifyHTML'], function() {
	gulp.watch(['./source/templates/*.handlebars'], ['handlebars']);
	gulp.watch(jsfiles, ['minifyJs']);
	gulp.watch(['./source/*.html'], ['minifyHTML']);
});

/******************************************************************************
*******************************************************************************
	 PACKAGING
	 	Build 
	 	Clean
*******************************************************************************
******************************************************************************/

/*
	zips the extension with the name of current version # from 
	the manifest file
*/
gulp.task('build', function() {
	var json = JSON.parse(fs.readFileSync('./Chrome/manifest.json'));
	var file_name = json.version.split('.').join('_');

	console.log(file_name);

	return gulp.src('Chrome/**')
		.pipe(zip(file_name+'.zip'))
		.pipe(gulp.dest('.'));
});

/*
	everything built goes into /src/
*/
gulp.task('clean', function(cb) {
	exec('rm Chrome/src/*', 
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
	});

	console.log('cleaned Chrome/src/');
});