'use strict';

const gulp = require('gulp');
const server = require('browser-sync').create();

gulp.task('default', function(fn) {
  const sequence = require('run-sequence');
  sequence(
    'build',
    'serve',
    fn
  );
});

gulp.task('build', function(fn) {
  const sequence = require('run-sequence');
  sequence(
    'eslint',
    'stylelint',
    'clean',
    'copy',
    'style',
    'images',
    'webp',
    'svg',
    'sprite',
    'js',
    fn
  );
});

gulp.task('deploy', function(done) {
  const ghPages = require('gulp-gh-pages');
  return gulp.src('dist/**/*')
    .pipe(ghPages());
  done();
});

gulp.task('style', function(done) {
  const rename = require('gulp-rename');
  const plumber = require('gulp-plumber');
  const sass = require('gulp-sass');
  const csso = require('gulp-csso');
  const postcss = require('gulp-postcss');
  const autoprefixer = require('autoprefixer');
  return gulp.src('src/sass/style.scss', { base: 'src/sass' })
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(gulp.dest('dist/css'))
    .pipe(csso())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('dist/css'))
    .pipe(server.stream());
  done();
});

gulp.task('serve', function() {
  server.init({
    server: 'dist/',
    notify: false,
    open: false,
    cors: true,
    ui: false
  });

  gulp.watch('src/sass/**/*.{scss,sass}', ['style']);
  gulp.watch('src/*.html', ['html:update']);
  gulp.watch('src/js/**/*.js', ['js:update']);
  gulp.watch('src/img/**/*.svg', ['svg:update']);
});

gulp.task('copy', function(done) {
  return gulp.src(
    [
      'src/fonts/**/*.{woff,woff2}',
      'src/js/**/*.min.js',
      'src/*.html',
      'src/favicons/**/*'
    ],
    {
      base: 'src'
    }
  )
    .pipe(gulp.dest('dist'));
  done();
});

gulp.task('images', function(done) {
  const imagemin = require('gulp-imagemin');
  return gulp.src('src/img/**/*.{png,jpg,jpeg,gif}', { base: 'src' })
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true})
    ]))
    .pipe(gulp.dest('dist'));
  done();
});

gulp.task('webp', function (done) {
  const webp = require('gulp-webp');
  return gulp.src('src/img/**/*.{png,jpg}', { base: 'src' })
    .pipe(webp({
      quality: 80
    }))
    .pipe(gulp.dest('dist'));
  done();
});

gulp.task('svg', function(done) {
  const svgmin = require('gulp-svgmin');
  return gulp.src(['src/img/**/*.svg', '!src/img/**/{icon-,logo-}*.svg'], { base: 'src' })
    .pipe(svgmin())
    .pipe(gulp.dest('dist'));
  done();
});

gulp.task('svg:update', ['svg', 'sprite'], function(done) {
  server.reload();
  done();
});

gulp.task('sprite', function(done) {
  const rename = require('gulp-rename');
  const svgstore = require('gulp-svgstore');
  return gulp.src('src/img/{icon-,logo-}*.svg')
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('dist/img'));
  done();
});

gulp.task('clean', function(done) {
  const del = require('del');
  return del('dist');
  done();
});

gulp.task('html:copy', function(done) {
  return gulp.src('src/*.html', { base: 'src' })
    .pipe(gulp.dest('dist'));
  done();
});

gulp.task('html:update', ['html:copy'], function(done) {
  server.reload();
  done();
});

gulp.task('js', function(done) {
  const rename = require('gulp-rename');
  const babel = require('gulp-babel');
  return gulp.src(['src/js/**/*.js', '!src/js/**/*.min.js'], { base: 'src' })
    .pipe(babel({
      presets: ['env']
    }))
    .pipe(gulp.dest('dist'))
    .pipe(babel({
      minified: true,
      comments: false
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('dist'));
  done();
});

gulp.task('eslint', function(done) {
  const eslint = require('gulp-eslint');
  return gulp.src(['src/js/**/*.js', '!src/js/**/*.min.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
  done();
});

gulp.task('stylelint', function(done) {
  const stylelint = require('gulp-stylelint');
  return gulp.src('src/sass/**/*.scss')
    .pipe(stylelint({
      syntax: 'scss',
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
  done();
});

gulp.task('js:update', ['js'], function(done) {
  server.reload();
  done();
});
