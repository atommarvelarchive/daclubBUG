// Saves options to chrome.storage
user = {}
function save_options() {
  user.username = document.getElementById('username').value;
  user.email = document.getElementById('email').value;
  user.pwd = document.getElementById('pwd').value;
  user.state = document.getElementById('state').value;
  user.version = parseInt(document.getElementById('version').value);
  user.signedIn = document.getElementById('signedIn').value === "true" ? true : false;
  chrome.storage.sync.set({
    user: user
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    chrome.runtime.sendMessage({update:true});
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get("user",
  function(result) {
    document.getElementById('username').value = result.user.username;
    document.getElementById('email').value = result.user.email;
    document.getElementById('pwd').value = result.user.pwd;
    document.getElementById('version').value = result.user.version;
    document.getElementById('state').value = result.user.state;
    document.getElementById('signedIn').value = result.user.signedIn;
    user = result.user;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',
    save_options);
