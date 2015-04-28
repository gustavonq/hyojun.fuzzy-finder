#hyojun.fuzzy-finder

**version: 0.1.0**

-working on: *Chrome 41+, Firefox 44+, IE 10+, Safari 7+*

##About

The *hyojun.fuzzy-finder* project is designed to create a way to perform searches inside the [Hyojun.Guideline](https://bitbucket.org/fbiz/hyojun.guideline) without the need of backend services, dynamic pages or any database.

This project contains everything you need to plug this feature on your guideline project.

It contains:

* javascript required to make the ux work
* css required to render properly the search results
* the [grunt task](https://bitbucket.org/fbiz/hyojun.grunt.fuzzy-finder-cache.git) that sniff the pages and cache the values
* working examples (running ```grunt```)

####The javascript

It's pure javascript (no libs required). Built following AMD standards.

In case of customization or different flows you can [require](http://requirejs.org/), modify the [modules](https://bitbucket.org/fbiz/hyojun.fuzzy-finder/src) and export your own version.

####The css

The css was created using [sass](http://sass-lang.com) and has only the rules expected to make the result's list looks as expected. no global rules or external libraries is required.

##How it works?

hyojun.fuzzy-finder is blazing fast because all data is already cached and available on the page. You can [define your own set of rules](https://bitbucket.org/fbiz/hyojun.grunt.fuzzy-finder-cache.git) and setup what is going to be cached.

As you type your query, after the 2th char the engine will perform a search inside the database you provided, testing the query and rendering results.

The implementation success relies on **3 steps**:

###1- HTML

The javacript plugin requires only this html code:

```html
<form>
    <input id="fuzzy-query" type="text"/>
    <ul id="fuzzy-result"></ul>
</form>
```

> if your query returned results, besides adding them on the list (```<li>```) a class ```active``` will be placed on ```#fuzzy-result``` node.

###2- CSS

This project is about caching the **Hyojun.Guideline** project so, there are a few *types* handled by the css in order to make easer identifying and filter results. The built in theme included on this project contains css rules for types (```sample.t```):

* **css**
* **data-plugin** - used on node elements that has javascript controlling them;
* **templates**
* **text** - for headers and link (a, h1, h2, h3, h4, h5, h6) describing modules;

###3- Javascript

There are 2 steps to make the javascript work (and many approaches to it).

1 - Make sure you have [requirejs](http://requirejs.org/), [almond](https://github.com/jrburke/almond/blob/0.3.1/almond.js) or the engine you like to handle javascript AMD.

> there are [distributed versions](https://bitbucket.org/fbiz/hyojun.fuzzy-finder/downloads) including [almond 0.3.1](https://github.com/jrburke/almond/blob/0.3.1/almond.js), AMD modules compiled via [r.js](https://github.com/jrburke/r.js) (you won't need to worry about multiplus requests)

2 - The *namespace* to access the library is **hyojun-fuzzy-finder** and the plugin is started by the controller: **hyojun.fuzzy-finder/controller**

```javascript
require('hyojun.fuzzy-finder/controller')(myCachedDataBase);
```

###Result anatomy

Results mostly* follow the structure:

```html
<li>
	<a class="item" href="{{sample.h}}" target="_blank" data-type="{{sample.t}}">
		<span class="content">{{sample.c}} (leading chunk)</span>
		<span class="selection">{{sample.c}} (matching value)</span>
		<span class="content">{{sample.c}} (trailing chunk)</span>
		<span class="url">{{sample.h}}</span>
	</a>
</li>
```

> when performing searches on url only the ```<span class="url">``` will be suppressed.

##Tips and tricks

As your project grows, the results too and we start facing too much itens and what would be supposed to help end up being a pain in the ass.

There are a few tips that can you doing better searches, they are:

### # Filtering reuslts

Every *sample* has it's type (```sample.t```) and you can choose to performe your search only for a specific types. To make it work use:

    {{sample.t}}:{{query}}

**Example:**

Considering this query on your input text: 

    template:search-suggestion

This will first grab only *samples* that are ```templates``` (```sample.t```) and then try to match ```search-suggestion``` over ```sample.c```.

> you can combine more than one filter as well: ```template:link:guideline```.
> This example will search for **guideline** only on *samples* that are **template** or **link**


### # Testing your query over urls

Sometimes you just remember the url (not the service name, or the module name) and you can test your query also on urls. There is a specific notation for that:

    url!{{query}}

You can also combine this feature with filters as well:

    template:url!search-suggestion

> this example will first grab samples that are ```template``` (`sample.t`) and then match `search-suggestion` on sample's url (`sample.h`)

### # Keyboard shortcuts:

Considering that your query got a few results, you can:

* navigate on results using your arrows keys (**up** and **down**). 

* hit **enter** when over an item to open that result in a new page.

* hit **esc** to close the results' window.

##How to install:

###- For developers:

1. ```git clone git@bitbucket.org:fbiz/hyojun.fuzzy-finder.git```

2. ```npm install```

3. ```npm start``` 

> ```npm start``` will run the grunt's **default task** and start serving the tests on your localhost ([python SimpleHTTPServer](https://docs.python.org/2/library/simplehttpserver.html))

All tests will be placed on **/test** folder.

> The test page is created caching [BBB Technology home page](http://bbc.com/technology), so you can see how results pop up and all asssets used on the project. (tip: type a query to bring some headlines from their homepage).

###- For those who only want to plug hyojun.fuzzy-finder on existent projects

If you have your own **hyojun.guideline** project running:

1. grab the [distributed version](https://bitbucket.org/fbiz/hyojun.fuzzy-finder/downloads) that best fits your script architecture
2. make sure your html structure follows the pattern described above.
3. create the [cache file and the initializer via grunt](https://bitbucket.org/fbiz/hyojun.grunt.fuzzy-finder-cache.git).

##Road map:

* new themes;
* run levenstain algorithm when no results were found;
* test pages over phantom to make more realible cache (today is only url fetch);


####Fork it, make it better and send your pull request!

happy coding!