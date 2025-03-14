import { UserManager, Log } from "oidc-client-ts";

// re-enable if having issues with login
Log.setLogger(console);
Log.setLevel(Log.DEBUG);

const cognitoAuthConfig = {
    authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_d46KXnFGn",
    client_id: "sep7sl8h18qssf0tc94p9pc3r",
    redirect_uri: "https://d3rq77oh23742.cloudfront.net/index.html",
    response_type: "code",
    scope: "phone openid email"
};

if (import.meta.env.DEV) {
    cognitoAuthConfig.redirect_uri = "http://localhost:5173";
}
console.log("redirect_uri: ", cognitoAuthConfig.redirect_uri);

// create a UserManager instance
export const userManager = new UserManager({
    ...cognitoAuthConfig,
});

export async function signOutRedirect () {
    const clientId = "sep7sl8h18qssf0tc94p9pc3r";
    const logoutUri = cognitoAuthConfig.redirect_uri;
    const cognitoDomain = "https://us-east-2d46kxnfgn.auth.us-east-2.amazoncognito.com";
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
};