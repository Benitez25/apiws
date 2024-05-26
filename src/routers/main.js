const express = require('express')
const {login, 
        createUser, 
        createPost,
        updateUser,
        viewPost,
        allPost,
        detailPost,
        updatePost,
        updateAdopPost,
        updateImgAdopPost,
        insertTimeRequest,
        insertTimeSearch} = require('../controller/main');
const multer = require('multer');

const router = express.Router()

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


router.post('/login', login)
router.post('/createUser', createUser)
router.post('/updateUser', updateUser)
router.post('/createPost', createPost)
router.post('/updateImgAdopPost', upload.single('file'), updateImgAdopPost)
router.post('/updatePost', updatePost)
router.post('/updateAdopPost', updateAdopPost)

router.get('/viewPost/:id', viewPost)
router.get('/detailPost/:id', detailPost)

router.get('/allPost/:id', allPost)

router.post('/insertTimeRequest', insertTimeRequest)
router.post('/insertTimeSearch', insertTimeSearch)

module.exports = router