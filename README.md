# Luft Balloon jQuery Testing Framework
[mrshow]: http://www.youtube.com/watch?v=c6BvdpR6V3g
[You've got to follow your balloon!][mrshow]

Luft Balloon allows you to write tests that run directly in your browser.

## Setup

To run tests, you will need to put a script referrence to luft-balloon.js at the bottom of your body tag.

``` html
<script type="text/javascript" src="path/to/luft-balloon.js"></script>
```

Followed by javascript that contains your tests.

``` javascript
luft.test("/", 'product overlay open and close', 3000, function(t){
  t.assert_exists($('#redballoon'), 'critial element');
});
```

Lastly you need to make a call to luft.init() *after* all your tests are declared and after the document is loaded.

``` javascript
$(document).ready(function(){
  luft.init();
});
```

## Examples

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


luft.test("/", 'subscribe and unsubscribe', 3000, function(t){
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


## What Luft Balloon Does

* Allows you to perform operations on the DOM from a running web browser.
* Runs one test per page at a time, collecting results in HTML5 local storage as it goes.
* Provides a suite of common assertions to use.
* Allows for multiple assertions and actions to be performed in a given test.
* Reports directly in the browser on success/failure of tests.

## What It Does Not Do

* Provide any kind of setup/teardown functionallity.
* Allow for integration tests to test multiple pages in a single test.
* Integrate with a CI server (yet).

## Isn't It Actually Spelled Luftballon?

Yes.

## Inspired By

Helium Css.

