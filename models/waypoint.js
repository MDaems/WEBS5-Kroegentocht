var mongoose = require('mongoose');
Schema = mongoose.Schema;

var waypointsSchema = new Schema({
    gId: {type: String, required: true},
    name: {type: String, required: true},
    lat: {type: String, required: true},
    lng: {type: String, required: true},
    userIds: {type: [Schema.ObjectId], ref: "User"}
});

waypointsSchema.methods.countUsers = function countUsers() {
    return this.userIds.length;
}

waypointsSchema.methods.containsUser = function containsUser(userId) {
    if (this.userIds.indexOf(userId) === -1) {
       return false
    };
     return true
}

Waypoint = mongoose.model('waypoints', waypointsSchema);