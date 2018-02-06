/**
 * Module Dependencies
 */

const gulp = require('gulp');
const browserSync = require('browser-sync');
const reload = browserSync.reload;
const nodemon = require('gulp-nodemon');
const clean = require('gulp-clean');
const concat = require('gulp-concat');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const uglifyjs = require('uglify-js');
const minifier = require('gulp-uglify/minifier');
const less = require('gulp-less');
const cssmin = require('gulp-cssmin');
const cssrewrite = require('gulp-rewrite-css');
const pump = require('pump');

const minifierOptions = {
    compress: { screw_ie8: false },
    mangle: false,
    output: { screw_ie8: false }
};

const paths = {
    cleans: [
        'public/scripts/dist',
        'public/styles/dist'
    ],
    scripts: {
        vendors: [
            'public/scripts/vendors/*.js',
            'node_modules/es5-shim/es5-shim.js',
            'node_modules/es5-shim/es5-sham.js',     
            'node_modules/underscore/underscore-min.js',
            'node_modules/moment/min/moment.min.js',
            'node_modules/browser-detect/dist/browser-detect.js'
        ],
        bundles: [
            'public/scripts/polyfills/event-listener.js',
            'public/scripts/lib/jquery.selectric.min.js',
            'node_modules/tingle.js/dist/tingle.js',
            'node_modules/magnific-popup/dist/jquery.magnific-popup.min.js',
            'public/scripts/services/http/main.js',
            'public/scripts/services/render/main.js',
            'public/scripts/services/pagination/main.js',
            'public/scripts/services/filter/main.js',
            'public/scripts/helpers/develop.js',
            'node_modules/sweetalert/dist/sweetalert.min.js',
            'node_modules/owl.carousel/dist/owl.carousel.min.js',
            'node_modules/pg-calendar/dist/js/pignose.calendar.min.js',
            'public/scripts/lib/picker.js',
            'public/scripts/lib/picker.date.js',
            'public/scripts/lib/picker.time.js',
            'public/scripts/helpers/binder.js',
            'public/scripts/helpers/main.js',
            'public/scripts/helpers/polyfills.js'
        ]
    },
    styles: {
        lesses: [
            'public/less/main.less'
        ],
        csses: [
            'public/styles/dist/less.min.css',
            'node_modules/sweetalert/dist/sweetalert.css',
            'node_modules/tingle.js/dist/tingle.min.css',
            'node_modules/owl.carousel/dist/assets/owl.carousel.min.css',
            'node_modules/pg-calendar/dist/css/pignose.calendar.min.css',
            'node_modules/magnific-popup/dist/magnific-popup.css',
            'public/styles/pickadate/default.css',
            'public/styles/pickadate/default.date.css',
            'public/styles/pickadate/default.time.css'
        ]
    }
}

/**
 * Gulp Tasks
 */

gulp.task('browser-sync', ['nodemon'], () => {
    browserSync({
        proxy: "localhost:8081",
        port: 3001,
        notify: true,
        open: false
    });
});

gulp.task('nodemon', cb => {
    var called = false;
    return nodemon({
        script: 'bin/www',
        ignore: [
            'gulpfile.js',
            'node_modules/',
            'public/scripts/**/*.js'
        ]
    })
        .on('start', () => {
            if (!called) {
                called = true;
                cb();
            }
        })
        .on('restart', () => {
            setTimeout(() => {
                reload({ stream: false });
            }, 1000);
        });
});

gulp.task('default', ['browser-sync'], () => {
    gulp.watch([
        'public/less/**/*.less',
        'public/scripts/**/*.js',
        'public/images/**/*.*',
        'views/**/*.ejs'
    ], reload);
});

gulp.task('clean', () => {
    return gulp.src(paths.cleans)
               .pipe(clean({ force: true }));
});

gulp.task('scripts:vendors', (callback) => {
    pump([
        gulp.src(paths.scripts.vendors),
        concat('vendors.min.js'),
        minifier(minifierOptions, uglifyjs),
        gulp.dest('public/scripts/dist')
    ], callback);
});

gulp.task('scripts:bundles', (callback) => {
    pump([
        gulp.src(paths.scripts.bundles),
        concat('bundles.min.js'),
        minifier(minifierOptions, uglifyjs),
        gulp.dest('public/scripts/dist')
    ], callback);
});

gulp.task('scripts', ['scripts:vendors', 'scripts:bundles']);

gulp.task('styles:lesses', () => {
    return gulp.src(paths.styles.lesses)
               .pipe(concat('bundle.min.css'))
               .pipe(less())
               .pipe(cssrewrite({ sourceDir: 'public/less', destination: 'public/styles/dist' }))
               .pipe(cssmin())
               .pipe(rename('less.min.css'))
               .pipe(gulp.dest('public/styles/dist'));
});

gulp.task('styles:csses', ['styles:lesses'], () => {
    return gulp.src(paths.styles.csses)
               .pipe(cssrewrite({ sourceDir: 'public/styles', destination: 'public/styles/dist' }))
               .pipe(concat('bundle.min.css'))
               .pipe(cssmin())
               .pipe(replace(/node_modules\//g, ''))
               .pipe(gulp.dest('public/styles/dist'));
});

gulp.task('styles', ['styles:csses']);

gulp.task('build', ['clean', 'scripts', 'styles']);