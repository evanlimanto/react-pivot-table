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
        lint: {
            glob: ['src/**/*.jsx']
        }
    }
);

