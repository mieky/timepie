var gulp         = require("gulp");
var sass         = require("gulp-sass");
var webserver    = require("gulp-webserver");
var livereload   = require("gulp-livereload");
var autoprefixer = require("gulp-autoprefixer");
var del          = require("del");

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
    gulp.watch("./app/sass/*.scss", ["sass"]);
});

gulp.task("server", function() {
    gulp.src("./app")
        .pipe(webserver({
            livereload: true
        }));
});

gulp.task("build", ["clean"], function() {
    gulp.src(["index.html", "./js/**", "./css/**", "./fonts/**", "./img/**"], { base: "./app/" })
        .pipe(gulp.dest("dist"));
});

gulp.task("default", ["sass", "watch", "server"], function() {});
