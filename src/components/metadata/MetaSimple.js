import React, { Component } from 'react';
import PropTypes from 'prop-types';
import TextareaAutosize from 'react-textarea-autosize';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import DropdownList from 'react-widgets/lib/DropdownList';
import Modal from 'react-modal';
import StaticIndex from '../../containers/views/StaticIndex';
import moment from 'moment';
import momentLocalizer from 'react-widgets/lib/localizers/moment';
import 'react-widgets/dist/css/react-widgets.css';
import MetaTags from './MetaTags';

momentLocalizer(moment);

export class MetaSimple extends Component {

  constructor() {
    super();
    this.state = {
      staticfiles: [],
      showModal: false
    };
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
  }

  handleOpenModal () {
    this.setState({ showModal: true });
  }

  handleCloseModal () {
    this.setState({ showModal: false });
  }

  handleEditableChange(e) {
    const { nameAttr, updateFieldValue } = this.props;
    updateFieldValue(nameAttr, e.target.value);
  }

  handleDatepickerChange(date, dateStr) {
    const { nameAttr, updateFieldValue } = this.props;
    let formatted = moment(date).format('YYYY-MM-DD HH:mm:ss');
    updateFieldValue(nameAttr, formatted);
  }

  handleDropdownChange(value) {
    const { nameAttr, updateFieldValue } = this.props;
    updateFieldValue(nameAttr, value);
  }

  handleEditableBlur(e) {
    const { nameAttr, updateFieldValue } = this.props;
    updateFieldValue(nameAttr, e.target.value.trim());
  }

  renderEditable() {
    const { fieldValue } = this.props;
    return (
      <TextareaAutosize
        onChange={(e) => this.handleEditableChange(e)}
        onBlur={(e) => this.handleEditableBlur(e)}
        className="field value-field"
        value={`${fieldValue}`} />
    );
  }

  renderDatepicker() {
    const { fieldValue } = this.props;
    let dateValue = (new Date(fieldValue) == 'Invalid Date') ? null : new Date(fieldValue);
    return (
      <DateTimePicker
        onChange={(v, d) => this.handleDatepickerChange(v, d)}
        className="date-field"
        value={dateValue} />
    );
  }

  onClickPickerItem(url) {
    const { nameAttr, updateFieldValue } = this.props;
    this.refs.imagepicker.value = url;
    updateFieldValue(nameAttr, url);
    this.handleCloseModal();
  }

  renderStaticFilePicker() {
    const { fieldValue } = this.props;
    return (
      <div className="imagepicker">
        <TextareaAutosize
          onChange={(e) => this.handleEditableChange(e)}
          className="field value-field"
          value={fieldValue}
          ref="imagepicker" />
        <span className="images-wrapper">
          <button onClick={this.handleOpenModal}>
            <i className="fa fa-picture-o" aria-hidden="true" />
          </button>
          <Modal
             isOpen={this.state.showModal}
             onAfterOpen={this.fetchStaticFiles}
             contentLabel="onRequestClose Example"
             onRequestClose={this.handleCloseModal}
             style={{
              overlay: {
                backgroundColor: 'rgba(0,0,0,0.6)',
                zIndex: 10,
              },
              content: {
                margin: 20,
                paddingTop: 0,
                paddingRight: 10,
                paddingLeft: 15,
              }
            }} >
            <div className="content">
              <StaticIndex onClickStaticFile={(url) => this.onClickPickerItem(url)} modalView={true} />
            </div>
          </Modal>
        </span>
      </div>
    );
  }

  renderLayoutPicker() {
    const { fieldValue, appMeta } = this.props;
    const layouts = appMeta.site.layouts;

    return (
      <div className="layout-picker">
        <DropdownList
          value={fieldValue || 'Select Layout'}
          onChange={(v) => this.handleDropdownChange(v)}
          data={['none', ...layouts]} />
      </div>
    );
  }

  renderTagsInput() {
    const { fieldValue, nameAttr, updateFieldValue, appMeta } = this.props;

    return (
      <MetaTags
        fieldValue={fieldValue || ['']}
        nameAttr={nameAttr}
        updateFieldValue={updateFieldValue}
        suggestions={appMeta.site.tags} />
    );
  }

  render() {
    const { fieldKey } = this.props;
    let node;
    switch (fieldKey) {
      case 'date':
        node = this.renderDatepicker();
        break;
      case 'image':
      case 'file':
        node = this.renderStaticFilePicker();
        break;
      case 'layout':
        node = this.renderLayoutPicker();
        break;
      case 'tags':
        node = this.renderTagsInput();
        break;
      default:
        node = this.renderEditable();
    }
    return (
      <div className="meta-value">
        {node}
      </div>
    );
  }
}

MetaSimple.propTypes = {
  parentType: PropTypes.string.isRequired,
  updateFieldValue: PropTypes.func.isRequired,
  nameAttr: PropTypes.any.isRequired,
  fieldKey: PropTypes.string.isRequired,
  fieldValue: PropTypes.any,
  appMeta: PropTypes.object
};

export default MetaSimple;
