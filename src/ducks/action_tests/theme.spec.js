import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as themeDuck from '../theme';
import { API } from '../../constants/api';
import nock from 'nock';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

import { theme, template } from './fixtures';

describe('Actions::Theme', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('fetches a theme-gem successfully', () => {
    nock(API)
      .get('/theme')
      .reply(200, theme);

    const expectedActions = [
      { type: themeDuck.FETCH_THEME_REQUEST },
      { type: themeDuck.FETCH_THEME_SUCCESS, theme },
    ];

    const store = mockStore({ theme: {} });

    return store.dispatch(themeDuck.fetchTheme()).then(() => {
      // return of async themeDuck
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('fetches templates from directories successfully', () => {
    nock(API)
      .get('/theme/assets/')
      .reply(200, template);

    const expectedActions = [
      { type: themeDuck.FETCH_THEME_REQUEST },
      { type: themeDuck.FETCH_THEME_SUCCESS, theme: template },
    ];

    const store = mockStore({ theme: {} });

    return store.dispatch(themeDuck.fetchTheme('assets/')).then(() => {
      // return of async themeDuck
      expect(store.getActions()).toEqual(expectedActions);
    });
  });

  it('creates FETCH_THEME_FAILURE when fetching theme failed', () => {
    nock(API)
      .get('/data')
      .replyWithError('Something gone wrong');

    const expectedActions = [
      { type: themeDuck.FETCH_THEME_REQUEST },
      { type: themeDuck.FETCH_THEME_FAILURE },
    ];

    const store = mockStore({ theme: {} });

    return store.dispatch(themeDuck.fetchTheme()).then(() => {
      // return of async themeDuck
      expect(store.getActions()[1].type).toEqual(expectedActions[1].type);
    });
  });

  it('fetches a template successfully', () => {
    nock(API)
      .get('/theme/_layouts/default.html')
      .reply(200, template);

    const expectedActions = [
      { type: themeDuck.FETCH_THEME_ITEM_REQUEST },
      { type: themeDuck.FETCH_THEME_ITEM_SUCCESS, template },
    ];

    const store = mockStore({ template: {} });

    return store
      .dispatch(themeDuck.fetchThemeItem('_layouts', 'default.html'))
      .then(() => {
        // return of async themeDuck
        expect(store.getActions()).toEqual(expectedActions);
      });
  });

  it('creates FETCH_THEME_ITEM_FAILURE when fetching a template failed', () => {
    nock(API)
      .get('/theme/data_file.yml')
      .replyWithError('Something gone wrong');

    const expectedActions = [
      { type: themeDuck.FETCH_THEME_ITEM_REQUEST },
      { type: themeDuck.FETCH_THEME_ITEM_FAILURE },
    ];

    const store = mockStore({ template: {} });

    return store.dispatch(themeDuck.fetchThemeItem('test.html')).then(() => {
      // return of async themeDuck
      expect(store.getActions()[1].type).toEqual(expectedActions[1].type);
    });
  });

  it('creates PUT_THEME_ITEM_SUCCESS when copying a template successfully', () => {
    nock(API)
      .put('/theme/_layouts/page.html')
      .reply(200, template);

    const expectedActions = [{ type: themeDuck.PUT_THEME_ITEM_SUCCESS }];

    const store = mockStore({ template: {} });

    return store
      .dispatch(themeDuck.putThemeItem('_layouts', 'page.html', 'foo'))
      .then(() => {
        // return of async themeDuck
        expect(store.getActions()[0].type).toEqual(expectedActions[0].type);
      });
  });
});
