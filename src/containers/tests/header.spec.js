import React from 'react';
import ReactDOM from 'react-dom';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';
import { Header } from '../Header';
import { config } from './fixtures';

const defaultProps = {
  admin: { version: '0.1.0' },
  config: config
};

function setup(props) {
  const component = mount(
    <Header {...props} />
  );

  return {
    component: component,
    title: component.find('h3 span'),
  };
}

describe('Containers::Header', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(<Header {...defaultProps} />, div);
  });

  it('should render correctly', () => {
    const { component, title } = setup(defaultProps);
    const { config } = component.props();
    expect(title.text()).toEqual(config.title);

    const tree = renderer.create(<Header {...defaultProps} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('should render placeholder title', () => {
    const props = { ...defaultProps, config: {} };
    const { component, title } = setup(props);
    expect(title.text()).toEqual('You have no title!');

    const tree = renderer.create(<Header {...props} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
