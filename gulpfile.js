// Shared Dependencies
var gulp = require('gulp');
var gutil = require('gulp-util');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
// html task
var fileinclude = require('gulp-file-include');
// svg task
var svgstore = require('gulp-svgstore');
var svgmin = require('gulp-svgmin');
var inject = require('gulp-inject');
// styles task
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
// javascript task
var babel = require('gulp-babel');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
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
  gulp.src('src/index.html')
    .pipe(plumber(onError))
    .pipe(fileinclude())
    .pipe(gulp.dest('dist/'))
    .pipe(reload({
      stream: true
    }));
});

// Styles Task
// Compiles Sass to CSS
gulp.task('styles', function () {
  return gulp.src('src/scss/main.scss')
    .pipe(plumber(onError))
    .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(autoprefixer({ browsers: ['last 2 versions']}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({
      stream: true
    }));
});

// Javascript Task
gulp.task('javascript', function () {
  return gulp.src('src/js/*.js')
    .pipe(plumber(onError))
    .pipe(sourcemaps.init())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(babel())
      .pipe(concat('bundle.js'))
      //.pipe(uglify())
    .pipe(sourcemaps.write(''))
    .pipe(gulp.dest('dist/js'))
    .pipe(reload({
      stream: true
    }));
});

// move assets over to dist folder
gulp.task('move', function(){
  // node modules
  gulp.src([
    'node_modules/jquery/dist/jquery.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.min.js',
    'node_modules/leaflet/dist/leaflet.js'
  ])
    .pipe(gulp.dest('dist/js'));

  // font files
  gulp.src('src/assets/fonts/*.*')
    .pipe(gulp.dest('dist/fonts'));

  // favicons
  gulp.src('src/assets/favicons/*.*')
    .pipe(gulp.dest('dist/favicons'));

  // leaflet marker icon
  gulp.src('src/assets/icons/icon-place.svg')
    .pipe(gulp.dest('dist/icons'));
});

// generate svg sprite sheet
gulp.task('svg', function(){
  return gulp.src('src/assets/icons/*.svg')
    .pipe(svgstore({inlineSvg: true}))
    .pipe(gulp.dest('src/includes'));
});

// Sync Task
// runs browser-sync
gulp.task('sync-proxy', function () {
  browserSync({
    proxy: '127.0.0.1:80',
    online: true,
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
    notify: false
  });
});

// Watch Task
// Watches Jade, Sass, Javascript
gulp.task('watch', function () {
  gulp.watch('src/**/*.{html}', ['html']);
  gulp.watch('src/assets/icons/*.svg', ['svg', 'html']);
  gulp.watch('src/js/*.js', ['javascript']);
  gulp.watch('src/scss/**/*.scss', ['styles']);
});

// Default Task
gulp.task('default', ['svg', 'html', 'javascript', 'styles', 'sync-proxy', 'watch']);

// Offline Task
gulp.task('offline', ['svg', 'html', 'javascript', 'styles', 'sync-noproxy', 'watch']);

// build task
gulp.task('build', ['svg', 'html', 'javascript', 'styles', 'move']);
