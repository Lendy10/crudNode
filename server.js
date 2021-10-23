const express = require('express');
const app = express();
const connectDB = require('./config/connection');
const path = require('path');
const {
    v4: uuidv4
} = require('uuid');
const fileUpload = require('express-fileupload');
const {
    check,
    validationResult
} = require('express-validator');
const session = require('express-session');
const Student = require('./model/studentModel');

connectDB();

const view = __dirname + "/public/view/";

//static served
app.use(express.static('public'));

app.use(express.json({
    extended: false
}))

//middleware for form and url
app.use(express.urlencoded({
    extended: true
}));

//middleware for file upload
app.use(fileUpload());

//for view engine
app.set('view engine', 'ejs');

app.use(session({
    secret: 'keyboard cat',
    cookie: {
        maxAge: 5000
    }
}))

app.get('/', async (req, res) => {
    try {
        //ambil data smeua mhs dari db
        const students = await Student.find();
        res.render(path.join(view, "index"), {
            students,
            alert: req.session
        });
    } catch (err) {
        console.error(err);
    }
})

app.get('/add', (req, res) => {
    if (!req.session.message) {
        req.session.message = {}
    }

    res.render(path.join(view, "add"), {
        msg: req.session.message
    });
})

app.post('/add_data',
    [ //UPLOAD File
        check('name').notEmpty().withMessage('Name must not be empty'),
        check('nim').notEmpty().withMessage('NIM must not empty'),
        check('nim').isNumeric().withMessage('NIM only receives Numeric'),
        check('study').notEmpty().withMessage('Program study must not be empty'),
        check('email').notEmpty().withMessage('Email must not be empty'),
        check('email').isEmail().withMessage("Must be email")
    ], async (req, res) => {
        const {
            name,
            nim,
            study,
            email
        } = req.body;

        const file = req.files.profile;

        //cek apakah yg diupload adalah gambar
        if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.mimetype)) {
            console.log(file.mimetype);
            var errorMsg = {
                msg: "File must be image"
            }
        }

        if (file.size > 8000000) {
            var errorMsg = {
                msg: "File maximum of 8 mb"
            }
        }

        if (errorMsg) {
            req.session.message = {
                errorss: [errorMsg],
                name,
                nim,
                email,
                study
            }
            console.log(req.session.message);
            return res.redirect('/add');
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.session.message = {
                errorss: errors.array(),
                name,
                nim,
                email,
                study
            }

            return res.redirect('/add');
        }

        try {
            //ganti nama file
            file.name = uuidv4() + path.extname(file.name);

            if (!file) {
                file.name = 'default.jpg'
            }

            //save path
            const savePath = path.join(__dirname, 'public', 'image', file.name);
            await file.mv(savePath);

            //simpan ke database, buat object stundent
            const studentModel = await new Student({
                name,
                nim,
                email,
                study,
                picture: file.name
            })

            await studentModel.save();

            req.session.message = {
                alert: 'success',
                msg: "User has been added"
            };
            res.redirect("/");
        } catch (err) {
            console.error(err);
        }
    })

//delete route
app.get('/delete/:id', async (req, res) => {
    try {
        //cari di db
        await Student.findOneAndRemove({
            _id: req.params.id
        })

        req.session.message = {
            alert: 'danger',
            msg: "User has been deleted"
        };
        res.redirect('/');
    } catch (err) {
        if (err.kind == 4) {
            new Error("Not valid Student");
        }
        console.error(err);
    }
})

//edit route
app.get('/edit/:id', async (req, res) => {
    try {
        //get id
        const student = await Student.findOne({
            _id: req.params.id
        });

        res.render(path.join(view, 'edit'), {
            student,
            msg: req.session.message
        });
    } catch (err) {
        if (err.kind === 4) {
            new Error("Not Valid Student");
        }
        console.error(err);
    }
})

app.post('/save_edit/:id', [
    check('name').notEmpty().withMessage('Name must not be empty'),
    check('nim').notEmpty().withMessage('NIM must not empty'),
    check('nim').isNumeric().withMessage('NIM only receives Numeric'),
    check('study').notEmpty().withMessage('Program study must not be empty'),
    check('email').notEmpty().isEmail().withMessage('Email must not be empty')
], async (req, res) => {
    const errors = validationResult(req);
    const {
        name,
        nim,
        study,
        email
    } = req.body;

    const id = req.params.id;

    if (!errors.isEmpty()) {
        req.session.message = {
            errorss: errors.array(),
            name,
            nim,
            email,
            study
        }
        res.redirect(`/edit/${id}`);
    }

    //save to db
    const student = await Student.findOneAndUpdate({
        _id: id
    }, {
        name,
        nim,
        study,
        email
    });

    await student.save();

    req.session.message = {
        alert: 'success',
        msg: "User has been updated"
    };

    res.redirect('/');
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})