(function(){

// var channels = {
//   'bbc_one': 'bbcone',
//   'bbc_two': 'bbctwo',
//   'bbc_three': 'bbcthree'
//   'bbc_four': 'bbcfour',
//   ''
//     , 'BBC Two'           : 'bbctwo'
//     , 'CBeebies'          : 'cbeebies'
//     , 'CBBC'              : 'cbbc'
//     , 'BBC Three'         : 'bbcthree'
//     , 'BBC Four'          : 'bbcfour'
//     , 'BBC News Channel'  : 'bbcnews24'
//     , 'BBC Parliament'    : 'bbcparl'
// }

var username = 'anorton',
    password = '',
    reduxBaseURL = 'https://i.bbcredux.com';

var reduxLogin = function(success, error) {
  var xhr = new XMLHttpRequest();

  xhr.open('post', reduxBaseURL + '/user/login', true);
  xhr.setRequestHeader("Content-type","application/x-www-form-urlencoded");
  xhr.onreadystatechange = function() {

    var status;
    var data;

    if (xhr.readyState == 4) { // `DONE`
      status = xhr.status;
      if (status == 200) {
        data = JSON.parse(xhr.responseText);
        success && success(data);
      } else {
        error && error(status);
      }
    }

  };
  xhr.send(encodeQueryData({ username: username, password: password }));
};

var reduxSearch = function(params, success, error) {
  if(!localStorage.token) {

    reduxLogin(function(data) {
      localStorage.token = data.token;
      reduxSearch(params, success, error);
    }, error);

  } else {

    var url = reduxBaseURL + '/asset/search?' +
              'token=' + localStorage.token +
              '&' + encodeQueryData(params);

    var xhr = new XMLHttpRequest();

    xhr.open('get', url, true);
    xhr.onreadystatechange = function() {

      var status;
      var data;
      // http://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
      if (xhr.readyState == 4) { // `DONE`
        status = xhr.status;
        if (status == 200) {

          data = JSON.parse(xhr.responseText);
          success && success(data);

        } else if (status == 403 ) {

          reduxLogin(function(data) {
            localStorage.token = data.token;
            reduxSearch(params, success, error);
          }, error);

        } else {

          error && error(status);

        }
      }

    };
    xhr.send();

  }
}

var getProgrammeDetails = function(pid, success, error) {
  var url = 'http://www.bbc.co.uk/programmes/' + pid + '.json';

  var xhr = new XMLHttpRequest();

  xhr.open('get', url, true);
  xhr.onreadystatechange = function() {

    var status;
    var data;
    // http://xhr.spec.whatwg.org/#dom-xmlhttprequest-readystate
    if (xhr.readyState == 4) { // `DONE`
      status = xhr.status;
      if (status == 200) {

        data = JSON.parse(xhr.responseText);
        success && success(data);

      } else {

        error && error(status);

      }
    }

  };
  xhr.send();
}

var encodeQueryData = function(data) {
  var ret = [];
  for (var d in data)
    ret.push(encodeURIComponent(d) + "=" + encodeURIComponent(data[d]));
  return ret.join("&");
}

var matches = window.location.pathname.match(/^\/programmes\/([a-z0-9]+)$/)

if(matches) {
  getProgrammeDetails(matches[1], function(data) {

    console.log(data);

    if(data.programme.type === 'episode') {

      var params = {
        q: data.programme.title,
        before: data.programme.first_broadcast_date,
        limit: 1,
        advanced: 1
      }

      var reduxUrl = 'https://www.bbcredux.com/search?' + encodeQueryData(params) + '#results';
      
      var element = "<div class=\"br-box-secondary\" style=\"margin-bottom: 2px\">" +
                      "<div class=\"island\">" +
                        "<h2><a href=\"" + reduxUrl +"\">Search on Redux</a></h2>" +
                      "</div>" +
                    "</div>";
      
      document.querySelector('.map__column--last .map__inner').innerHTML = element + document.querySelector('.map__column--last .map__inner').innerHTML;
      
      console.log(reduxUrl);

      // reduxSearch({
      //   before: data.programme.first_broadcast_date,
      //   channel: data.programme.ownership.service.key,
      //   limit: 1
      // }, function(data) {
      //   console.log(data);
      // }, function(errorStatus) {
      //   console.log(errorStatus);
      // });

    }

  }, function(error) {
    console.log("Error", error);
  })
}

})();
