import React, { Component } from 'react'
import Helmet from 'react-helmet'
import { Provider as ReduxProvider } from 'react-redux'
import { timer } from 'rxjs'

import { ConnectionActions } from 'rt-actions'
import { Platform, PlatformProvider } from 'rt-components'
import { AutobahnConnectionProxy } from 'rt-system'
import { ThemeProvider } from 'rt-theme'

import { createApplicationServices } from '../../applicationServices'
import configureStore from '../../configureStore'
import { Router } from '../../shell'
import FakeUserRepository from '../../shell/fakeUserRepository'
import GlobalScrollbarStyle from '../../shell/GlobalScrollbarStyle'
import { OpenFinLimitChecker } from '../../shell/openFin'

const LOG_NAME = 'Application Service: '

const platform = new Platform()

const store = configureStore(
  createApplicationServices({
    autobahn: new AutobahnConnectionProxy(location.hostname, 'com.weareadaptive.reactivetrader', +location.port),
    limitChecker: new OpenFinLimitChecker(),
    platform,
    user: FakeUserRepository.currentUser,
  }),
)

store.dispatch(ConnectionActions.connect())

const APPLICATION_DISCONNECT = 15 * 60 * 1000

timer(APPLICATION_DISCONNECT).subscribe(() => {
  store.dispatch(ConnectionActions.disconnect())
  console.warn(LOG_NAME, `Application has reached disconnection time at ${APPLICATION_DISCONNECT}`)
})

export default class MainRoute extends Component {
  render() {
    return (
      <React.Fragment>
        <Helmet>
          <link rel="stylesheet" type="text/css" href="https://use.fontawesome.com/releases/v5.2.0/css/all.css" />
        </Helmet>
        <ThemeProvider>
          <ReduxProvider store={store}>
            <PlatformProvider value={platform}>
              <React.Fragment>
                <GlobalScrollbarStyle />
                <Router />
              </React.Fragment>
            </PlatformProvider>
          </ReduxProvider>
        </ThemeProvider>
      </React.Fragment>
    )
  }
}
