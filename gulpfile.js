var gulp = require('gulp');
var shell = require('gulp-shell');
var sass = require('gulp-sass');
var jspm = require('gulp-jspm');
var copy = require('gulp-contrib-copy');
var clean = require('gulp-clean');
var merge = require('merge-stream');
var replace = require('gulp-replace');

gulp.task('default', ['sass', 'server:dev', 'watch']);

gulp.task('serveBuild', ['server:production'])

gulp.task('reset-env', function() {
    delete process.env.NJTRANSIT_SETTINGS;
});

gulp.task('set-env', function() {
    return process.env.NJTRANSIT_SETTINGS = 'settings/production.py';
});

gulp.task('sass', function() {
    return gulp.src('./static/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./static/css'));
});

gulp.task('build-dev', ['sass'], shell.task([
    './node_modules/.bin/webpack -d --config=config/webpack.dev.js'
]));

gulp.task('build', ['sass'], shell.task([
    './node_modules/.bin/webpack -p --config=config/webpack.prod.js'
]));

gulp.task('clean', function() {
    return gulp.src('dist/', {
            read: false
        })
        .pipe(clean({
            force: true
        }));
});

gulp.task('copy', ['clean', 'build'], function() {
    return merge([
        gulp.src('static/css/**/*.css')
            .pipe(replace(/\/static\//g, '/dist/'))
            .pipe(gulp.dest('dist/css')),
        gulp.src('static/img/**')
            .pipe(gulp.dest('dist/img')),
        gulp.src(['static/**/*.ico', 'static/*.js'])
            .pipe(gulp.dest('dist')),
        gulp.src('static/bundles/*.js')
            .pipe(gulp.dest('dist/bundles'))
    ]);
});

gulp.task('ci', ['copy']);

gulp.task('watch', function () {
    gulp.watch('static/sass/**/*.scss', ['sass']);
    gulp.watch('static/jsx/**/*.jsx', ['build-dev']);
    gulp.watch('static/jsx/**/*.js', ['build-dev']);
});



gulp.task('server:dev', ['reset-env', 'build-dev'], shell.task([
    'python tester.py',
    'python main.py'
]));

gulp.task('server:production', ['set-env', 'copy'], shell.task([
    'python tester.py',
    'python main.py'
    ]));
