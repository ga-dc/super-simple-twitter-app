# Super-simple app with Twitter log-in authentication

Create a new Twitter application at https://dev.twitter.com/apps .

```js
// env.js
module.exports = {
  sessionSecret: "mysecret",
  twitter: {
    consumerKey: "abc123",
    consumerSecret: "abc123",
    callbackUrl: "http://127.0.0.1:3000/auth/twitter/callback"
  }
}
```
