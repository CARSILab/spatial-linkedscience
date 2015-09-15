var gulp = require('gulp');
var plumber = require('gulp-plumber');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var reload = browserSync.reload;

// ON error
function onError(error) {
  gutil.beep();
  gutil.log(gutil.colors.red(error.message));
  this.emit('end');
}

// HTML Task
// Compiles Jade to HTML
gulp.task('html', function () {
  gulp.src('dev/*.jade')
    .pipe(plumber(onError))
    .pipe(jade({
      pretty: true
    }))
    .pipe(gulp.dest(''))
    .pipe(reload({
      stream: true
    }));
});

// Styles Task
// Compiles Sass to CSS
gulp.task('styles', function () {
  return gulp.src('dev/css/main.scss')
    .pipe(plumber(onError))
    .pipe(sass({
      //includePaths: ['./dev/css/1-plugins', './dev/css/2-base', './dev/css/3-sections']
    }))
    .pipe(prefix(['last 2 versions', 'ie 9'], {
      cascade: true
    }))
    .pipe(gulp.dest('assets/css'))
    .pipe(reload({
      stream: true
    }));
});

// Javascript Task
// browserify
gulp.task('javascript', function () {
  var b = browserify({
    entries: './dev/js/spatial.js',
    debug: true
  });

  return b.bundle()
    .pipe(plumber(onError))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init())
    //.pipe(uglify())
    .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./assets/js'))
    .pipe(reload({
      stream: true
    }));
});

// Sync Task
// runs browser-sync
gulp.task('sync', function () {
  browserSync({
    proxy: '127.0.0.1:80',
    open: "external",
    notify: false
  });
});

// Watch Task
// Watches Jade, Sass, Javascript
gulp.task('watch', function () {
  gulp.watch('dev/**/*.jade', ['html']);
  gulp.watch('dev/js/*.js', ['javascript']);
  gulp.watch('dev/css/**/*.{sass,scss}', ['styles']);
});

// Default Task
// Runs all the above
gulp.task('default', ['html', 'javascript', 'styles', 'sync', 'watch']);

// Offline Task
// Runs all the above except for browser-sync
gulp.task('offline', ['html', 'javascript', 'styles', 'watch']);
