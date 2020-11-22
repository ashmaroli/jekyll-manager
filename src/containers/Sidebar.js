import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import _ from 'underscore';
import classnames from 'classnames';

import { capitalize } from '../utils/helpers';
import { ADMIN_PREFIX } from '../constants';

export class Sidebar extends Component {

  constructor(props){
    super(props);

    this.handleClick = this.handleClick.bind(this);
    this.state = { collapsedPanel: true };
  }

  handleClick() {
    if (this.state.collapsedPanel == true) {
      this.setState({
        collapsedPanel: false
      });
    } else {
      this.setState({
        collapsedPanel: true
      });
    }
  }

  linkTo(item, label) {
    return item.type === 'collection' ?
      `${ADMIN_PREFIX}/collections/${label}` :
      `${ADMIN_PREFIX}/${label}`;
  }

  renderPanels(item) {
    return _.map(item.panels, (panel, i) => {
      return (
        <li key={i}>
          <Link activeClassName="active" to={this.linkTo(item, panel)}>
            <i className="fa fa-book" />{capitalize(panel)}
          </Link>
        </li>
      );
    });
  }

  renderAccordionRoute(item, index) {
    const panelHeight = this.state.collapsedPanel ? 47 : (item.panels.length + 1) * 49;
    const accordionClasses = classnames({
      'accordion-label': true,
      'collapsed': this.state.collapsedPanel
    });

    return (
      <li className={accordionClasses} style={{ maxHeight: panelHeight }} key={index}>
        <a onClick={this.handleClick}>
          <i className={`fa fa-${item.icon}`} />
          {capitalize(item.label)}
          <div className="counter">{item.panels.length}</div>
          <div className="chevrons">
            <i className="fa fa-chevron-up" />
          </div>
        </a>
        <ul>
          {this.renderPanels(item)}
        </ul>
      </li>
    );
  }

  renderRoute(item, index) {
    if (item.render) {
      return (
        <li key={index}>
          <Link activeClassName="active" to={this.linkTo(item, item.link || item.label)}>
            <i className={`fa fa-${item.icon}`} />
            {capitalize(item.label)}
          </Link>
        </li>
      );
    }
  }

  renderRouteSection(section) {
    return _.map(section, (item, index) => {
      if (item.panels && item.panels.length > 0) {
        return this.renderAccordionRoute(item, index);
      } else {
        return this.renderRoute(item, index);
      }
    });
  }

  renderRoutes() {
    const { config, site } = this.props;
    const collections = _.filter(site.collections, label => label !== 'posts');

    const routes = [
      [
        {
          'label': 'pages',
          'icon': 'file-text',
          'render': site.content_pages.length > 0
        }
      ],
      [
        {
          'label': 'drafts',
          'icon': 'edit',
          'render': site.drafts.length > 0
        },
        {
          'label': 'posts',
          'icon': 'book',
          'type': 'collection',
          'render': site.posts.length > 0
        }
      ],
      [
        {
          'label': 'collections',
          'icon': 'briefcase',
          'type': 'collection',
          'panels': collections,
          'render': collections.length > 0
        }
      ],
      [
        {
          'label': 'data files',
          'icon': 'database',
          'link': 'datafiles',
          'render': site.data_files.length > 0
        },
        {
          'label': 'static files',
          'icon': 'file',
          'link': 'staticfiles',
          'render': site.static_files.length > 0
        }
      ],
      [
        {
          'label': 'templates',
          'icon': 'clone',
          'render': site.templates.length > 0
        },
        {
          'label': 'theme gem',
          'icon': 'diamond',
          'link': 'theme',
          'render': config.theme ? true : false
        }
      ],
      [
        {
          'label': 'configuration',
          'icon': 'cog',
          'render': true
        }
      ]
    ];

    return _.map(routes, (section, index) => {
      const section_size = _.map(section, entry => entry.render).filter(Boolean).length;

      if (section_size > 0) {
        return (
          <div className="route-section" key={index}>
            {this.renderRouteSection(section)}
          </div>
        );
      }
    });
  }

  render() {
    return (
      <div className="sidebar">
        <Link className="logo" to={ADMIN_PREFIX} />
        <ul className="routes">
          {this.renderRoutes()}
        </ul>
      </div>
    );
  }
}

Sidebar.propTypes = {
  site: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired
};

export default Sidebar;
