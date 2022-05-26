const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000



//middleware
app.use(cors());
app.use(express.json())


//jwt create
function verifyJwt(req, res, next) {
  const authorize = req.headers.authorization;
  if (!authorize) {
      return res.status(401).send({ message: "Unauthorize access!" })
  }
  // console.log(authorize);
  const token = authorize.split(" ")[1];
  jwt.verify(token, process.env.SECRET_KEY, function (err, decoded) {
      if (err) {
          // console.log("err");
          return res.status(403).send({ message: "Forbidden access" })
      }
      req.decoded = decoded;
      next()
  });
}


//connect to database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8oq1d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
   try{
    await client.connect()
    const productCollection = client.db("facmaster-factory").collection("product");
    const reviewCollection = client.db("facmaster-factory").collection("review");
    const userCollection = client.db("facmaster-factory").collection("user");
    const orderCollection = client.db("facmaster-factory").collection("order");
    //  console.log('database connect');

    
      //all product load
      app.get('/products', async(req, res) =>{
        const query ={}
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        // console.log(cars);
        res.send(products)
    })
      //all review load
      app.get('/reviews', async(req, res) =>{
        const query ={}
        const cursor = reviewCollection.find(query);
        const reviews = await cursor.toArray();
        // console.log(cars);
        res.send(reviews)
    })

    // post product
    app.post('/product', verifyJwt, async (req, res) => {
      const product = req.body;
      const result = await productCollection.insertOne(product)
      if (result.insertedId) {
          res.send({success: true, message:`Successfully Added ${product.name}`})
      }
      else{
          res.send({success: false, message:`Something is Wrong`})
      }

  })

            // create user
            app.put('/user/:email', async (req, res) => {
                const user = req.body;
                const email = req.params.email;
                const filter = { email: email }
                const options = { upsert: true };
                const updatedDoc = {
                    $set: user
                }
                const result = await userCollection.updateOne(filter, updatedDoc, options);
                const token = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '60d' });
                res.send({ result, token })
            })
  

            // get all users
            app.get('/users', verifyJwt, async (req, res) => {
                const query = {};
                const result = await userCollection.find(query).toArray();
                res.send(result)
            })

         
         //verify Admin
         async function verifyAdmin  (req, res, next) {
            const requestEmail = req.decoded.email;
            const request = await userCollection.findOne({email: requestEmail})
            if (request.roll === "admin") {
                next()
            }
            else{
                res.status(403).send({ message: 'forbidden' })
            }
        }
            

        // post orders 
        app.post('/orders', async (req, res) => {
          const order = req.body;
          const result = await orderCollection.insertOne(order)
          res.send(result)
      })

      // get all orders
      app.get('/orders', verifyJwt, async (req, res) => {
          const query = {};
          const result = await orderCollection.find(query).toArray()
          res.send(result)
      })

      // get my order
      app.get('/orders/:email', verifyJwt, async (req, res) => {
          const email = req.params.email;
          const filter = { customerEmail: email };
          const result = await orderCollection.find(filter).toArray()
          res.send(result)
      })

      // delete order
      app.delete('/order/:id', verifyJwt, async (req, res) => {
          const id = req.params.id;
          const filter = { _id: ObjectId(id) };
          const result = await orderCollection.deleteOne(filter);
          res.send(result)
      })


       
        // get admin 
        app.get('/admin/:email', verifyJwt, async(req, res)=>{
            const userEmail = req.params.email;
            const user = await userCollection.findOne({email:userEmail})
            const isAdmin = user.roll === 'admin';
            res.send({admin : isAdmin})
        })

        // make admin
        app.put("/user/makeAdmin/:email", verifyJwt, verifyAdmin,async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { roll: 'admin' }
            };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.send(result)
        })
        // delete admin
        app.put("/user/deleteAdmin/:email", verifyJwt, verifyAdmin,async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: { roll: '' }
            };
            const result = await userCollection.updateOne(filter, updateDoc,options);
            res.send(result)
        })



   }
   finally{
       
   }
}

run().catch(console.dir)



app.get('/', (req, res) => {
  res.send('Facmaster Factory server!')
})

app.listen(port, () => {
  console.log(`Facmaster Factory listening on port ${port}`)
})