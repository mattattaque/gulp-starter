import gulp from 'gulp';
import sass from 'gulp-sass';
import babel from 'gulp-babel';
import eslint from 'gulp-eslint';
import browserSync from 'browser-sync'; 
import child_process from 'child_process'; 
import browserify from 'browserify';
import fs from 'fs';
import babelify from 'babelify';
import del from 'del';  
import watchify from 'watchify';

const reload = browserSync.reload; 
const execute = child_process.exec; 

const src = {
  scss: './src/scss/*.scss',
  js:   './src/js/*.js',
  html: './build/*.html'
};

gulp.task('default', ['build', 'lint', 'lint:watch', 'sass', 'sass:watch']);

// Uses babelify and browswerify to transpile (ES6->ES5) and bundle up our ES5 code. 
gulp.task('build', () => { 
  const b = browserify({
    entries: './src/js/main.js',
    cache: {}, 
    packageCache: {}, 
    plugin: [watchify]
  }); 
  //Takes browserify instance defined in higher scope and initiates bundling 
  const bundleMe = () => {
    b.transform('babelify', {presets: ['es2015']})
    .bundle()
    .pipe(fs.createWriteStream('./build/bundle.js'));
  }; 
  b.on('update', bundleMe); 
  bundleMe();
});

gulp.task('sass', () => {
  return gulp.src( src.scss )
  .pipe(sass().on('error', sass.logError))
  .pipe(gulp.dest('./build'));
});

gulp.task('sass:watch', () => {
  gulp.watch( src.scss , ['sass']);
});

gulp.task('lint', () => {
  return gulp.src([ src.js,'!node_modules/**']) 
  .pipe(eslint())
  .pipe(eslint.format())
  //.pipe(eslint.failAfterError());
});

gulp.task('lint:watch', ['lint'], () => { 
  gulp.watch([ src.js ], ['lint']); 
});

gulp.task('serve', function () {
  browserSync.init({
    server: {
      baseDir: "./build/"
    },
  });
  gulp.watch(src.html).on("change", reload);
  gulp.watch(src.scss, ['sass', reload]);
  gulp.watch(src.js, ['build', reload]);

});

// Automate unit testing on JavaScript with Tape. 
// TODO: Would be nice to find a better way of doing this without having to 
// spawn a child process (execute)
gulp.task('test', () => {
  return execute('babel-tape-runner ./test/*', function (err, stdout, stderr) {
  console.log(stdout);
  console.log(stderr);
  });
});

gulp.task('test:watch', ['test'], () => { 
  gulp.watch([ src.js, 'test/*.js'], ['test']); 
});

gulp.task('clean', () => {
  return del(['build/*.js', 'build/*.css', '!build/index.html'])
  .then(paths => {
  console.log('Deleted files and folders:\n', paths.join('\n'));
  });
});

