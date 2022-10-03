const express = require('express');
const path = require("path");

const app = express();

app.use(express.static('./public'));

app.get('/css/index', (req, res) => {
    res.status(200)
        .send('Hello World!');
});


app.use((req, res, next) => {
    console.log(req.method);
    next();
    console.log('WHYY')
});

app.get('/', (req, res) => {
    res.status(200)
        .send('Hello World!');
});

app.delete('/', (req, res) => {
    res.status(204)
        .send('Hello World!');
});

app.listen(5000, ()=> {
    console.log('Server running at port 5000');
})
