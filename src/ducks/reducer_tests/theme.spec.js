import * as themeDuck from '../theme';
import { template, theme } from './fixtures';

const reducer = themeDuck.default;

describe('Reducers::Theme', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      theme: {},
      template: {},
      isFetching: false,
      updated: false,
    });
  });

  it('should handle fetchTheme', () => {
    expect(
      reducer(
        {},
        {
          type: themeDuck.FETCH_THEME_REQUEST,
        }
      )
    ).toEqual({
      isFetching: true,
    });
    expect(
      reducer(
        { theme },
        {
          type: themeDuck.FETCH_THEME_SUCCESS,
          theme,
        }
      )
    ).toEqual({
      theme,
      isFetching: false,
    });
    expect(
      reducer(
        {},
        {
          type: themeDuck.FETCH_THEME_FAILURE,
        }
      )
    ).toEqual({
      isFetching: false,
    });
  });

  it('should handle fetchThemeItem(id)', () => {
    expect(
      reducer(
        {},
        {
          type: themeDuck.FETCH_THEME_ITEM_REQUEST,
        }
      )
    ).toEqual({
      isFetching: true,
    });
    expect(
      reducer(
        {},
        {
          type: themeDuck.FETCH_THEME_ITEM_SUCCESS,
          template,
        }
      )
    ).toEqual({
      template,
      isFetching: false,
    });
    expect(
      reducer(
        {},
        {
          type: themeDuck.FETCH_THEME_ITEM_FAILURE,
        }
      )
    ).toEqual({
      template: {},
      isFetching: false,
    });
  });

  it('should handle putThemeItem', () => {
    expect(
      reducer(
        {},
        {
          type: themeDuck.PUT_THEME_ITEM_SUCCESS,
          template,
        }
      )
    ).toEqual({
      template,
      updated: true,
    });
    expect(reducer({ updated: true }, {})).toEqual({
      updated: false,
    });
  });
});
