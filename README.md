# Luft Balloon jQuery Testing Framework
[mrshow]: http://www.youtube.com/watch?v=c6BvdpR6V3g
[You've got to follow your balloon!][mrshow]

Luft Balloon allows you to write tests that run directly in your browser.  It requires that you use jQuery.

* [Setup](#setup)
* [Basics](#basics)
* [More Complex Examples](#more-complex-examples)
* [Things Luft Balloon Does](#things-luft-balloon-does)
* [Things Luft Baloon Does Not DO](#things-luft-balloon-does-not-do)

## Setup

To run tests, you will need to put a script referrence to luft-balloon.js at the bottom of your body tag.

``` html
<script type="text/javascript" src="path/to/luft-balloon.js"></script>
```

Followed by javascript that contains your test definitions.

``` javascript
luft.test("/", 'product overlay open and close', 3000, function(t){
  t.assert_exists($('#redballoon'), 'critial element');
  t.complete();
});
```

Lastly you need to make a call to luft.init() *after* all your tests are declared and after the document is loaded.

``` javascript
$(document).ready(function(){
  luft.init();
});
```

## Basics

Javascript by nature is very asynchronous.  This presents some issues when immediately trying to assert some state after you have performed an action.  Luft Balloon's solution for this is to allow each test to specify timeouts for how long it should wait before performing subsequent steps in a test.

### Define a test with luft.test()

This is used to define the scope of a single test.  You define the relative path for the browser to navigate to, give the test a meaningful name, specify the maximum time it should take to complete, and provide a function that contains the test logic.

A simple test definition could simply assert a condition on a loaded page:

``` javascript
luft.test("/artists", 'renders 20 artists', 1000, function(t){
  t.assert_equal(20, $('.artist').length);
  t.complete();
});
```

The above example will navigate the browser to '/artists'.  Then once the page load event fires, assert that there are 20 '.artist' elements on the page.  If the encapsulated logic takes longer than 1000ms (1 second) before calling t.complete(), the test will fail.  If the assert statement fails, this will also cause a failing state to be reported.

### Trigger actions and wait with t.after()

To ensure that event handlers have been setup properly by your javascript, you often need to trigger some action, then make an assertion after the event code has occurred.  To do this, you may nest t.after() callbacks inside of your tests.

``` javascript
luft.test("/products", 'ajax load more button', 2000, function(t){
  var link = $('.more:first');
  t.assert_exists(link, 'more link');
  t.assert_equal(10, $('.products').length);
  link.click(); // will not be called if prior asserts fail
  t.after('more link clicked', 500, function(){
    t.assert_equal(20, $('.products').length);
    t.complete();
  });
});
```

In this example, we first perform a few asserts to ensure the link we want to click actualy exists, then after triggering the click event, we need to wait for some time (half a second in this case) for the ajax events to fire and load more products into the page before we can perform additional assertions.

### Be Careful With Timeouts And Waits

Since the timeout passed to test() specifies the max time it should take for the entire test to complete, you never want your total after() wait times to exceed your max.  This is a recipe for a broken test!

### Strings For Context

The strings passed to test(), after(), and the assert() methods (other than the URL) are used when printing out test and assertion failures so you know what went wrong and where.

## More Complex Examples

You can define as many tests as you want to build a test suite.  Luft Balloon will iterate over each page and then display a final report once all the tests have been performed.

Here is a small test suite:

``` javascript
luft.test("/", 'product overlay open and close', 3000, function(t){
  $('.js_get_remote_overlay:first').click();
  t.after('album was clicked', 2000, function(){
    modal_close = $('.modalCloseImg');
    t.assert_exists(modal_close, "modal close button");
    modal_close.click();
    t.after('modal X clicked', 500, function(){
      t.assert_hidden(modal_close, "modal close button");
      t.complete();
    });
  });
});


luft.test("/artists", 'subscribe and unsubscribe', 3000, function(t){
  var link = null;
  $('.subscribe_link').each(function(i,elem){
    if($(elem).text()=='Subscribe'){
      link = $(elem);
      return false;
    }
  });

  t.assert_exists(link, 'subscribe link');
  t.assert_equal('Subscribe', link.text());
  link.click();
  t.after('link clicked once', 1000, function(){
    t.assert_equal('Unsubscribe', link.text());
    link.click();
    t.after('link clicked again', 1000, function(){
      t.assert_equal('Subscribe', link.text());
      t.complete();
    });
  });
});
```

As you can see, you can nest as many calls to t.after() as you need, just be careful not to wait longer than your max timeout!

## Things Luft Balloon Does

* Allows you to perform operations on the DOM from a running web browser.
* Runs one test per page at a time, collecting results in HTML5 local storage as it goes.
* Provides a suite of common assertions to use.
* Allows for multiple assertions and actions to be performed in a given test.
* Reports directly in the browser on success/failure of tests.

## Things Luft Balloon Does Not Do

* Provide any kind of setup/teardown functionality.
* Allow for integration type tests that test events across multiple pages in a single test.
* Support loading pages with HTTP verbs other than GET
* Integrate with a CI server (yet).

## Isn't It Actually Spelled Luftballon?

Yes.

## Inspired By

[helium]: https://github.com/geuis/helium-css
[Helium Css][helium] 

