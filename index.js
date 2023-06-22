const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express()
 app.use(cors())
app.use(express.json())
const port =process.env.PORT || 5000;


const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.8sp76yj.mongodb.net/?retryWrites=true&w=majority`;

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
        const toysCollection = client.db("toysDB").collection("toys")
        
        // Create index
        const indexKeys={name:1,sub_category:1}
        const indexOption={name:"nameSubCategory"}
        const toysIndex=await toysCollection.createIndex(indexKeys,indexOption)

        app.get('/alltoys', async(req,res)=>{
            const cursor = await toysCollection.find({}).toArray();
            res.send(cursor);
        });
        app.get('/toys/:text', async(req,res)=>{
            const sub_category=req.params.text
            const query={sub_category:sub_category}
            const cursor = await toysCollection.find(query).toArray();
            res.send(cursor);
        });
        app.get('/search/:text', async(req,res)=>{
            const searchText=req.params.text
            const query={
                $or:[
                    {name:{$regex:searchText,$options:"i"}},
                    {sub_category:{$regex:searchText,$options:"i"}}
                ]
            }
            const cursor = await toysCollection.find(query).toArray();
            res.send(cursor);
        });
        app.get('/toy-details/:id', async(req,res)=>{
            const id=req.params.id
            const query={_id:new ObjectId(id)}
            const cursor = await toysCollection.findOne(query)
            res.send(cursor);
        });
        app.get('/my-toys/:text', async(req,res)=>{
            const email=req.params.text
            const query={seller_email:email}
            const cursor = await toysCollection.find(query).toArray();
            res.send(cursor);
        });

        app.post('/add', async(req,res)=>{
            const result=await toysCollection.insertOne(req.body)
            res.send(result)
        });
        app.delete('/deleteToy/:id',async(req,res)=>{
            const id=req.params.id;
            const query={_id:new ObjectId(id)}
            const result=await toysCollection.deleteOne(query)
            res.send(result)
           
          })
          app.get('/edit/:id',async(req,res)=>{
            const id=req.params.id
            const query={_id:new ObjectId(id)}
            const result=await toysCollection.findOne(query);
            res.send(result)
            
          });
          app.put('/update/:id',async(req,res)=>{
            const id=req.params.id
            const toy=req.body
            const filter={_id:new ObjectId(id)}
            const options={upsert:true}
            const updateUser={
              $set:{
                name:toy.name,
                image:toy.image,
                sub_category:toy.sub_category,
                price:toy.price,
                rating:toy.rating,
                quantity:toy.quantity,
                description:toy.description,
              }
            }
            const result =await toysCollection.updateOne(filter,updateUser,options)
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


app.get('/', (req, res) => {
    res.send('hello world')
})

app.listen(port, () => {
    console.log("Server is running 5000");
})