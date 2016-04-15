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


/* 
	used in 'compress' and 'watch'
	should only watch files i will actually compress
*/
var jsfiles = [
	//'source/js/*.js'
	'source/js/Base.js',  
	'source/js/Sports.js', 
	'source/js/NBA.js', 
	'source/js/NFLoff.js',
	'source/js/NFLnews.js', 
	'source/js/Links.js', 
	'source/js/pageHandler.js',
	//'source/js/bookmarksBar.js', 
	'source/js/googleAnalytics.js',
	'source/js/NHL.js'
];

var libs = [
	'source/libs/jquery-2.1.4.min.js',
	//'source/libs/jquery-ui.min.js', // used to be needed because of $.highlight
	'source/libs/bootstrap-3.3.5-dist/js/bootstrap.min.js',
	//'source/libs/bootstrap_custom/js/bootstrap.min.js',
	//'source/libs/mdl/material.min.js',
	//'source/libs/jquery.xml2json.js',
	'source/libs/countdown.min.js',
	'source/libs/handlebars.runtimev4.0.5.min.js',
];

var jsfilesES6 = [
	'source/js/NHL.js',
	//'source/js/bookmarksBar.js',
]

gulp.task('default', ['minify', 'handlebars', 'compress', 'concatLibs']);


/********************************************************************
	DOING DEV WORK
	- need js files included individually
	- no js minification
		- CSS/HTML minification doesn't really matter
********************************************************************/
gulp.task('predev', ['handlebars'], function() {
	gulp.src(libs)
	.pipe(concat('libs.min.js'))
	.pipe(gulp.dest('Chrome/src/'));

	gulp.src(jsfiles)
	.pipe(gulp.dest('Chrome/src/'));

	return gulp.src('source/new_tab.html')
	.pipe(inlinesource())
	.pipe(gulp.dest('Chrome/src/'));
});

gulp.task('dev', ['handlebars', 'predev'], function() {

	var myJsFiles = [
		'libs.min.js', 'templates.js',
		'Base.js',  'Sports.js', 
		'NBA.js', 'NFLoff.js', 'NFLnews.js', 'Links.js', 
		'NHL.js',
		'pageHandler.js', 'googleAnalytics.js'
	];

	// inject (  src([], {read: false})   , optionsForInject    )
	gulp.src('./Chrome/src/new_tab.html')
	.pipe(
		inject(
			gulp.src(myJsFiles, 
			{
				read: false, 
				'cwd': __dirname + '/Chrome/src'
			}).pipe(print())
			, {addRootSlash: false}))
	.pipe(gulp.dest('Chrome/src/'));
});



/*********************************************
	FINAL BUILD
	- Test what I will ship
**********************************************/
gulp.task('minify', function() {
	gulp.src('source/new_tab.html')
		.pipe(inlinesource())
		.pipe(htmlmin({
			collapseWhitespace: true, 
			removeComments: true,
			minifyCSS: true,
			//removeStyleLinkTypeAttributes: true,
			//removeScriptTypeAttributes: true
		}))
	.pipe(gulp.dest('Chrome/src/'))

	var cssFiles = [
		'source/libs/bootstrap-3.3.5-dist/css/bootstrap.min.css',
		//'source/libs/mdl/material.min.css',
	];
	//gulp.src(cssFiles)
	//.pipe(gulp.dest('Chrome/src/'))
});

gulp.task('handlebars', function(cb) {
	exec('handlebars -m ./source/templates/> ./Chrome/src/templates.js', 
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
	});
});

gulp.task('compress', function() {
	gulp.src(jsfiles)
		.pipe(babel({
			only: jsfilesES6,
			presets: ['es2015']
		}))
		.pipe(concat('app.min.js'))
		.pipe(uglify().on('error', util.log))
		.pipe(gulp.dest('Chrome/src/'));
});

/*
	libraries are already minified, so just combine
*/
gulp.task('concatLibs', function() {

	return gulp.src(libs)
		.pipe(concat('libs.min.js'))
		.pipe(gulp.dest('Chrome/src/'));
});

gulp.task('watch', ['default'], function() {
	gulp.watch(['./source/templates/*.handlebars'], ['handlebars']);
	gulp.watch(jsfiles, ['compress']);
	gulp.watch(['./source/*.html'], ['minify']);
});

/*
	zips the extension with the name from the current version # from 
	the manifest 
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
	exec('rm -r Chrome/src/', 
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
	});

	console.log('cleaned Chrome/src/');
});