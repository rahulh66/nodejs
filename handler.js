const { MongoClient, ObjectId } = require("mongodb");

let cachedClient = null;

async function connectToDatabase(uri) {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    await client.connect();
    cachedClient = client;
  }
  return cachedClient.db("nodejs-api"); // Replace with your database name
}

exports.testConnection = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    const db = await connectToDatabase(uri);
    const collections = await db.listCollections().toArray();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Connected to the database successfully!",
        collections: collections.map((col) => col.name),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Database connection failed", error: error.message }),
    };
  }
};

// Create a new user
module.exports.createUser = async (event) => {
  const uri = process.env.MONGODB_URI
  try {
    const db = await connectToDatabase(uri);
    const usersCollection = db.collection("users");

    const { name, email } = JSON.parse(event.body);

    // Basic validation
    if (!name || !email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Name and email are required." }),
      };
    }

    const result = await usersCollection.insertOne({ name, email, createdAt: new Date() });

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "User created successfully!",
        userId: result.insertedId,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error saving user", error: error.message }),
    };
  }
};


// Read a user
module.exports.getUser = async (event) => {
  const uri = process.env.MONGODB_URI;
  const { id } = event.pathParameters;
  const userID = ObjectId.createFromHexString(id)

  try {
    const db = await connectToDatabase(uri);
    const usersCollection = db.collection("users");
    const user = await usersCollection.findOne({ _id: userID });

    if (!user) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify(user),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Error fetching user with id ${id}`, error: error.message }),
    };
  }
};


// Update a user
module.exports.updateUser = async (event) => {
  const uri = process.env.MONGODB_URI;
  const { id } = event.pathParameters;
  const userID = ObjectId.createFromHexString(id)
  const { name, email } = JSON.parse(event.body);

  try {
    const db = await connectToDatabase(uri);
    const usersCollection = db.collection("users");
    const result = await usersCollection.updateOne(
      { _id: userID },
      { $set: { name, email, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User updated successfully!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error updating user", error: error.message }),
    };
  }
};


// Delete a user
module.exports.deleteUser = async (event) => {
  const uri = process.env.MONGODB_URI;
  const { id } = event.pathParameters;
  const userID = ObjectId.createFromHexString(id)

  try {
    const db = await connectToDatabase(uri);
    const usersCollection = db.collection("users");
    const result = await usersCollection.deleteOne({ _id: userID });

    if (result.deletedCount === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User deleted successfully!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error deleting user", error: error.message }),
    };
  }
};