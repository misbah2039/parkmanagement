require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path")
const hbs = require("hbs")
const Register = require("./models/registers");
const Routine = require("./models/routine")
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");
const auth2 = require("./middleware/auth");
const staticPath = path.join(__dirname, "../public");
const viewspath = path.join(__dirname, "../templates/views");
const partialspath = path.join(__dirname, "../templates/partials");

app.set("view engine", "hbs");
app.set("views", viewspath);
hbs.registerPartials(partialspath);
app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
    res.render("home")
})
app.get("/addstaff", auth, (req, res) => {
    if (req.user.rol === "admin") {
        res.render("addstaff")
    }
    else {
        res.send("you are not admin")
    }
})
app.get("/viewstaff", (req, res) => {

    Register.find({}).then((x) => {
        res.render("viewstaff", { x })
        console.log(x)
    }).catch((err) => {
        console.log(err);
    })


})

app.get("/viewroutine", (req, res) => {
    Routine.find({}).then((y) => {
        res.render("viewroutine", { y })
        console.log(y)
    }).catch((err) => {
        console.log(err);
    })
})
app.get("/createroutine", auth, (req, res) => {
    if (req.user.role === "admin") {
        res.render("createroutine")

    }
    else {
        res.send("you are not admin")
    }
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.get("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((currentElement) => {
            return currentElement.token != req.token;
        });
        res.clearCookie("jwt");
        //   console.log("logout successfully");
        await req.user.save();
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
});

app.post("/createroutine", async (req, res) => {
    try {
        const registerEmployeeslot = new Routine({
            name: req.body.name,
            slot1: req.body.slot1,
            slot2: req.body.slot2,
            slot3: req.body.slot3
        });
        const registeredslot = await registerEmployeeslot.save();
        res.status(201).render("viewroutine");

    } catch (error) {
        res.status(400).send(error);
    }
})

app.post("/addstaff", async (req, res) => {
    try {
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        if (password === cpassword) {
            const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                email: req.body.email,
                gender: req.body.gender,
                phone: req.body.phone,
                age: req.body.age,
                password: req.body.password,
                confirmpassword: req.body.confirmpassword,
            });
            // console.log("the success part" + registerEmployee);
            const token = registerEmployee.generateAuthToken();
            // console.log("the token part" + token);
            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 100000),
                httpOnly: true,
                // secure:true
            });
            // console.log(cookie);
            const registered = await registerEmployee.save();
            // console.log("the page part" + registered);
            res.status(201).render("home");
        } else {
            res.send("password are not matching");
        }
    } catch (error) {
        res.status(400).send(error);
    }
});

app.post("/login", async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({ email: email });
        const isMatch = bcrypt.compare(password, useremail.password);
        const token = await useremail.generateAuthToken();
        // console.log("the token part" + token);

        res.cookie("jwt", token, {
            expires: new Date(Date.now() + 100000),
            httpOnly: true,
            // secure:true
        });
        if (isMatch) {
            res.status(201).render("home");
        } else {
            res.send("Invalid login detailss");
        }
    } catch (error) {
        res.status(400).send("invalid login details");
    }
});

app.get("/delete/:id", auth2, async (req, res) => {
    const id = req.params.id;
    await Register.findByIdAndDelete({ _id: id })
    res.render("viewstaff")
})

app.get("/edit/:id", (req, res) => {
    const id = req.params.id;
    Register.find({ _id: id }).then((x) => {
        res.render("edit", { x })
        console.log(x)
    }).catch((err) => {
        console.log(err);
    })
})

app.post("/edit/:id", async (req, res) => {
    const id = req.params.id;
    await Register.findByIdAndUpdate({ _id: id }, req.body)
    console.log(req.body.firstname)
    res.render("home")
    console.log("update")
})

app.listen(5000, () => {
    console.log("listening to the port number 5000")
})