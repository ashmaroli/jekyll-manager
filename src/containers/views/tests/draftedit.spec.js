import React from 'react';
import { shallow } from 'enzyme';

import Errors from '../../../components/Errors';
import Button from '../../../components/Button';
import { DraftEdit } from '../DraftEdit';
import { draft } from './fixtures';

const defaultProps = {
  draft,
  errors: [],
  fieldChanged: false,
  updated: false,
  isFetching: false,
  router: {},
  route: {},
  params: { collection_name: "posts", splat: [null, "inception", "md"] }
};

const setup = (props = defaultProps) => {
  const actions = {
    fetchDraft: jest.fn(),
    deleteDraft: jest.fn(),
    putDraft: jest.fn(),
    putDocument: jest.fn(),
    updateTitle: jest.fn(),
    updateBody: jest.fn(),
    updatePath: jest.fn(),
    clearErrors: jest.fn()
  };

  const component = shallow(<DraftEdit {...actions} {...props} />);

  return {
    component,
    actions,
    h1: component.find('h1').last(),
    table: component.find('.content-table'),
    saveButton: component.find(Button).first(),
    publishButton: component.find(Button).at(2),
    deleteButton: component.find(Button).last(),
    errors: component.find(Errors),
    props
  };
};

describe('Containers::DraftEdit', () => {
  it('should render correctly', () => {
    let { component } = setup(Object.assign(
      {}, defaultProps, { isFetching: true }
    ));
    component = setup(Object.assign(
      {}, defaultProps, { draft: {} }
    )).component;
    expect(component.find('h1').node).toBeTruthy();
  });

  it('should not render error messages initially', () => {
    const { errors } = setup();
    expect(errors.node).toBeFalsy();
  });

  it('should render error messages', () => {
    const { errors } = setup(Object.assign({}, defaultProps, {
      errors: ['The title field is required!']
    }));
    expect(errors.node).toBeTruthy();
  });

  it('should not call putDraft if a field is not changed.', () => {
    const { saveButton, actions } = setup();
    saveButton.simulate('click');
    expect(actions.putDraft).not.toHaveBeenCalled();
  });

  it('should call putDraft if a field is changed.', () => {
    const { saveButton, actions } = setup(Object.assign({}, defaultProps, {
      fieldChanged: true
    }));
    saveButton.simulate('click');
    expect(actions.putDraft).toHaveBeenCalled();
  });

  it('should call deleteDraft', () => {
    const { deleteButton, actions } = setup();
    deleteButton.simulate('click');
    expect(actions.deleteDraft).not.toHaveBeenCalled(); // TODO pass prompt
  });

  it('should call putDocument', () => {
    const { publishButton, actions } = setup();
    publishButton.simulate('click');
    expect(actions.putDocument).not.toHaveBeenCalled(); // TODO pass prompt
  });
});
