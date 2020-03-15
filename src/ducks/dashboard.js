import { sessionMetaUrl } from '../constants/api';
import { get } from '../utils/fetch';

// Action Types
export const FETCH_META_REQUEST = 'FETCH_META_REQUEST';
export const FETCH_META_SUCCESS = 'FETCH_META_SUCCESS';
export const FETCH_META_FAILURE = 'FETCH_META_FAILURE';

// Actions
export const fetchMeta = () => dispatch => {
  dispatch({ type: FETCH_META_REQUEST });
  return get(
    sessionMetaUrl(),
    { type: FETCH_META_SUCCESS, name: 'meta' },
    { type: FETCH_META_FAILURE, name: 'error' },
    dispatch
  );
};

// Reducer
export default function dashboard(
  state = {
    meta: {},
    isFetching: false,
  },
  action
) {
  switch (action.type) {
    case FETCH_META_REQUEST:
      return { ...state, isFetching: true };
    case FETCH_META_SUCCESS:
      return { ...state, meta: action.meta, isFetching: false };
    case FETCH_META_FAILURE:
      return { ...state, meta: {}, isFetching: false };
    default:
      return state;
  }
}
