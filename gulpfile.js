
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
  'source/js/backgrounds.js',
  // 'source/js/*.js'
  'source/js/handlebars-helpers.js',
  'source/js/browser.js',
  'source/js/dataFetchers/helpers.js',
  'source/js/dataFetchers/NHLData.js',
  'source/js/dataFetchers/NFLData.js',
  'source/js/dataFetchers/MLBData.js',
  'source/js/dataFetchers/NBAData.js',
  'source/js/widget-new.js',
  'source/js/Links.js',
  'source/js/sport.js',
  'source/js/NHL.js',
  'source/js/MLB.js',
  'source/js/NFL.js',
  'source/js/NBA.js',
  'source/js/pageHandler.js',
  'source/js/googleAnalyticsChrome.js',     // Chrome version by default
  // 'source/js/googleAnalyticsFirefox.js', // will replace Chrome version when building for FF
  'source/js/googleAnalytics.js',
];

// libraries to be included, in order
const libs = [
  'source/libs/jquery-3.3.1.slim.min.js',
  // 'source/libs/jquery-ui.min.js', // used to be needed because of $.highlight
  'source/libs/tether.min.js', // needed in bootstrap 4
  'source/libs/bootstrap-4.0.0-dist/js/bootstrap.min.js',
  // 'source/libs/mdl/material.min.js',
  // 'source/libs/jquery.xml2json.js',
  // 'source/libs/countdown.min.js',
  'source/libs/handlebars.runtimev4.0.5.min.js',
  // 'source/libs/lodash.core.min.js',
];

// css files, will be inlined
const cssFiles = [
  'source/libs/bootstrap-4.0.0-dist/css/bootstrap.min.css',
  // 'source/libs/mdl/material.min.css',
  'source/style.css',
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
        ignorePath: [
          // have to put more specific paths before less specific paths
          'source/js/dataFetchers/',
          'source/js/',
          'source/libs/bootstrap-4.0.0-dist/js/',
          'source/libs/',
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
        ignorePath: ['source/libs/bootstrap-4.0.0-dist/css/', 'source/'],
        addRootSlash: false,
      }))
    .pipe(gulp.dest('Chrome/src/'));
}

/** ***********************************************************************************************
 * Transform source files into ones that will go into production
***************************************************************************************************/

function handlebars(cb) {
  return exec('./node_modules/handlebars/bin/handlebars -m ./source/templates/> ./Chrome/src/templates.js',
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
  gulp.watch(['./source/*.css'], moveCSS);
}

function watchCodeCompress() {
  gulp.watch(['./source/templates/*.handlebars'], handlebars);
  gulp.watch(jsfiles, minifyJS);
  gulp.watch(['./source/*.html', './source/*.css'], minifyHTML);
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

function setup() {
  return exec('mkdir -p Chrome/src');
}

/** ***********************************************************************************************
 * Gulp tasks that can be called from cl or Visual Studio Code
***************************************************************************************************/

// no effeciency steps, can see error lines, etc.
gulp.task('dev', gulp.series(setup, handlebars, moveLibs, moveJS, moveCSS, moveHTML, watchCodeDev));

// full effeciency workflow
gulp.task('compress', gulp.series(setup, handlebars, concatLibs, minifyJS, minifyHTML, watchCodeCompress));

// Firefox -- compressed
gulp.task('firefox', gulp.series(setup, firefox, handlebars, concatLibs, minifyJS, minifyHTML, watchCodeCompress));

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

// TODO: replace with gulp eslint so i can have a task fail if it doesn't pass
//  dont have tests --- so i guess dont zip if eslint fails?
gulp.task('lint', (cb) => {
  exec('./node_modules/.bin/eslint --color source/js', (err, stdout, stderr) => {
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
