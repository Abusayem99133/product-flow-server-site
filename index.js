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

    // app.get("/books", async (req, res) => {
    //   const result = await productFlowCollection.find().toArray();
    //   res.send(result);
    // });
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
    // app.get("/api/books", async (req, res) => {
    //   const { page = 1, limit = 9 } = req.query;

    //   try {
    //     const books = await productFlowCollection
    //       .find({})
    //       .skip((page - 1) * limit)
    //       .limit(parseInt(limit))
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
    // app.get("/books", async (req, res) => {
    //   const { search, brand, category, minPrice, maxPrice, sortBy } = req.query;

    //   try {
    //     // Build the query object
    //     let query = {};

    //     if (search) {
    //       query.productName = { $regex: search, $options: "i" }; // Case-insensitive search
    //     }

    //     if (brand) {
    //       query.brandName = brand;
    //     }

    //     if (category) {
    //       query.categoryName = category;
    //     }

    //     if (minPrice || maxPrice) {
    //       query.price = {};
    //       if (minPrice) query.price.$gte = Number(minPrice);
    //       if (maxPrice) query.price.$lte = Number(maxPrice);
    //     }

    //     // Build the sorting object
    //     let sort = {};
    //     if (sortBy === "priceLowToHigh") {
    //       sort.price = 1;
    //     } else if (sortBy === "priceHighToLow") {
    //       sort.price = -1;
    //     } else if (sortBy === "newestFirst") {
    //       sort.createdAt = -1;
    //     }

    //     const products = await products.find(query).sort(sort);
    //     res.json(products);
    //   } catch (error) {
    //     res.status(500).json({ message: error.message });
    //   }
    // });
    app.get("/api/books", async (req, res) => {
      const {
        page = 1,
        limit = 9,
        search = "",
        category = "",
        minPrice = 0,
        maxPrice = Infinity,
        sortBy = "",
        brand = "",
      } = req.query;

      try {
        // Build the query object
        let query = {};

        // Implement search functionality
        if (search) {
          query.product_name = { $regex: search, $options: "i" }; // Case-insensitive search
        }

        // Implement category filtering
        if (category) {
          query.category = { $regex: category, $options: "i" }; // Case-insensitive match for category
        }

        // Implement price range filtering
        if (minPrice || maxPrice) {
          query.price = {
            $gte: parseFloat(minPrice),
            $lte: parseFloat(maxPrice),
          };
        }

        // Implement brand filtering
        if (brand) {
          query.brand_name = { $regex: brand, $options: "i" }; // Case-insensitive match for brand
        }

        // Build the sorting object
        let sort = {};
        if (sortBy === "priceLowToHigh") {
          sort.price = 1;
        } else if (sortBy === "priceHighToLow") {
          sort.price = -1;
        } else if (sortBy === "newestFirst") {
          sort.product_creation_date = -1;
        }

        // Execute the query with pagination and sorting
        const books = await productFlowCollection
          .find(query)
          .sort(sort)
          .skip((page - 1) * limit)
          .limit(parseInt(limit))
          .toArray();

        // Count the total number of documents that match the query
        const count = await productFlowCollection.countDocuments(query);

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
