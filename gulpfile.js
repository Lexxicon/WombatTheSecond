'use strict';
const _ = require('lodash');
const gutil = require('gulp-util');
const log = require('fancy-log');
const colors = require('ansi-colors');
const clean = require('gulp-clean');
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const git = require('gulp-git');
const ts = require("gulp-typescript");
const gulpRename = require('gulp-rename');
const tslint = require('gulp-tslint');
const tsProject = ts.createProject("tsconfig.json");
const dotFlatten = require('gulp-dot-flatten');
const replace = require('gulp-replace');
const download = require("gulp-download");
const filter = require('gulp-filter');
const mocha = require('gulp-mocha');
const screeps = require('gulp-screeps');

const gulpDotFlatten = require('./lib/gulp-dot-flatten.js');

/********/
/* INIT */
/********/

let config;

try {
  config = require('./config.json');
} catch (error) {
  if (error.code == "MODULE_NOT_FOUND") {
    log(colors.red('ERROR'), 'Could not find file "config.json"');
  } else {
    log(error);
  }
  process.exit();
}

try {
  let credentials = require('./credentials.json');
  if (!config.user) { config.user = {} }
  _.merge(config.user, credentials.user);
} catch (error) {
  if (error.code == "MODULE_NOT_FOUND") {
    log(colors.red('ERROR'), 'Could not find file "credentials.json"');
  } else {
    log(error);
  }
  process.exit();
}

if (!config.user || !config.user.email || !config.user.password) {
  log(colors.red('ERROR'), 'Invalid "config.json" file: cannot find user credentials');
  process.exit();
}

if (!config.targets) {
  log(colors.red('ERROR'), 'Invalid "config.json" file: cannot find build targets');
  process.exit();
}

if (!config.defaultTarget || !config.targets[config.defaultTarget]) {
  log(colors.red('ERROR'), 'Invalid "config.json" file: cannot find default build target');
  process.exit();
}

log('Successfully loaded', colors.magenta('config.json'));

if (gutil.env.target) {
  if (!config.targets[gutil.env.target]) {
    log(colors.red('ERROR'), 'Invalid build target "' + gutil.env.target + '"');
    log('Valid build targets are:', '"' + Object.keys(config.targets).join('", "') + '"');
    process.exit();
  }
  log('Using selected build target', colors.magenta(gutil.env.target));
} else {
  log('Using default build target', colors.magenta(config.defaultTarget));
}

const buildTarget = gutil.env.target || config.defaultTarget;
const buildConfig = config.targets[buildTarget];

const repo = config.repository || "";
const time = new Date().getTime();
let hash = undefined;

/*********/
/* TASKS */
/*********/
gulp.task('update_constants', () => {
  return download('https://screeps.com/a/constants.js')
    .pipe(gulp.dest('lib/downloads'));
});

gulp.task('update_stats', () => {
  return download('https://raw.githubusercontent.com/screepers/screeps-stats/master/js/screepsstats.js')
    .pipe(gulp.dest('lib/downloads'));
});

gulp.task('update_submodules', (done) => {
  git.updateSubmodule({ args: "--init --remote", quiet: true }, done);
})

gulp.task('lint', function (done) {
  if (buildConfig.lint) {
    log('linting ...');
    return gulp.src('src/**/*.ts')
      .pipe(tslint({ formatter: 'prose' }))
      .pipe(tslint.report({
        summarizeFailureOutput: true,
        emitError: buildConfig.lintRequired === true
      }));
  } else {
    log('skipped lint, according to config');
    return done();
  }
});
gulp.task('findHash', (cb) => {
  git.revParse({ args: '--short HEAD', quiet: true }, (err, h) => {
    hash = h;
    if (err) return cb(err);
    cb();
  });
})

gulp.task('clean', () => {
  return gulp.src(['dist/tmp', 'dist/' + buildTarget], { read: false, allowEmpty: true })
    .pipe(clean());
});

gulp.task('test', (cb) => {
  return gulp.src('dist/tmp/test/**/*.test.js')
    .pipe(mocha({
      require: ['lodash', 'mochaShim.js']
    })).on('error', () => {
      const err = new Error("Test failed");
      err.stack = "Test failed";
      cb(err);
    });
})

gulp.task('compile', () => {
  return tsProject.src()
    .pipe(replace('__REVISION__', hash))
    .pipe(replace('__BUILD_TIME__', time))
    .pipe(replace('__REPO__', repo))
    .pipe(tsProject())
    .js.pipe(gulp.dest("dist/tmp"));
});

gulp.task('flatten', () => {
  return gulp.src('dist/tmp/src/**/*.js')
    .pipe(gulpDotFlatten())
    .pipe(gulp.dest('dist/' + buildTarget));
})

gulp.task('push', () => {
  return gulp.src('dist/' + buildTarget + '/*.js')
    .pipe(gulpRename((path) => path.extname = ''))
    .pipe(screeps({
      email: config.user.email,
      password: config.user.password,
      branch: buildConfig.branch,
      ptr: false,
      host: 'screeps.com',
      port: 443,
      secure: true
    }))
})
/**************/
/* META-TASKS */
/**************/

gulp.task('publish', gulp.series(
  gulp.parallel('findHash', 'clean', 'lint'),
  'compile',
  gulp.parallel('flatten', 'test'),
  'push'));

gulp.task('build', gulp.series(
  gulp.parallel('findHash', 'clean', 'lint'),
  'compile',
  gulp.parallel('flatten', 'test')));
