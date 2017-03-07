
const gulp = require('gulp');
const exec = require('child_process').exec;
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const babel = require('gulp-babel');
const util = require('gulp-util');
const inlinesource = require('gulp-inline-source');
const inject = require('gulp-inject');
const manifest = require('./Chrome/manifest.json');
// const print = require('gulp-print');

/** ***********************************************************************************************
 * Source files
***************************************************************************************************/

// all js files needed, in order of inclusion
const jsfiles = [
  // 'source/js/*.js'
  'source/js/Base.js',
  'source/js/Sports.js',
  'source/js/NBA.js',
  // 'source/js/NFLoff.js',
  // 'source/js/NFLnews.js',
  'source/js/Links.js',
  // 'source/js/bookmarksBar.js',
  'source/js/widget.js',
  'source/js/sport.js',
  'source/js/NHL.js',
  'source/js/MLB.js',
  'source/js/NFL_new.js',
  'source/js/pageHandler.js',
  'source/js/googleAnalyticsChrome.js',     // Chrome version by default
  // 'source/js/googleAnalyticsFirefox.js', // will replace Chrome version when building for FF
  'source/js/googleAnalytics.js',
];

// libraries to be included, in order
const libs = [
  'source/libs/jquery-2.1.4.min.js',
  // 'source/libs/jquery-ui.min.js', // used to be needed because of $.highlight
  // 'source/libs/bootstrap-3.3.5-dist/js/bootstrap.min.js',
  'source/libs/tether.min.js',
  'source/libs/bootstrap-4.0.0-dist/js/bootstrap.min.js',
  // 'source/libs/bootstrap_custom/js/bootstrap.min.js',
  // 'source/libs/mdl/material.min.js',
  'source/libs/jquery.xml2json.js',
  // 'source/libs/countdown.min.js',
  'source/libs/handlebars.runtimev4.0.5.min.js',
];

// css files, will be inlined
const cssFiles = [
  // 'source/libs/bootstrap-3.3.5-dist/css/bootstrap.min.css',
  'source/libs/bootstrap-4.0.0-dist/css/bootstrap.min.css',
  // 'source/libs/mdl/material.min.css',
];


/** ***********************************************************************************************
 * Copy relevant files into /src/ where they are part of the dir that is loaded  in Chrome
***************************************************************************************************/

function moveLibs() {
  return gulp.src(libs)
    .pipe(concat('libs.min.js'))
    .pipe(gulp.dest('Chrome/src/'));
}

function moveJS() {
  return gulp.src(jsfiles)
    .pipe(gulp.dest('Chrome/src/'));
}

function moveCSS() {
  return gulp.src(cssFiles)
    .pipe(gulp.dest('Chrome/src/'));
}

function moveHTML() {
  const myJsFiles = ['Chrome/src/libs.min.js', 'Chrome/src/templates.js'];

  // inject (  src([], {read: false})   , optionsForInject    )
  return gulp.src('source/new_tab.html')
    .pipe(inject(
      gulp.src(myJsFiles.concat(jsfiles),
        {
          read: false,
        })// .pipe(print())
      , {
        ignorePath: ['source/js/', 'source/libs/', 'source/libs/bootstrap-4.0.0-dist/js/',
          'Chrome/src/'],
        addRootSlash: false,
      }))
    .pipe(inject(
      gulp.src(cssFiles,
        {
          read: false,
          // 'cwd': __dirname + '/Chrome/src'
        }),
      {
        ignorePath: 'source/libs/bootstrap-4.0.0-dist/css/',
        addRootSlash: false,
      }))
    .pipe(gulp.dest('Chrome/src/'));
}

/** ***********************************************************************************************
 * Transform source files into ones that will go into production
***************************************************************************************************/

function handlebars(cb) {
  return exec('handlebars -m ./source/templates/> ./Chrome/src/templates.js',
    (err, stdout, stderr) => {
      util.log(stdout);
      util.log(stderr);
      cb(err);
    });
}

function minifyHTML() {
  const libsToInclude = ['Chrome/src/libs.min.js', 'Chrome/src/templates.js', 'Chrome/src/app.min.js'];

  return gulp.src('source/new_tab.html')
    .pipe(inlinesource())
    .pipe(inject(
      gulp.src(libsToInclude, { read: false }) /* .pipe(print())*/, // arg 1 for inject
      { ignorePath: 'Chrome/src/', addRootSlash: false })) // arg 2 for inject
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeComments: true,
      minifyCSS: true,
      //removeStyleLinkTypeAttributes: true,
      //removeScriptTypeAttributes: true
    }))
    .pipe(gulp.dest('Chrome/src/'));
}

function minifyJS() {
  return gulp.src(jsfiles)
    .pipe(concat('app.min.js'))
    .pipe(babel({
      presets: ['babili'],
    }))
    .pipe(gulp.dest('Chrome/src/'));
}

function concatLibs() {
  // libraries are already minified, so just combine
  return gulp.src(libs)
    .pipe(concat('libs.min.js'))
    .pipe(gulp.dest('Chrome/src/'));
}

/** ***********************************************************************************************
 * Helper functions for tasks
***************************************************************************************************/

function watchCodeDev() {
  gulp.watch(['./source/templates/*.handlebars'], handlebars);
  gulp.watch(jsfiles, moveJS);
  gulp.watch(['./source/*.html'], moveHTML);
}

function watchCodeCompress() {
  gulp.watch(['./source/templates/*.handlebars'], handlebars);
  gulp.watch(jsfiles, minifyJS);
  gulp.watch(['./source/*.html'], moveHTML);
}

function firefox(done) {
  const index = jsfiles.indexOf('source/js/googleAnalyticsChrome.js');
  if (index === -1) {
    util.log(util.colors.bgRed('googleAnalyticsChrome.js not in jsfiles'));
  } else {
    jsfiles[index] = 'source/js/googleAnalyticsFirefox.js';
    // util.log(jsfiles);
  }
  done();
}

/** ***********************************************************************************************
 * Gulp tasks that can be called from cl or Visual Studio Code
***************************************************************************************************/

// no effeciency steps, can see error lines, etc.
gulp.task('dev', gulp.series(handlebars, moveLibs, moveJS, moveCSS, moveHTML, watchCodeDev));

// full effeciency workflow
gulp.task('compress', gulp.series(handlebars, concatLibs, minifyJS, minifyHTML, watchCodeCompress));

// Firefox -- compressed
gulp.task('firefox', gulp.series(firefox, handlebars, concatLibs, minifyJS, minifyHTML, watchCodeCompress));

gulp.task('default', gulp.series('dev'));

// zips the extension with the name of current version # from the manifest file
gulp.task('zip', (cb) => {
  const fileName = manifest.version.split('.').join('_');
  util.log(fileName);

  const zipCommand = `zip -r ${fileName}.zip Chrome/**`;
  return exec(zipCommand,
    (err, stdout, stderr) => {
      util.log(stdout);
      util.log(stderr);
      cb(err);
    });
});

// TODO: right now have to run dev/compress twice after cleaning
gulp.task('clean', (cb) => {
  // everything built goes into /src
  exec('rm Chrome/src/*', (err, stdout, stderr) => {
    util.log(stdout);
    util.log(stderr);
    cb(err);
  });

  util.log('cleaned Chrome/src/');
});
