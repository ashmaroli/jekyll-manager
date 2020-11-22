import * as dashboardDuck from '../dashboard';
import { meta } from './fixtures';

const reducer = dashboardDuck.default;

describe('Reducers::Dashboard', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      isFetching: false,
      meta: {},
    });
  });

  it('should handle fetchMeta', () => {
    expect(
      reducer(
        {},
        {
          type: dashboardDuck.FETCH_META_REQUEST,
        }
      )
    ).toEqual({
      isFetching: true,
    });
    expect(
      reducer(
        { meta },
        {
          type: dashboardDuck.FETCH_META_SUCCESS,
          meta,
        }
      )
    ).toEqual({
      isFetching: false,
      meta,
    });
    expect(
      reducer(
        {},
        {
          type: dashboardDuck.FETCH_META_FAILURE,
        }
      )
    ).toEqual({
      meta: {},
      isFetching: false,
    });
  });
});
