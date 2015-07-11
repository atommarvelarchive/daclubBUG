window.onload = function() {
global = {};



var setMyURL = function(name, isId){
  global.myURL = isId ? "http://steamcommunity.com/id/"+name :"http://steamcommunity.com/profiles/"+name ; //+"/friends/players/"
}

var fetchPage = function(site, callback){
  var xhr = new XMLHttpRequest();
  xhr.open("GET", site);
  xhr.onreadystatechange=function()
  {
  if (xhr.readyState==4 && xhr.status==200)
    {
      var div = document.createElement("div");
      div.innerHTML = xhr.responseText;
      callback(div);
    }
  }
  xhr.send();
};

var getUid = function(url){
  var parts = url.split("/");
  for(s in parts){
    if(parts[s] === "id" || parts[s] === "profiles")
      return parts[s+1];
  }
  return null;
}

var grabOnlinePlayers = function(callback){
  var url = global.myURL;
  fetchPage(url, function(page){ 
    var players = [];
	  var elems = document.getElementsByClassName("linkFriend_in-game");
	  for (player in elems){
	    var uid = getUid(elems[player].getAttribute("href"));
	  	rankSearch(elems[player].innerText, function(result){
  	  	players.push(result);
  	  	callback(players);
	  	})
  	}
  });
};

var rankSearch = function(username, uid, callback){
	var baseURL = "http://nautsrankings.com/index.php?search=";
	fetchPage(baseURL+username, function(page){
	  global.page = page;
	  var items = global.page.getElementsByClassName("row");
	  //filter out ones with only row
	  var results = [];
	  for(item in items){
	    var elem = items[item];
	    if(((elem.getAttribute("class")).split(" ")).length === 1){
	      var curUid = getUid( elem.getElementsByClassName("name")[0].getElementsByTagName("a")[0].getAttribute("href"))
	      if(curUid === uid){
	      var player = {};
	      player.rank = parseInt((elem.getElementsByClassName("rank")[0]).getElementsByTagName("a")[0].innerText);
	      player.winP = parseFloat(elem.getElementsByClassName("win")[0].innerText);
	      player.char = elem.getElementsByClassName("favorite")[0].getElementsByTagName("img")[0].getAttribute("title");
	      player.games = parseInt(elem.getElementsByClassName("played")[0].innerText);
	      player.pic = player.pic = elem.getElementsByClassName("name")[0].getElementsByTagName("img")[0].getAttribute("src");
	      player.profile = elem.getElementsByClassName("name")[0].getElementsByTagName("a")[0].getAttribute("href");
	      callback(player);
	      }
	    }
	  }
	  callback(null);
	});
};

  document.querySelector('#greeting').innerText =
    'Hello, World! It is ' + new Date();
  document.getElementById("id").onclick = function(){
    var name = document.getElementById("name").value;
    setMyURL(name, true);
  };
  document.getElementById("uname").onclick = function(){
    var name = document.getElementById("name").value;
    setMyURL(name, false);
  };
  document.getElementById("teamBtn").onclick = function(){
    grabOnlinePlayers(function(players){
      var div = document.getElementById("players");
      var pre = document.createElement("pre");
      pre.innerText = JSON.stringify(players, null, "\t");
      div.appendChiled(pre);
    });
  };
};