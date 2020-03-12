import { themeAPIUrl, themeItemAPIUrl } from '../constants/api';
import { get, put } from '../utils/fetch';

// Action Types
export const FETCH_THEME_REQUEST = 'FETCH_THEME_REQUEST';
export const FETCH_THEME_SUCCESS = 'FETCH_THEME_SUCCESS';
export const FETCH_THEME_FAILURE = 'FETCH_THEME_FAILURE';
export const FETCH_THEME_ITEM_REQUEST = 'FETCH_THEME_ITEM_REQUEST';
export const FETCH_THEME_ITEM_SUCCESS = 'FETCH_THEME_ITEM_SUCCESS';
export const FETCH_THEME_ITEM_FAILURE = 'FETCH_THEME_ITEM_FAILURE';
export const PUT_THEME_ITEM_REQUEST = 'PUT_THEME_ITEM_REQUEST';
export const PUT_THEME_ITEM_SUCCESS = 'PUT_THEME_ITEM_SUCCESS';
export const PUT_THEME_ITEM_FAILURE = 'PUT_THEME_ITEM_FAILURE';

// Actions
export const fetchTheme = (directory = '') => dispatch => {
  dispatch({ type: FETCH_THEME_REQUEST });
  return get(
    themeAPIUrl(directory),
    { type: FETCH_THEME_SUCCESS, name: 'theme' },
    { type: FETCH_THEME_FAILURE, name: 'error' },
    dispatch
  );
};

export const fetchThemeItem = (directory, filename) => dispatch => {
  dispatch({ type: FETCH_THEME_ITEM_REQUEST });
  return get(
    themeItemAPIUrl(directory, filename),
    { type: FETCH_THEME_ITEM_SUCCESS, name: 'template' },
    { type: FETCH_THEME_ITEM_FAILURE, name: 'error' },
    dispatch
  );
};

export const putThemeItem = (directory, filename, data) => (
  dispatch,
  getState
) => {
  return put(
    themeItemAPIUrl(directory, filename),
    JSON.stringify({ raw_content: data }),
    { type: PUT_THEME_ITEM_SUCCESS, name: 'template' },
    { type: PUT_THEME_ITEM_FAILURE, name: 'error' },
    dispatch
  );
};

// Reducer
export default function theme(
  state = {
    theme: {},
    template: {},
    isFetching: false,
    updated: false,
  },
  action
) {
  switch (action.type) {
    case FETCH_THEME_REQUEST:
      return { ...state, isFetching: true };
    case FETCH_THEME_SUCCESS:
      return { ...state, theme: action.theme, isFetching: false };
    case FETCH_THEME_FAILURE:
      return { ...state, isFetching: false };
    case FETCH_THEME_ITEM_REQUEST:
      return { ...state, isFetching: true };
    case FETCH_THEME_ITEM_SUCCESS:
      return { ...state, template: action.template, isFetching: false };
    case FETCH_THEME_ITEM_FAILURE:
      return { ...state, template: {}, isFetching: false };
    case PUT_THEME_ITEM_SUCCESS:
      return { ...state, template: action.template, updated: true };
    default:
      return { ...state, updated: false };
  }
}
