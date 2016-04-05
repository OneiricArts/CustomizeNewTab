var gulp = require('gulp');
var exec = require('child_process').exec;

gulp.task('default', function(cb) {
	// place code for your default task here
	exec('handlebars -m ./ChromeExt/templates/> ./ChromeExt/templates/templates.js', 
		function (err, stdout, stderr) {
			console.log(stdout);
			console.log(stderr);
			cb(err);
	});
});

gulp.task('watch', function() {
	gulp.watch(['./ChromeExt/templates/*.handlebars'], ['default']);
});