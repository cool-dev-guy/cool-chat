// listen for the url
onmessage = function (event) {
  var url = event.data;
  console.log('[Web worker] Web worker ready');
  makeRequest(url);
};

function makeRequest(url) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        postMessage(xhr.responseText);
        setTimeout(function () {
          makeRequest(url);
        }, 1000); // Retry after a 500 ms (0.5-second) delay.
      } else {
        // There was an error in the request.
        console.error("Request error:", xhr.status, xhr.statusText);
        setTimeout(function () {
          makeRequest(url); // Retry the request after a delay.
        }, 1500); // Retry after 1 second.
      }
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}
