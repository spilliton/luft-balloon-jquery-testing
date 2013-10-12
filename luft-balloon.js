// Luft Balloon jQuery site testing v1.1
// License: MIT License(http://opensource.org/licenses/mit-license.php)
// Copyright 2013 Zachary Kloepping http://twitter.com/spilliton
// Inspired by Helium CSS (https://github.com/geuis/helium-css)
// Last update: 10/12/2013

// # Example usage
// <script type="text/javascript" src="path/to/luft-balloon.js"></script>
// # After luft-balloon is included
// luft.test("/", 'product overlay open and close', 3000, function(t){
//   $('.js_get_remote_overlay:first').click();
//   t.after('album was clicked', 2000, function(){
//     modal_close = $('.modalCloseImg');
//     t.assert_exists(modal_close, 'modal close');
//     modal_close.click();
//     t.after('modal X clicked', 500, function(){
//       t.assert(!modal_close.is(":visible"), "modal not re-closed");
//       t.complete();
//     });
//   });
// });
//
// $(document).ready(function(){
//   luft.init();
// });

var luft = {

  callback: undefined,
  errorLogged: false,
  advancing: false,

  // Loaded every pageload before init()
  //allTests: [{ path: "/",  name: '', func}]
  allTests: [],

  data: {
    //status,
    //currentTestIndex,
    //errors,
    //totalAssertCount,
    //passedAssertCount
  },

  init: function(){
    // Callback on init or default to running the report.
    luft.callback = (arguments.length > 0) ? arguments[0] : luft.report;

    //silently fail if localStorage is not available
    if( window.localStorage ){
      //load page data
      luft.load();
      luft.save();
      luft.checkstatus();
    }else{
      throw new Error('localStorage API not found');
    }
  },

  checkstatus: function(){
    //determine state
    //0: not started
    //1: looping through pages, running tests
    //2: finished, show report

    if(typeof luft.data.status === 'undefined'){
      luft.data.status = 0;
    }

    if( luft.data.status === 0 ){
      luft.renderStart();
      return false;
    }
      
    if( luft.data.status === 1 ){
      luft.runTests();
      return false;
    }
    
    if( luft.data.status === 2 ){
      //Finished, issue report
      luft.callback();
    }

  },
  
  renderStart: function(){
    var total = luft.allTests.length.toString();
    var html = [
        '<h1>Run '+total+' Luft Tests</h1>',
        '<input type="button" id="testStart" value="Start"/>',
        '<input type="button" id="testHide" value="Hide"/>'
    ];

    luft.generateCSS();

    var div = document.createElement('div');
        div.id = 'luftID';
        div.innerHTML = html.join('');

    $('body')[0].appendChild(style);
    $('body')[0].appendChild(div);

    //add listener to save list and start processing
    $('#testStart').on('click', luft.startTests);
    $('#testHide').on('click', luft.hide);
  },

  restart: function(){
    luft.reset();
    luft.startTests();
  },

  startTests: function(){
    luft.data.status = 1;
    luft.data.currentTestIndex = 0;
    luft.data.totalAssertCount = 0;
    luft.data.passedAssertCount = 0;
    luft.data.errors = [];
    luft.save();
    luft.nav();
  },

  hide: function(){
    $('#luftID').hide();
  },

  //display final report
  report: function(){
    var html = [
      '<h1>Tests Complete!</h1>',
      '<input type="button" id="luftRestart" value="Reset Tests"/>',
      '<input type="button" id="testHide" value="Hide"/>'
    ];

    luft.generateCSS();

    var passed = luft.data.passedAssertCount.toString();
    var total = luft.data.totalAssertCount.toString();
    html.push('<h2>'+"Passed "+passed+' out of '+total+" assertions."+'</h2>');
    luft.pushErrorsTo(html);

    var div = document.createElement('div');
        div.id = 'luftID';
        div.innerHTML = html.join('');

    $('body')[0].appendChild(style);
    $('body')[0].appendChild(div);

    //add listener to reset all data
    $('#luftRestart').on('click', luft.restart);
    $('#testHide').on('click', luft.hide);
  },

  pushErrorsTo: function(html){
    if(luft.data.errors.length == 0){return true;}
    html.push('<ul class="cell">');
    for(var i=0;i<luft.data.errors.length;i++){
      var classname = '';
      if(i%2==0){
        classname = ' class="alternate"';
      }
      var str = luft.errorToString(luft.data.errors[i]);
      html.push('<li'+classname+'>'+str+'</li>')
    }
    html.push('</ul>'); 
  },

  errorToString: function(error){
    var test = "Test: "+error.test_name+' on page '+error.path;
    var contexts = "After: "+error.contexts.join(' -> ');
    var failure = "Failed: "+error.msg;
    var msg = [test, contexts, failure].join('<br/>');
    return msg;
  },

  generateCSS: function(){

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
  },

  reset: function(){
    //resets to beginning
    localStorage.removeItem('luftData');
    $('#luftID').remove();
    luft.clear();
    luft.init();
  },

  // run relevant tests on the page
  // page already loaded at this point
  runTests: function(){
    var test = luft.currentTest();
    var error = {
      path: test.path,
      test_name: test.name
    };

    try{
      test.func(luftTestContext);
    }catch(err){
      error.msg = err;
      error.contexts = luftTestContext.textContexts;
      luft.addError(error);
      luft.advanceTests();
    }

    // if no initial errors, test eventually times out
    setTimeout(function(){
      error.contexts = luftTestContext.textContexts
      if(luftTestContext.errorMsg){
        error.msg = luftTestContext.errorMsg;
        luft.addError(error);
      }else if(!luftTestContext.completed){
        error.msg = "Did not complete in time!";
        luft.addError(error);
      }
      luft.advanceTests();
    }, test.timeout); 

  },

  currentTest: function(){
    var i = luft.data.currentTestIndex;
    return luft.allTests[i];
  },

  // Returns true if there is a valid next test
  advanceTests: function(){
    if(!luft.advancing){
      luft.advancing = true;
      luft.data.totalAssertCount += luftTestContext.assertCount;
      luft.data.passedAssertCount += luftTestContext.passedAssertCount;
      luft.data.currentTestIndex += 1;
      luft.save();    
      var should_advance = luft.data.currentTestIndex < luft.allTests.length;
      if(should_advance){
        luft.nav();
      }else{
        luft.data.status = 2;
        luft.save();
        luft.callback();
      }
    }
  },

  //navigate to next page in list
  nav: function(){
    var path = luft.currentTest().path;
    window.location = path;
  },

  // registers a test
  test: function(path, test_name, timeout, func){
    luft.allTests.push({'path': path, 'name': test_name, 'func': func, 'timeout': timeout});
  },
  
  addError: function(msg){
    if(!luft.errorLogged){
      luft.errorLogged = true;
      luft.data.errors.push(msg);
      luft.save();
    }
  },

  // thanks stack overflow
  arrayUnique: function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
  },


  // on: function(target, ev, fn){
  //     //only add events to the first element in the target/querySelectorAll nodeList.
  //     //don't need to add in support for multiple targets
  //     target = target[0] || target;
  //     target.addEventListener(ev, fn, false);
  // },


  load: function(){
    if(!localStorage.luftData){
      localStorage.luftData = JSON.stringify({});
    }
    luft.data = JSON.parse( localStorage.luftData );
  },


  save: function(){
    localStorage.luftData = JSON.stringify( luft.data );
  },


  // when something goes wrong, nice to luft.clear() to nuke the local storage
  clear: function() {
    delete localStorage['luftData'];
  },


  get: function(url, index, callback){
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
  }
};

// Since only one test is run per page load this context
// is also used once per page load
var luftTestContext = {
  errorMsg: null,
  textContexts: [],
  assertCount: 0,
  passedAssertCount: 0,
  completed: false,
  after: function(text, timeout, func){
    if(luftTestContext.errorMsg){throw luftTestContext.errorMsg;}
    luftTestContext.textContexts.push(text);
    if(typeof func === 'function'){
      setTimeout(function(){
        try{
          func();
        }catch(err){
          luftTestContext.errorMsg = err;
        }
      }
      ,timeout);
    }else{
      throw "after() expects function as second param";
    }
  },
  assert: function(val, fail_msg){
    if(luftTestContext.errorMsg){throw luftTestContext.errorMsg;}
    luftTestContext.assertCount += 1;
    if(val){
      luftTestContext.passedAssertCount += 1;
    }else{
      throw fail_msg;
    }
  },
  assert_exists: function(elem, elem_name){
    luftTestContext.assert(($(elem).length > 0), elem_name+' did not exist on page!');
  },
  assert_visible: function(elem, elem_name){
    luftTestContext.assert($(elem).is(":visible"), elem_name+' was not visible!');
  },
  assert_hidden: function(elem, elem_name){
    luftTestContext.assert(!$(elem).is(":visible"), elem_name+' was not hidden!');
  },
  assert_equal: function(expected, actual){
    luftTestContext.assert((expected === actual), 'expected "'+expected+'" but was "'+actual+'"');
  },
  complete: function(){
    luftTestContext.completed = true;
  }
};