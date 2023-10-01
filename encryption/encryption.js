// contains encryption tools
// made by cool-dev-guy with combination of link-lock code.

const short_api = {
  'post':"https://api.shrtco.de/v2/shorten?url=",
  'fetch':"https://api.shrtco.de/v2/info?code="
}
async function generateFragment(url, passwd, hint, useRandomSalt, useRandomIv) {
  const api = apiVersions[LATEST_API_VERSION];

  const salt = useRandomSalt ? await api.randomSalt() : null;
  const iv = useRandomIv ? await api.randomIv() : null;
  const encrypted = await api.encrypt(url, passwd, salt, iv);
  const output = {
    v: LATEST_API_VERSION,
    e: b64.binaryToBase64(new Uint8Array(encrypted))
  }

  // Add the hint if there is one
  if (hint != "") {
    output["h"] = hint;
  }

  // Add the salt and/or initialization vector if randomly generated
  if (useRandomSalt) {
    output["s"] = b64.binaryToBase64(salt);
  }
  if (useRandomIv) {
    output["i"] = b64.binaryToBase64(iv);
  }

  // Return the base64-encoded output
  return b64.encode(JSON.stringify(output));
}
async function encryptMessage(password,message){
  // Check that password is successfully confirmed
  url = message;
  const confirmPassword = password;
  const confirmation = password;
  // if (password != confirmation) {
  //   confirmPassword.setCustomValidity("Passwords do not match");
  //   confirmPassword.reportValidity();
  //   return;
  // }

  // Initialize values for encryption
  const useRandomIv = true;
  const useRandomSalt = true;

  const hint = "cool-chat(devoloped by cool-dev-guy)(encription used from github.com/jstrieb/link-lock)";

  const encrypted = await generateFragment(url, password, hint, useRandomSalt,useRandomIv);
  const output = `https://example.com/?text=${encrypted}`;
  return output;
}
function createMessageURI(text) {
  return new Promise((resolve, reject) => {
    const url = `${short_api.post}${text}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 201) {
        const responseData = JSON.parse(xhr.responseText);
        // console.log('Request was successful.');
        // console.log('Response content:', responseData);
        resolve(responseData.result.code);
      } else {
        console.log('Request failed:', xhr.statusText);
        reject(xhr.statusText);
      }
    };
    xhr.onerror = function () {
      console.log('Network error occurred.');
      reject('Network error');
    };
    xhr.send();
  });
}
function fetchMessageURI(code) {
  return new Promise((resolve, reject) => {
    const url = `${short_api.fetch}${code}`;
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      if (xhr.status === 200) {
        const responseData = JSON.parse(xhr.responseText);
        // console.log('Response content:', responseData);
        const encryptedMessage = responseData.result.url;
        resolve(encryptedMessage);
      } else {
        console.log('Request failed with status:', xhr.status);
        reject(xhr.statusText);
      };
    };
    xhr.onerror = function () {
      console.log('Network error occurred.');
      reject('Network error');
    };
    xhr.send();
  });
};
async function decryptMessage(urlx) {
    if (!("b64" in window)) {
      console.error("Base64 library not loaded.");
      return;
    }
    if (!("apiVersions" in window)) {
      console.error("API library not loaded.");
      return;
    }
    const urlObject = new URL(urlx);
    const searchParams = urlObject.searchParams;
    const textParameterValue = searchParams.get("text");
    if (textParameterValue !== null) {
      // console.log("Encripted message:", textParameterValue);
    } else {
      console.error("The message is corrupted.");
    }
    const hash = `${textParameterValue}`;
    let params;
    try {
      params = JSON.parse(b64.decode(hash));
    } catch {
      return "err";
    }
    const api = apiVersions[params["v"]];
    const encrypted = b64.base64ToBinary(params["e"]);
    const salt = "s" in params ? b64.base64ToBinary(params["s"]) : null;
    const iv = "i" in params ? b64.base64ToBinary(params["i"]) : null;
    password = "default";
    let url;
      try {
        url = await api.decrypt(encrypted, password, salt, iv);
        return url;
      } catch {
        return "err";
      }
}
// MessageObject (aka message code) its a set of approx 6 chars representing a message.
async function createMessageObject(message) {
  try {
    const _Encrypted_msg = await encryptMessage('default', `https://cool-dev-guy.github.io/link-encrypted-text/?text=${message}`);
    // console.log(_Encrypted_msg)
    const code = await createMessageURI(_Encrypted_msg);
    return code;
  } catch (error) {
    console.error('Error:', error);
  }
}
async function readMessageObject(code) {
  try {
    const _Encrypted_msg = await fetchMessageURI(code);
    const _msg = await decryptMessage(_Encrypted_msg);
    //console.log(_msg);
    return new URL(_msg).searchParams.get('text');
  } catch (error) {
    console.error('Error:', error);
  }
}
