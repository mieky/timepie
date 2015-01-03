var gulp         = require("gulp");
var sass         = require("gulp-sass");
var webserver    = require("gulp-webserver");
var livereload   = require("gulp-livereload");
var autoprefixer = require("gulp-autoprefixer");
var gutil        = require("gulp-util");
var del          = require("del");
var source       = require("vinyl-source-stream");
var watchify     = require("watchify");
var browserify   = require("browserify");
var tsify        = require("tsify");

gulp.task("clean", function(cb) {
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
    gulp.watch("./app/sass/**/*.scss", ["sass"]);
    gulp.watch("./app/src/**/*.ts", ["ts"]);
});

gulp.task("server", function() {
    gulp.src("./app")
        .pipe(webserver({
            livereload: false
        }));
});

gulp.task("build", ["clean"], function() {
    gulp.src(["./app/index.html", "./app/js/**", "./app/css/**"], { base: "./app/" })
        .pipe(gulp.dest("dist"));
});

gulp.task("ts", function bundle() {
    var watchifyArgs = watchify.args;
    watchifyArgs.debug = true;

    var bundleStream = watchify(browserify("./app/src/timepie.ts", watchifyArgs))
        .plugin("tsify")
        .bundle();

    return bundleStream
        .on("error", gutil.log.bind(gutil, "Browserify error"))
        .pipe(source("timepie.js"))
        .pipe(gulp.dest("./app/js"));
});

gulp.task("default", ["sass", "ts", "watch", "server"], function() {});
