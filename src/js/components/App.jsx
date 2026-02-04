import { Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from "./layout/Header";
import Footer from "./layout/Footer";
import SalesforceRestApi from '@ocdla/salesforce/SalesforceRestApi.js';
import { getCookie } from '@ocdla/salesforce/CookieUtils.js';


let client;


function isLoggedIn() {

    let sessionInstanceUrl = getCookie("instanceUrl");
    let sessionAccessToken = getCookie("accessToken");

    if (process.env.SF_OAUTH_SESSION_ACCESS_TOKEN_OVERRIDE)
    {
        sessionInstanceUrl = process.env.SF_OAUTH_SESSION_INSTANCE_URL_OVERRIDE;
        sessionAccessToken = process.env.SF_OAUTH_SESSION_ACCESS_TOKEN_OVERRIDE;
    }

    return !!sessionAccessToken;
}

// @jbernal - previously in index.js
// Retrieve video data and related thumbnail data.
async function getApiClient() {

    let sessionInstanceUrl, sessionAccessToken;
    let applicationInstanceUrl, applicationAccessToken;

    // Check if there are cookies to use for instance_url and access_token.
    if (process.env.NODE_ENV == 'production')
    {
        console.log("NODE PRODUCTION ENV!");
        let applicationTokens = await fetch("/connect").then(resp => resp.json());
        applicationInstanceUrl = applicationTokens.instance_url;
        applicationAccessToken = applicationTokens.access_token;
    }

    sessionInstanceUrl = getCookie("instanceUrl");
    sessionAccessToken = getCookie("accessToken");

    let session = new SalesforceRestApi(sessionInstanceUrl, sessionAccessToken);
    let application = new SalesforceRestApi(applicationInstanceUrl, applicationAccessToken);
    // user.setApi(session);

    return application;
}




export default function App() {

    const [appReady, setAppReady] = useState(false);

    useEffect(() => {
        async function fn() {
            client = await getApiClient();
            setAppReady(true);
        }
        fn();
    }, []);


    return (
        <div className="tablet:container mx-auto">
            <Header loggedIn={isLoggedIn()} />
            <div className="mx-auto pt-4">
                {!appReady ? <h1>Loading...</h1> : <Outlet context={{ client }} />}
            </div>
            <Footer />
        </div>
    );
}

