# How To Set Up Your Local Environment

This is a step by step guide for setting up your local production environment. This includes setting up the server, the database, and the build system.

I wrote this guide after going through this grueling process _**three times**_. The first time taking me several weeks to figure out.

**NOTE: ** I am no expert in this stuff, so these steps are very specific to my exact situation. If you have a Windows computer, these steps will surely vary (for example, Im pretty sure Homebrew is mac only) but there are alternatives; I just don't know them because like I said, I am no expert.

## Get the Repo

Paste this into your terminal to get the code.
```shell
git clone https://github.com/CARSILab/spatial-linkedscience.git
```

_If you don't already have it, here is how you can download [Git][git]_

## Setting Up The Backend Stuff

### Homebrew:

This is a package manager for OSX.
You can install it by pasting this into your terminal:
```shell
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```
After it is installed, run this command to make sure everything went okay:

```shell
brew doctor
```

### Nginx server

1. Run `brew install nginx` from the terminal
1. Navigate to `usr/local/etc/nginx`
1. Replace `nginx.conf` with `_config/nginx.conf` from this repo
1. Open `nginx.conf` and go to ~line 152
1. Replace the `root` path with the path to your project directory + `/dist`

### Fuseki

1. Download [Fuseki][fuseki]
1. Extract and rename folder to `fuseki`
1. Move folder into `usr/local`
1. Move `spatial-data/` and `config-spatial\@linkedscience.ttl` into `fuseki/` folder

### Node
Now this is my area of expertise!
You can download Node the [easy][node] way or the [less easy][nvmguide] way, but I suggest the latter because it will allow you to use npm without needing to use `sudo` all the time, and allows you to easily switch versions of Node on the fly.

Once you have Node installed, you can install Gulp which will be our task runner:

```shell
npm install gulp -g
```

### Building the project

From inside the project directory,
```shell
npm install
```
then
```shell
gulp build
```

Now you should have everything you need to get started!


## Spinning Up The Server
Whenever you want to start working, just go navigate to the project directory and 

Start up the server and database with:
```shell
./server.sh
```
Then, in a new terminal window, go back to the project directory and simply enter:
```shell
gulp
```
This will automatically compile your sass, javascript, and html, and run a browsersync server that is pure magic!

You can hit `ctrl + c` in both tabs to stop them.


[fuseki]: http://shinyfeather.com/jena/binaries/jena-fuseki1-1.3.1-distribution.zip
[node]: https://nodejs.org/en/
[nvmguide]: http://codepen.io/amaldare93/post/installing-node-with-nvm
[git]: https://git-scm.com/download/linux
[repo]: https://github.com/CARSILab/spatial-linkedscience