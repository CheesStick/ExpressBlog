const multer = require('multer');
const jwt = require('jsonwebtoken');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, '/home/amine/Documents/Dev/js/expressBlog/public/assets/images');
//     },
//     filename: async (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         const userID = await jwt.verify(req.cookies.jwt, '*6t|xy-a#s$r`g1/q=_u').id;
//         cb(null, `user-${userID}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(null, false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

module.exports.uploadUserPhoto = upload.single('photo');

module.exports.resizeUserPhoto = async (req, res, next) => {
    if (!req.file) return next();
    
    const userID = await jwt.verify(req.cookies.jwt, '*6t|xy-a#s$r`g1/q=_u').id;
    req.file.filename = `user-${userID}-${Date.now()}.jpeg`;

    sharp(req.file.buffer)
    .resize(96, 96)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`/home/amine/Documents/Dev/js/expressBlog/public/assets/images/${req.file.filename}`);

    next();
};