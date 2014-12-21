var gulp         = require("gulp");
var sass         = require("gulp-sass");
var webserver    = require("gulp-webserver");
var livereload   = require("gulp-livereload");
var autoprefixer = require("gulp-autoprefixer");
var gutil        = require("gulp-util");
var sourcemaps   = require("gulp-sourcemaps");
var del          = require("del");
var source       = require("vinyl-source-stream");
var buffer       = require("vinyl-buffer");
var watchify     = require("watchify");
var browserify   = require("browserify");
var tsify        = require("tsify");

gulp.task("clean", function (cb) {
    del(["dist/**"], cb);
});

gulp.task("sass", function() {
    gulp.src("./app/sass/*.scss")
        .pipe(sass({ errLogToConsole: true }))
        .pipe(autoprefixer())
        .pipe(gulp.dest("./app/css"))
        .pipe(livereload());
});

gulp.task("watch", function() {
    livereload.listen();
    gulp.watch("./app/sass/*/*.scss", ["sass"]);
    gulp.watch("./app/js/**/*.js", ["ts"]);
});

gulp.task("server", function() {
    gulp.src("./app")
        .pipe(webserver({
            livereload: true
        }));
});

gulp.task("build", ["clean"], function() {
    gulp.src(["./app/index.html", "./app/js/**", "./app/css/**"], { base: "./app/" })
        .pipe(gulp.dest("dist"));
});

gulp.task("default", ["sass", "ts", "watch", "server"], function() {});

// Typescript bundle
var bundler = watchify(browserify("./app/src/timepie.ts", watchify.args));
bundler.plugin("tsify");

gulp.task("ts", bundle);
bundler.on("update", bundle); // on any dep update, runs the bundler

function bundle() {
    return bundler.bundle()
        .on("error", gutil.log.bind(gutil, "Browserify Error"))
        .pipe(source("timepie.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        .pipe(sourcemaps.write("./", {
            debug: true,
            includeContent: false,
            sourceRoot: "/js"
        }))
        .pipe(gulp.dest("./app/js"));
}
