var gulp = require('gulp');
var webpack = require('webpack-stream');

gulp.task('default', function() {
    return gulp.src('examples/app.jsx')
        .pipe(webpack(
        {
            output: {
                filename: 'bundle.js'
            },
            devtool: 'source-map',
            module: {
                loaders: [
                    {
                        test: /\.jsx$/,
                        loader: 'babel-loader',
                        query: {
                            presets: ['es2015', 'react', 'stage-1'],
                            plugins: ['transform-runtime']
                        }
                    },
                    {
                        test: /\.js$/,
                        loader: 'script-loader',
                    }
                ]
            }
        }
        ))
        .pipe(gulp.dest('examples/'));
});
