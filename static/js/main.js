document.setup = false;
document.loadedIndex = 0;
const proxy = "https://cool-chat-proxy.vercel.app/proxy";
const proxy_get = "https://cool-chat-proxy.vercel.app/proxy-get"
function evaluateChatJoin(){
  _joinUrl = document.getElementById("chatJoinInput").value;
  _Username = document.getElementById("chatUsernameInput").value;
  _publicUrl = document.getElementById("chatJoinInput2").value;
  if (_joinUrl!=null && _Username != null){
    document.chatUsername = _Username;
    document.chatUri = _joinUrl;
    console.log('[App]Chat Joined as '+_Username)
    openTab('chatBox');
    document.chatInterface = document.getElementById('chat');
    document.chatInterface.scrollTop = document.chatInterface.scrollHeight;
    document.setup = true;
    document.chatString = ''

    if (getStorage('session') != _joinUrl){
      sendStorage('session',_joinUrl)
      sendStorage('userMessageCount',0)
    }

    createWebWorker(_publicUrl);
  }
  
  else{
    document.setup = false;
  }
}
function sendStorage(variable,value){
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem(variable,value);
  } else {
    console.log('local storage not supported')
  }
}
function getStorage(variable){
  if (typeof(Storage) !== "undefined") {
    return localStorage.getItem(variable);
  } else {
    console.log('local storage not supported');
    return null;
  }
}
function retrieveMessage(data) {
  if (document.chatString != data) {
    console.log(data);
    document.chatString = data;

    var jsonData = JSON.parse(document.chatString);

    if (jsonData && jsonData.dreamlo && jsonData.dreamlo.leaderboard && jsonData.dreamlo.leaderboard.entry) {
      var messages = jsonData.dreamlo.leaderboard.entry;

      for (var i = 0; i < messages.length; i++) {
        var entry = messages[i];
        var _temp_name = entry.name.split(';');
        if (i > document.loadedIndex) {
          chatAppCreateMessageBox(_temp_name[0], entry.text);
          document.loadedIndex = i;
        }
      }
    }
  }
}

function createWebWorker(url){
  // if(typeof(Worker) !== "undefined") {
  //   if(typeof(w) == "undefined") {
  //     console.log("started Web worker created");
  //     w = new Worker("https://cool-dev-guy.github.io/cool-chat/worker/message_fetcher.js");
  //   }
  //   console.log(w,"started Web worker");
  //   w.onmessage = function(event) {
  //     console.log(event.data);
  //     document.getElementById("options").innerHTML = event.data;
  //   };
  // } else {
  //   document.getElementById("options").innerHTML = "Sorry, your browser does not support Web Workers...";
  // }
  
  // custom
  const cross_origin_script_url = "https://cool-dev-guy.github.io/cool-chat/worker/message_fetcher.js";
  const worker_url = getWorkerURL( cross_origin_script_url );
  const worker = new Worker( worker_url );
  worker.postMessage(`${proxy_get}/${url}/json-date`);
  worker.onmessage = (evt) => retrieveMessage(evt.data);
  URL.revokeObjectURL( worker_url );

  // Returns a blob:// URL which points
  // to a javascript file which will call
  // importScripts with the given URL
  function getWorkerURL( url ) {
    const content = `importScripts( "${ url }" );`;
    return URL.createObjectURL( new Blob( [ content ], { type: "text/javascript" } ) );
  }
}
function chatAppCreateMessageBox(user,text){
  var outerDiv = document.createElement('div');
  var innerDiv = document.createElement('div');
  if (user == document.chatUsername){
    outerDiv.className = 'message-container user';
  }else{
    outerDiv.className = 'message-container other';
  }
  
  
  innerDiv.className = 'messagebox';
  var messager = document.createElement('span');
  messager.textContent = user;
  messager.className = 'messager';
  var message = document.createElement('span');
  message.textContent = text;
  message.className = 'content';
  innerDiv.appendChild(messager)
  innerDiv.appendChild(message)
  outerDiv.appendChild(innerDiv)
  document.getElementById('chat').appendChild(outerDiv);
}
function sendMessage(){
  _sendMessage = document.getElementById("MessageBoxInput").value;
  document.getElementById("MessageBoxInput").value = '';
  if (_sendMessage!='' && document.chatUsername!=null && document.chatUri!=null){
    _passableMessage = _sendMessage.substring(0, 185);
    console.log(document.chatUsername);
    //chatAppCreateMessageBox(document.chatUsername,_passableMessage);
    document.chatInterface.scrollTop = document.chatInterface.scrollHeight;
    sendMessageToServer(_passableMessage)
  }
}
function sendMessageToServer(text) {
  var Mcount = parseInt(getStorage('userMessageCount'), 10);
  const url = `${proxy}/${document.chatUri}/add/${document.chatUsername};${Mcount}/0/0/${text}`;
  sendStorage('userMessageCount',Mcount+1);
  console.log(url);

  // Create a new XHR object
  const xhr = new XMLHttpRequest();
  xhr.open("GET",url, true);
  xhr.onload = function () {
    if (xhr.status === 200) {
      console.log("Response:\n" + xhr.responseText)
    } else {
      console.log("Error: " + xhr.status)
    }
  };
  xhr.onerror = function () {
    console.log("Network error occurred.")
  };
  xhr.send();
}
function openApp(){
  openTab((document.setup === true) ? 'chatBox' : 'chatBin');
}
