chrome.app.runtime.onLaunched.addListener(function(launchData) {
  

  chrome.app.window.create('../index.html', {
    bounds: {
      width: 1280,
      height: 714
    },
    //alwaysOnTop: true,
    //minWidth:800,
    //minHeight: 500,
    frame: 'none'});

});