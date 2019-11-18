import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { HotKeys } from 'react-hotkeys';
import DocumentTitle from 'react-document-title';

import { fetchConfig } from '../actions/config';
import { fetchMeta } from '../actions/dashboard';
import keyboardShortcuts from '../constants/keyboardShortcuts';

// Components
import Sidebar from './Sidebar';
import Header from './Header';
import Notifications from './Notifications';

class App extends Component {

  componentDidMount() {
    const { fetchConfig, fetchMeta } = this.props;
    fetchConfig();
    fetchMeta();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.updated !== nextProps.updated) {
      const { fetchConfig } = this.props;
      fetchConfig();
    }
  }

  render() {
    const { isFetching } = this.props;

    if (isFetching) {
      return null;
    }

    const config = this.props.config.content;
    const { admin, site } = this.props.meta;

    return (
      <DocumentTitle title="Jekyll Manager">
        <HotKeys keyMap={keyboardShortcuts} className="wrapper">
          {
            config &&
            <div>
              {site && <Sidebar config={config} site={site} />}
              <div className="container">
                {admin && <Header config={config} admin={admin} />}
                <div className="content">
                  {this.props.children}
                </div>
              </div>
              <Notifications />
            </div>
          }
        </HotKeys>
      </DocumentTitle>
    );
  }
}

App.propTypes = {
  children: PropTypes.element,
  fetchConfig: PropTypes.func.isRequired,
  fetchMeta: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  meta: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  updated: PropTypes.bool
};

const mapStateToProps = (state) => ({
  config: state.config.config,
  meta: state.dashboard.meta,
  updated: state.config.updated,
  isFetching: state.config.isFetching,
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchConfig,
  fetchMeta
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(App);
