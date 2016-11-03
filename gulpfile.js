var gulp = require("gulp");
var ts = require("gulp-typescript");
var merge = require("merge2");
var project = ts.createProject("tsconfig.json", { noImplicitAny: true });

gulp.task("default", () => {
    var result = project.src().pipe(project());
    return result.js.pipe(gulp.dest("dist"))
});
