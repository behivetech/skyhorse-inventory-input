import ApolloClient from "apollo-boost";
import { ApolloProvider, InMemoryCache } from "@apollo/client";
import App from "next/app";
import { AppProvider } from "@shopify/polaris";
import {
    Provider as AppBridgeProvider,
    useAppBridge,
} from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import "@shopify/polaris/build/esm/styles.css";
import translations from "@shopify/polaris/locales/en.json";

function userLoggedInFetch(app) {
    const fetchFunction = authenticatedFetch(app);

    return async (uri, options) => {
        const response = await fetchFunction(uri, options);
        console.log(uri);
        if (
            response.headers.get(
                "X-Shopify-API-Request-Failure-Reauthorize"
            ) === "1"
        ) {
            const authUrlHeader = response.headers.get(
                "X-Shopify-API-Request-Failure-Reauthorize-Url"
            );

            const redirect = Redirect.create(app);
            redirect.dispatch(Redirect.Action.APP, authUrlHeader || `/auth`);
            return null;
        }

        return response;
    };
}

function MyProvider(props) {
    const app = useAppBridge();
    const client = new ApolloClient({
        cache: new InMemoryCache(),
        fetch: userLoggedInFetch(app),
        fetchOptions: {
            credentials: "include",
        },
    });

    const Component = props.Component;

    return (
        <ApolloProvider client={client}>
            <Component {...props} />
        </ApolloProvider>
    );
}

class MyApp extends App {
    render() {
        const { Component, pageProps, host } = this.props;

        return (
            <AppProvider i18n={translations}>
                <AppBridgeProvider
                    config={{
                        apiKey: API_KEY,
                        host: host,
                        forceRedirect: true,
                    }}
                >
                    <MyProvider Component={Component} {...pageProps} />
                </AppBridgeProvider>
            </AppProvider>
        );
    }
}

MyApp.getInitialProps = async ({ ctx }) => {
    return {
        host: ctx.query.host,
    };
};

export default MyApp;
