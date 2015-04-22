# My Workflow #


* Gulp
* Jade
* Stylus
* Jeet
* nib
* rupture

```
$ npm i
$ npm start
```

### folders Explained

The `source` folder contains your jade,stylus and js files.
The `build` folder is for the development stage and contains compiled html,css,javascript files.
The `app` folder is for the production stage and contains minified html,css and javascript.

### Ready to Deploy your site?

**edit** and **rename** the `examples-secrets.json` file to just `secrets.json` and add you server username, password and path where it needs to drop the files.

```
$ gulp deploy
```

#### DRY testing
To test a task just run `gulp` followed by the task.
To run it with php use `gulp php`

#### Get Started
for the development stage use `--dev` flag
for the production stage use `--production` flag
