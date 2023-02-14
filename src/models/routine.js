const mongoose = require("mongoose");

var url = "mongodb://localhost:27017/parkManagement";
mongoose.connect(url).then((db)=>{
    console.log("successfull")
    })


const routineSchma = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    slot1: {
        type: String
    },
    slot2: {
        type: String
    },
    slot3: {
        type: String
    }

});

const Routine = new mongoose.model("Routine", routineSchma);

module.exports = Routine;
