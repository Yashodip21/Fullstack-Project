const mongoose=require("mongoose");
const initData=require("./data.js");
const Listing = require("../models/listing.js"); // path adjust if needed

const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";

main()
 .then(()=>{
    console.log("Connected to dbs");
 })
 .catch((err)=>{
    console.log(err);
 })
async function main(params) {
    await mongoose.connect(MONGO_URL);
    
}

const initDB=async()=>{
   await Listing.deleteMany({});
   initData.data=initData.data.map((obj)=>({
      ...obj,
      owner:"6981ed5f5b3aee857588cb36",
   }))
   await Listing.insertMany(initData.data);

   console.log("Data as intialized");
};

initDB();
