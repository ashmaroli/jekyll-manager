import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Checkbox from './form/Checkbox';

export default class Toggled extends Component {

  constructor(props) {
    super(props);

    this.state = {
      panel: props.checked
    };
  }

  togglePanel(e) {
    const onChange = this.props.onChange;
    onChange(e);
    this.setState({ panel: e });
  }

  render() {
    const { label, panel, checked } = this.props;
    const controllerClasses = classnames({
      "controller-wrap": true,
      "active": this.state.panel
    });

    return (
      <div className={controllerClasses}>
        <Checkbox
          text={label}
          checked={checked}
          onChange={(e) => this.togglePanel(e)} />
        <div className="toggled-panel">
          {panel}
        </div>
      </div>
    );
  }
}

Toggled.propTypes = {
  panel: PropTypes.object.isRequired,
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  checked: PropTypes.bool
};
