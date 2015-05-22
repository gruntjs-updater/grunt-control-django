# grunt-control-django

> Start, stop, test, manage concurrent Django servers.

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-control-django --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-control-django');
```

## The "control_django" task

### Overview
In your project's Gruntfile, add a section named `control_django` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
    control_django: {
        dev_server_up: {
            options: {
                host: 8000,
                port: 127.0.0.1,
                // Starts the server
                always_restart: true,
            },
        },
        test_server_up: {
            options: {
                host: host,
                port: testport,
                always_restart: true,
            },
        },
        test_server_down: {
            options: {
                host: host,
                port: testport,
                // Kills the server
                always_kill: true,
            },
        },
    },
});
```

### Options

#### options.host
Type: `String`
Default value: `undefined`

This is the host IP from which you will serve Django, for example: `127.0.0.1`.

#### options.port
Type: `number`
Default value: `undefined`

This is the port you are serving your Django server from, Eg: `8000`.

### Usage Examples

#### Default Options
In this example, I want to run a Django test server for my end-to-end tests on port `8001`, without bringing down my default Django dev server on port `8000`. The code below shows how to start and stop the server from the Grunt config.

```js
grunt.initConfig({
    control_django: {
      test_server_up: {
          options: {
              host: '127.0.0.1',
              port: '8001',
              always_restart: true,
          },
      },
      test_server_down: {
          options: {
              host: '127.0.0.1',
              port: '8001',
              always_kill: true,
          },
      },
    }
});

grunt.registerTask('django-start', 'control_django:test_server_up');
grunt.registerTask('django-stop', 'control_django:test_server_up');
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
=======
Start, stop, test, manage concurrent Django servers.
