require('dotenv').config()
const express = require('express');
const app = express();
const cors = require('cors')
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send('server is running')
})

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS}@cluster0.n2wd0zs.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const menuCollection = client.db("bistroDb-1").collection("menu-1");
        const reviewCollection = client.db("bistroDb-1").collection("reviews-1");
        const cartCollection = client.db("bistroDb-1").collection("carts-1");
        const userCollection = client.db("bistroDb-1").collection("users-1");

        app.get('/menu', async (req, res) => {
            const result = await menuCollection.find().toArray();
            res.send(result)
        })
        app.get('/review', async (req, res) => {
            const result = await reviewCollection.find().toArray();
            res.send(result)
        })

        app.post('/carts', async(req,res)=>{
            const item=req.body;
            const result=await cartCollection.insertOne(item)
            res.send(result)
        })

        app.get('/carts', async(req,res)=>{
            const email=req.query.email;
            if(!email){
                res.send([])
            }
            else{
                const query={email: email}
                const result=await cartCollection.find(query).toArray();
                res.send(result)
            }
        })

        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result)
          })

          //post login user in DB one by one
          app.post('/users', async(req,res)=>{
            const user=req.body;
            const query={email: user.email}
            const existingUser=await userCollection.findOne(query);
            if(existingUser){
                return res.send({message:'This user is already logged in'})
            }
            const result=await userCollection.insertOne(user);
            res.send(result);
          })

          //get all logged in user from DB
          app.get('/users', async(req,res)=>{
            const result=await userCollection.find().toArray()
            res.send(result)
          })

          //make an user admin
          app.patch('/users/admin/:id', async(req,res)=>{
            const id=req.params.id;
            const filter={_id: new ObjectId(id)};

            const updateDoc = {
                $set: {
                  role: 'admin'
                },
              };

            const result=await userCollection.updateOne(filter,updateDoc)
            res.send(result)
          });

          //delete an user
          app.delete('/users/:id', async(req,res)=>{
            const id=req.params.id;
            const query={_id: new ObjectId(id)}
            const result=await userCollection.deleteOne(query)
            res.send(result)
          })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})