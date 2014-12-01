var manifest = require('./package.json'),
    gulp = require('gulp'),
    rimraf = require('rimraf'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    connect = require('gulp-connect'),
    open = require('gulp-open');

var srcPaths = ['src/ng-swipe.js', 'src/components/*.js'];

gulp.task('clean', function(cb) {
  return rimraf('dist', cb);
});

gulp.task('build', ['clean', 'dist']);

gulp.task('dist', ['clean'], function() {
    gulp.src(srcPaths)
      .pipe(jshint())
      .pipe(concat('ng-swipe-' + manifest.version + '.js'), {newline: '\n\n'})
      .pipe(gulp.dest('dist'))
      .pipe(uglify())
      .pipe(rename('ng-swipe-' + manifest.version + '-min.js'))
      .pipe(gulp.dest('dist'));
})

gulp.task('test', function() {
  // TODO
});

gulp.task('examples', function() {
  connect.server({
    root: ['examples', 'dist', 'src'],
    port: 3000
  });

  gulp.src('examples/index.html')
    .pipe(open('', {url: 'http://localhost:3000'}));
});

gulp.task('default', ['examples']);