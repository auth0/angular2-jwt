var gulp = require('gulp');

var PATHS = {
    src: 'src/*.ts'
};

gulp.task('clean', function(done) {
    var del = require('del');
    del(['dist'], done);
});

gulp.task('ts2js', function() {
    var typescript = require('gulp-typescript');
    var tsResult = gulp.src(PATHS.src)
        .pipe(typescript({
            noImplicitAny: true,
            module: 'system',
            target: 'ES5',
            moduleResolution: 'node',
            emitDecoratorMetadata: true,
            experimentalDecorators: true
        }));

    return tsResult.js.pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
    gulp.watch(PATHS.src, ['ts2js'])
})

gulp.task('default', ['ts2js', 'watch']);