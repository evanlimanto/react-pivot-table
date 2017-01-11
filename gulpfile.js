/*
var gulp = require('gulp'),
    addStandardGulpTasks = require('djs-dev-tools').configureGulp.default,
    appTypes = require('djs-dev-tools').appTypes,
    environments = require('djs-utils').environments;

process.env.NODE_ENV = process.env.NODE_ENV || environments.DEVELOPMENT;

addStandardGulpTasks(gulp,
    {
        maindir: __dirname,
        types: [appTypes.TYPE_REACT],
        copiedFiles: [
            __dirname + '/examples/index.html'
        ],
        taskOptions: {
            webpack: {
                config: {
                    entry: __dirname + '/examples/app.jsx'
                }
            }
        },
        webpack: {
            descoenv: {js: __dirname + '/descoenv.js', dest: __dirname + '/src'},
            config: {
                entry: __dirname + '/examples/app.jsx'
            },
            devServerPort: 8081
        },
    }
);
*/
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
