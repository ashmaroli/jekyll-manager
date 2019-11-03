import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';

export class Gauge extends Component {

  // A not-so-smart function
  singularize(size, str) {
    if (size != 1) return str;
    return str.replace(/s$/, '');
  }

  renderCoreMask() {
    const { count } = this.props;
    const content = this.props.hoverContents.slice(0, 3);

    let more;
    if (count > 3) {
      more = (
        <div className="hover-item more">
          ...and {count - 3} more {this.singularize(count - 3, 'items')}
        </div>
      );
    }

    const items = (
      _.map(content, (item, i) => {
        return (
          <div key={i} className="hover-item">
            <strong>{item}</strong>
          </div>
        );
      })
    );

    return (
      <div className="core-mask">
        <div className="hover-item-wrapper">
          {items}
          {more}
        </div>
      </div>
    );
  }

  render() {
    const { percent, count, label, hoverContents } = this.props;
    return (
      <div className="gauge-wrapper">
        <div className="gauge" data-progress={percent}>
          <div className="core">
            {hoverContents && this.renderCoreMask()}
            <div className="count">{count}</div>
            <div className="label">{this.singularize(count, label)}</div>
          </div>
        </div>
      </div>
    );
  }
}

Gauge.propTypes = {
  percent: PropTypes.number.isRequired,
  count: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  hoverContents: PropTypes.array
};

export default Gauge;
