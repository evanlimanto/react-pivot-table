/**
 * A clickable chevron icon that corresponds to a single data
 * field in the pivot table. On clicking this, the sort order of the
 * field is reversed.
 *
 * Author: limanto
 */

import React, { PropTypes } from 'react';
import { Glyphicon } from 'react-bootstrap';

import { X_AXIS } from '../consts';

const _ = require('lodash');

class ToggleableChevron extends React.Component {
    static propTypes() {
        return {
            // X_AXIS or Y_AXIS
            axis: PropTypes.number,
            // A {name, order} object
            field: PropTypes.object,
            // A callback function to invert the order of a row in the table.
            invertOrder: PropTypes.func
        };
    }

    render() {
        // The direction of the chevron to display.
        let glyphiconClass;
        if (_.eq(this.props.axis, X_AXIS)) {
            if (this.props.field.order) {
                glyphiconClass = 'chevron-right';
            }
            else {
                glyphiconClass = 'chevron-left';
            }
        }
        else if (this.props.field.order) {
            glyphiconClass = 'chevron-down';
        }
        else {
            glyphiconClass = 'chevron-up';
        }
        return (
          <a onClick={() => this.props.invertOrder(this.props.field)}>
            <Glyphicon glyph={glyphiconClass} />
          </a>
        );
    }
}

export default ToggleableChevron;

