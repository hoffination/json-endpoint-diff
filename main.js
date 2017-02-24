import React, {Component} from 'react'
import ReactDOM from 'react-dom'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Paper from 'material-ui/Paper'
import { Router, Route, IndexRoute, hashHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
injectTapEventPlugin()

import DiffPanel from './diff-panel/DiffPanel.jsx'
import BulkDiffPanel from './bulk-diff-panel/BulkDiffPanel.jsx'
require("!style!css!./node_modules/jsondiffpatch/public/formatters-styles/html.css")

// const NoMatch = React.createClass({/*...*/})

const STYLE = {
  padding: '10px',
  maxWidth: '700px',
  marginLeft: 'auto',
  marginRight: 'auto'
}

const App = React.createClass({
  render() {
    return (
      <MuiThemeProvider>
        <Paper style={STYLE}>
          {this.props.children}
        </Paper>
      </MuiThemeProvider>
    )
  }
})

//  <Route path="*" component={NoMatch}/>

ReactDOM.render(
 <Router history={hashHistory}>
   <Route path="/" component={App}>
     <IndexRoute component={DiffPanel} />
     <Route path="bulk" component={BulkDiffPanel}/>
   </Route>
 </Router>,
 document.getElementById('container')
)

// service worker logic
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/jsondiff/sw.js').then(function(registration) {
    console.debug('ServiceWorker registration successful with scope: ', registration.scope);
  }).catch(function(err) {
    console.debug('ServiceWorker registration failed: ', err);
  })
}
