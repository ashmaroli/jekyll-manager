import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'underscore';
import classnames from 'classnames';
import DocumentTitle from 'react-document-title';

import { fetchMeta } from '../../actions/dashboard';
import Gauge from '../../components/dashboard/Gauge';
import GaugeBoard from '../../components/dashboard/GaugeBoard';
import { generateTitle } from '../../utils/helpers';
import Splitter from '../../components/Splitter';

export class Dashboard extends Component {

  constructor(props) {
    super(props);

    this.state = {
      collapsed: true
    };
  }

  componentDidMount() {
    const { fetchMeta } = this.props;
    fetchMeta();
  }

  getUsername() {
    const config = this.props.config.content;

    let user = 'User';
    if (_.isString(config.author)) {
      user = config.author;
    } else if (_.isObject(config.author)) {
      user = config.author.name;
    } else if (config.name) {
      user = config.name;
    }

    return user;
  }

  totalSiteFiles() {
    const site = this.props.meta.site;
    const contentKeys = [
      'content_pages', 'data_files', 'static_files', 'collection_docs', 'drafts', 'posts'
    ];

    return _.map(
      contentKeys, key => site[key].length
    ).reduce((a, b) => a + b, 0);
  }

  renderTile(obj) {
    const keys = _.keys(obj);
    return _.map(keys, (key, i) => {
      return (
        <div className="tile-entry" key={i}>
          <div className="tile-key">{key}:</div>
          <div className="tile-value">{obj[key]}</div>
        </div>
      );
    });
  }

  toggleCard() {
    this.setState({ collapsed: !this.state.collapsed });
  }

  renderHealthCard(site) {
    const cardClasses = classnames({
      'pull-right': true,
      'health-card': true,
      'collapsed': this.state.collapsed
    });
    const health = site.health;
    return (
      <section className={`${cardClasses} ${health.report_lvl}`}>
        <header onClick={() => this.toggleCard()}>
          <i className="fa fa-stethoscope fa-lg" />
          Site Health
          <div className="chevrons">
           { this.state.collapsed && <i className="fa fa-chevron-down" /> }
           { !this.state.collapsed && <i className="fa fa-chevron-up" /> }
          </div>
        </header>
        <article>{health.report_txt}</article>
      </section>
    );
  }

  render() {
    const { isFetching, meta } = this.props;
    if (isFetching) {
      return null;
    }

    const config = this.props.config.content;
    const { jekyll, admin, site } = meta;

    const user = this.getUsername();
    const size = this.totalSiteFiles();
    const site_keys = _.keys(site);

    const pages = _.filter(site_keys, key => key.includes('_pages'));
    const files = _.filter(site_keys, key => key.includes('_files'));
    const posts = _.filter(site_keys, key => ['drafts', 'posts'].includes(key));
    const collection_docs = _.filter(site_keys, key => key == 'collection_docs');

    const gaugeList = [
      [pages, files, collection_docs],
      [posts]
    ];

    return (
      <DocumentTitle title={generateTitle('Dashboard')}>
        <div className="single">
          <div className="content-header">
            <h1>Welcome, {user}!</h1>
            {this.renderHealthCard(site)}
          </div>
          <div className="dashboard">
            <div className="main">
              <GaugeBoard
                dataSet={site}
                baseValue={size}
                layoutArray={gaugeList}
                config={config} />
            </div>
            <Splitter />
            <div className="tiles">
              <div className="first tile">
                <div className="label">Jekyll</div>
                {this.renderTile(jekyll)}
              </div>
              <div className="last tile">
                <div className="label">Manager</div>
                {this.renderTile(admin)}
              </div>
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

Dashboard.propTypes = {
  fetchMeta: PropTypes.func.isRequired,
  meta: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  meta: state.dashboard.meta,
  config: state.config.config,
  isFetching: state.dashboard.isFetching
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchMeta
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
