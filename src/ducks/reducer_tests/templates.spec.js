import * as templatesDuck from '../templates';
import { template } from './fixtures';

const reducer = templatesDuck.default;

describe('Reducers::Templates', () => {
  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual({
      templates: [],
      template: {},
      isFetching: false,
      updated: false,
    });
  });

  it('should handle fetchTemplates', () => {
    expect(
      reducer(
        {},
        {
          type: templatesDuck.FETCH_TEMPLATES_REQUEST,
        }
      )
    ).toEqual({
      isFetching: true,
    });
    expect(
      reducer(
        { template },
        {
          type: templatesDuck.FETCH_TEMPLATES_SUCCESS,
          templates: [template],
        }
      )
    ).toEqual({
      templates: [template],
      template: {},
      isFetching: false,
    });
    expect(
      reducer(
        {},
        {
          type: templatesDuck.FETCH_TEMPLATES_FAILURE,
        }
      )
    ).toEqual({
      templates: [],
      isFetching: false,
    });
  });

  it('should handle fetchTemplate(id)', () => {
    expect(
      reducer(
        {},
        {
          type: templatesDuck.FETCH_TEMPLATE_REQUEST,
        }
      )
    ).toEqual({
      isFetching: true,
    });
    expect(
      reducer(
        {},
        {
          type: templatesDuck.FETCH_TEMPLATE_SUCCESS,
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
          type: templatesDuck.FETCH_TEMPLATE_FAILURE,
        }
      )
    ).toEqual({
      template: {},
      isFetching: false,
    });
  });

  it('should handle putTemplate', () => {
    expect(
      reducer(
        {},
        {
          type: templatesDuck.PUT_TEMPLATE_SUCCESS,
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
