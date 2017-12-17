----
# Volkswagen ES5 Angular Skeleton
----

~~~~
NAME: skeleton-vw-es5-angular-gulp
AUTHOR: Pradeep Sekar

REPO:
https://github.com/r0ughnex/skeleton-vw-es5-angular-gulp

AWS STAGING (develop):
http://skeleton-vw-es5-angular-gulp.develop.s3-website-ap-southeast-2.amazonaws.com/build/

AWS PRODUCTION (master):
http://skeleton-vw-es5-angular-gulp.master.s3-website-ap-southeast-2.amazonaws.com/build/
~~~~

----
# Guide to Frontend Development
----

## Installing Node, Bower and Gulp?

Install the latest **LTS** version of node and it's package manager, which can be found [here](https://nodejs.org/en/) (which were **8.9.1** and **5.5.1** at the time of writing this document). Once node in installed on your machine, open the terminal or command prompt and run the command **npm install -g bower** to install bower and then run the command **npm install -g gulp** to install gulp.

## Commands to run in Localhost?

Open the terminal or command prompt at the root folder **/web/**, and run the command **npm install**, followed by the command **bower install**. Once installation of both, the node modules and the bower components are complete, run the command **gulp**. This will start a **local server on port: 8000** and also **start watchers to watch for changes** on all relevant files and assets inside **/web/src/**.

You can optionally also run the command **gulp dev** or **gulp prod** to indicate development or production mode. The default mode is development, which injects unminifed source files from **/web/src/** into **index.html**. The production mode will inject minified source files from **/web/dist/**, and in addition to that, also strip out all the comments and console statements.

----
# Deploying to AWS S3 Servers
----

There are two **AWS S3 buckets** that have been configured for this project, one on **develop** and another on **master**.

If you are on a **feature branch** and want to deploy to the bucket configured on develop, then **merge your feature branch into develop through a pull request** and get it approved by at least one other developer. Once the pull request is approved, merged and commited into develop, **Codeship will automatically compile, bundle and build the neccessary files** and deploy it to the relevant bucket configured on that branch (links listed at the top).

If you are on **develop** and want to deploy to the bucket configured on master, then use git flow to create a new **release branch** from develop and **merge the release branch into master**. Once the release is merged and commited into master, **Codeship will automatically compile, bundle and build the neccessary files** and deploy it to the relevant bucket configured on that branch (links listed at the top).

**Note:** If you want a **new AWS S3 bucket** created on a specific **feature branch** that you are currently working on, contact a senior developer who has admin access, to create and configure one for you.
