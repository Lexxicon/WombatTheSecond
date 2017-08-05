'use strict';

const gutil = require('gulp-util');
const clean = require('gulp-clean');
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const git = require('gulp-git');
const ts = require("gulp-typescript");
const gulpRename = require('gulp-rename');
const tsProject = ts.createProject("tsconfig.json");
const dotFlatten = require('gulp-dot-flatten');
const replace = require('gulp-replace');

const gulpDotFlatten = require('./lib/gulp-dot-flatten.js');
const gulpScreepsUpload = require('./lib/gulp-screeps-upload.js');

/********/
/* INIT */
/********/

let config;

try {
  config = require('./config.json');
} catch (error) {
  if (error.code == "MODULE_NOT_FOUND") {
    gutil.log(gutil.colors.red('ERROR'), 'Could not find file "config.json"');
  } else {
    gutil.log(error);
  }
  process.exit();
}

if (!config.user || !config.user.email || !config.user.password) {
  gutil.log(gutil.colors.red('ERROR'), 'Invalid "config.json" file: cannot find user credentials');
  process.exit();
}

if (!config.targets) {
  gutil.log(gutil.colors.red('ERROR'), 'Invalid "config.json" file: cannot find build targets');
  process.exit();
}

if (!config.defaultTarget || !config.targets[config.defaultTarget]) {
  gutil.log(gutil.colors.red('ERROR'), 'Invalid "config.json" file: cannot find default build target');
  process.exit();
}

gutil.log('Successfully loaded', gutil.colors.magenta('config.json'));

if (gutil.env.target) {
  if (!config.targets[gutil.env.target]) {
    gutil.log(gutil.colors.red('ERROR'), 'Invalid build target "' + gutil.env.target + '"');
    gutil.log('Valid build targets are:', '"' + Object.keys(config.targets).join('", "') + '"');
    process.exit();
  }
  gutil.log('Using selected build target', gutil.colors.magenta(gutil.env.target));
} else {
  gutil.log('Using default build target', gutil.colors.magenta(config.defaultTarget));
}

const buildTarget = gutil.env.target || config.defaultTarget;
const buildConfig = config.targets[buildTarget];

const time = new Date().getTime();
let hash = undefined;

/*********/
/* TASKS */
/*********/

gulp.task('findHash', (cb) => {
  git.revParse({ args: '--short HEAD', quite: true }, (err, h) => {
    hash = h;
    if (err) return cb(err);
    cb();
  });
})

gulp.task('clean', () => {
  return gulp.src(['dist/tmp', 'dist/' + buildTarget], { read: false, allowEmpty: true })
    .pipe(clean());
});

gulp.task('compile', gulp.series('findHash', () => {
  return tsProject.src()
    .pipe(replace('__REVISION__', hash))
    .pipe(replace('__BUILD_TIME__', time))
    .pipe(tsProject())
    .js.pipe(gulp.dest("dist/tmp"));
}));

// gulp.task('replace', () => {
//   return gulp.src('dist/tmp/**/*.js')
//     .js.pipe(gulp.dest("dist/tmp"));
// })

gulp.task('flatten', () => {
  return gulp.src('dist/tmp/**/*.js')
    .pipe(gulpDotFlatten())
    .pipe(gulp.dest('dist/' + buildTarget));
})

gulp.task('push', () => {
  return gulp.src('dist/' + buildTarget + '/*.js')
    .pipe(gulpRename((path) => path.extname = ''))
    .pipe(gulpScreepsUpload(config.user.email, config.user.password, buildConfig.branch, 0));
});

/**************/
/* META-TASKS */
/**************/

gulp.task('publish', gulp.series('clean', 'compile', 'flatten', 'push'));
