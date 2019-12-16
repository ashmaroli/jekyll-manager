import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory, withRouter } from 'react-router';
import { HotKeys } from 'react-hotkeys';
import _ from 'underscore';
import classnames from 'classnames';
import DocumentTitle from 'react-document-title';

import Toggled from '../../components/Toggled';
import Splitter from '../../components/Splitter';
import Errors from '../../components/Errors';
import Breadcrumbs from '../../components/Breadcrumbs';
import Button from '../../components/Button';
import InputPath from '../../components/form/InputPath';
import InputTitle from '../../components/form/InputTitle';
import Editor from '../../components/Editor';
import Metadata from '../../containers/MetaFields';
import { updateTitle, updateBody, updatePath, updateTemplate } from '../../actions/metadata';
import { putTemplate } from '../../actions/templates';
import { clearErrors } from '../../actions/utils';
import { getLeaveMessage } from '../../constants/lang';
import { preventDefault, getExtensionFromPath, generateTitle } from '../../utils/helpers';
import { ADMIN_PREFIX } from '../../constants';

export class TemplateNew extends Component {

  constructor(props) {
    super(props);

    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);

    this.state = {
      hasFrontMatter: false,
      body: '',
      ext: 'html'
    };
  }

  componentDidMount() {
    const { router, route } = this.props;
    router.setRouteLeaveHook(route, this.routerWillLeave);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.updated !== nextProps.updated) {
      browserHistory.push(`${ADMIN_PREFIX}/templates/${nextProps.template.path}`);
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

  getExtension(e) {
    const ext = getExtensionFromPath(e.target.value);
    this.setState({ ext: ext });
  }

  handleToggle(e) {
    this.setState({ hasFrontMatter: e });
  }

  handleEditorChange() {
    const { updateBody } = this.props;
    const content = this.refs.editor.getValue();
    updateBody(content);
    this.setState({ body: content });
  }

  handleClickSave(e) {
    const { fieldChanged, putTemplate, params } = this.props;

    // Prevent the default event from bubbling
    preventDefault(e);

    if (fieldChanged) {
      const content = this.refs.editor.getValue();
      const include_front_matter = this.state.hasFrontMatter;
      putTemplate('create', params.splat, null, include_front_matter);
    }
  }

  render() {
    const {
      errors, updated, updateTitle, updateBody, updatePath, fieldChanged, params
    } = this.props;

    const keyboardHandlers = {
      'save': this.handleClickSave,
    };

    return (
      <DocumentTitle title={generateTitle('New Template')}>
        <HotKeys handlers={keyboardHandlers} className="single">
          {errors.length > 0 && <Errors errors={errors} />}
          <div className="content-header">
            <Breadcrumbs type="templates" splat={params.splat || ''} />
          </div>

          <div className="content-wrapper">
            <div className="content-body">
              <InputPath
                onChange={updatePath}
                onBlur={(e) => this.getExtension(e)}
                type="new-template"
                path="" />

              <Toggled
                label="Front Matter"
                checked={this.state.hasFrontMatter}
                onChange={(e) => this.handleToggle(e)}
                panel={<Metadata fields={{}} />} />

              <Splitter />

              <Editor
                onEditorChange={() => this.handleEditorChange()}
                onSave={this.handleClickSave}
                editorChanged={fieldChanged}
                content={this.state.body}
                type={this.state.ext}
                ref="editor" />
            </div>

            <div className="content-side">
              <Button
                onClick={this.handleClickSave}
                type="create"
                active={fieldChanged}
                triggered={updated}
                icon="plus-square"
                block />
            </div>
          </div>
        </HotKeys>
      </DocumentTitle>
    );
  }
}

TemplateNew.propTypes = {
  putTemplate: PropTypes.func.isRequired,
  updateTitle: PropTypes.func.isRequired,
  updateBody: PropTypes.func.isRequired,
  updatePath: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  errors: PropTypes.array.isRequired,
  fieldChanged: PropTypes.bool.isRequired,
  updated: PropTypes.bool.isRequired,
  router: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  template: PropTypes.object.isRequired,
  new_field_count: PropTypes.number
};

const mapStateToProps = (state) => ({
  template: state.templates.template,
  fieldChanged: state.metadata.fieldChanged,
  errors: state.utils.errors,
  updated: state.templates.updated,
  new_field_count: state.metadata.new_field_count
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  updateTitle,
  updateBody,
  updatePath,
  putTemplate,
  clearErrors
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(TemplateNew));
