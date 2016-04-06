var gulp = require('gulp');
var path = require('path');
var del = require('del');
var sass = require('gulp-sass');
var cssmin = require('gulp-cssmin');
var autoprefixer = require('gulp-autoprefixer');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var browserify = require('gulp-browserify');
var uglify = require('gulp-uglify');
var nunjucks = require('gulp-nunjucks');
var htmlmin = require('gulp-htmlmin');
var imagemin = require('gulp-imagemin');
var runsequence = require('gulp-run-sequence');
var browsersync = require('browser-sync');
var gulpif = require('gulp-if');
var minimist = require('minimist');

var knownOptions = {
    string: 'env',
    default: { env: 'dev' }
};

var options = minimist(process.argv.slice(2), knownOptions);

var paths = {
    'source': 'src',
    'destination': 'build',
    'css_src': 'src/sass/**/*.scss',
    'css_dist': 'build/css',
    'js_src': 'src/js/**/*.js',
    'js_dist': 'build/js',
    'img_src': 'src/images/**/*',
    'img_dist': 'build/images',
};

gulp.task('sass', function() {
    gulp.src(paths.css_src)
        .pipe(gulpif(options.env === 'dev', sourcemaps.init()))
        .pipe(sass())
        .pipe(autoprefixer({
            browsers: ['last 2 versions', '> 5%', 'ie 9']
        }))
        .pipe(cssmin())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulpif(options.env === 'dev', sourcemaps.write()))
        .pipe(gulpif(options.env === 'dev', browsersync.reload({stream: true})))
        .pipe(gulp.dest(paths.css_dist));
});

gulp.task('js', function() {
    return gulp.src(paths.js_src)
        .pipe(gulpif(options.env === 'dev', sourcemaps.init()))
        .pipe(browserify())
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulpif(options.env === 'dev', sourcemaps.write()))
        .pipe(gulpif(options.env === 'dev', browsersync.reload({stream: true})))
        .pipe(gulp.dest(paths.js_dist));
});

gulp.task('html', function() {
    gulp.src([paths.source + '/**/*.html', '!' + paths.source + '/layouts/**', '!' + paths.source + '/includes/**'])
        .pipe(nunjucks.compile())
        .pipe(rename(function(file) {
            file.extname = '.html';
            if (file.basename !== 'index' && file.basename !== '404' && file.basename !== 'googlece70ffefa64987a5') {
                file.dirname = path.join(file.dirname, file.basename);
                file.basename = "index";
            }
            return file;
        }))
        .pipe(gulpif(options.env === 'prod', htmlmin({collapseWhitespace: true})))
        .pipe(gulpif(options.env === 'dev', browsersync.reload({stream: true})))
        .pipe(gulp.dest(paths.destination));
});

gulp.task('images', function() {
    gulp.src(paths.img_src)
        .pipe(imagemin({progressive: true}))
        .pipe(gulp.dest(paths.img_dist));
});

gulp.task('htaccess', function() {
    gulp.src(paths.source + '/.htaccess')
        .pipe(gulp.dest(paths.destination));
});

gulp.task('htpasswd', function() {
    gulp.src(paths.source + '/.htpasswd')
        .pipe(gulp.dest(paths.destination));
});

gulp.task('favicon', function() {
    gulp.src(paths.source + '/favicon.ico')
        .pipe(gulp.dest(paths.destination));
});

gulp.task('sitemap', function() {
    gulp.src(paths.source + '/sitemap.txt')
        .pipe(gulp.dest(paths.destination));
});

gulp.task('clean', function() {
    del(paths.destination);
});

gulp.task('build', ['clean'], function(cb) {
    runsequence('html', ['htaccess', 'htpasswd', 'favicon', 'sitemap'], ['sass', 'js', 'images'], cb);
});

gulp.task('serve', ['build'], function() {
    browsersync.init({
        server: {
            baseDir: paths.destination
        },
        open: false
    });
    gulp.watch(paths.source + '/**/*.html', ['html']);
    gulp.watch(paths.css_src, ['sass']);
    gulp.watch(paths.js_src, ['js']);
    gulp.watch(paths.img_src, ['images']);
});

gulp.task('default', ['serve']);
