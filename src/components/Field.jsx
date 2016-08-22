/**
 * React Component which uses the React-DnD (drag and drop)
 * library to allow draggable columns in the pivot table. Corresponds
 * to a header field in the pivot table.
 */

import React, { Component, PropTypes } from 'react';
import { DragSource, DropTarget } from 'react-dnd';

import { ToggleableChevron } from './';
import { FIELD, DATA_AXIS } from '../consts';

const _ = require('lodash');

/**
 * Spec object for a draggable item.
 */
const fieldSource = {
    /**
     * Called when an element is dragged. Returns minimal
     * information describing the data being dragged.
     */
    beginDrag(props) {
        return {
            index: props.index,
            axis: props.axis
        };
    },

    /**
     * Called when an element is dragged. Returns whether
     * or not it can be dragged, and this is the case when
     * the size of the field is greater than one.
     */
    canDrag(props) {
        return props.getFieldLength() > 0;
    }
};

/**
 * Spec object for a drop target.
 */
const fieldTarget = {
    /**
     * Called when a draggable item is hovered over a
     * target with this function bound to it.
     */
    hover(props, monitor, component) {
        const dragIndex = monitor.getItem().index;
        const hoverIndex = props.index;
        const startAxis = monitor.getItem().axis;
        const endAxis = component.props.axis;

        if (props.moveField(startAxis, endAxis, dragIndex, hoverIndex)) {
            if (_.eq(endAxis, DATA_AXIS)) {
                monitor.getItem().axis = 1 - startAxis;
                monitor.getItem().index = 0;
            }
            else if (!_.eq(startAxis, DATA_AXIS)) {
                monitor.getItem().axis = endAxis;
                monitor.getItem().index = hoverIndex;
            }
        }
    }
};

class Field extends Component {
    static propTypes() {
        return {
            connectDragSource: PropTypes.func.isRequired,
            connectDropTarget: PropTypes.func.isRequired,
            // Index of field in the x-axis or y-axis.
            index: PropTypes.number.isRequired,
            // Function to be called when this field is moved.
            moveField: PropTypes.func.isRequired,
            // X_AXIS of Y_AXIS
            axis: PropTypes.number,
            // Function to compute the number of fields in the axis that
            // contains this field.
            getFieldLength: PropTypes.func,
            // Background color of this cell.
            backgroundColor: PropTypes.string,
            // A {name, order} object.
            field: PropTypes.object,
            // Callback function to invert the sort order of this field.
            invertOrder: PropTypes.func,
            // The colspan of the <th> item.
            colSpan: PropTypes.number,
            // The rowspan of the <th> item.
            rowSpan: PropTypes.number
        };
    }

    render() {
        const { connectDragSource, connectDropTarget } = this.props;
        const style = { backgroundColor: this.props.backgroundColor, cursor: 'move', textAlign: 'right' };
        const axis = this.props.axis;
        const field = this.props.field;
        const invertOrder = this.props.invertOrder;
        const colSpan = this.props.colSpan;
        const rowSpan = this.props.rowSpan;

        return connectDragSource(connectDropTarget(
            <th style={style} colSpan={colSpan} rowSpan={rowSpan}>
                {field.name}
                {invertOrder ? <ToggleableChevron axis={axis} field={field} invertOrder={invertOrder} /> : ''}
            </th>
        ));
    }
}

export default _.flow(
    DropTarget(FIELD, fieldTarget, connect => ({
        connectDropTarget: connect.dropTarget()
    })),
    DragSource(FIELD, fieldSource, (connect, monitor) => ({
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging()
    }))
)(Field);

