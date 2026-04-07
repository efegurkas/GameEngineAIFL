const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamName : {type : String, required: true, unique: true},
    password : {type: String, required: true},
    botApiKey : {type: String, required: true},
    score : {type: Number, default : 0},
    matchesPlayed : {type: Number, default: 0}
},{
    collection : 'Teams'
});

module.exports = mongoose.model('Team',TeamSchema); 
