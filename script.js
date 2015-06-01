(function(){

var getProgrammeDetails = function(pid, success, error) {
  var url = 'http://www.bbc.co.uk/programmes/' + pid + '.json';

  var xhr = new XMLHttpRequest();

  xhr.open('get', url, true);
  xhr.onreadystatechange = function() {

    var status, data;

    if (xhr.readyState == 4) {
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

    }

  }, function(error) {
    console.log("Error", error);
  })
}

})();
