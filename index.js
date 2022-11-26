const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
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
        const bookingsCollection = client.db('motorbike').collection('bookings');
        // const standardBikeCollection = client.db('motorbike').collection('standardBike');
        // const cruiserBikeCollection = client.db('motorbike').collection('cruiserBike');
        
        app.get('/categories', async(req, res) => {
            const query = {};
            const categoryList = await categoryCollection.find(query).toArray(); 
            res.send(categoryList);
        })

        app.get('/categories/:id', async(req, res) => {
            id = req.params.id;
            console.log
            const query = { _id : ObjectId(id)};
            const categoryList = await categoryCollection.findOne(query);
            res.send(categoryList);
        })
        
        app.get('/bikes', async(req, res) => {
            const id = req.query.id
            const query = {id: id};
            const bikesList = await bikeCollection.find(query).toArray(); 
            res.send(bikesList);
        })

        app.post('/bookings', async(req, res) =>{
            const booking = req.body;
            const query = {};
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
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