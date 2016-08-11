import React, { PropTypes } from 'react';
import { Glyphicon } from 'react-bootstrap';

const _ = require('lodash');

class ToggleableChevron extends React.Component {
    static propTypes() {
        return {
            axis: PropTypes.string,
            field: PropTypes.string,
            invertOrder: PropTypes.func
        };
    }

    render() {
        let glyphiconClass;
        if (_.eq(this.props.axis, 'x')) {
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

