# How To Set Up Your Local Environment

This is a step by step guide for setting up your local production environment. This includes setting up the server, the database, and the build system.

I wrote this guide after going through this grueling process _**three times**_. The first time taking me several weeks to figure out.

**NOTE: ** I am no expert in this stuff, so these steps are very specific to my exact situation. If you have a Windows computer, these steps will surely vary (for example, Im pretty sure Homebrew is mac only) but there are alternatives; I just don't know them because like I said, I am no expert.


## Setting Up The Backend Stuff
1. **Homebrew:**
  1. `ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"`
  1. `brew doctor`

1. **Nginx:**
  1. `brew install nginx`
  1. Navigate to `usr/local/etc/nginx`
  1. Replace `nginx.conf` with this [file][nginx.conf]
  1. Open `nginx.conf` and go to ~line 152
  1. Replace the `root` path with the path to your project directory + `/dist`

1. **Fuseki:**
  1. Download [Fuseki][fuseki]
  1. Extract and rename folder to `fuseki`
  1. Move folder into `usr/local`
  1. Move `spatial-data/` and `config-spatial\@linkedscience.ttl` into `fuseki/` folder

1. **Node:**
  * Download Node the [easy][node] way
  -or-
  * Download Node the [hard][nvmguide] way but with much better results

  * `npm install gulp -g`


## Set Up The Repo

  1. Get [Git][git] if you don't have it already
  1. Clone the [repo][repo]
    `git clone https://github.com/CARSILab/spatial-linkedscience.git`

  1. `cd spatial-linkedscience`
  1. `npm install`
  1. `gulp build`

## Spinning Up The Server

1. `./server.sh`
1. Open new terminal window
1. `gulp`




[nginx.conf]: link
