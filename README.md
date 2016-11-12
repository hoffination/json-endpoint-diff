# json-endpoint-diff

![json-endpoint-diff icon](images/icon-128x128.png)

> This tool will compare the JSON output of two REST endpoints to check for regressions

Plug in two GET or POST endpoints, put in any parameters to request with, click to submit, and view a visual breakdown of the differences.

### [Demo](http://s3-us-west-2.amazonaws.com/jsondiff/index.html)

It may be required to the [Allow-Control-Allow-Origin:*](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi/related) chrome extension to get this working for some endpoints.

The project was created in React with a [Material-UI](http://www.material-ui.com/#/) front end using several great libraries:
- [Ramda](http://ramdajs.com/)
- [superagent](https://github.com/visionmedia/superagent)
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch)

### Security Concerns
I've been asked questions about whether or not data requests handled by this app are stored to a database or sent to a server. The answer is __no__. No data is stored from the app for any reason. This app currently only runs on the frontend without communicating to servers or databases to process JSON data or store requests.


## Develop

##### Setup
```bash
git clone https://github.com/hoffination/json-endpoint-diff

cd json-endpoint-diff
npm install

npm install -g webpack webpack-dev-server
```

##### Run
```bash
webpack-dev-server --progress --colors
```
