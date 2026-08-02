require("dotenv").config();

const app = require("./app");

const { connectDB } = require("./config/db");

// const restRoutes = require("./routes/restRoutes");

const { ApolloServer } = require("@apollo/server");

const { expressMiddleware } = require("@as-integrations/express5");

const typeDefs = require("./graphql/typeDefs");

const resolvers = require("./graphql/resolvers");

async function startServer() {

    await connectDB();

    const apollo = new ApolloServer({
        typeDefs,
        resolvers
    });

    await apollo.start();

    app.use("/graphql", expressMiddleware(apollo));

    // app.use("/", restRoutes);

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {

        console.log("");

        console.log("--------------------------------");

        console.log(`REST API      : http://localhost:${PORT}`);

        console.log(`GraphQL       : http://localhost:${PORT}/graphql`);

        console.log("--------------------------------");
    });

}

startServer();