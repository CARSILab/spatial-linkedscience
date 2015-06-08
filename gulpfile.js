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
  gulp.src('build/*.jade')
      .pipe(plumber())
      .pipe(jade())
      .pipe(gulp.dest(''))
      .pipe(reload({stream:true}));
});

// Styles Task
// Compiles Sass to CSS
gulp.task('styles', function(){
  sass('build/css/main.sass', {
    style: 'compressed' })
  .pipe(plumber())
  .pipe(prefix('last 2 versions'))
  .pipe(gulp.dest('assets/css'))
  .pipe(reload({stream:true}));
});

// Scripts Task
// Uglifies(minifies) Javascript
gulp.task('scripts', function(){
  gulp.src('build/*.js')
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
    server: {
      baseDir: './'
    }
  });
});

// Watch Task
// Watches Jade, Sass, Javascript
gulp.task('watch', function(){
  gulp.watch('build/*.jade', ['html']);
  gulp.watch('build/*.js', ['scripts']);
  gulp.watch('build/css/main.sass', ['styles']);
});

gulp.task('default', ['html', 'scripts', 'styles', 'sync', 'watch']);
