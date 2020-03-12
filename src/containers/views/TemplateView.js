import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory, Link } from 'react-router';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';

import Button from '../../components/Button';
import Breadcrumbs from '../../components/Breadcrumbs';
import Editor from '../../components/Editor';
import { fetchThemeItem, putThemeItem } from '../../ducks/theme';
import { getExtensionFromPath, generateTitle } from '../../utils/helpers';
import { ADMIN_PREFIX } from '../../constants';

export class TemplateView extends Component {

  constructor(props) {
    super(props);

    this.handleClickEdit = this.handleClickEdit.bind(this);
    this.state = { checkboxState: false };
  }

  componentDidMount() {
    const { fetchThemeItem, params } = this.props;
    const [directory, ...rest] = params.splat;
    const filename = rest.join('.');
    fetchThemeItem(directory, filename);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.updated !== nextProps.updated) {
      browserHistory.push(
        `${ADMIN_PREFIX}/templates/${nextProps.template.relative_path}`
      );
    }
  }

  toggle(e) {
    this.setState({ checkboxState: !this.state.checkboxState });
  }

  blankFunc() {}

  browse(link) {
    browserHistory.push(link);
  }

  handleClickEdit(e) {
    const { putThemeItem, template, params } = this.props;
    const { raw_content } = template;
    const [directory, ...rest] = params.splat;
    const filename = rest.join('.');

    this.setState({ checkboxState: false });
    putThemeItem(directory, filename, raw_content);
  }

  render() {
    const { isFetching, template, params, updated } = this.props;

    if (isFetching) {
      return null;
    }

    const { name, path, relative_path, data, raw_content, http_url, exist_at_source } = template;
    const checked = exist_at_source && this.state.checkboxState;
    const edit_url = `${ADMIN_PREFIX}/templates/${relative_path}`;
    const force_copy = exist_at_source ? checked : true;
    const [directory, ...rest] = params.splat;
    const ext = getExtensionFromPath(path);

    return (
      <DocumentTitle title={generateTitle(name, directory, 'Theme')}>
        <div>
          <div className="content-header">
            <Breadcrumbs splat={relative_path || ''} type="theme" />
          </div>
          <div className="content-wrapper">
            <div className="content-body">
              { raw_content &&
                <Editor
                  onEditorChange={() => this.blankFunc()}
                  editorChanged={false}
                  content={raw_content}
                  type={ext}
                  ref="editor"
                  readOnly={true} />
              }
            </div>
            <div className="content-side">
              {
                exist_at_source &&
                <Button
                  onClick={() => this.browse(edit_url)}
                  type="edit"
                  icon="edit"
                  active={true}
                  block />
              }
              <Button
                onClick={this.handleClickEdit}
                type="theme-file"
                active={force_copy}
                icon="copy"
                block />
              {
                exist_at_source &&
                  <div className="theme-checkbox">
                    <input
                      type="checkbox"
                      id="source-check"
                      checked={this.state.checkboxState}
                      onClick={(e) => this.toggle(e)} />
                    <label htmlFor="source-check">
                      <span>Overwrite file at Source</span>
                    </label>
                  </div>
              }
            </div>
          </div>
        </div>
      </DocumentTitle>
    );
  }
}

TemplateView.propTypes = {
  template: PropTypes.object.isRequired,
  fetchThemeItem: PropTypes.func.isRequired,
  putThemeItem: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  isFetching: PropTypes.bool.isRequired,
  updated: PropTypes.bool.isRequired
};

const mapStateToProps = (state) => ({
  template: state.theme.template,
  isFetching: state.theme.isFetching,
  updated: state.theme.updated
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchThemeItem,
  putThemeItem
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(TemplateView);
