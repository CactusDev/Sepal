const gulp = require("gulp");
const ts = require("gulp-typescript");

const project = ts.createProject("tsconfig.json");

gulp.task("build", () => {
    const result = project.src().pipe(project());
    return result.js.pipe(gulp.dest("js"))
});

gulp.task("default", ["build"]);
