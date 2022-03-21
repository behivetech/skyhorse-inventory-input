const { parsed: localEnv } = require("dotenv").config();

const webpack = require("webpack");
const apiKey = JSON.stringify(process.env.SHOPIFY_API_KEY);
const shop = JSON.stringify(process.env.SHOP);
const queryDelay = JSON.stringify(process.env.QUERY_DELAY);
const totalQueryRows = JSON.stringify(process.env.TOTAL_QUERY_ROWS);

module.exports = {
    webpack: (config) => {
        const env = {
            API_KEY: apiKey,
            SHOP: shop,
            QUERY_DELAY: queryDelay,
            TOTAL_QUERY_ROWS: totalQueryRows,
        };

        config.plugins.push(new webpack.DefinePlugin(env));

        // Add ESM support for .mjs files in webpack 4
        config.module.rules.push({
            test: /\.mjs$/,
            include: /node_modules/,
            type: "javascript/auto",
        });

        return config;
    },
};
