/*global -$ */
'use strict';
require('es6-promise').polyfill();
var build_type = 'dist';
// var combineJSON = require('./tasks/combine_json');
// var formatProfileData = require('./tasks/format_profile_data');
var gulp = require('gulp');
var fileinclude = require('gulp-file-include');
var $ = require('gulp-load-plugins')();
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var gif = require('gulp-if');
var postcss = require('gulp-postcss');
var browserSync = require('browser-sync');
var useref = require('gulp-useref');
var handlebars = require('gulp-compile-handlebars');
var data = require('gulp-data');
var rename = require('gulp-rename');
var reload = browserSync.reload;
var archieml = require('gulp-archieml');
var source = require('vinyl-source-stream');
var fs = require('fs');
var runSequence = require('run-sequence');



gulp.task('aml2json', function() {
  console.log('aml converted to json');
    return gulp.src(build_type+'/aml/*.aml')
        .pipe(archieml())
        .pipe(gulp.dest(build_type+'/aml/js/'));
});

gulp.task('fetchDoc', function() {
  var docID = '1TBcsaL0GnBXO7O-471cYL6QnqmR2N2Nj9uRQZulGMKM';
  var copyURL = 'https://docs.google.com/feeds/download/documents/export/Export?id=' + docID + '&exportFormat=txt'
  return request(copyURL, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log('download successful!') // Show the HTML for the Google homepage.
    }else{
      console.log('download error! ' + error)
    }
  }).pipe(source('test.aml')).pipe(gulp.dest(build_type+'/aml/'));
})



gulp.task('runArchieSeq',function(callback){
  runSequence('fetchDoc',
              'aml2json',
              'renderArchie',
              callback);
})

gulp.task('renderArchie',function(){
  var templateData = require('./'+build_type+'/aml/js/test.json');
  var theCopy = templateData.copy;
  var mapped = theCopy.map(function(d){
    var rObj = {};
    rObj[d.type] = d.value;
    return rObj;
  })
  var data = {};
  data.copy = mapped;

  console.log('rendered to html');
  return gulp.src('./app/partials/archieml-body.handlebars')
    .pipe(handlebars(data))
    .pipe(rename('archie.htm'))
    .pipe(gulp.dest('app/templates/'));
})

gulp.task('convertProfilesToJson', function() {
  console.log('aml converted to json');
    return gulp.src('./app/data/profiles.aml')
        .pipe(archieml())
        .pipe(rename('profiles.json'))
        .pipe(gulp.dest('./app/data/'));
});

/*USE THIS TO PARSE PROFILE DATA AND RENDER PROFILES TO HTML*/
gulp.task('formatProfileData',['convertProfilesToJson'], function() {
    console.log('formatting profiles');
    var vetListData = require('./app/data/full-vet-list.json');
    var profileData = require('./app/data/profiles.json');
    var t = formatProfileData(profileData,vetListData);
    console.log(t.val);
    var options = {
    helpers:{
      ifeq:function(a, b, options) {
        if (a == b) { return options.fn(this); }
      },
      ifnoteq:function(a, b, options) {
        if (a != b) { return options.fn(this); }
      },
      lowercase:function(input) {
        var output = input.toLowerCase();
        return output;
      },
      list:function(items, options) {
        var out = "";
        for(var i=0, l=items.length; i<l; i++) {
          out = out + options.fn(items[i]);
        }
        return out;
      }
    }
  }
  return gulp.src('./app/partials/profiles.handlebars')
    .pipe(handlebars(t.val.profiles,options))
    .pipe(rename('profile-list.htm'))
    .pipe(gulp.dest('app/templates/'));
});

/*USE THIS TO PARSE AND RENDER ISSUES TO HTML*/
gulp.task('renderIssuesList',function(){
  var templateData = require('./app/data/overview.json');
  var vetListData = require('./app/data/full-vet-list.json');
  var t = combineJSON(templateData,vetListData);
  var options = {
    helpers:{
      ifeq:function(a, b, options) {
        if (a == b) { return options.fn(this); }
      },
      ifnoteq:function(a, b, options) {
        if (a != b) { return options.fn(this); }
      },
      iflessthan:function(index, target, options) {
        if(index < target){
            return options.fn(this);
         }
      },
      ifgreaterthan:function(index, target, options) {
        if(index >= target){
            return options.fn(this);
         }
      },
      list:function(items, options) {
        var out = "";
        for(var i=0, l=items.length; i<l; i++) {
          out = out + options.fn(items[i]);
        }
        return out;
      }
    }
  }
  return gulp.src('./app/partials/issues.handlebars')
    .pipe(handlebars(t,options))
    .pipe(rename('issues-list.htm'))
    .pipe(gulp.dest('app/templates/'));
})


gulp.task('renderProfiles',function(){
  var templateData = require('./app/data/profiles.json');
  var theCopy = templateData.profiles;

  var options = {
    helpers:{
      ifeq:function(a, b, options) {
        if (a == b) { return options.fn(this); }
      },
      list:function(items, options) {
        var out = "";
        for(var i=0, l=items.length; i<l; i++) {
          out = out + options.fn(items[i]);
        }
        return out;
      }
    }
  }
  console.log(theCopy);
  return gulp.src('./app/partials/profiles.handlebars')
    .pipe(handlebars(theCopy,options))
    .pipe(rename('profile-list.htm'))
    .pipe(gulp.dest('app/templates/'));
})





gulp.task('styles', function () {
  return gulp.src('app/styles/main.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({
      outputStyle: 'compressed', // libsass doesn't support expanded yet
      precision: 10,
      includePaths: ['.'],
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe(postcss([
      require('autoprefixer-core')({browsers: ['last 1 version']})
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(build_type+'/styles'))
    .pipe(reload({stream: true}));
});


gulp.task('renderTemplate', function () {
  var templateData = require('./app/partials/data/header.json'),
  options = {
    batch : ['app/partials'],
    helpers : {
      capitals : function(str){
        return str.toUpperCase();
      }
    }
  }

  return gulp.src('app/partials/header.tpl')
    .pipe(handlebars(templateData, options))
    .pipe(rename('content.htm'))
    .pipe(gulp.dest('app/templates/'));
});

gulp.task('move-templates', function() {
    gulp.src('app/templates/**/*')
    .pipe(gulp.dest(build_type+'/templates'));
});

gulp.task('html', [], function () {
  //var assets = useref.assets({searchPath: ['app','.']});

  return gulp.src('app/*.html')
    .pipe(useref({searchPath: ['app','.']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.csso()))
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file',
      context: {
        ver: build_type
      }
    }))
    .pipe(reload({stream: true}))
    //.pipe($.if('*.html', $.minifyHtml({conditionals: true, loose: true})))
    .pipe(gulp.dest(build_type));
});

gulp.task('images', function () {
  return gulp.src('app/images/**/*')
    // .pipe($.cache($.imagemin({
    //   progressive: true,
    //   interlaced: true,
    //   // don't remove IDs from SVGs, they are often used
    //   // as hooks for embedding and styling
    //   svgoPlugins: [{cleanupIDs: false}]
    // })))
    .pipe(gulp.dest(build_type+'/images'));
});


gulp.task('data', function () {
  return gulp.src('app/data/**/*')
    // .pipe($.cache($.imagemin({
    //   progressive: true,
    //   interlaced: true,
    //   // don't remove IDs from SVGs, they are often used
    //   // as hooks for embedding and styling
    //   svgoPlugins: [{cleanupIDs: false}]
    // })))
    .pipe(gulp.dest(build_type+'/data'));
});



gulp.task('extras', function () {
    return gulp.src([
      'app/*.*',
      '!app/*.html'
    ], {
      dot: true
    }).pipe(gulp.dest(build_type));
});

gulp.task('clean', require('del').bind(null, ['.tmp', 'dist','prod']));

gulp.task('serve', ['html','move-templates','styles','images'], function () {
  build_type = 'dist';
  browserSync({
    notify: false,
    port: 9000,
    ghostMode: false,
    server: {
      //baseDir: ['.tmp', 'app'],
      baseDir: [build_type],
      routes: {
        '/bower_components': 'bower_components'
      }
    }
  });

  // watch for changes
  gulp.watch([
    'app/templates/*',
    'app/*.html',
    'app/scripts/**/*.js',
    'app/images/**/*'
  ]).on('change', reload);

  gulp.watch(['app/*.html','app/templates/*','app/scripts/**/*.js'], ['html']);
  gulp.watch('app/styles/**/*.scss', ['styles']);
});

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('app/styles/*.scss')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)+/
    }))
    .pipe(gulp.dest('app/styles'));

  gulp.src('app/*.html')
    .pipe(wiredep({
      ignorePath: /^(\.\.\/)*\.\./
    }))
    .pipe(gulp.dest('app'));
});

gulp.task('build', ['html','move-templates', 'styles', 'images', 'data', 'extras'], function () {
  build_type = 'dist';
  return gulp.src(build_type+'/**/*').pipe($.size({title: 'build'}));
});

gulp.task('build-prod', ['runArchieSeq'], function () {
  build_type = 'prod';
  gulp.start('build');
  return gulp.src(build_type+'/**/*').pipe($.size({title: 'build-prod'}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
  gulp.start('serve');
});
