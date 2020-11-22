import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import _ from 'underscore';
import { mount } from 'enzyme';
import { Sidebar } from '../Sidebar';

import { config, site, blank_site } from './fixtures';

const defaultProps = {
  config,
  site
};

const nonCollectionLinks = ['content_pages', 'data_files', 'static_files', 'configuration', 'drafts', 'posts'];

function setup(props) {
  const component = mount(<Sidebar {...props} />);

  return {
    component,
    links: component.find('.routes').find('li')
  };
}

describe('Containers::Sidebar', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Sidebar {...defaultProps} />, div);
  });

  it('should render correctly', () => {
    const { links, component } = setup(defaultProps);
    const { config } = component.props();

    const keys = _.filter(_.keys(site), key => nonCollectionLinks.includes(key));
    const collections = site.collections.length > 1 ? site.collections.length : 0;
    const theme = config.theme ? 1 : 0;

    const actual = links.length;
    const expected = keys.length + collections + site.templates.length + theme + 1; // the link to /configuration

    expect(actual).toEqual(expected);

    const tree = renderer
      .create(<Sidebar {...defaultProps} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render collapsible list-item for collections', () => {
    const { component, links } = setup(defaultProps);
    const listItem = links.find('.accordion-label');
    expect(listItem.text()).toContain('Collections');
    expect(component.state('collapsedPanel')).toBe(true);

    listItem.find('a').first().simulate('click');
    expect(component.state('collapsedPanel')).toBe(false);
    listItem.find('a').first().simulate('click');
    expect(component.state('collapsedPanel')).toBe(true);
  });

  it('should render fine for a "blank" Jekyll site', () => {
    const minimal_config = { gems: ['jekyll-admin'] };
    const { links } = setup({
      site: blank_site,
      config: minimal_config
    });
    expect(links.length).toEqual(1); // the link to /Configuration
  });
});
