// import ApolloClient from "apollo-boost";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";
import {
    ApolloLink,
    ApolloClient,
    ApolloProvider,
    from,
    HttpLink,
    InMemoryCache,
} from "@apollo/client";
import App from "next/app";
import { AppProvider } from "@shopify/polaris";
import {
    Provider as AppBridgeProvider,
    useAppBridge,
} from "@shopify/app-bridge-react";
import { authenticatedFetch } from "@shopify/app-bridge-utils";
import { Redirect } from "@shopify/app-bridge/actions";
import "@shopify/polaris/build/esm/styles.css";
import "../styles/polaris-overrides.scss";
import translations from "@shopify/polaris/locales/en.json";

import ProductsProvider from "../components/providers/ProductsProvider";

function userLoggedInFetch(app) {
    const fetchFunction = authenticatedFetch(app);

    return async (uri, options) => {
        const response = await fetchFunction(uri, options);

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
    const shopifyEndpoint = new HttpLink({
        fetch: userLoggedInFetch(app),
        fetchOptions: {
            credentials: "include",
        },
    });
    const myEndpoint = new HttpLink({
        uri: "api/products",
    });

    const link = from([
        new RetryLink({
            delay: {
                initial: 3000,
                max: Infinity,
            },
            attempts: {
                max: 5,
                retryIf: (response, _operation) => true,
            },
        }),
        onError(({ graphQLErrors, networkError, operation, forward }) => {
            if (graphQLErrors) {
                for (let err of graphQLErrors) {
                    switch (err.extensions.code) {
                        // Apollo Server sets code to THROTTLED
                        // when an AuthenticationError is thrown in a resolver
                        case "THROTTLED":
                            // Retry the request, returning the new observable
                            return forward(operation);
                    }
                }
            }

            // To retry on network errors, we recommend the RetryLink
            // instead of the onError link. This just logs the error.
            if (networkError) {
                console.log(`[Network error]: ${networkError}`);
            }
        }),
        ApolloLink.split(
            (operation) => operation.getContext().clientName === "myEndpoint",
            myEndpoint, //if above
            shopifyEndpoint
        ),
    ]);
    const client = new ApolloClient({
        cache: new InMemoryCache({
            typePolicies: {
                Products: {
                    // keyFields: false,
                    fields: {
                        products: {
                            keyArgs: ["query"],
                        },
                    },
                },
            },
        }),
        link,
    });

    const Component = props.Component;

    return (
        <ApolloProvider client={client}>
            <ProductsProvider>
                <Component {...props} />
            </ProductsProvider>
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
