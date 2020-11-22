import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory, withRouter } from 'react-router';
import _ from 'underscore';
import { HotKeys } from 'react-hotkeys';
import DocumentTitle from 'react-document-title';

import Collapsible from '../../components/Collapsible';
import Button from '../../components/Button';
import Splitter from '../../components/Splitter';
import Errors from '../../components/Errors';
import Breadcrumbs from '../../components/Breadcrumbs';
import InputPath from '../../components/form/InputPath';
import InputTitle from '../../components/form/InputTitle';
import MarkdownEditor from '../../components/MarkdownEditor';
import Metadata from '../MetaFields';
import { fetchDraft, deleteDraft, putDraft } from '../../ducks/drafts';
import { updateTitle, updateBody, updatePath } from '../../ducks/metadata';
import { putDocument } from '../../ducks/collections';
import { clearErrors } from '../../ducks/utils';
import { preventDefault, generateTitle } from '../../utils/helpers';
import { getLeaveMessage, getDeleteMessage } from '../../constants/lang';
import { ADMIN_PREFIX } from '../../constants';

export class DraftEdit extends Component {

  constructor(props) {
    super(props);

    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);

    this.state = {
      panelHeight: 0,
      unpublished: true
    };
  }

  componentDidMount() {
    const { fetchDraft, params, router, route } = this.props;
    const [directory, ...rest] = params.splat;
    const filename = rest.join('.');
    fetchDraft(directory, filename);

    router.setRouteLeaveHook(route, this.routerWillLeave);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.updated !== nextProps.updated) {
      const new_path = nextProps.draft.path;
      const path = this.props.draft.path;
      // redirect if the path is changed
      if (new_path != path) {
        browserHistory.push(`${ADMIN_PREFIX}/drafts/${nextProps.draft.relative_path}`);
      }
    }

    if (this.props.new_field_count !== nextProps.new_field_count) {
      const panelHeight = findDOMNode(this.refs.frontmatter).clientHeight;
      this.setState({ panelHeight: panelHeight + 60 }); // extra height for various types of metafield field
    }

    if (this.props.published !== nextProps.published) {
      browserHistory.push(`${ADMIN_PREFIX}/collections/${nextProps.doc.path.substring(1)}`);
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

  handleClickSave(e) {
    const { putDraft, fieldChanged, params } = this.props;

    // Prevent the default event from bubbling
    preventDefault(e);

    if (fieldChanged) {
      const [directory, ...rest] = params.splat;
      const filename = rest.join('.');
      putDraft('edit', directory, filename);
    }
  }

  handleClickPublish(name) {
    const { putDocument, params } = this.props;
    const confirm = window.confirm(
      `Delete draft "${name}" and publish to the "_posts" directory?`
    ); // TODO: move to 'constants/lang'
    if (confirm) {
      const [directory, ...rest] = params.splat;
      const filename = rest.join('.');
      putDocument('publish', 'posts', directory, filename);
      this.setState({ unpublished: false });
    }
  }

  handleClickDelete(name) {
    const { deleteDraft, params } = this.props;
    const confirm = window.confirm(getDeleteMessage(name));
    if (confirm) {
      const [directory, ...rest] = params.splat;
      const filename = rest.join('.');
      deleteDraft(directory, filename);
      browserHistory.push(`${ADMIN_PREFIX}/drafts/${directory || ''}`);
    }
  }

  render() {
    const { isFetching, draft, errors, updateTitle, updateBody, updatePath,
      updated, fieldChanged, params } = this.props;

    if (isFetching) {
      return null;
    } else if (_.isEmpty(draft)) {
      return <h1>Could not find the draft.</h1>;
    }

    const keyboardHandlers = {
      'save': this.handleClickSave,
    };

    const { name, relative_path, raw_content, http_url, front_matter } = draft;
    const directory = params.splat[0];

    const layout = front_matter.layout || '';
    const title = front_matter.title || '';

    const inputPath = <InputPath onChange={updatePath} type="drafts" path={relative_path} />;
    const metafields = (
      <Metadata
        ref="frontmatter"
        fields={{ layout, title, raw_content, path: relative_path, ...front_matter }} />
    );

    return (
      <DocumentTitle title={generateTitle(name, directory, 'Drafts')}>
        <HotKeys
          handlers={keyboardHandlers}
          className="single">
          {errors.length > 0 && <Errors errors={errors} />}
          <div className="content-header">
            <Breadcrumbs splat={relative_path} type="drafts" />
          </div>

          <div className="content-wrapper">
            <div className="content-body">
              <InputTitle onChange={updateTitle} title={title} ref="title" />

              <Collapsible
                label="Edit Filename or Path"
                panel={inputPath} />

              <Collapsible
                label="Edit Front Matter"
                overflow={true}
                height={this.state.panelHeight}
                panel={metafields} />

              <Splitter />

              <MarkdownEditor
                onChange={updateBody}
                onSave={this.handleClickSave}
                placeholder="Body"
                initialValue={raw_content}
                ref="editor" />
              <Splitter />
            </div>

            <div className="content-side">
              <Button
                onClick={this.handleClickSave}
                type="save"
                active={fieldChanged}
                triggered={updated}
                icon="save"
                block />
              <Button
                to={http_url}
                type="view"
                icon="eye"
                active={true}
                block />
              <Splitter />
              <Button
                onClick={() => this.handleClickPublish(name)}
                type="publish"
                icon="send-o"
                active={this.state.unpublished}
                block />
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

DraftEdit.propTypes = {
  draft: PropTypes.object.isRequired,
  fetchDraft: PropTypes.func.isRequired,
  deleteDraft: PropTypes.func.isRequired,
  putDraft: PropTypes.func.isRequired,
  putDocument: PropTypes.func.isRequired,
  updateTitle: PropTypes.func.isRequired,
  updateBody: PropTypes.func.isRequired,
  updatePath: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errors: PropTypes.array.isRequired,
  fieldChanged: PropTypes.bool.isRequired,
  updated: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  new_field_count: PropTypes.number,
  published: PropTypes.bool,
  doc: PropTypes.object
};

const mapStateToProps = (state) => ({
  draft: state.drafts.draft,
  isFetching: state.drafts.isFetching,
  fieldChanged: state.metadata.fieldChanged,
  updated: state.drafts.updated,
  errors: state.utils.errors,
  new_field_count: state.metadata.new_field_count,
  published: state.collections.updated,
  doc: state.collections.currentDocument
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchDraft,
  deleteDraft,
  putDraft,
  putDocument,
  updateTitle,
  updateBody,
  updatePath,
  clearErrors
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DraftEdit));
