#hyojun.fuzzy-finder

**version: 0.1.0**

*CSS tested on: Chrome 41, Safari, IE9+ and Firefox*

The hyojun.fuzzy-finder project is designed to create a way to perform searches inside the [Hyojun.Guideline](https://bitbucket.org/fbiz/hyojun.guideline) without the need of backend services, dynamic serverd pages or any database.

This project contains everything you need to plug this feature on your guideline project. It contains:

* javascript required to make the ux work
* css required to render properly the search results
* the [grunt task](https://bitbucket.org/fbiz/hyojun.grunt.fuzzy-finder-cache.git) that sniff the pages and cache the values

###javascript

It's pure javascript (no libs required). Built following AMD standards.

In case of customization or different flows you can [require](http://requirejs.org/), modify the [modules](https://bitbucket.org/fbiz/hyojun.fuzzy-finder/src) and export your own version.

> there are distributed *(/dist/js/)* versions including [almond 0.3.1](https://github.com/jrburke/almond/blob/0.3.1/almond.js) and also with only all AMD compiled via [r.js](https://github.com/jrburke/r.js), so you won't need to worry about multiplus requests.

###css

The css was created using [sass](http://sass-lang.com) and has only the rules expected to make the result's list looks as expected.

##How it works?

Fuzzy-Finder is blazing fast because all data is already cached and available on the page.

##Instalation

1 - 

2 - 
