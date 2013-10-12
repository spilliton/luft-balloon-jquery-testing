// Luft Balloon jQuery site testing v0.1
// License: MIT License(http://opensource.org/licenses/mit-license.php)
// Copyright 2013 Zachary Kloepping http://twitter.com/spilliton
// Inspired by Helium CSS (https://github.com/geuis/helium-css)
// Last update: 10/12/2013

// # Example usage
// <script type="text/javascript" src="path/to/luft-balloon.js"></script>
// # After luft-balloon is included
// test("/", 'product overlay open and close', 3000, function(t){
//   $('.js_get_remote_overlay:first').click();
//   t.after('album was clicked', 2000, function(){
//     modal_close = $('.modalCloseImg');
//     t.assert_exists(modal_close, "modal close button");
//     modal_close.click();
//     t.after('modal X clicked', 500, function(){
//       t.assert_hidden(modal_close, "modal close button");
//       t.complete();
//     });
//   });
// });
//
// $(document).ready(function(){
//   init();
// });

var luft = (function($, document) {

  // Local Variables =======================================

  var callback = undefined;
  var errorLogged = false;
  var advancing = false;
  var textContexts = [];
  var totalAssertCount = 0;
  var passedAssertCount = 0;
  var currentTestCompleted = false;
  var currentTestError = null;

  // allTests gets populated by calls to test
  var allTests = [];
  // data gets serialized into local storage
  var data = {
    //status,
    //currentTestIndex,
    //errors,
    //totalAssertCount,
    //passedAssertCount
  };

  // Public Methods =======================================

  var init = function(){
    // Callback on init or default to running the report.
    callback = (arguments.length > 0) ? arguments[0] : report;
    //silently fail if localStorage is not available
    if( window.localStorage ){
      //load page data
      load();
      save();
      checkstatus();
    }else{
      throw new Error('localStorage API not found');
    }
  };

  // registers a test
  var test = function(path, test_name, timeout, func){
    allTests.push({'path': path, 'name': test_name, 'func': func, 'timeout': timeout});
  };

  var reset = function(){
    //resets to beginning
    localStorage.removeItem('luftData');
    $('#luftID').remove();
    clear();
    init();
  };

  // Public assertion methods ===================================

  // Since only one test is run per page load this context
  // is also used once per page load
  var helpers = {
    after: function(text, timeout, func){
      if(currentTestError){throw currentTestError;}
      textContexts.push(text);
      if(typeof func === 'function'){
        setTimeout(function(){
          try{
            func();
          }catch(err){
            currentTestError = err;
          }
        }
        ,timeout);
      }else{
        throw "after() expects function as second param";
      }
    },
    assert: function(val, fail_msg){
      if(currentTestError){throw currentTestError;}
      totalAssertCount += 1;
      if(val){
        passedAssertCount += 1;
      }else{
        throw fail_msg;
      }
    },
    assert_exists: function(elem, elem_name){
      helpers.assert(($(elem).length > 0), elem_name+' did not exist on page!');
    },
    assert_visible: function(elem, elem_name){
      helpers.assert($(elem).is(":visible"), elem_name+' was not visible!');
    },
    assert_hidden: function(elem, elem_name){
      helpers.assert(!$(elem).is(":visible"), elem_name+' was not hidden!');
    },
    assert_equal: function(expected, actual){
      helpers.assert((expected === actual), 'expected "'+expected+'" but was "'+actual+'"');
    },
    complete: function(){
      currentTestCompleted = true;
    }
  };


  // Private methods =======================================

  var checkstatus = function(){
    //determine state
    //0: not started
    //1: looping through pages, running tests
    //2: finished, show report
    if(typeof data.status === 'undefined'){
      data.status = 0;
    }
    // render 
    if( data.status === 0 ){
      renderStart();
      return false;
    }
    // loop through pages running tests
    if( data.status === 1 ){
      runTests();
      return false;
    }
    //Finished, issue report
    if( data.status === 2 ){
      callback();
    }
  };
  
  var renderStart = function(){
    var total = allTests.length.toString();
    var html = [
        '<h1>Run '+total+' Luft Tests</h1>',
        '<input type="button" id="testStart" value="Start"/>',
        '<input type="button" id="testHide" value="Hide"/>'
    ];

    generateCSS();

    var div = document.createElement('div');
        div.id = 'luftID';
        div.innerHTML = html.join('');

    $('body')[0].appendChild(style);
    $('body')[0].appendChild(div);

    //add listener to save list and start processing
    $('#testStart').on('click', startTests);
    $('#testHide').on('click', hide);
  };

  var restart = function(){
    reset();
    startTests();
  };

  var startTests = function(){
    data.status = 1;
    data.currentTestIndex = 0;
    data.totalAssertCount = 0;
    data.passedAssertCount = 0;
    data.errors = [];
    save();
    nav();
  };

  var hide = function(){
    $('#luftID').hide();
  };

  //display final report
  var report = function(){
    var html = [
      '<h1>Tests Complete!</h1>',
      '<input type="button" id="luftRestart" value="Reset Tests"/>',
      '<input type="button" id="testHide" value="Hide"/>'
    ];

    generateCSS();

    var passed = data.passedAssertCount.toString();
    var total = data.totalAssertCount.toString();
    html.push('<h2>'+"Passed "+passed+' out of '+total+" assertions."+'</h2>');
    pushErrorsTo(html);

    var div = document.createElement('div');
        div.id = 'luftID';
        div.innerHTML = html.join('');

    $('body')[0].appendChild(style);
    $('body')[0].appendChild(div);

    //add listener to reset all data
    $('#luftRestart').on('click', restart);
    $('#testHide').on('click', hide);
  };

  var pushErrorsTo = function(html){
    if(data.errors.length == 0){return true;}
    html.push('<ul class="cell">');
    for(var i=0;i<data.errors.length;i++){
      var classname = '';
      if(i%2==0){
        classname = ' class="alternate"';
      }
      var str = errorToString(data.errors[i]);
      html.push('<li'+classname+'>'+str+'</li>')
    }
    html.push('</ul>'); 
  };

  var errorToString = function(error){
    var test = "Test: "+error.test_name+' on page '+error.path;
    var contexts = "After: "+error.contexts.join(' -> ');
    var failure = "Failed: "+error.msg;
    var msg = [test, contexts, failure].join('<br/>');
    return msg;
  };

  var generateCSS = function(){
    var css = [
      '#luftID{',
        'font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;',
        'font-size: 16px;',
        'font-weight: bold;',
        'color: #fff;',
        'position: absolute;',
        'z-index: 999999999;',
        'top: 10%;',
        'width: 80%;',
        'left: 10%;',
        'background-color: #3498db;', //blue
        'padding: 10px 20px 20px 20px;',
        'border: none',
      '}',
      '#luftID .cell{',
        'background: #fff;',
        'padding: 10px;',
        'color: #000;',
      '}',
      '#luftID div{',
        'border:none;',
      '}',
      '#luftID .alternate{',
        'border: 1px solid #eee;',
        'border-width: 1px 0 1px 0;',
      '}',
      '#luftID ul{',
        'list-style: none;',
        'padding: 0;',
        'margin: 0;',
      '}',
      '#luftID li:hover{',
        'background: #eee',
      '}',
      '#luftID h1{',
        'color: #fff;',
        'margin: 0 0 10px 0;',
        'padding: 0;',
        'font-size: 20px;',
      '}',
      '#luftID h2{',
        'color: #fff;',
        'margin: 20px 0 0 0;',
        'padding: 0;',
        'font-size: 16px;',
      '}',
      '#cssdetectDesc{',
        'background: #8ac6ed;',
      '}',
      '#luftID textarea{',
        'width: 100%;',
        'height:300px;',
        'border: none;',
        'margin: 0 0 10px 0;',
        'padding: 10px;',
        'resize: none;',
        'outline: 1px none transparent;',
        'border-radius: 0;',
      '}',
      '#luftID input{',
        'background: #fff;',
        'border: none;',
        'padding: 10px 20px 10px 20px;',
        'margin: 0 10px 0 0;',
        'font-size: 18px;',
        'cursor: pointer;',
        '-webkit-appearance: button;',
      '}',
      '#luftID input:hover{',
        'background: #ecf0f1;',
        'pointer: cursor;',
      '}',
      '#luftID a{',
        'color: #fff',
      '}',
      '#cssreportResetID{',
        'position:absolute;',
        'top: 10px;',
        'right: 10px;',
      '}',
      '#luftID .green, #luftID .selector{',
        'color: #009000;',
      '}',

      '#luftID .black, #luftID .matched_selector{',
        'color: #000000;',
      '}',

      '#luftID .red, #luftID .invalid_selector{',
        'color: #cc0000;',
      '}',

      '#luftID .blue, #luftID .pseudo_class{',
        'color: #0000cc',
      '}'
    ];

    style = document.createElement('style');
    style.innerHTML = css.join('');

    $('body')[0].appendChild( style );
  };

  // run relevant tests on the page
  // page already loaded at this point
  var runTests = function(){
    var test = currentTest();
    var error = {
      path: test.path,
      test_name: test.name
    };

    try{
      test.func(helpers);
    }catch(err){
      error.msg = err;
      error.contexts = textContexts;
      addError(error);
      advanceTests();
    }

    // if no initial errors, test eventually times out
    setTimeout(function(){
      error.contexts = textContexts;
      if(currentTestError){
        error.msg = currentTestError;
        addError(error);
      }else if(!currentTestCompleted){
        error.msg = "Did not complete in time!";
        addError(error);
      }
      advanceTests();
    }, test.timeout); 

  };

  var currentTest = function(){
    var i = data.currentTestIndex;
    return allTests[i];
  };

  // Returns true if there is a valid next test
  var advanceTests = function(){
    if(!advancing){
      advancing = true;
      data.totalAssertCount += totalAssertCount;
      data.passedAssertCount += passedAssertCount;
      data.currentTestIndex += 1;
      save();    
      var should_advance = data.currentTestIndex < allTests.length;
      if(should_advance){
        nav();
      }else{
        data.status = 2;
        save();
        callback();
      }
    }
  };

  //navigate to next page in list
  var nav = function(){
    var path = currentTest().path;
    window.location = path;
  };


  
  var addError = function(msg){
    if(!errorLogged){
      errorLogged = true;
      data.errors.push(msg);
      save();
    }
  };


  var load = function(){
    if(!localStorage.luftData){
      localStorage.luftData = JSON.stringify({});
    }
    data = JSON.parse( localStorage.luftData );
  };


  var save = function(){
    localStorage.luftData = JSON.stringify( data );
  };

  var clear = function() {
    delete localStorage['luftData'];
  };

  var get = function(url, index, callback){
    if(window.attachEvent){
      var http = new ActiveXObject("Microsoft.XMLHTTP");
    }else{
      var http = new XMLHttpRequest();
    }
    http.open("GET", url);
    http.onreadystatechange=function() {
      if(http.readyState === 4) {
        callback(index, http.responseText);
      }
    }
    http.send(null);
  };

  return {
    init: init,
    test: test,
    reset: reset, 
    helpers: helpers
  };

})(jQuery, document);