const gulp = require('gulp');
const pug = require('gulp-pug');
const fs = require('fs');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');

const del = require('del');

const browserSync = require('browser-sync').create();

const gulpWebpack = require('gulp-webpack');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config.js');

const paths = {
    root: './build',
    templates: {
        pages: 'src/views/pages/*.pug',
        src: 'src/views/**/*.pug'
    },
    styles: {
        src: 'src/styles/**/*.sass',
        dest: 'build/assets/styles/'
    },    
    images: {
        src: 'src/images/**/*.*',
        dest: 'build/assets/images/'
    },
    scripts: {
        src: 'src/scripts/**/*.js',
        dest: 'build/assets/scripts/'
    }
}

// pug
function views() {
    return gulp.src(paths.templates.pages)
        .pipe(pug({
            locals : JSON.parse(fs.readFileSync('./content.json', 'utf-8')),
            pretty: true,
        }))
        .pipe(gulp.dest(paths.root));
}

// sass
function styles() {
    return gulp.src('./src/styles/app.sass')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(sourcemaps.write())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest(paths.styles.dest))
}

// очистка
function clean() {
    return del(paths.root);
}

// webpack
function scripts() {
    return gulp.src('src/scripts/app.js')
        .pipe(gulpWebpack(webpackConfig, webpack)) 
        .pipe(gulp.dest(paths.scripts.dest));
}

// галповский вотчер
function watch() {
    gulp.watch(paths.styles.src, styles);
    gulp.watch(paths.templates.src, views);
    gulp.watch(paths.images.src, images);
    gulp.watch(paths.scripts.src, scripts);
}

// локальный сервер + livereload (встроенный)
function server() {
    browserSync.init({
        server: paths.root
    });
    browserSync.watch(paths.root + '/**/*.*', browserSync.reload);
}

// просто переносим картинки
function images() {
    return gulp.src(paths.images.src)
        .pipe(gulp.dest(paths.images.dest));
}

exports.templates = views;
exports.styles = styles;
exports.clean = clean;
exports.images = images;

gulp.task('default', gulp.series(
    clean,
    gulp.parallel(styles, views, images, scripts),
    gulp.parallel(watch, server)
));