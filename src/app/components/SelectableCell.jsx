import React, { PropTypes } from 'react';

class SelectableCell extends React.Component {
    static propTypes() {
        return {
            rowSpan: PropTypes.number,
            colSpan: PropTypes.number,
            innerText: PropTypes.String,
            tag: PropTypes.string,
            onClick: PropTypes.function,
            isSelected: PropTypes.boolean
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
        const backgroundColor = (this.props.isSelected) ? '#fcf8e3' : '#fff';
        const style = { backgroundColor };
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
