const express = require('express')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

//user--facmasterFactory
//pass--Zfg8KwNWMOviWg7z

//connect to database
const uri = `mongodb+srv://${process.env.DB_USER}:<password>@cluster0.8oq1d.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});


app.get('/', (req, res) => {
  res.send('Facmaster Factory server!')
})

app.listen(port, () => {
  console.log(`Facmaster Factory listening on port ${port}`)
})