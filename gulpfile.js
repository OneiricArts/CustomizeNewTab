var gulp = require('gulp');
var exec = require('child_process').exec;
var htmlmin = require('gulp-htmlmin');
var uglify = require("gulp-uglify");
var concat = require('gulp-concat');
var rename = require('gulp-rename');




gulp.task('default', function(cb) {
	// place code for your default task here
	exec('handlebars -m ./source/templates/> ./ChromeExt/templates.js', 
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
	.pipe(gulp.dest('ChromeExt/'))
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

	gulp.src(files)
		.pipe(concat('app'))
		.pipe(uglify())
		.pipe(rename({
			extname: ".min.js"
		}))
		.pipe(gulp.dest('ChromeExt/'));
});

gulp.task('watch', function() {
	gulp.watch(['./ChromeExt/templates/*.handlebars'], ['default']);
});