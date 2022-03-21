const { parsed: localEnv } = require("dotenv").config();

const webpack = require("webpack");
const API_KEY = JSON.stringify(process.env.SHOPIFY_API_KEY);
const SHOP = JSON.stringify(process.env.SHOP);
const QUERY_DELAY = JSON.stringify(process.env.QUERY_DELAY);
const TOTAL_QUERY_ROWS = JSON.stringify(process.env.TOTAL_QUERY_ROWS);
const INFINITE_SCROLL_THRESHOLD = JSON.stringify(
    process.env.INFINITE_SCROLL_THRESHOLD
);

module.exports = {
    webpack: (config) => {
        const env = {
            API_KEY,
            SHOP,
            QUERY_DELAY,
            TOTAL_QUERY_ROWS,
            INFINITE_SCROLL_THRESHOLD,
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
