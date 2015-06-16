var gulp = require('gulp'),
    jade = require('gulp-jade'),
    sass = require('gulp-ruby-sass'),
    prefix = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    browserSync = require('browser-sync'),
    reload = browserSync.reload;


// HTML Task
// Compiles Jade to HTML
gulp.task('html', function(){
  gulp.src('dev/*.jade')
      .pipe(plumber())
      .pipe(jade({
        pretty: true
      }))
      .pipe(gulp.dest(''))
      .pipe(reload({stream:true}));
});

// Styles Task
// Compiles Sass to CSS
gulp.task('styles', function(){
  sass('dev/css/main.sass', {
    style: 'expanded' })
  .pipe(plumber())
  .pipe(prefix('last 2 versions'))
  .pipe(gulp.dest('assets/css'))
  .pipe(reload({stream:true}));
});

// Scripts Task
// Uglifies(minifies) Javascript
gulp.task('scripts', function(){
  gulp.src('dev/*.js')
      .pipe(rename({suffix:'.min'}))
      .pipe(plumber())
      //.pipe(uglify())
      .pipe(gulp.dest('assets/js'))
      .pipe(reload({stream:true}));
});

// Sync Task
// runs browser-sync
gulp.task('sync', function(){
  browserSync({
    proxy: 'localhost:80'
  });
});

// Watch Task
// Watches Jade, Sass, Javascript
gulp.task('watch', function(){
  gulp.watch('dev/*.jade', ['html']);
  gulp.watch('dev/*.js', ['scripts']);
  gulp.watch('dev/css/**/*.{sass,scss}', ['styles']);
});

// Default Task
// Runs all the above
gulp.task('default', ['html', 'scripts', 'styles', 'sync', 'watch']);

// Offline Task
// Runs all the above except for browser-sync
gulp.task('offline', ['html', 'scripts', 'styles', 'watch']);
