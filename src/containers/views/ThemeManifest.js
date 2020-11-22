import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';

import { fetchTheme } from '../../ducks/theme';
import { generateTitle } from '../../utils/helpers';
import Collapsible from '../../components/Collapsible';
import { ADMIN_PREFIX } from '../../constants';

export class ThemeManifest extends Component {

  componentDidMount() {
    const { fetchTheme, params } = this.props;
    fetchTheme(params.splat);
  }

  componentWillReceiveProps(nextProps) {
    const { fetchTheme } = nextProps;
    if (this.props.params.splat !== nextProps.params.splat) {
      fetchTheme(nextProps.params.splat);
    }
  }

  renderDirectoryRow(directory) {
    const { name, path } = directory;
    const to = `${ADMIN_PREFIX}/theme/${path}`;
    return (
      <tr key={name}>
        <td className="row-title">
          <strong>
            <Link to={to}>
              <i className="fa fa-folder" aria-hidden="true" />
              {name}
            </Link>
          </strong>
        </td>
      </tr>
    );
  }

  render() {
    const { theme } = this.props;
    const description = theme.description ? "description" : "summary";
    const keys = ["name", "version", "license", "authors", description, "path"];
    const values = keys.map((key) => { return (theme[key]); });
    const directories = theme.directories;

    const theme_meta = (
      <div className="content-table theme-info">
        <table>
          <tbody>
            {
              _.map(keys, (key, i) => {
                return (
                  <tr key={i}>
                    <td><strong>Theme {key}:</strong></td>
                    <td>{values[i]}</td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );

    return (
      <DocumentTitle title={generateTitle(theme.name, 'Theme Manifest')}>
        <div>
          <div className="content-header">
            <h1>Theme Manifest</h1>
          </div>

          <div className="content-table theme-dirs">
            <table>
              <thead>
                <tr>
                  <th>Directories</th>
                </tr>
              </thead>
              <tbody>
                {
                  _.map(directories, entry => {
                    return this.renderDirectoryRow(entry);
                  })
                }
              </tbody>
            </table>
          </div>

          <Collapsible
            label="Theme Metadata"
            panel={theme_meta} />
        </div>
      </DocumentTitle>
    );
  }
}

ThemeManifest.propTypes = {
  theme: PropTypes.object.isRequired,
  fetchTheme: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  theme: state.theme.theme
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTheme
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(ThemeManifest);
