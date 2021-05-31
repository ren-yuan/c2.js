const gulp = require('gulp');
const browserify = require('browserify');
const tsify = require("tsify");
const source = require('vinyl-source-stream');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const {series} = require('gulp');

function build() {
    return browserify({entries: ['src/main.ts'], standalone: 'c2'})
    .plugin(tsify)
    .bundle()
    .pipe(source('c2.js'))
    .pipe(gulp.dest("dist"));
}

function compress() {
    return gulp.src('dist/c2.js')
    .pipe(uglify())
    .pipe(rename({extname: '.min.js'}))
    .pipe(gulp.dest('dist'));
}

function copy() {
    return gulp.src('dist/c2.min.js')
    .pipe(gulp.dest('website/assets'));
}

exports.default = series(build, compress, copy);