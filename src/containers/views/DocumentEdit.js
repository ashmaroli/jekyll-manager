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
import Splitter from '../../components/Splitter';
import Errors from '../../components/Errors';
import Breadcrumbs from '../../components/Breadcrumbs';
import Button from '../../components/Button';
import InputPath from '../../components/form/InputPath';
import InputTitle from '../../components/form/InputTitle';
import MarkdownEditor from '../../components/MarkdownEditor';
import Metadata from '../../containers/MetaFields';
import { fetchDocument, deleteDocument, putDocument } from '../../ducks/collections';
import { updateTitle, updateBody, updatePath } from '../../ducks/metadata';
import { clearErrors } from '../../ducks/utils';
import { preventDefault, capitalize, generateTitle } from '../../utils/helpers';
import { getLeaveMessage, getDeleteMessage, getNotFoundMessage } from '../../constants/lang';
import { ADMIN_PREFIX } from '../../constants';

export class DocumentEdit extends Component {

  constructor(props) {
    super(props);

    this.handleClickSave = this.handleClickSave.bind(this);
    this.routerWillLeave = this.routerWillLeave.bind(this);

    this.state = { panelHeight: 0 };
  }

  componentDidMount() {
    const { fetchDocument, params, router, route } = this.props;
    const [directory, ...rest] = params.splat;
    const filename = rest.join('.');
    fetchDocument(params.collection_name, directory, filename);

    router.setRouteLeaveHook(route, this.routerWillLeave);
  }

  componentWillReceiveProps(nextProps) {
    const { currentDocument } = this.props;
    if (this.props.updated !== nextProps.updated) {
      const new_path = nextProps.currentDocument.path;
      const path = currentDocument.path;
      // redirect if the path is changed
      if (new_path != path) {
        browserHistory.push(
          `${ADMIN_PREFIX}/collections/${new_path.substring(1)}` // remove `_`
        );
      }
    }

    if (this.props.new_field_count !== nextProps.new_field_count) {
      const panelHeight = findDOMNode(this.refs.frontmatter).clientHeight;
      this.setState({ panelHeight: panelHeight + 60 }); // extra height for various types of metafield field
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
    const { putDocument, fieldChanged, params } = this.props;

    // Prevent the default event from bubbling
    preventDefault(e);

    if (fieldChanged) {
      const collection = params.collection_name;
      const [directory, ...rest] = params.splat;
      const filename = rest.join('.');
      putDocument('edit', collection, directory, filename);
    }
  }

  handleClickDelete() {
    const { deleteDocument, params } = this.props;
    const [directory, ...rest] = params.splat;
    const filename = rest.join('.');
    const confirm = window.confirm(getDeleteMessage(filename));
    if (confirm) {
      const collection = params.collection_name;
      deleteDocument(collection, directory, filename);
      browserHistory.push(
        `${ADMIN_PREFIX}/collections/${collection}/${directory || ''}`
      );
    }
  }

  render() {
    const {
      isFetching, currentDocument, errors, updateTitle, updateBody, updatePath, updated,
      fieldChanged, params
    } = this.props;

    if (isFetching) {
      return null;
    }

    if (_.isEmpty(currentDocument)) {
      return <h1>{getNotFoundMessage('document')}</h1>;
    }

    const {
      title, raw_content, http_url, collection, front_matter,
    } = currentDocument;
    const [directory, ...rest] = params.splat;
    const filename = rest.join('.');
    const docPath = directory ? `${directory}/${filename}` : filename;

    const layout = front_matter.layout || '';

    const inputPath = <InputPath onChange={updatePath} type={collection} path={docPath} />;
    const metafields = (
      <Metadata
        ref="frontmatter"
        fields={{ layout, title, raw_content, path: docPath, ...front_matter }} />
    );

    const keyboardHandlers = {
      'save': this.handleClickSave,
    };

    const docTitle = generateTitle(title, directory, capitalize(collection));

    return (
      <DocumentTitle title={docTitle}>
        <HotKeys handlers={keyboardHandlers} className="single">

          {errors.length > 0 && <Errors errors={errors} />}

          <div className="content-header">
            <Breadcrumbs splat={docPath} type={collection} />
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
                onClick={() => this.handleClickDelete()}
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

DocumentEdit.propTypes = {
  currentDocument: PropTypes.object.isRequired,
  fetchDocument: PropTypes.func.isRequired,
  deleteDocument: PropTypes.func.isRequired,
  putDocument: PropTypes.func.isRequired,
  updateTitle: PropTypes.func.isRequired,
  updateBody: PropTypes.func.isRequired,
  updatePath: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  errors: PropTypes.array.isRequired,
  updated: PropTypes.bool.isRequired,
  fieldChanged: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  new_field_count: PropTypes.number
};

const mapStateToProps = (state) => ({
  currentDocument: state.collections.currentDocument,
  isFetching: state.collections.isFetching,
  fieldChanged: state.metadata.fieldChanged,
  updated: state.collections.updated,
  errors: state.utils.errors,
  new_field_count: state.metadata.new_field_count
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  fetchDocument,
  deleteDocument,
  putDocument,
  updateTitle,
  updateBody,
  updatePath,
  clearErrors
}, dispatch);

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(DocumentEdit)
);
