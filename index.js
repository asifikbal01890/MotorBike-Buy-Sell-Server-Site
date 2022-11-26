const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vh3xqbm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const categoryCollection = client.db('motorbike').collection('categories');
        const bikeCollection = client.db('motorbike').collection('bikes');
        // const standardBikeCollection = client.db('motorbike').collection('standardBike');
        // const cruiserBikeCollection = client.db('motorbike').collection('cruiserBike');
        
        app.get('/categories', async(req, res) => {
            const query = {};
            const option = await categoryCollection.find(query).toArray(); 
            res.send(option);
        })

        app.get('/categories/:id', async(req, res) => {
            id = req.params.id;
            const query = { _id : ObjectId(id)};
            const option = await categoryCollection.findOne(query); 
            res.send(option);
        })
        
        
    } 
    finally {
        
    }
}
run().catch(console.log);
app.get('/', async(req, res) =>{
    res.send('server is running');
})

app.listen(port, () => console.log(`server running on ${port}`));