const express = require("express");
const searchAndFilterProperties  =require("../Controllers/searchController");
const router = express.Router();

router.get("/", searchAndFilterProperties);

module.exports=router;
