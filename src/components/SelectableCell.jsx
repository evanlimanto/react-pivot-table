/**
 * A helper class corresponding to the column and row headers. Allows
 * for selection that will trigger a callback to the pivot table class.
 */

import React, { PropTypes } from 'react';

class SelectableCell extends React.Component {
    static propTypes() {
        return {
            rowSpan: PropTypes.number,
            colSpan: PropTypes.number,
            // The text to display in the cell.
            innerText: PropTypes.String,
            // Whether we are displaying a <th> or <td>
            tag: PropTypes.string,
            // The callback function for selecting a cell.
            onClick: PropTypes.function,
            // Whether this cell is selected.
            isSelected: PropTypes.boolean,
            // A HTML color code denoting the background color of this cell.
            backgroundColor: PropTypes.string
        };
    }

    static defaultProps() {
        return {
            rowSpan: 1,
            colSpan: 1,
            innerText: ''
        };
    }

    render() {
        const rowSpan = this.props.rowSpan;
        const colSpan = this.props.colSpan;
        const innerText = this.props.innerText;
        const backgroundColor = (this.props.isSelected) ? '#fcf8e3' : this.props.backgroundColor;
        const style = { backgroundColor, textAlign: 'right' };
        return (
          <this.props.tag
            style={style}
            rowSpan={rowSpan}
            colSpan={colSpan}
            onClick={event => (this.props.onClick ? this.props.onClick(event) : null)}
          >{innerText}</this.props.tag>);
    }
}

export default SelectableCell;
