const gulp = require("gulp");
const ts = require("gulp-typescript");
const livereload = require("gulp-livereload");

const project = ts.createProject("tsconfig.json", { noImplicitAny: true });

gulp.task("build-live", () => {
    let result = project.src().pipe(project());
    result.pipe(result.js.pipe(gulp.dest("dist")))
    .pipe(livereload());

    // let result = project.src().pipe(project());
    // return result.js.pipe(gulp.dest("dist"))
});

gulp.task("dev", () => {
    livereload.listen();
    gulp.watch("src/**/*.ts", ["build-live"]);
});
