import _ from 'underscore';
import { CLEAR_ERRORS, validationError } from './utils';
import { get, put, del } from '../utils/fetch';
import { validator } from '../utils/validation';
import { slugify, trimObject } from '../utils/helpers';
import {
  getFilenameNotValidMessage,
  getContentRequiredMessage,
} from '../constants/lang';
import { templatesAPIUrl, templateAPIUrl } from '../constants/api';

// Action Types
export const FETCH_TEMPLATES_REQUEST = 'FETCH_TEMPLATES_REQUEST';
export const FETCH_TEMPLATES_SUCCESS = 'FETCH_TEMPLATES_SUCCESS';
export const FETCH_TEMPLATES_FAILURE = 'FETCH_TEMPLATES_FAILURE';
export const FETCH_TEMPLATE_REQUEST = 'FETCH_TEMPLATE_REQUEST';
export const FETCH_TEMPLATE_SUCCESS = 'FETCH_TEMPLATE_SUCCESS';
export const FETCH_TEMPLATE_FAILURE = 'FETCH_TEMPLATE_FAILURE';
export const PUT_TEMPLATE_REQUEST = 'PUT_TEMPLATE_REQUEST';
export const PUT_TEMPLATE_SUCCESS = 'PUT_TEMPLATE_SUCCESS';
export const PUT_TEMPLATE_FAILURE = 'PUT_TEMPLATE_FAILURE';
export const DELETE_TEMPLATE_REQUEST = 'DELETE_TEMPLATE_REQUEST';
export const DELETE_TEMPLATE_SUCCESS = 'DELETE_TEMPLATE_SUCCESS';
export const DELETE_TEMPLATE_FAILURE = 'DELETE_TEMPLATE_FAILURE';

// Actions
export const fetchTemplates = (directory = '') => dispatch => {
  dispatch({ type: FETCH_TEMPLATES_REQUEST });
  return get(
    templatesAPIUrl(directory),
    { type: FETCH_TEMPLATES_SUCCESS, name: 'templates' },
    { type: FETCH_TEMPLATES_FAILURE, name: 'error' },
    dispatch
  );
};

export const fetchTemplate = (directory, filename) => dispatch => {
  dispatch({ type: FETCH_TEMPLATE_REQUEST });
  return get(
    templateAPIUrl(directory, filename),
    { type: FETCH_TEMPLATE_SUCCESS, name: 'template' },
    { type: FETCH_TEMPLATE_FAILURE, name: 'error' },
    dispatch
  );
};

export const putTemplate = (
  mode,
  directory,
  filename = '',
  include_front_matter = true
) => (dispatch, getState) => {
  // get edited fields from metadata state
  const metadata = getState().metadata.metadata;

  let { path, raw_content } = metadata;
  if (!path || !raw_content) {
    return dispatch(validationError(validateTemplate(metadata)));
  }

  // clear errors
  dispatch({ type: CLEAR_ERRORS });

  // omit raw_content, path and empty-value keys in metadata state from front_matter
  const front_matter = _.omit(metadata, (value, key, object) => {
    return key == 'raw_content' || key == 'path' || value === '';
  });

  let payload;
  if (mode == 'create') {
    filename = path;
    if (include_front_matter == false) {
      payload = { raw_content };
    } else {
      payload = { front_matter, raw_content };
    }
  } else {
    if (include_front_matter == false) {
      payload = { path: path, raw_content };
    } else {
      payload = { path: path, front_matter, raw_content };
    }
  }

  //send the put request
  return put(
    templateAPIUrl(directory, filename),
    preparePayload(payload),
    { type: PUT_TEMPLATE_SUCCESS, name: 'template' },
    { type: PUT_TEMPLATE_FAILURE, name: 'error' },
    dispatch
  );
};

export const deleteTemplate = (directory, filename) => dispatch => {
  return fetch(templateAPIUrl(directory, filename), {
    method: 'DELETE',
  })
    .then(data => {
      dispatch({ type: DELETE_TEMPLATE_SUCCESS });
      dispatch(fetchTemplates(directory));
    })
    .catch(error =>
      dispatch({
        type: DELETE_TEMPLATE_FAILURE,
        error,
      })
    );
};

const validateTemplate = metadata => {
  return validator(
    metadata,
    { path: 'filename', raw_content: 'required' },
    {
      'path.filename': getFilenameNotValidMessage(),
      'raw_content.required': getContentRequiredMessage(),
    }
  );
};

const preparePayload = obj => JSON.stringify(trimObject(obj));

// Reducer
export default function templates(
  state = {
    templates: [],
    template: {},
    isFetching: false,
    updated: false,
  },
  action
) {
  switch (action.type) {
    case FETCH_TEMPLATES_REQUEST:
    case FETCH_TEMPLATE_REQUEST:
      return { ...state, isFetching: true };
    case FETCH_TEMPLATES_SUCCESS:
      return {
        ...state,
        templates: action.templates,
        isFetching: false,
        template: {},
      };
    case FETCH_TEMPLATES_FAILURE:
      return { ...state, isFetching: false, templates: [] };
    case FETCH_TEMPLATE_SUCCESS:
      return { ...state, template: action.template, isFetching: false };
    case FETCH_TEMPLATE_FAILURE:
      return { ...state, template: {}, isFetching: false };
    case PUT_TEMPLATE_SUCCESS:
      return { ...state, template: action.template, updated: true };
    default:
      return { ...state, updated: false };
  }
}
