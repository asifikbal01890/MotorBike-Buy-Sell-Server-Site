const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
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
        const usersCollection = client.db('motorbike').collection('users');
        // const standardBikeCollection = client.db('motorbike').collection('standardBike');
        // const cruiserBikeCollection = client.db('motorbike').collection('cruiserBike');

        app.get('/categories', async (req, res) => {
            const query = {};
            const categoryList = await categoryCollection.find(query).toArray();
            res.send(categoryList);
        })

        app.get('/categories/:id', async (req, res) => {
            id = req.params.id;
            console.log
            const query = { _id: ObjectId(id) };
            const categoryList = await categoryCollection.findOne(query);
            res.send(categoryList);
        })

        app.get('/bikes', async (req, res) => {
            const id = req.query.id;
            const query = { id: id };
            const bikesList = await bikeCollection.find(query).toArray();
            res.send(bikesList);
        })

        // app.get('/mybikes', async (req, res) => {
        //     const email = req.query.email;
        //     console.log(email);
        //     const decodedEmail = req.decoded.email;
        //     // if( email !== decodedEmail){
        //     //     return res.status(403).send({message: 'forbidden access'});
        //     // }
        //     const query = {};
        //     const bikesList = await bikeCollection.find(query).toArray();
        //     res.send(bikesList);
        // })

        app.post('/bikes', async (req, res) => {
            const bike = req.body;
            const result = await bikeCollection.insertOne(bike);
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
                return res.send({ accessToken: token })
            }
            res.status(403).send({ accessToken: 'you are not authorized' })
        })

        app.put('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        })

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isAdmin: user?.role === 'admin'});
        })

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isSeller: user?.role === true});
        })

        app.get('/users/buyer/:email', async (req, res) => {
            const email = req.params.email;
            const query = {email}
            const user = await usersCollection.findOne(query);
            res.send({isBuyer: user?.role === false});
        })
    }
    finally {

    }
}
run().catch(console.log);
app.get('/', async (req, res) => {
    res.send('server is running');
})

app.listen(port, () => console.log(`server running on ${port}`));