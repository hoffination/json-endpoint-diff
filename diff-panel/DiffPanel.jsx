import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import R from 'ramda'
import Paper from 'material-ui/Paper'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Divider from 'material-ui/Divider'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import request from 'superagent'

const jsondiffpatch = require('../node_modules/jsondiffpatch/public/build/jsondiffpatch.min.js')
const formatter = require('../node_modules/jsondiffpatch/public/build/jsondiffpatch-formatters.min.js')

import injectTapEventPlugin from 'react-tap-event-plugin'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

const CONTAINER_STYLE = {
  display: 'flex',
  justifyContent: 'space-around'
}

class EndpointField extends Component {
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

class ParameterList extends Component {
  constructor(props) {
    super(props)

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(param, key, index, event) {
    param[key] = event.target.value
    if (this.props.parameters.length === (index + 1)) {
      this.props.onChange(R.append({name: '', value: '', id: index + 1}, R.update(index, param, this.props.parameters)))
    } else if (this.props.parameters.length === index + 2 && this.props.parameters[index+1].name === '' && this.props.parameters[index+1].value === '' && param.name === '' && param.value === '') {
      this.props.onChange(R.dropLast(1, R.update(index, param, this.props.parameters)))
    } else {
      this.props.onChange(R.update(index, param, this.props.parameters))
    }
  }

  render() {
    return (
      <div>
        <h4>Endpoint Parameters</h4>
        {this.props.parameters.map((param, index) => {
          return (
            <div style={CONTAINER_STYLE} key={param.id.toString()}>
              <TextField
                hintText={'Name'}
                style={{maxWidth: '160px'}}
                id={'name_' + param.id}
                value={param.name}
                onChange={this.handleChange.bind(this, param, 'name', index)}
              >
              </TextField>
              <TextField
                hintText={'Value'}
                style={{width: '420px'}}
                id={'value' + param.id}
                value={param.value}
                onChange={this.handleChange.bind(this, param, 'value', index)}
              >
              </TextField>
            </div>
          )
        })}
      </div>
    )
  }
}

class DiffForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      endpointType_1: 'GET',
      endpointURL_1: '',
      endpointType_2: 'GET',
      endpointURL_2: '',
      parameters: [{name: '', value: '', id: 0}],
      result_1: '',
      result_2: '',
      difference: ''
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
    let params = R.reduce(
      R.merge,
      {},
      R.dropLast(1, this.state.parameters).map(param => {
        return R.objOf(param.name, param.value)
      })
    )

    // Construct queryParams if the endpoints are GET requests
    let url_1 = this.state.endpointURL_1
    if (this.state.endpointType_1 === 'GET' && Object.keys(params).length > 0) {
      url_1 += '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&')
    }

    let url_2 = this.state.endpointURL_2
    if (this.state.endpointType_2 === 'GET' && Object.keys(params).length > 0) {
      url_2 += '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&')
    }

    request(this.state.endpointType_1, url_1)
      .send(params)
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (err) {
          alert(err)
          return
        }
        request(this.state.endpointType_2, url_2)
          .send(params)
          .set('Accept', 'application/json')
          .end((err, res2) => {
            if (err) {
              alert(err)
              return
            }
            this.setState({
              result_1: res.text,
              result_2: res2.text,
              difference: formatter.html.format(jsondiffpatch.diff(JSON.parse(res.text), JSON.parse(res2.text)), JSON.parse(res.text))
            })
          })
      })
  }

  render () {
    return (
      <form
        style={{textAlign: 'center'}}
        onSubmit={this.handleSubmission}
      >
        <h1>JSON Endpoint Diff</h1>
        <p>This tool will compare the JSON output of two REST endpoints. These endpoints must
          return JSON in order for this tool to return the differences in output.
        </p>
        <EndpointField
          hint={'Endpoint 1'}
          reqType={this.state.endpointType_1}
          url={this.state.endpointURL_1}
          onChange={this.handleEndpointChange_1}
        />
        <EndpointField
          hint={'Endpoint 2'}
          reqType={this.state.endpointType_2}
          url={this.state.endpointURL_2}
          onChange={this.handleEndpointChange_2}
        />
        <ParameterList
          parameters={this.state.parameters}
          onChange={this.handleParameterChange}
        />
        <br/>
        <RaisedButton primary={true} disabled={false} label="Submit" type="submit" />
        <p style={{overflowY: 'auto', maxHeight: '80px'}}>
          {this.state.result_1}
        </p>
        <Divider />
        <p style={{overflowY: 'auto', maxHeight: '80px'}}>
          {this.state.result_2}
        </p>
        <Divider />
        <div style={{textAlign: 'left'}} dangerouslySetInnerHTML={{ __html: this.state.difference }}></div>
      </form>
    )
  }
}

class DiffPanel extends Component {
  render() {
    injectTapEventPlugin()
    return (
      <DiffForm/>
    )
  }
}

const STYLE = {
  padding: '10px',
  maxWidth: '700px',
  marginLeft: 'auto',
  marginRight: 'auto'
}

ReactDOM.render(
 <MuiThemeProvider>
   <Paper style={STYLE}>
     <DiffPanel />
   </Paper>
 </MuiThemeProvider>,
 document.getElementById('container')
)
