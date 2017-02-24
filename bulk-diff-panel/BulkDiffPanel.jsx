import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import R from 'ramda'
import Paper from 'material-ui/Paper'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import CircularProgress from 'material-ui/CircularProgress';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import request from 'superagent'
import eachLimit from 'async/eachLimit';
import { Link } from 'react-router'

const jsondiffpatch = require('../node_modules/jsondiffpatch/public/build/jsondiffpatch.min.js')
const formatter = require('../node_modules/jsondiffpatch/public/build/jsondiffpatch-formatters.min.js')

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

const CONTAINER_STYLE = {
  display: 'flex',
  justifyContent: 'space-around'
}

class BulkServiceField extends Component {
  constructor(props) {
      super(props)

      this.handleTypeChange = this.handleTypeChange.bind(this)
      this.handleUrlChange = this.handleUrlChange.bind(this)
  }

  handleTypeChange(event, index, value) {
    this.props.onChange(value, this.props.url)
  }

  handleUrlChange(event) {
    this.props.onChange(this.props.reqType, event.target.value)
  }

  render () {
    return (
      <div style={CONTAINER_STYLE}>
        <SelectField
          floatingLabelText='Type'
          value={this.props.reqType}
          onChange={this.handleTypeChange}
          style={{maxWidth: '80px', textAlign: 'left'}}
        >
          <MenuItem value={'GET'} primaryText='GET'/>
          <MenuItem value={'POST'} primaryText='POST'/>
        </SelectField>
        <TextField
          hintText={this.props.hint}
          style={{alignSelf: 'flex-end', width: '500px'}}
          value={this.props.url}
          onChange={this.handleUrlChange}>
        </TextField>
      </div>
    )
  }
}

class BulkParameterList extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
    this.handleOpen = this.handleOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  handleChange(param, key, index, event) {
    let inputLines = event.target.value.trim().split('\n');
    if (inputLines.length === 1) {
      param[key] = event.target.value
      if (this.props.parameters.length === (index + 1)) {
        this.props.onChange(R.append({value: '', result_1: '', result_2: '', difference: '', open: false, id: index + 1}, R.update(index, param, this.props.parameters)))
      } else if (this.props.parameters.length === index + 2 && this.props.parameters[index+1].value === '' && param.value === '') {
        this.props.onChange(R.dropLast(1, R.update(index, param, this.props.parameters)))
      } else {
        param.result_1 = ''
        param.result_2 = ''
        param.result_3 = ''
        param.difference = ''
        this.props.onChange(R.update(index, param, this.props.parameters))
      }
    } else {
      param[key] = inputLines[0];
      inputLines.splice(0, 1)
      inputLines.push('')
      let parametersToAdd = [];
      inputLines.forEach((input, pos) => parametersToAdd.push({value: input, result_1: '', result_2: '', difference: '', open: false, id: index + pos + 1}))
      this.props.onChange(R.concat(R.update(index, param, this.props.parameters), parametersToAdd))
    }
  }

  handleOpen(index, e) {
    this.props.onChange(R.update(index, R.merge(this.props.parameters[index], {open: true}), this.props.parameters));
  }

  handleClose() {
    this.props.parameters.forEach((param, index) => {
      if (param.open) {
        this.props.onChange(R.update(index, R.merge(this.props.parameters[index], {open: false}), this.props.parameters));
        return;
      }
    })
  }

  render() {
    const actions = [
      <FlatButton
        label="Close"
        primary={true}
        onTouchTap={this.handleClose}
      />
    ];
    return (
      <div>
        <h4>Endpoints</h4>
        {this.props.parameters.map((param, index) => {
          return (
            <div style={CONTAINER_STYLE} key={param.id.toString()}>
              <TextField
                hintText={'Value'}
                style={{width: '420px'}}
                id={'value' + param.id}
                multiLine={true}
                rowsMax={1}
                value={param.value}
                onChange={this.handleChange.bind(this, param, 'value', index)}>
              </TextField>
              {param.difference
                ? <RaisedButton style={{maxHeight: '35px', minWidth: '60px'}} backgroundColor="#E53935" labelColor="white" label="X" onTouchTap={this.handleOpen.bind(this, index)}/>
                : param.result_1
                  ? <h3>✔</h3>
                  : <h3>?</h3>
              }
              <Dialog
                title="Differences"
                actions={actions}
                modal={false}
                open={param.open}
                onRequestClose={this.handleClose}
              >
                <div style={{textAlign: 'left', overflowY: 'auto', maxHeight: 'inherit'}} dangerouslySetInnerHTML={{ __html: param.difference }}></div>
              </Dialog>
            </div>
          )
        })}
      </div>
    )
  }
}

class BulkDiffForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      endpointType_1: 'GET',
      endpointURL_1: '',
      endpointType_2: 'GET',
      endpointURL_2: '',
      parameters: [{value: '', result_1: '', result_2: '', difference: '', open: false, id: 0}],
      pending_submission: false
    }

    this.handleEndpointChange_1 = this.handleEndpointChange_1.bind(this)
    this.handleEndpointChange_2 = this.handleEndpointChange_2.bind(this)
    this.handleParameterChange = this.handleParameterChange.bind(this)
    this.handleSubmission = this.handleSubmission.bind(this)
  }

  handleEndpointChange_1(type, url) {
    this.setState({
      endpointType_1: type,
      endpointURL_1: url
    })
  }

  handleEndpointChange_2(type, url) {
    this.setState({
      endpointType_2: type,
      endpointURL_2: url
    })
  }

  handleParameterChange(parameters) {
    this.setState({
      parameters: parameters
    })
  }

  handleSubmission(e) {
    e.preventDefault()
    this.setState({
      pending_submission: true
    })
    let updatedValues = this.state.parameters.map(param => {
      let copy = param;
      return copy
    })

    var _this = this;
    eachLimit(updatedValues, 10, function iter(item, callback) {
      if (!item.value) {
        return callback()
      }

      let url_1 = _this.state.endpointURL_1
      let params_1 = ''
      if (_this.state.endpointType_1 === 'GET') {
        url_1 += item.value
        _this.parseSecondUrl({_this, url_1, params_1, item, callback});
      } else {
        let params_1 = {};
        let queryParams = item.value.split('?')
        if (queryParams.length > 1) {
          url_1 += queryParams[0]
          queryParams[1].split('&').forEach(x => {
            let queryObj = x.split('=')
            params_1[queryObj[0]] = queryObj[1]
          });
        }
        console.log(url_1, params_1)
        _this.parseSecondUrl({_this, url_1, params_1, item, callback});
      }
    }, function finished(err) {
      if (err) {
        console.log(err);
      }

      _this.setState({
        pending_submission: false,
        parameters: updatedValues.sort((a, b) => b.difference.length - a.difference.length)
      })
    })
  }

  parseSecondUrl( {_this, url_1, params_1, item, callback} ) {
    let url_2 = _this.state.endpointURL_2
    let params_2 = ''
    if (_this.state.endpointType_2 === 'GET') {
      url_2 += item.value;
      _this.requestFromEndpoints({_this, url_1, params_1, item, url_2, params_2, callback});
    } else {
      let params_2 = {};
      let queryParams = item.value.split('?')
      if (queryParams.length > 1) {
        url_2 += queryParams[0]
        queryParams[1].split('&').forEach(x => {
          let queryObj = x.split('=')
          params_2[queryObj[0]] = queryObj[1]
        });
      }
      console.log(url_2, params_2)
      _this.requestFromEndpoints({_this, url_1, params_1, item, url_2, params_2, callback});
    }
  }

  requestFromEndpoints( {_this, url_1, params_1, item, url_2, params_2, callback} ) {
    request(_this.state.endpointType_1, url_1)
      .send(params_1)
      .set('Accept', 'application/json')
      .type('form')
      .end((err1, res) => {
        if (err1) {
          console.error(err1);
          item.result_1 = err1;
        } else {
          item.result_1 = res.text
        }
        request(_this.state.endpointType_2, url_2)
          .send(params_2)
          .set('Accept', 'application/json')
          .type('form')
          .end((err2, res2) => {
            if (err2) {
              console.error(err2)
              item.result_2 = err2
            } else {
              item.result_2 = res2.text
            }
            if (err1 || err2) {
              item.difference =  err1 || err2
            } else {
              console.log(res.text)
              console.log(res2.text)
              item.difference =  formatter.html.format(jsondiffpatch.diff(JSON.parse(res.text), JSON.parse(res2.text)), JSON.parse(res.text))
            }
            callback()
          })
      })
  }

  render () {
    return (
      <form
        style={{textAlign: 'center'}}
        onSubmit={this.handleSubmission}
      >
        <h1>JSON Bulk Endpoint Diff</h1>
        <p>
          This tool will compare the JSON output of two REST services. These endpoints must
          return JSON in order for this tool to return the differences in output. POST parameters
          can be added to the end of the url as query parameters (ex: endpoint?param=data&param2=moreData).
        </p>
        <Link to={`/`}>Return to Diff Panel</Link>
        <BulkServiceField
          hint={'Service 1'}
          reqType={this.state.endpointType_1}
          url={this.state.endpointURL_1}
          onChange={this.handleEndpointChange_1}
        />
        <BulkServiceField
          hint={'Service 2'}
          reqType={this.state.endpointType_2}
          url={this.state.endpointURL_2}
          onChange={this.handleEndpointChange_2}
        />
        <BulkParameterList
          parameters={this.state.parameters}
          onChange={this.handleParameterChange}
        />
      {!this.state.pending_submission ?
          <div>
            <br/>
            <RaisedButton primary={true} disabled={false} label="Submit" type="submit" />
          </div>
        : <CircularProgress />}
      </form>
    )
  }
}

export default class BulkDiffPanel extends Component {
  render() {
    return (
      <BulkDiffForm/>
    )
  }
}
