var gulp = require('gulp');
var exec = require('child_process').exec;
var htmlmin = require('gulp-htmlmin');
var uglify = require("gulp-uglify");
var concat = require('gulp-concat');
var rename = require('gulp-rename');




gulp.task('default', function(cb) {
	// place code for your default task here
	exec('handlebars -m ./source/templates/> ./Chrome/templates.js', 
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
	});
});

gulp.task('minify', function() {
	gulp.src('source/new_tab.html')
		.pipe(htmlmin({
			collapseWhitespace: true, 
			removeComments: true,
			minifyCSS: true
		}))
	.pipe(gulp.dest('Chrome/'))
});

gulp.task('compress', function() {
	var files = [
		//'source/js/*.js'
		'source/js/Base.js',  
		'source/js/Sports.js', 
		'source/js/NBA.js', 
		'source/js/NFLoff.js',
		'source/js/NFLnews.js', 
		'source/js/Links.js', 
		//'source/js/bookmarksBar.js', 
		'source/js/pageHandler.js',
		'source/js/googleAnalytics.js'
	];

	var libs = [
		'source/libs/jquery-2.1.4.min.js',
		//'source/libs/jquery-ui.min.js',
		'source/libs/bootstrap-3.3.5-dist/js/bootstrap.min.js',

		'source/libs/mdl/material.min.js',

		//'source/libs/jquery.xml2json.js',
		'source/libs/countdown.min.js',

		'source/libs/handlebars.runtime-v4.0.5.js',
		'Chrome/templates.js'
	];

	gulp.src(libs)
		.pipe(concat('libs.min.js'))
		.pipe(gulp.dest('Chrome/'));

	gulp.src(files)
		.pipe(concat('app'))
		.pipe(uglify())
		.pipe(rename({
			extname: ".min.js"
		}))
		.pipe(gulp.dest('Chrome/'));
});

gulp.task('watch', function() {
	gulp.watch(['./source/templates/*.handlebars'], ['default']);
});