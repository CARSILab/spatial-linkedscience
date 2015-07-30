var gulp = require('gulp'),
    jade = require('gulp-jade'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber'),
    concat = require('gulp-concat'),
    gutil = require('gulp-util'),
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
  return gulp.src('dev/css/main.sass')
    .pipe(plumber(function(error) {
      gutil.beep();
      gutil.log(gutil.colors.red(error.message));
      this.emit('end');
    }))
    .pipe(sass({
      //includePaths: ['dev/css/1-plugins', 'dev/css/2-base', 'dev/css/3-sections']
    }))
    .pipe(prefix(['last 2 versions', 'ie 9'], { cascade: true }))
    .pipe(gulp.dest('assets/css'))
    .pipe(reload({stream:true}));
  });

// Scripts Task
// Uglifies(minifies) Javascript
gulp.task('scripts', function(){
  gulp.src(['dev/js/jquery.min.js', 'dev/js/bootstrap.min.js', 'dev/js/leaflet-src.js', 'dev/js/Sparql.js', 'dev/js/spatial.js'])
      .pipe(plumber())
      .pipe(concat('scripts.min.js', {
        newLine:'\n;'
      }))
      .pipe(gulp.dest('assets/js'))
      .pipe(uglify())
      .pipe(gulp.dest('assets/js'))
      .pipe(reload({stream:true}));
});


// Sync Task
// runs browser-sync
gulp.task('sync', function(){
  browserSync({
    proxy: '127.0.0.1:80',
    open: "external"
  });
});

// Watch Task
// Watches Jade, Sass, Javascript
gulp.task('watch', function(){
  gulp.watch('dev/*.jade', ['html']);
  gulp.watch('dev/js/*.js', ['scripts']);
  gulp.watch('dev/css/**/*.{sass,scss}', ['styles']);
});

// Default Task
// Runs all the above
gulp.task('default', ['html', 'scripts', 'styles', 'sync', 'watch']);

// Offline Task
// Runs all the above except for browser-sync
gulp.task('offline', ['html', 'scripts', 'styles', 'watch']);
