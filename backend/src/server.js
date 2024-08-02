"use strict";

import app from "./app.js";
import dotenv from 'dotenv';
dotenv.config();

const port = process.env.port || 3000;

app.listen(port, () => {
    console.log(`Running on http://localhost:${port}`);
});