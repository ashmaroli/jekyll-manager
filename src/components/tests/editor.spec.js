import React from 'react';
import { shallow } from 'enzyme';
import _ from 'underscore';
import Editor from '../Editor';
import { json } from './fixtures';

const content = JSON.stringify(json);

const defaultProps = {
  content,
  editorChanged: false,
  type: 'yaml'
};

function setup(props = defaultProps) {
  const actions = {
    onEditorChange: jest.fn(),
    getValue: jest.fn()
  };

  let component = shallow(
    <Editor {...props} {...actions} />
  );

  return {
    component,
    editor: component.find('.editor'),
    actions
  };
}

describe('Components::Editor', () => {
  it('should render correctly', () => {
    const { editor } = setup();
    expect(editor.prop('value')).toEqual(content);
  });

  it('should render the Editor modes correctly', () => {
    const types = {
      'js': 'javascript',
      'yml': 'yaml',
      'csv': 'plain_text'
    };
    _.each(_.keys(types), type => {
      const { editor } = setup(Object.assign({}, defaultProps, {
        type
      }));
      expect(editor.prop('mode')).toEqual(types[type]);
    });
  });

  it('should call onEditorChange if editor is not changed', () => {
    const { actions, editor } = setup();
    editor.simulate('change');
    expect(actions.onEditorChange).toHaveBeenCalled();
  });
});
