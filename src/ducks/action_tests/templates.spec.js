import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as templatesDuck from '../templates';
import * as utilsDuck from '../utils';
import { API } from '../../constants/api';
import nock from 'nock';

import { template } from './fixtures';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Actions::Templates', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('fetches templates succesfully', () => {
    nock(API)
      .get('/templates/')
      .reply(200, [template]);

    const expectedActions = [
      { type: templatesDuck.FETCH_TEMPLATES_REQUEST },
      { type: templatesDuck.FETCH_TEMPLATES_SUCCESS, templates: [template] },
    ];

    const store = mockStore({ templates: [], isFetching: false });

    return store.dispatch(templatesDuck.fetchTemplates()).then(() => {
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('fetches templates from subdirectories successfully', () => {
    nock(API)
      .get('/templates/template-dir')
      .reply(200, [template]);

    const expectedActions = [
      { type: templatesDuck.FETCH_TEMPLATES_REQUEST },
      { type: templatesDuck.FETCH_TEMPLATES_SUCCESS, templates: [template] },
    ];

    const store = mockStore({ templates: [], isFetching: false });

    return store
      .dispatch(templatesDuck.fetchTemplates('template-dir'))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('fetches the template successfully', () => {
    nock(API)
      .get('/templates/template.html')
      .reply(200, template);

    const expectedActions = [
      { type: templatesDuck.FETCH_TEMPLATE_REQUEST },
      { type: templatesDuck.FETCH_TEMPLATE_SUCCESS, template },
    ];

    const store = mockStore({ template: {}, isFetching: true });

    return store
      .dispatch(templatesDuck.fetchTemplate(null, 'template.html'))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('deletes the template successfully', () => {
    nock(API)
      .delete('/templates/template-dir/template.html')
      .reply(200);

    const expectedActions = [
      { type: templatesDuck.DELETE_TEMPLATE_SUCCESS },
      { type: templatesDuck.FETCH_TEMPLATES_REQUEST },
    ];

    const store = mockStore({});

    return store
      .dispatch(templatesDuck.deleteTemplate('template-dir', 'template.html'))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates DELETE_TEMPLATE_FAILURE when deleting a template failed', () => {
    nock(API)
      .delete('/templates/template.html')
      .replyWithError('something awful happened');

    const expectedAction = {
      type: templatesDuck.DELETE_TEMPLATE_FAILURE,
      error: 'something awful happened',
    };

    const store = mockStore({ templates: [template] });

    return store
      .dispatch(templatesDuck.deleteTemplate('template.html'))
      .then(() => {
        expect(store.getActions()[0].type).toEqual(expectedAction.type);
      });
  });

  it('updates the template successfully', () => {
    nock(API)
      .put('/templates/template-dir/template.html')
      .reply(200, template);

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      { type: templatesDuck.PUT_TEMPLATE_SUCCESS, template },
    ];

    const store = mockStore({ metadata: { metadata: template } });

    return store
      .dispatch(
        templatesDuck.putTemplate('edit', 'template-dir', 'template.html')
      )
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('updates the template without front matter successfully', () => {
    nock(API)
      .put('/templates/template-dir/template.html')
      .reply(200, template);

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      { type: templatesDuck.PUT_TEMPLATE_SUCCESS, template },
    ];

    const store = mockStore({ metadata: { metadata: template } });

    return store
      .dispatch(
        templatesDuck.putTemplate(
          'edit',
          'template-dir',
          'template.html',
          false
        )
      )
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates the template successfully', () => {
    nock(API)
      .put('/templates/template-dir/new_template.html')
      .reply(200, template);

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      { type: templatesDuck.PUT_TEMPLATE_SUCCESS, template },
    ];

    const store = mockStore({
      metadata: {
        metadata: { path: 'new_template.html', raw_content: 'foo\n' },
      },
    });

    return store
      .dispatch(templatesDuck.putTemplate('create', 'template-dir'))
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates the template without front matter successfully', () => {
    nock(API)
      .put('/templates/template-dir/new_template.html')
      .reply(200, template);

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      { type: templatesDuck.PUT_TEMPLATE_SUCCESS, template },
    ];

    const store = mockStore({
      metadata: {
        metadata: { path: 'new_template.html', raw_content: 'foo\n' },
      },
    });

    return store
      .dispatch(
        templatesDuck.putTemplate('create', 'template-dir', null, false)
      )
      .then(() => {
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates PUT_TEMPLATE_FAILURE when updating template failed', () => {
    nock(API)
      .put(`/templates/assets/${template.name}`)
      .replyWithError('something awful happened');

    const expectedActions = [
      { type: utilsDuck.CLEAR_ERRORS },
      {
        type: templatesDuck.PUT_TEMPLATE_FAILURE,
        error: 'something awful happened',
      },
    ];

    const store = mockStore({ metadata: { metadata: template } });

    return store
      .dispatch(templatesDuck.putTemplate('edit', 'assets', template.name))
      .then(() => {
        expect(store.getActions()[1].type).toEqual(expectedActions[1].type);
      });
  });

  it('creates VALIDATION_ERROR if required field is not provided.', () => {
    const expectedActions = [
      {
        type: utilsDuck.VALIDATION_ERROR,
        errors: ['The filename is not valid.', 'The content is required.'],
      },
    ];

    const store = mockStore({
      metadata: { metadata: { path: '', title: '' } },
    });

    store.dispatch(templatesDuck.putTemplate(template.name));
    expect(store.getActions()).toEqual(expectedActions);
  });
});
