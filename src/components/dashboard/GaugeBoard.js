import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import _ from 'underscore';
import classnames from 'classnames';
import Gauge from './Gauge';
import { toTitleCase } from '../../utils/helpers';
import { ADMIN_PREFIX } from '../../constants';

export class GaugeBoard extends Component {

  calcPercentage(operand, base) {
    if (base === 0) base = 1;
    return Math.round(operand / base * 100);
  }

  hoverOnZeroGauge(entry, to) {
    const { config } = this.props;

    if (entry === 'collection_docs') {
      return 'No Collections with documents found!';
    } else if (entry === 'drafts' && !config.show_drafts) {
      return (
        <span>
          Restart your Site configured with <code>show_drafts: true</code> to process drafts
        </span>
      );
    } else {
      return <Link className="btn btn-active" to={to}>Add Resource</Link>;
    }
  }

  renderGauges(item) {
    const { dataSet, baseValue } = this.props;

    return _.map(item, (entry, index) => {
      const count = dataSet[entry].length;

      let new_path;
      switch (entry) {
        case 'content_pages':
          new_path = 'pages/new';
          break;
        case 'data_files':
          new_path = 'datafiles/new';
          break;
        case 'static_files':
          new_path = 'staticfiles';
          break;
        case 'drafts':
          new_path = 'drafts/new';
          break;
        case 'posts':
          new_path = 'collections/posts/new';
          break;
        default:
          new_path = `${entry}/new`;
      }

      let hoverContents;
      if (count === 0) {
        const to = `${ADMIN_PREFIX}/${new_path}`;
        hoverContents = [this.hoverOnZeroGauge(entry, to)];
      } else {
        hoverContents = dataSet[entry];
      }

      return (
        <Gauge
          key={index}
          percent={this.calcPercentage(count, baseValue)}
          count={count}
          label={toTitleCase(entry.replace('_', ' '))}
          hoverContents={hoverContents} />
      );
    });
  }

  renderColumns(list) {
    const slotClasses = classnames({
      "slot": true,
      "single-column": list.length == 1
    });

    return _.map(list, (items, i) => {
      return (
        <div key={i} className={slotClasses}>
          {this.renderGauges(items)}
        </div>
      );
    });
  }

  renderRows() {
    const { layoutArray } = this.props;
    return _.map(layoutArray, (items, i) => {
      return (
        <div key={i} className="row">
          {this.renderColumns(items)}
        </div>
      );
    });
  }

  render() {
    return (
      <div className="gauge-board">
        <div className="caption">
          <span className="well">
            Total no. of content files: <strong>{this.props.baseValue}</strong>
          </span>
        </div>
        {this.renderRows()}
      </div>
    );
  }
}

GaugeBoard.propTypes = {
  dataSet: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  baseValue: PropTypes.number.isRequired,
  layoutArray: PropTypes.array.isRequired
};

export default GaugeBoard;
