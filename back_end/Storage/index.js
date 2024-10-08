require("dotenv").config();                                     //imported dotenv and created .env file with key and secret key
const express = require("express");                             //imported express to manage routes and servers
const multer = require("multer");                               //imported multer lib for handeling the uploading of files. 
const { s3UploadV2 } = require("./S3service");                  //used AWS s3 for online storage
const uuid = require("uuid").v4;                                //imported uuid library to handle and rename files
const app = express();


//Simple test of uploading single file.

    //const upload = multer({dest: "Uploads/"});                        uploads the files to destination file Uploads
    //app.post("/upload", upload.single("file"), (req, res) => {        uploads single file
    //    res.json({status: "success"});                                returns if successfully uploaded
    //});


//Test for uploading multiple files at once.

    //const upload = multer({dest: "Uploads/"});
    //app.post("/upload", upload.arry65ay("file"), (req, res) => {      added array to handel multiple files.
    //    res.json({status: "success"});                                returns if successfully uploaded
    //});


//Test for multiple fields uploading

    //const upload = multer({dest: "Uploads/"});            

//added 3 types : video, image and files           |                            |                               |
    //const multiUpload = upload.fields([{name: "Video", maxCount: 1}, {name: "Image", maxCount: 1}, {name: "Document", maxCount: 1} ])
    //app.post("/upload", multiUpload , (req, res) => {
    //   console.log(req.files);
    //  res.json({status: "success"});
    //});


//Test for custom file names

    //const storage = multer.diskStorage({                          used diskstorage to uplaod to local server
    //   destination: (req, file, cb) => {
    //      cb(null, "uploads/");
    //},
    // filename: (req,file,cb) => {                                 customizes filename
    //      const {originalname} = file;                            made filename original name 
    //      cb(null, `${uuid()}-${originalname}`)                   
    // }
    //});

const storage = multer.memoryStorage();


//added function to handel file types
const filefilter = (req, file, cb) => {                             
   if(file.mimetype.split("/")[0] === 'image') {                       //checks to see if file is of correct type
    cb(null, true);
   } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);        
   }
};

//uploads multiple files with array.
const upload = multer({storage, filefilter, limits: {fileSize: 1000000000}});      //file size limit set in bytes
app.post("/upload", upload.array("file"), async (req, res) => {
    try{                                        //try catch for error handeling

        const results = await s3UploadV2(req.files);
        console.log(results);                   
        res.json({status: "success"});          // send back "success" if uploaded successfully

    } catch (err) {                             //catches error that was thrown and displays it in console
        console.log(err);

    }
    
    
    
});

//added error handeling for smooth operation

app.use((error, req, res, next) => {                 //error handeling implemented for clean opperation
    if(error instanceof multer.MulterError){        //error of file is to large
       if(error.code === "LIMIT_FILE_SIZE"){
        return res.json({
            message: "file is too large",
        });


       }

       if(error.code === "LIMIT_FILE_COUNT"){       //error if too many files are uploaded
        return res.json({
            message: "file limit reached",
        });
    }

    if(error.code === "LIMIT_UNEXPECTED_FILE"){     //error if file is of the wrong type
        return res.json({
            message: "file is of the wrong type",
        });
    }
      
    }
});

app.listen(4000, () => console.log("Listening on port: 4000"));      //set up express server to listen to specific port.