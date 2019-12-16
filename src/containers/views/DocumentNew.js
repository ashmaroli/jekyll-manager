import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { browserHistory, withRouter } from 'react-router';
import { HotKeys } from 'react-hotkeys';
import DocumentTitle from 'react-document-title';

import Splitter from '../../components/Splitter';
import Errors from '../../components/Errors';
import Breadcrumbs from '../../components/Breadcrumbs';
import Button from '../../components/Button';
import Collapsible from '../../components/Collapsible';
import InputPath from '../../components/form/InputPath';
import InputTitle from '../../components/form/InputTitle';
import MarkdownEditor from '../../components/MarkdownEditor';
import Metadata from '../../containers/MetaFields';
import { updateTitle, updateBody, updatePath } from '../../actions/metadata';
import { putDocument } from '../../actions/collections';
import { clearErrors } from '../../actions/utils';
import { getLeaveMessage } from '../../constants/lang';
import { preventDefault, capitalize, generateTitle } from '../../utils/helpers';
import { ADMIN_PREFIX } from '../../constants';

export class DocumentNew extends Component {

  constructor(props) {
    super(props);

    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.handleClickSave = this.handleClickSave.bind(this);

    this.state = { panelHeight: 0 };
  }

  componentDidMount() {
    const { router, route } = this.props;
    router.setRouteLeaveHook(route, this.routerWillLeave);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.updated !== nextProps.updated) {
      const path = nextProps.currentDocument.path;
      const splat = path.substr(path.indexOf('/')+1, path.length);
      browserHistory.push(
        `${ADMIN_PREFIX}/collections/${nextProps.currentDocument.collection}/${splat}`
      );
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
    const { fieldChanged, putDocument, params } = this.props;

    // Prevent the default event from bubbling
    preventDefault(e);

    if (fieldChanged) {
      const { collection_name, splat } = params;
      putDocument('create', collection_name, splat);
    }
  }

  render() {
    const { errors, updated, updateTitle, updateBody, updatePath, fieldChanged,
      params, config } = this.props;

    const keyboardHandlers = {
      'save': this.handleClickSave,
    };

    const collection = params.collection_name;
    const link = `${ADMIN_PREFIX}/collections/${collection}`;

    const docTitle = generateTitle('New Document', params.splat, capitalize(collection));

    return (
      <DocumentTitle title={docTitle}>
        <HotKeys handlers={keyboardHandlers} className="single">

          {errors.length > 0 && <Errors errors={errors} />}

          <div className="content-header">
            <Breadcrumbs type={collection} splat={params.splat || ''} />
          </div>

          <div className="content-wrapper">
            <div className="content-body">
              <InputPath onChange={updatePath} type={collection} path="" />
              <InputTitle onChange={updateTitle} title="" ref="title" />

              <Collapsible
                label="Edit Front Matter"
                overflow={true}
                height={this.state.panelHeight}
                panel={<Metadata fields={{ 'layout': '' }} ref="frontmatter" />} />

              <Splitter />

              <MarkdownEditor
                onChange={updateBody}
                onSave={this.handleClickSave}
                placeholder="Body"
                initialValue=""
                ref="editor" />
              <Splitter />
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

DocumentNew.propTypes = {
  putDocument: PropTypes.func.isRequired,
  updateTitle: PropTypes.func.isRequired,
  updateBody: PropTypes.func.isRequired,
  updatePath: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  errors: PropTypes.array.isRequired,
  fieldChanged: PropTypes.bool.isRequired,
  updated: PropTypes.bool.isRequired,
  params: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  currentDocument: PropTypes.object.isRequired,
  new_field_count: PropTypes.number
};

const mapStateToProps = (state) => ({
  currentDocument: state.collections.currentDocument,
  fieldChanged: state.metadata.fieldChanged,
  errors: state.utils.errors,
  updated: state.collections.updated,
  config: state.config.config,
  new_field_count: state.metadata.new_field_count
});

const mapDispatchToProps = (dispatch) => bindActionCreators({
  updateTitle,
  updateBody,
  updatePath,
  putDocument,
  clearErrors
}, dispatch);

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DocumentNew));
