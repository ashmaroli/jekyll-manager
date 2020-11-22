import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory, withRouter } from 'react-router';
import { HotKeys } from 'react-hotkeys';
import _ from 'underscore';
import DocumentTitle from 'react-document-title';

import Toggled from '../../components/Toggled';
import Button from '../../components/Button';
import Splitter from '../../components/Splitter';
import Errors from '../../components/Errors';
import Breadcrumbs from '../../components/Breadcrumbs';
import InputPath from '../../components/form/InputPath';
import Editor from '../../components/Editor';
import Metadata from '../MetaFields';
import { fetchTemplate, deleteTemplate, putTemplate } from '../../ducks/templates';
import { updateTitle, updateBody, updatePath, updateTemplate } from '../../ducks/metadata';
import { clearErrors } from '../../ducks/utils';
import { preventDefault, getExtensionFromPath, generateTitle } from '../../utils/helpers';
import { getLeaveMessage, getDeleteMessage } from '../../constants/lang';
import { ADMIN_PREFIX } from '../../constants';

export class TemplateEdit extends Component {

  constructor(props) {
    super(props);

    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);

    this.state = {
      hasFrontMatter: null,
      body: ''
    };
  }

  componentDidMount() {
    const { fetchTemplate, params, router, route } = this.props;
    const [directory, ...rest] = params.splat;
    const filename = rest.join('.');
    fetchTemplate(directory, filename);

    router.setRouteLeaveHook(route, this.routerWillLeave);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.updated !== nextProps.updated) {
      const new_path = nextProps.template.path;
      const path = this.props.template.path;
      // redirect if the path is changed
      if (new_path != path) {
        browserHistory.push(`${ADMIN_PREFIX}/templates/${new_path}`);
      }
    }
  }

  componentWillUnmount() {
    const { clearErrors, errors} = this.props;
    // clear errors if any
    if (errors.length) {
      clearErrors();
    }
  }

  routerWillLeave(nextLocation) {
    if (this.props.fieldChanged) {
      return getLeaveMessage();
    }
  }

  handleToggle(e) {
    const { updateTemplate } = this.props;
    this.setState({ hasFrontMatter: e });
    updateTemplate("FRONT MATTER", e);
  }

  handleEditorChange() {
    const { updateBody } = this.props;
    const content = this.refs.editor.getValue();
    updateBody(content);
    this.setState({ body: content });
  }

  handleClickSave(e) {
    const { putTemplate, fieldChanged, params, template } = this.props;
    const hasFrontMatter = this.state.hasFrontMatter;

    // Prevent the default event from bubbling
    preventDefault(e);

    let include_front_matter;
    if (_.isBoolean(hasFrontMatter)) {
      include_front_matter = hasFrontMatter;
    } else {
      include_front_matter = template.has_front_matter;
    }

    if (fieldChanged) {
      const [directory, ...rest] = params.splat;
      const filename = rest.join('.');
      putTemplate('edit', directory, filename, include_front_matter);
    }
  }

  handleClickDelete(name) {
    const { deleteTemplate, params } = this.props;
    const confirm = window.confirm(getDeleteMessage(name));
    if (confirm) {
      const [directory, ...rest] = params.splat;
      const filename = rest.join('.');
      deleteTemplate(directory, filename);
      browserHistory.push(`${ADMIN_PREFIX}/templates/${directory || ''}`);
    }
  }

  render() {
    const { isFetching, template, errors, updatePath, updated, fieldChanged,
      params } = this.props;

    if (isFetching) {
      return null;
    }

    if (_.isEmpty(template)) {
      return <h1>{`Could not find the template.`}</h1>;
    }

    const keyboardHandlers = {
      'save': this.handleClickSave,
    };

    const { name, path, raw_content, http_url, has_front_matter, front_matter } = template;
    const directory = params.splat[0];
    const ext =  getExtensionFromPath(path);
    const metafields = <Metadata ref="frontmatter" fields={{raw_content, path, ...front_matter}} />;

    return (
      <DocumentTitle title={generateTitle(name, directory, 'Templates')}>
        <HotKeys handlers={keyboardHandlers} className="single">

          {errors.length > 0 && <Errors errors={errors} />}

          <div className="content-header">
            <Breadcrumbs splat={path} type="templates" />
          </div>

          <div className="content-wrapper">
            <div className="content-body">
              <InputPath onChange={updatePath} type="edit-template" path={path} />

              <Toggled
                label="Front Matter"
                checked={has_front_matter}
                onChange={(e) => this.handleToggle(e)}
                panel={metafields} />

              <Splitter />

              <Editor
                onEditorChange={() => this.handleEditorChange()}
                onSave={this.handleClickSave}
                editorChanged={fieldChanged}
                content={this.state.body || raw_content}
                type={ext}
                ref="editor" />
            </div>

            <div className="content-side">
              <Button
                onClick={this.handleClickSave}
                type="save"
                active={fieldChanged}
                triggered={updated}
                icon="save"
                block />
              {
                http_url &&
                <Button
                  to={http_url}
                  type="view"
                  icon="eye"
                  active={true}
                  block />
              }
              <Splitter />
              <Button
                onClick={() => this.handleClickDelete(name)}
                type="delete"
                active={true}
                icon="trash"
                block />
            </div>
          </div>
        </HotKeys>
      </DocumentTitle>
    );
  }
}

TemplateEdit.propTypes = {
  template: PropTypes.object.isRequired,
  fetchTemplate: PropTypes.func.isRequired,
  deleteTemplate: PropTypes.func.isRequired,
  putTemplate: PropTypes.func.isRequired,
  updateTitle: PropTypes.func.isRequired,
  updateBody: PropTypes.func.isRequired,
  updatePath: PropTypes.func.isRequired,
  updateTemplate: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errors: PropTypes.array.isRequired,
  fieldChanged: PropTypes.bool.isRequired,
  updated: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  new_field_count: PropTypes.number
};

const mapStateToProps = (state) => ({
  template: state.templates.template,
  isFetching: state.templates.isFetching,
  fieldChanged: state.metadata.fieldChanged,
  updated: state.templates.updated,
  errors: state.utils.errors,
  new_field_count: state.metadata.new_field_count
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchTemplate,
  deleteTemplate,
  putTemplate,
  updateTemplate,
  updateTitle,
  updateBody,
  updatePath,
  clearErrors
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TemplateEdit));
