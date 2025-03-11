const express = require('express');
const dbConnect = require('./database/index');
const { PORT } = require('./config/index');
const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cookie-parser');

const corsOptions = {
    credentials: true,
    origin: ['http://localhost:3000'],
}

const app = express();

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(express.json());

app.use(router);

dbConnect();

app.use('/storage', express.static('storage'));

// app.get('/', (req, res) => res.json({msg: 'Hello World!'}));

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Backend is running on port: ${PORT}`)
});