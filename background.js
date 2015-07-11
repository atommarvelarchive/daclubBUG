global = {};
user = 
{
	username: "default",
    email: "email",
	pwd: "",
	firstname: "club",
	lastname: "coin",
	zip: "77566",
	version: 0,
    state: "register",
	bd: {
		month: "01",
		day: "01",
		year: "1980"
	},
    signedIn: true
};
hw =
{
	attempt : 0,
	code : ""
};
commander = {};

function updateUser(){
    chrome.storage.sync.get("user",function(result){
        if(result.user) {
            user = result.user
        } else {
            chrome.storage.sync.set({user: user});
        }
    });
};

function saveUser(){
  chrome.storage.sync.set({ user: user }, function() { });
}

commander.path=
{
    register:{
        'https://club.nintendo.com/': "signup",
        "https://club.nintendo.com/home.do": "bounceAccount",
        "https://club.nintendo.com/registration.do": "accountDetails",
        "https://club.nintendo.com/account-family-add-member.do": "registerChild",
        "https://club.nintendo.com/confirm-registration.do": "signin",
        "https://club.nintendo.com/account.do": "addChild"
    },
    codes:{
        "https://club.nintendo.com/": "signinChild",
        "https://club.nintendo.com/home.do": "regHome",
        "https://club.nintendo.com/todo-product-register.do" : "hwGenerator",
        "https://club.nintendo.com/coins-survey/" : "surveyPerson",
        "https://club.nintendo.com/survey-thanks" : "signout"
    },
};

commander.getScript = function(url){
    if(url.indexOf("https://club.nintendo.com/coins-survey/") === 0)
        url = "https://club.nintendo.com/coins-survey/";
    if(url.indexOf("https://club.nintendo.com/survey-thanks") === 0)
        url = "https://club.nintendo.com/survey-thanks";
    var cut = url.indexOf(".do");
    cut = (cut === -1) ? url.length : cut+3;
    url =  url.slice(0,cut);
    if(this[this.path[user.state][url]])
        return this[this.path[user.state][url]]();
    else
        console.log("not an automated page");
};

commander.surveyPerson = function(){
    console.log("generating surveyPerson command");
    return 'document.getElementById("age").value = 8;' +
           'document.getElementById("month").value = 0;' +
           'document.getElementById("male").checked = true;' +
           'document.getElementById("beginner").checked = true;' +
           'document.getElementById("survey-profile-submit").click();';
}

commander.regHome = function(){
    console.log("generating regHome command");
    if(user.signedIn && user.version <8)
        return 'window.location.assign("https://club.nintendo.com/todo-product-register.do");';
    else
        return 'window.location.assign("https://club.nintendo.com/");';
}

commander.bounceAccount = function(){
    console.log("generating regHome command");
    if(user.signedIn && user.version <8)
        return 'window.location.assign("https://club.nintendo.com/account.do");';
    else
        return 'window.location.assign("https://club.nintendo.com/");';
}

commander.signup = function(){
   console.log("generating signup command");
    return  'document.getElementsByClassName("signup-trigger")[0].click();' +
            'document.getElementById("date-month").value = '+user.bd.month+';' +
            'document.getElementById("date-day").value = '+user.bd.day+';' +
            'document.getElementById("date-year").value = '+user.bd.year+';' +
            'document.getElementById("dob-submit").click();	';
};

commander.signin = function(){
    console.log("generating signin command");
    console.log("version "+user.version);
    user.signedIn = true;
    return 'document.getElementsByClassName("signin-trigger")[0].click();' +
           'document.getElementById("username").value = "'+user.username+user.version.toString()+'";' +
           'document.getElementById("password").value = "'+user.pwd+'";' +
           'document.getElementById("login-submit").click();';
}

commander.signout = function(){
   user.signedIn = false;
   return 'document.querySelector("#container > div.content > div.header > div > div.club-account > div > a").click();';
}

commander.signinChild = function(){
    console.log("generating signinChildCommand");
    if(!user.signedIn){
        user.version++;
        user.signedIn = true;
        saveUser();
    }
    if(user.version <8) {
        return commander.signin();
    }
}

commander.addChild = function(){
    console.log("generating addChild command");
    user.version++;
    saveUser();
    if(user.version<8)
        return 'document.getElementsByClassName("cta-small add")[1].click();';
    else
    {
        console.log("you've registered enough");
        user.state = "codes";
        user.version = -1;
        saveUser();
        return this.signout();
    }
}

commander.accountDetails = function(){
    console.log("generating accountDetails command");
    return  'document.getElementById("over-13-email").value = "'+user.email+'";' +
            'document.getElementById("txt-username").value = "'+user.username+user.version.toString()+'";' +
            'document.getElementById("txt-password").value = "'+user.pwd+'";' +
            'document.getElementById("txt-reenter-password").value = "'+user.pwd+'";' +
            'document.getElementById("txt-firstname").value = "'+user.firstname+'";' +
            'document.getElementById("txt-lastname").value = "'+user.lastname+'";' +
            'document.getElementById("txt-postal").value = "'+user.zip+'";' +
            'document.getElementById("sel-level-gamer").value = "i";' +
            'document.getElementById("optin-all").checked = false;' +
            'document.getElementById("terms-agree").checked = true;' +
            'validateEmail();'+
            'validateUsername();'+
            'document.getElementsByClassName("input-submit cta btn-done")[0].click();';
};

commander.registerChild = function(){
    console.log("running registerChild command");
    return  'document.getElementById("date-month").value = "'+user.bd.month+'";' +
            'document.getElementById("date-day").value = "'+user.bd.day+'";' +
            'document.getElementById("date-year").value = "2005";' +
            'document.getElementById("dob-submit").click();' +
            'document.getElementById("btn-yes-parent").click();' +
            'document.getElementById("child-username").value = "'+user.username+user.version.toString()+'";' +
            'document.getElementById("child-password").value = "'+user.pwd+'";' +
            'document.getElementById("child-reenter-password").value = "'+user.pwd+'";' +
            'document.getElementById("family-underage-submit").click();' +
            'window.setTimeout(function(){document.getElementById("family-underage-submit").click()}, 6000);';
};

commander.hwGenerator = function(){
    console.log("running hwGenerator command");
    var code = getHwCode();
    return  'document.getElementById("pin-serial-2").value = "HW"+"'+code+'";' +
            'document.querySelector("#content > div > div > div.main > form > p > span > button").click();';
};

function getHwCode(){
    var finalCode = user.version.toString();
    if(hw.code === ""){
        hw.code = generateNumString(7);
    }
    finalCode += hw.code;
    finalCode += hw.attempt.toString();
    hw.attempt++;
    if(hw.attempt === 10){
        hw.attempt = 0;
        hw.code = "";
    }
    return finalCode;
};

function generateNumString(count){
    var numString = "";
    for(var i = 0;i<count;i++){
        numString += Math.floor(Math.random() * (10)).toString();
    }
    return numString;
};

chrome.browserAction.onClicked.addListener(function(tab){
      var code = commander.getScript(tab.url);
      var ret = "true";
      chrome.tabs.executeScript(tab.id, {code: code+ret}, function(results){
      });
});

chrome.webNavigation.onCompleted.addListener(function(details){
      var code = commander.getScript(details.url);
      var ret = "true";
      chrome.tabs.executeScript(details.tabId, {code: code+ret}, function(results){
      });
});

chrome.runtime.onMessage.addListener(function(msg, sndr, rsp){
    if(msg.update)
        updateUser();
});

updateUser();

