var gulp = require('gulp');
var sass = require('gulp-sass')(require('sass'));
var sassGlob = require('gulp-sass-glob');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-terser');
var concatJs = require('gulp-concat');
var concatCss = require('gulp-concat-css');
var cssnano = require('gulp-cssnano');
var sourcemaps = require('gulp-sourcemaps');

// Input configuration
var inputAssets = [
];
var inputJs = [
    './js/**/*.js'
];
var inputVendorCss = [
    './vendor_css/**/*.css'
];
var inputSass = ['./scss/**/*.scss', './../Resources/Private/Fusion/**/*.scss'];

var output = './built';

function sassTask() {
    var sassOptions = {
        errLogToConsole: true,
        outputStyle: 'expanded',
        silenceDeprecations: ['import']
    };
    return gulp
        .src(inputSass)
        .pipe(sassGlob())
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output))
        .pipe(browserSync.stream());
}

function jsTask() {
    return gulp
        .src(inputJs)
        .pipe(sourcemaps.init())
        .pipe(concatJs('index.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output));
}

function vendorCssTask() {
    return gulp
        .src(inputVendorCss)
        .pipe(sourcemaps.init())
        .pipe(concatCss('vendor.css'))
        .pipe(cssnano())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(output));
}

function assetsTask(done) {
    if (inputAssets.length === 0) {
        done();
        return;
    }
    return gulp
        .src(inputAssets, {allowEmpty: true})
        .pipe(gulp.dest(output));
}

function serveTask(done) {
    browserSync.init({
        proxy: 'dev.festival.psmb.loc'
    });

    gulp.watch(inputSass, sassTask)
        .on('change', function (path) {
            console.log('File ' + path + ' was changed, running tasks...');
        });
    gulp.watch(inputJs, jsTask)
        .on('change', function (path) {
            console.log('File ' + path + ' was changed, running tasks...');
        });
    done();
}

gulp.task('sass', sassTask);
gulp.task('js', jsTask);
gulp.task('vendorCss', vendorCssTask);
gulp.task('assets', assetsTask);
gulp.task('build', gulp.parallel(sassTask, jsTask, vendorCssTask, assetsTask));
gulp.task('serve', gulp.series(gulp.parallel(sassTask, jsTask, vendorCssTask, assetsTask), serveTask));
gulp.task('default', gulp.series('serve'));
