const multer = require('multer');
const {
    v4: uuidv4
} = require('uuid');
const path = require('path');


const imageStorage = multer.diskStorage({
    destination: 'public/image',
    filename: (req, file, callback) => {
        callback(null, uuidv4() + path.extname(file.originalname))
    }
})

const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 8000000 //8 mb
    },
    fileFilter(req, file, callback) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            callback("Not allowed", false)
        }
        callback(null, true)
    }
})

module.exports = imageUpload;