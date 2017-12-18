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
# ES5 Angular Skeleton Overview
----

## What is it about?

The skeletal **app structure** and the **gulp framework** in this repository give a brief introduction on **how to structure** and configure your angular project (along with some sample modules and components) for any of the **Volkswagen NGW page** builds, that you might work on in the future.

The main **purpose** of this skeleton is to **keep the outer structure** of all the builds, the **same**, across multiple projects including the ones that might be worked on by freelancers. This ensures that the built modules and **components can** easily **be made re-usable**, if required, for a different project that might currently be in the pipeline. It also enables **easier on boarding** for any of the in-house developers, who might be assigned to the project at a later point in time.

## How to use the skeleton?

**Fork the skeleton** in this repository and use it as a starting point for your project. Apart from changing the outer skeletal structure and the gulp framework, you are **free to experiment** with, and improve upon the existing set of modules and components or build your own (provided the Volkswagen **guidelines are maintained**).

If you happen to come across any **issues** or want to **suggest improvements**, raise it in the repository containing the original skeleton or create a new feature from develop, for the fix / improvement and issue a pull request back into develop for **review**, once it is complete.

## Why use ES5? Why not ES8?

ECMAScript 8 or **ECMAScript 2017** was officially released at the end of June by TC39. Currently, the standard is to publish a new ES specification version once a year. ES6 was published in 2015 and ES7 was published in 2016, but do you remember when ES5 was released? It happened in 2009, before the magical rise of JavaScript. With that said, a significant **bulk of Volkswagen NGW projects still run on ES5**.

So in-order to **make future code backwards compatible and re-usable** with older projects and different versions of angular, an **alternate ES8 version of this skeleton** (with the same outer skeletal structure) is currently being baked **in the oven**, and will be ready in the next 6-8 weeks. Once it is available, you **simply have to update your current skeleton** (the relevant files) and the gulp framework in your existing project to the newer version, and you're good to go, provided you followed the structural guidelines outlined in this skeleton.

----
# Guide to Frontend Development
----

A comprehensive and complete guide to frontend development can be found in the **readme** file [here](https://github.com/r0ughnex/skeleton-vw-es5-angular-gulp/blob/master/web/readme.md).
