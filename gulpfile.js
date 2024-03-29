/*




-------------------------------------------------------
 Author:    CreativeKoen
 Github:    github.com/CreativeKoen
 Repo:      https://github.com/CreativeKoen/gulpfile-stylus
-------------------------------------------------------




*/
var gulp          = require('gulp');
var $             = require('gulp-load-plugins')();

var args          = require('yargs').argv;

var browserSync   = require('browser-sync');
var reload        = browserSync.reload;

var marked        = require('marked');
var nib           = require('nib');
var rupture       = require('rupture');
var jeet          = require('jeet');

var pkg           = require('./package.json');
//var secrets   	  = require('./secrets.json');

var production    = !!(args.production); // true if --production
var dev           = !!(args.dev); // true if --production

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});



var displayError = function(error) {
    var errorString = '[' + error.plugin + ']';
        errorString += ' ' + error.message.replace("\n",''); // Removes new line at the end
    if(error.fileName)
        errorString += ' in ' + error.fileName + '\n';
    if(error.lineNumber)
        errorString += ' on line ' + error.lineNumber + '\n';
    console.error(errorString);
}





var paths = {
  styles: {
        src:    'source/stylus/main.styl',
        watch:  'source/stylus/**/*.styl',
        dest:   'build/css',
        build:  'app/css'
    },
  scripts: {
        src:    'source/js/*.js',
        dest:   'build/js',
        build:  'app/js'
    },
  html: {
        src:    'source/*.jade',
        dest:   'build/',
        build:  'app/'
    }
}





/*
-------------------------------------------------------
    Styles
-------------------------------------------------------
*/
gulp.task('styles', function() {
  gulp.src(paths.styles.src)
    .pipe($.changed(paths.styles.dest))
      .pipe($.stylus({
            compress: false,
            errLogToConsole: true,
            use: [ nib(), rupture(), jeet() ]
          }))
      .on('error', function(err)  { displayError(err);    })
      .pipe($.autoprefixer({browser: ['last 2 version','Firefox ESR', 'Opera 12.1','ie10','ie11'],cascade: true} ))
      .pipe($.rename({ suffix: '.min' }))
      .pipe($.minifyCss)
      .pipe($.if(args.dev, gulp.dest(paths.styles.dest)))
      .pipe($.if(args.production, gulp.dest(paths.styles.build) ))
    .pipe(browserSync.reload({stream:true}))
    .pipe($.notify('Styles Sass => minCss'));
  });





/*
-------------------------------------------------------
    Scripts
-------------------------------------------------------
*/
gulp.task('scripts', function() {
    gulp.src(paths.scripts.src)
    .pipe($.changed(paths.scripts.dest))
      .pipe($.jshint())
      .pipe($.jshint.reporter($.jshintStylish))
      .pipe($.plumber())
      .pipe($.uglify())
      .pipe($.if(args.dev, $.uglify()))
      .pipe($.if(args.production, $.uglify()))
      .pipe($.concat('main.js'))
      .pipe($.rename({ suffix: '.min' }))
    .pipe($.if(args.dev, gulp.dest(paths.scripts.dest)))
    .pipe($.if(args.production, gulp.dest(paths.scripts.build) ))
    .pipe($.notify('Scripts js => min js'));
});





/*
-------------------------------------------------------
    Templates
-------------------------------------------------------
*/
gulp.task('html', function(){
    gulp.src(paths.html.src)
    .pipe($.changed(paths.html.dest))
      .pipe($.if(args.dev, $.jade({pretty: true, markdown: marked})))
      .pipe($.if(args.production, $.jade({pretty: false, markdown: marked})))
        .on('error', function(err)  { displayError(err);    })
        .pipe($.if(args.dev, gulp.dest(paths.html.dest)))
        .pipe($.if(args.production, gulp.dest(paths.html.build) ))
      .pipe(browserSync.reload({stream:true}))
      .pipe($.notify({ message: 'Jade compiled to html' }));
});





/*
-------------------------------------------------------
    Php
-------------------------------------------------------
*/
gulp.task('html:php', function(){
    gulp.src(paths.html.src)
    .pipe($.changed(paths.html.dest))
      .pipe($.if(args.dev, $.jadePhp({pretty: true})))
      .pipe($.if(args.production, $.jadePhp({pretty: false})))
        .on('error', function(err)  { displayError(err);    })
        .pipe($.if(args.dev, gulp.dest(paths.html.dest)))
        .pipe($.if(args.production, gulp.dest(paths.html.build) ))
      .pipe(browserSync.reload({stream:true}))
      .pipe($.notify({ message: 'Jade compiled to php' }));
});





/*
-------------------------------------------------------
    Server
-------------------------------------------------------
*/
var config = {
    //proxy:      'local.example',
    notify:     true,
    logPrefix:  'CreativeKoen',
    server: {
        baseDir:    './build',
    },
    browser:    ['firefox']
};
gulp.task('server', function() {
    browserSync(config);

  gulp.watch(paths.scripts.src,  ['scripts']);
  gulp.watch(paths.styles.watch, ['styles']);
  gulp.watch(paths.html.src,     ['html']);
});






gulp.task('default', ['scripts', 'styles','html','server']);
gulp.task('php', ['scripts', 'styles','html:php','server']);




/*
-------------------------------------------------------
    Archive
-------------------------------------------------------
*/
gulp.task('archive', function(){
  gulp.src(['build/**/*'])
  .pipe($.zip(pkg.name + '-' + pkg.version + '.zip'))
  .pipe(gulp.dest('./'));
});





/*
-------------------------------------------------------
    Deploy
-------------------------------------------------------
*/
gulp.task('deploy',['archive'], function(){
    gulp.src('test/')
    .pipe(ftp({
        host: secrets.host,
        user: secrets.user,
        pass: secrets.pass,
        remotePath: '/public_html/' + secrets.path
    }))
});
