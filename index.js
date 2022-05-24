const express = require('express')
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

//user--facmasterFactory
//pass--Zfg8KwNWMOviWg7z

//middleware
app.use(cors());
app.use(express.json())

//connect to database
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8oq1d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
   try{
    await client.connect()
    const productCollection = client.db("facmaster-factory").collection("product");
    //  console.log('database connect');

    
      //6 product load
      app.get('/products', async(req, res) =>{
        const query ={}
        const cursor = productCollection.find(query);
        const products = await cursor.toArray();
        // console.log(cars);
        res.send(products)
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