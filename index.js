const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ddlv3rx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productFlowCollection = client
      .db("dbProductFlow")
      .collection("dbBooks");

    app.get("/books", async (req, res) => {
      const result = await productFlowCollection.find().toArray();
      res.send(result);
    });
    // app.get("/bookApi", async (req, res) => {
    //   const { page = 1, limit = 10 } = req.query;

    //   try {
    //     const books = await productFlowCollection
    //       .find({})
    //       .skip((page - 1) * limit) // Skip the documents from previous pages
    //       .limit(parseInt(limit)) // Limit the number of documents returned
    //       .toArray();

    //     const count = await productFlowCollection.countDocuments();

    //     res.json({
    //       books,
    //       totalPages: Math.ceil(count / limit),
    //       currentPage: parseInt(page),
    //     });
    //   } catch (err) {
    //     console.error(err.message);
    //     res.status(500).send("Server Error");
    //   }
    // });
    app.get("/api/books", async (req, res) => {
      const { page = 1, limit = 9 } = req.query;

      try {
        const books = await productFlowCollection
          .find({})
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .toArray();

        const count = await productFlowCollection.countDocuments();

        res.json({
          books,
          totalPages: Math.ceil(count / limit),
          currentPage: parseInt(page),
        });
      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Product flow server is Running");
});

app.listen(port, () => {
  console.log(`product flow start a port on ${port}`);
});
