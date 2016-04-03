// Shared Dependencies
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
// browserSync
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var onError = function(err) {
  console.log(err);
  this.emit('end')
};
// HTML Task
gulp.task('html', function () {
  return gulp.src('src/index.html')
    .pipe(plumber({errorHandler: onError}))
    .pipe(require('gulp-file-include')())
    .pipe(gulp.dest('dist/'))
    .pipe(reload({
      stream: true
    }));
});

// Styles Task
// Compiles Sass to CSS
gulp.task('styles', function () {
  return gulp.src('src/scss/main.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
      .pipe(require('gulp-sass')())
      .pipe(require('gulp-autoprefixer')({ browsers: ['last 2 versions']}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({
      stream: true
    }));
});

// Javascript Task
gulp.task('javascript', function(){
  return require('rollup').rollup({
    entry: 'src/js/index.js',
    plugins: [
      require('rollup-plugin-node-resolve')({jsnext: true}),
      require('rollup-plugin-commonjs')(),
      require('rollup-plugin-babel')({
        exclude: 'node_modules/**'
      }),
    ]
  }).then(function (bundle){
    return bundle.write({
      format: 'iife',
      dest: 'dist/js/bundle.js'
    });
  });
});

// move assets over to dist folder
gulp.task('move', function(){
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
    .pipe(require('gulp-svgstore')({inlineSvg: true}))
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
  gulp.watch('src/**/*.html', ['html']);
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
