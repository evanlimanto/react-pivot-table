import React, { Component, PropTypes } from 'react';
import { findDOMNode } from 'react-dom';
import { DragSource, DropTarget } from 'react-dnd';

import { ToggleableChevron } from './';
import { CARD } from '../consts/ItemTypes';

const _ = require('lodash');

const cardSource = {
    beginDrag(props) {
        return {
            index: props.index,
            col: props.col
        };
    }
};

const cardTarget = {
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        const startCol = monitor.getItem().col;
        const endCol = component.props.col;

        props.moveCard(startCol, endCol, dragIndex, hoverIndex);
        monitor.getItem().col = endCol;
        monitor.getItem().index = hoverIndex;
    }
};

class Card extends Component {
    static propTypes() {
        return {
            connectDragSource: PropTypes.func.isRequired,
            connectDropTarget: PropTypes.func.isRequired,
            index: PropTypes.number.isRequired,
            isDragging: PropTypes.bool.isRequired,
            moveCard: PropTypes.func.isRequired,
            getCardColumnLength: PropTypes.func.isRequired,
            tag: PropTypes.string,
            field: PropTypes.object,
            invertOrder: PropTypes.func,
            col: PropTypes.number,
            text: PropTypes.string,
            chevron: PropTypes.object
        };
    }

    render() {
        const { connectDragSource, connectDropTarget } = this.props;
        const text = this.props.text;
        const chevron = this.props.chevron;

        return connectDragSource(connectDropTarget(
            <this.props.tag style={{ cursor: 'move' }}>
              {text}{chevron}
            </this.props.tag>
        ));
    }
}

export default _.flow(
    DropTarget(CARD, cardTarget, connect => ({
        connectDropTarget: connect.dropTarget()
    })),
    DragSource(CARD, cardSource, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }))
)(Card);

