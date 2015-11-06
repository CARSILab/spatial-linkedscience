// Shared Dependencies
var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
// html task
var jade = require('gulp-jade');
// styles task
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
// javascript task
var babel = require('gulp-babel');
var concat = require('gulp-concat');
// sync task
var browserSync = require('browser-sync');
var reload = browserSync.reload;

// On error
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
gulp.task('javascript', function () {
  return gulp.src('dev/js/*.js')
    .pipe(plumber(onError))
    .pipe(sourcemaps.init())
		.pipe(babel())
		.pipe(concat('bundle.js'))
    //.pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./assets/js'))
    .pipe(reload({
      stream: true
    }));
});

// Sync Task
// runs browser-sync
gulp.task('sync-proxy', function () {
  browserSync({
    proxy: '127.0.0.1:80',
		online: true,
    open: 'external',
    notify: false
  });
});

// Sync Task
// runs browser-sync
gulp.task('sync-noproxy', function () {
  browserSync({
    server: {
      baseDir: './'
    },
		online: false,
    open: 'external',
    notify: false
  });
});

// Watch Task
// Watches Jade, Sass, Javascript
gulp.task('watch', function () {
  gulp.watch('dev/**/*.jade', ['html']);
  gulp.watch('dev/js/*.js', ['javascript']);
  gulp.watch(['dev/css/**/*.{sass,scss}', 'dev/libs/bootstrap/scss/*.scss'], ['styles']);
});

// Default Task
// Runs all the above
gulp.task('default', ['html', 'javascript', 'styles', 'sync-proxy', 'watch']);

// Offline Task
// Runs all the above except for browser-sync
gulp.task('offline', ['html', 'javascript', 'styles', 'sync-noproxy', 'watch']);
