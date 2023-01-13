const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const SSLCommerzPayment = require('sslcommerz-lts');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASS;
const is_live = false //true for live, false for sandbox

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
        const paymentsCollection = client.db('motorbike').collection('payments');

        app.get('/categories', async (req, res) => {
            const query = {};
            const categoryList = await categoryCollection.find(query).toArray();
            res.send(categoryList);
        })

        app.get('/categories/:id', async (req, res) => {
            id = req.params.id;
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

        app.post('/bikes', async (req, res) => {
            const bike = req.body;
            const result = await bikeCollection.insertOne(bike);
            res.send(result);
        })

        app.get('/bikes/my', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bikes = await bikeCollection.find(query).toArray();
            res.send(bikes);
        });

        app.delete('/bikes/my/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const bike = await bikeCollection.deleteOne(filter);
            res.send(bike);
        })

        app.get('/bikes/ads', async (req, res) => {
            const ads = req.role !== false;
            const query = {ads};
            const bikeAds = await bikeCollection.find(query).toArray();
            res.send(bikeAds);
        })

        app.put('/bikes/ads/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    ads: true
                }
            }
            const result = await bikeCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const booking = req.body;
            const result = await bookingsCollection.insertOne(booking);
            res.send(result);
        })

        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const bookings = await bookingsCollection.find(query).toArray();
            res.send(bookings);
        });

        app.get('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);
            res.send(booking);
        })

        app.get('/bookings/payment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const booking = await bookingsCollection.findOne(query);

            const transactionId = new ObjectId().toString();
            const data = {
                total_amount: parseInt(booking.price),
                currency: 'BDT',
                tran_id: transactionId, // use unique tran_id for each api call
                success_url: 'http://localhost:3030/success',
                fail_url: 'http://localhost:3030/fail',
                cancel_url: 'http://localhost:3030/cancel',
                ipn_url: 'http://localhost:3030/ipn',
                shipping_method: 'Courier',
                product_name: booking.itemName,
                product_category: 'Electronic',
                product_profile: 'general',
                cus_name: booking.userName,
                cus_email: booking.email,
                cus_add1: 'Dhaka',
                cus_add2: 'Dhaka',
                cus_city: booking.location,
                cus_state: 'Dhaka',
                cus_postcode: '1000',
                cus_country: 'Bangladesh',
                cus_phone: booking.phone,
                cus_fax: '01711111111',
                ship_name: 'Customer Name',
                ship_add1: 'Dhaka',
                ship_add2: 'Dhaka',
                ship_city: 'Dhaka',
                ship_state: 'Dhaka',
                ship_postcode: 1000,
                ship_country: 'Bangladesh',
            };
            console.log(data)
            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
            sslcz.init(data).then(apiResponse => {
                // console.log(apiResponse);
                // Redirect the user to payment gateway
                let GatewayPageURL = apiResponse.GatewayPageURL;
                res.send({url: GatewayPageURL});
            });
            
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

        app.get('/users/seller', async (req, res) => {
            const role = req.role !== true;
            const query = {role};
            const sellers = await usersCollection.find(query).toArray();
            res.send(sellers);
        })

        app.put('/users/seller/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    verify: 'verified'
                }
            }
            const result = await usersCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        });

        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const user = await usersCollection.deleteOne(filter);
            res.send(user);
        })

        app.get('/users/buyer', async (req, res) => {
            const role = req.role === true;
            const query = {role};
            const buyers = await usersCollection.find(query).toArray();
            res.send(buyers);
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