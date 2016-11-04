# json-endpoint-diff
> This tool will compare the JSON output of two REST endpoints to check for regressions

Plug in two GET or POST endpoints, put in any parameters to request with, click to submit, and view a great visual breakdown of the differences.

### [Demo](http://s3-us-west-2.amazonaws.com/jsondiff/index.html)

The project was created in React with a Material-UI front end using several great libraries:
- [Ramda](http://ramdajs.com/)
- [superagent](https://github.com/visionmedia/superagent)
- [jsondiffpatch](https://github.com/benjamine/jsondiffpatch)


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
