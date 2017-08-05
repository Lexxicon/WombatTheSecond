'use strict';

const gutil = require('gulp-util');
const clean = require('gulp-clean');
const gulp = require('gulp');
const fs = require('fs');
const path = require('path');
const gitrev = require('git-rev');
const screeps = require('gulp-screeps');
const ts = require("gulp-typescript");
const tsProject = ts.createProject("tsconfig.json");
const dotFlatten = require('gulp-dot-flatten');
const gulpDotFlatten = require('./lib/gulp-dot-flatten.js');

let auth;
try { auth = require('./auth.js') }
catch (err) { console.log("failed to load auth.js"); }

//gulp.task('default', ['screeps'])

gulp.task('clean', () => {
  return gulp.src('dist/')
    .pipe(clean());
});

gulp.task('compile', () => {
  return tsProject.src()
    .pipe(tsProject())
    .js.pipe(gulp.dest("dist/tmp"));
});

gulp.task('screeps', ['clean', 'dist'], () => {
  gitrev.branch((branch) => {
    let ptr = false
    auth.branch = auth.branch || branch
    auth.ptr = ptr
    gutil.log('Branch:', auth.branch)
    gulp.src(`dist/*.js`)
      .pipe(screeps(auth))
  });
});

gulp.task('faltten', () => {
  return gulp.src('dist/tmp/**/*.js')
    .pipe(gulpDotFlatten())
    .pipe(gulp.dest('dist/flat'));
})

gulp.task('compile-flattened', ['clean'],
  function tsc() {
    global.compileFailed = false;
    return tsProject.src()
      .pipe(tsProject())
      .on('error', (err) => global.compileFailed = true)
      .js.pipe(gulp.dest('dist/tmp'));
  },
  function checkTsc(done) {
    if (!global.compileFailed) {
      return done();
    }
    throw new PluginError("gulp-typescript", "failed to compile: not executing further tasks");
  },
  function flatten() {
    return gulp.src('dist/tmp/**/*.js')
      .pipe(gulpDotFlatten(0))
      .pipe(gulp.dest('dist/' + buildTarget));
  }
);

gulp.task('push', [], () => {
  gitrev.branch((branch) => {
    let ptr = false
    auth.branch = auth.branch || branch
    auth.ptr = ptr
    gutil.log('Branch:', auth.branch)
    gulp.src(`dist/*.js`)
      .pipe(screeps(auth))
  });
});
