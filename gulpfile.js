const gulp = require("gulp");
const ts = require("gulp-typescript");
const uglify = require("gulp-uglify");
const pump = require("pump");

const project = ts.createProject("tsconfig.json");

gulp.task("build", () => {
    const result = project.src().pipe(project());
    return result.js.pipe(gulp.dest("dist"))
});

gulp.task("compress", () => {
    // pump([
    //     gulp.src("lib/*js"),
    //     uglify(),
    //     gulp.dest("dist/")
    // ])
});

gulp.task("default", ["build", "compress"]);
