/**
 * Created by FANAT on 13.09.2015.
 */

module.exports = function(config)
{
    config.set({
        frameworks: [ 'jasmine' ],
        basePath: '..',
        files: [
            'test/*.js', // тесты
            //'js/upload_framework.js',
            //'js/torrent.js',
            'js/bb.engine.js'
            //'js/controls/*.js'
        ],
        browsers: [ 'Chrome' ]
    });
};
