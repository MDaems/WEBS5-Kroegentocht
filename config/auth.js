function getCallbackURL(service){
    if(process.env.PORT){
        return "https://webs5-kroegentocht.herokuapp.com/auth/"+ service + "/callback"
    }else {
        return "http://localhost:3000/auth/"+ service + "/callback"
    }
}

module.exports = {
    'facebookAuth' : {
        'clientID'      : '1442174045825392', // your App ID
        'clientSecret'  : 'b367221502a4343b5f20eb4f072208fa', // your App Secret
        'callbackURL'   : getCallbackURL("facebook")
    },

    'googleAuth' : {
        'clientID'      : '1051596400348-69fr392c6g2bs05ld45vcm8t990l5eqa.apps.googleusercontent.com',
        'clientSecret'  : 'a0TO4o3-pZydd7lK3k4erW3e',
        'callbackURL'   :  getCallbackURL("google")
    }
};