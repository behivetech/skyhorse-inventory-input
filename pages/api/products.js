import { ApolloServer, gql } from "apollo-server-micro";
import readline from "readline";
import fs from "fs";

let products = {};

// function processLine(line) {
//     const { id, __parentId } = line;

//     // if there is no `__parentId`, this is a parent
//     if (typeof __parentId === 'undefined') {
//         products[line.id] = {
//             id,
//             childrens: []
//         };
//         return products;
//     }

//     // this is a child, create its parent if necessary
//     if (typeof products[__parentId] === 'undefined') {
//         products[__parentId] = {
//             id: __parentId,
//             childrens: []
//         }
//     }

//     // add child to parent's children
//     products[__parentId].childrens.push(line);
//     return products;
// }

const typeDefs = gql`
    type Query {
        products: [Product!]!
    }
    type Product {
        name: String
    }
`;

const resolvers = {
    Query: {
        products: (_parent, args, _context) => {
            // console.log(jsonlUrl);

            // if (false) {
            //     const readInterface = readline.createInterface({
            //         input: fs.createReadStream(jsonlUrl),
            //         output: process.stdout,
            //         console: false
            //     });

            //     readInterface.on('line', processLine);

            //     await readInterface.on('close', function () {
            //         const resultArray = Object.values(products);
            //         console.log(resultArray);
            //     });
            // }

            return [{ name: JSON.stringify(args) }];
        },
    },
};

const apolloServer = new ApolloServer({ typeDefs, resolvers });

const startServer = apolloServer.start();

export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
        "Access-Control-Allow-Origin",
        "https://studio.apollographql.com"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    if (req.method === "OPTIONS") {
        res.end();
        return false;
    }

    await startServer;
    await apolloServer.createHandler({
        path: "/api/products",
    })(req, res);
}

export const config = {
    api: {
        bodyParser: false,
    },
};
