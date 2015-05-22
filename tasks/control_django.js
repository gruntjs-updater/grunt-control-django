/*
 * grunt-control-django
 * https://github.com/f1lt3r/grunt-control-django
 *
 * Copyright (c) 2015 Alistair MacDonald
 * Licensed under the MIT license.
 */

'use strict';

var sys = require('sys');
var _exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var Promise = require('bluebird');

function catchAllErr(e){
  console.warn("catchAllErr");
  console.error(e);
}

function verbose(msg){
  if (1||verbose){
    console.log(msg);
  }
}


var errors = {
  1: 'Can\'t kill server because: Server not running.'
};


function exec(command){
  return new Promise(function(resolve, reject){
    var child = _exec(command, function (error, stdout, stderr) {
      if (error !== null) {
        return reject(error);
      }

      resolve({out: stdout, err: stderr});
    });
  });
}




function kill(PIDs){
  var command = "kill -9 " + PIDs.join(' ');
  // console.log(command);
  return command;
}



module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  function _spawn(command){
    return new Promise(function(resolve, reject){
      var commands = command.split(' ');
      // console.log( commands[0], commands.slice(1));

      var child = spawn(commands[0], commands.slice(1));
      // var child = spawn(commands[0], commands.slice(1), { customFds: [0,1,2] });
      // var child = spawn(commands[0], commands.slice(1), {  stdio: 'inherit' });

      child.stdout.on('data', function (data) {
        grunt.log.write(data);
      });
      child.stderr.on('data', function (data) {
        grunt.log.write(data);
      });
      child.on('close', function (code) {
        grunt.log.warn('child process closed with code ' + code);
        reject(code);
      });
      child.on('exit', function (code) {
        grunt.log.warn('child process exited with code ' + code);
        reject(code);
      });
    });
  }




  grunt.registerMultiTask('control_django', 'Start, stop, test, manage concurrent Django servers.', function() {

    // Lets go Async!
    var done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    var opts = this.options({
      punctuation: '.',
      separator: ', '
    });
    // console.log(ops);

    var target = this.target;


    // Cleans the PIDS of linebeaks and spaces from CLI str
    // Returns array of numbers.
    function cleanPIDs(result){
      return new Promise(function(resolve, reject){
        var tmp = result.out.split('\n'),
          PIDs = [];

        tmp.forEach(function (str){
          var pid = parseInt(str);
          if (!isNaN(pid) && typeof pid === 'number'){
            PIDs.push(pid);
          }
        });

        if (PIDs.length > 0) {
          grunt.log.write('Server already running.');
          resolve(PIDs);
        } else {
          reject(1);
        }
      });
    }


    function maybeKillServer(PIDs){
      return new Promise(function(resolve, reject){
        if (opts.always_restart) {
          exec(kill(PIDs)).then(function(result){
            if (result.err) {
              grunt.log.error('"always_restart" is true, but couldn\'t kill existing Django server: '+target);
              return reject();
            } else {
              // Kill was successful
              grunt.log.write('\n');
              grunt.log.ok('Killed existing Django server: '+target);
              resolve();
            }
          });
        } else {
          resolve();
        }
      });
    }

    function killServer(PIDs){
      return new Promise(function(resolve, reject){
        exec(kill(PIDs)).then(function(result){
          if (result.err) {
            grunt.log.error('"always_kill" is true, but couldn\'t kill existing Django server: '+target);
            return reject();
          } else {
            // Kill was successful
            grunt.log.write('\n');
            grunt.log.ok('Killed existing Django server: '+target);
            done();
            resolve();
          }
        });
      });
    }

    function runServer(){
      return new Promise(function(resolve, reject){
        grunt.log.write('\n');
        grunt.log.ok('Starting Django server: '+target);
        _spawn(commands.run).then(function(result){
          grunt.log.write(result);
        }).catch(function(err){
          reject(err);
        });
      });
    }

    function getPIDs(PIDs){ return exec(commands.getPIDs); }

    var commands = {
      getPIDS: "ps -fe | grep 'python manage.py runserver "+opts.host+":"+opts.port+"' | grep -v grep | awk '{print $2}'",
      run: "python manage.py runserver "+opts.host+":"+opts.port,
      test: "python manage.py test --verbosity 2",
    };

    if (opts.always_kill) {
      exec(commands.getPIDS)
      .then(cleanPIDs)
      .then(killServer)
      .catch(function(err){
        grunt.log.warn('Error code: '+err);
        grunt.log.warn(errors[err]);
        done();
      });
    }

    if (opts.always_restart) {
      // exec(commands.getPIDS)
      // .then(cleanPIDs)
      // .then(maybeKillServer)
      // .then(runServer)
      runServer()
      .catch(function(code){
        done();
        // grunt.log.warn(code);
        // switch(code){
          // Server wasn't running, couldn't be killed
          // case 1:
            // grunt.log.write('Django server was not running: '+target);
            // But we want to start server anyway
            // runServer();
            // break;
        // }
      });
    }

  });

};
