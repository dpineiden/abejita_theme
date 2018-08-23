var gulp = require('gulp');
//var path = require('path');
var sass = require('gulp-sass');
var mainBowerFiles = require('main-bower-files');
var $ = require('gulp-load-plugins')();
var watch = require('gulp-watch');
var minifycss = require('gulp-clean-css');
var rename = require('gulp-rename');
var gzip = require('gulp-gzip');
var browserSync = require('browser-sync');
var reload = browserSync.reload;

var gzip_options = {
    threshold: '1kb',
    gzipOptions: {
        level: 9
    }
};

// Error notifications
var reportError = function(error) {
  $.notify({
    title: 'Gulp Task Error',
    message: 'Check the console.'
  }).write(error);
  console.log(error.toString());
  this.emit('end');
}
var config = {
  bootstrapDir: './bootstrap',
};


// Sass processing
gulp.task('sass', function() {
  return gulp.src(['node_modules/bootstrap/scss/bootstrap.scss', 'scss/style.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest("css"))
    .pipe(sass({ outputStyle: 'compressed' }))
    .pipe(browserSync.reload({
      stream: true
    }))
    .pipe($.notify({
      title: "SASS Compiled",
      message: "Your CSS files are ready sir.",
      onLast: true
    }));
});

// process JS files and return the stream.
gulp.task('js', function() {
  return gulp.src(['node_modules/bootstrap/dist/js/bootstrap.min.js',
                   'node_modules/jquery/dist/jquery.min.js',
                   'node_modules/popper.js/dist/umd/popper.min.js'])
    .pipe(gulp.dest("js"))
    .pipe(browserSync.stream());
});

// Optimize Images
gulp.task('images', function() {
  return gulp.src('images/**/*')
    .pipe($.imagemin({
      progressive: true,
      interlaced: true,
      svgoPlugins: [{
        cleanupIDs: false
      }]
    }))
    .pipe(gulp.dest('images'));
});

// JS hint
gulp.task('jshint', function() {
  return gulp.src('js/*.js')
    .pipe(reload({
      stream: true,
      once: true
    }))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.notify({
      title: "JS Hint",
      message: "JS Hint says all is good.",
      onLast: true
    }));
});

// Beautify JS
gulp.task('beautify', function() {
  gulp.src('js/*.js')
    .pipe($.beautify({indentSize: 2}))
    .pipe(gulp.dest('scripts'))
    .pipe($.notify({
      title: "JS Beautified",
      message: "JS files in the theme have been beautified.",
      onLast: true
    }));
});

// Compress JS
gulp.task('compress', function() {
  return gulp.src('js/*.js')
    .pipe($.sourcemaps.init())
    .pipe($.uglify())
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('scripts'))
    .pipe($.notify({
      title: "JS Minified",
      message: "JS files in the theme have been minified.",
      onLast: true
    }));
});

// Run drush to clear the theme registry
gulp.task('drush', function() {
  return gulp.src('', {
      read: false
    })
    .pipe($.shell([
      'drush cc views',
    ]))
    .pipe($.notify({
      title: "Caches cleared",
      message: "Drupal caches cleared.",
      onLast: true
    }));
});



// BrowserSync
gulp.task('browser-sync', function() {
  //watch files
  var files = [
    'styles/main.css',
    'js/**/*.js',
    'images/**/*',
    'templates/**/*.twig'
  ];
  browserSync.init({
    proxy: "drupal.localhost" ,
    online: true
  });
  //initialize browsersync
});
// gulp.task('bower', function() {
//     // mainBowerFiles is used as a src for the task,
//     // usually you pipe stuff through a task
//     return gulp.src(mainBowerFiles())
//         // Then pipe it to wanted directory, I use
//         // dist/lib but it could be anything really
//         .pipe(gulp.dest('dist/lib'))
// });

// Default task to be run with `gulp`
gulp.task('default', ['sass', 'browser-sync', 'js', 'drush'], function() {
  gulp.watch(['node_modules/bootstrap/scss/bootstrap.scss', 'scss/*.scss'], ['sass']);
  gulp.watch("js/**/*.js", ['js']);
  gulp.watch("templates/*.twig", ['drush']);
  gulp.watch("**/*.yml", ['drush']);
  gulp.watch("**/*.theme", ['drush']);
  gulp.watch("src/*.php", ['drush']);
});
