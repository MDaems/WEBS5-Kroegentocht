var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var racesSchema = new Schema({
    name: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
    waypointIds: [{ type: Schema.Types.ObjectId, ref: "waypoints" }],
    hasStarted: { type: Boolean, default: false, required: true },
    userIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    winnerId: { type: Schema.Types.ObjectId, ref: "User" }
});

racesSchema.methods.countWaypoints = function countWaypoints() {
    return this.waypointIds.length;
};

racesSchema.methods.countContestants = function countContestants() {
    return this.userIds.length;
};

racesSchema.methods.getUserScore = function getUserScore(userId) {
    var total = 0;
    for (var i = 0; i < this.waypointIds.length; i++) {
        if (this.waypointIds[i].containsUser(userId)) {
            total++;
        }
    }

    return total;
};

racesSchema.methods.checkWinner = function checkWinner(userId) {
    var total = 0;
    for (var x = 0; x < this.userIds.length; x++) {

        console.log("Aantal waypoints: "+ this.waypointIds.length);
        console.log("Aantal waypoints gebruiker: "+ this.getUserScore(this.userIds[x]._id));

        if(this.getUserScore(this.userIds[x]._id) == this.waypointIds.length)
        {
            console.log("Set Winner");
            this.winnerId = this.userIds[x]._id;
        }
    }


};

racesSchema.methods.getWinnerId = function getWinner(userId) { // Returns null if no winner.
  /*  var waypointUsers = new Array();

    var total = 0;
    for (var i = 0; i < this.waypointIds.length; i++) {

        if (this.waypointIds[i].containsUser(userId)) {
            total++;
        }
        //waypointUsers.push(this.waypointIds[i].userIds);

    }






   /!* var left = waypointUsers[0];
    if (left && left.length) {
        for (var i = 0; i < waypointUsers.length - 1; i++) {

            var right = waypointUsers[i + 1];
            for (var j = 0; j < left.length; j++) {

                var remain = new Array();
                for (var k = 0; k < right.length; k++) {

                    if (left[j].equals(right[k])) {
                        remain.push(left[j]);
                    }
                }
            }
            left = remain;
        }

        return left[0];
    }*!/

    return null;*/

};

racesSchema.methods.containsWaypoint = function containsUser(waypointId) {
    console.log('Contains waypoint?');
    for (var i = 0; i < this.waypointIds.length; i++) {
        console.log(this.waypointIds[i].gId +" = "+ waypointId);
        if(this.waypointIds[i].gId == waypointId)
        {
            console.log('already exists!');
            return true;
        }
    }
    return false;
}

Race = mongoose.model('races', racesSchema);