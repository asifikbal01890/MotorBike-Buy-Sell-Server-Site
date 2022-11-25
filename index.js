const express = require('express');
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

async function run() {
    try {
        
    } 
    finally {
        
    }
}
run().catch(console.log);
app.get('/', async(req, res) =>{
    res.send('server is running');
})

app.listen(port, () => console.log(`server running on ${port}`));