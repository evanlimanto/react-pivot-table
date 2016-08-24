/**
 * Main web component for the deshaw.util.pivot_table python module.
 *
 * Author: limanto
 */

import React, { PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { Table } from 'react-bootstrap';
import { DragDropContext } from 'react-dnd';

import { Field, SelectableCell } from '../components';
import { COLOR_SCHEME, X_AXIS, Y_AXIS, DATA_AXIS } from '../consts';
import { addToListInDict, sortDataRows, getTableMapping } from '../utils';

const _ = require('lodash');

require('../styles/index.css');

class PivotTable extends React.Component {
    static propTypes() {
        return {
            data: PropTypes.array,
            fieldLabels: PropTypes.array,
            allFields: PropTypes.array,
            xAxis: PropTypes.array,
            yAxis: PropTypes.array,
            dataFields: PropTypes.array
        };
    }

    /**
     * The constructor.
     * @constructor
     * @param {array} xAxis - The list of column headers names.
     * @param {array} yAxis - The list of row header names.
     * @param {array} dataFields - The list of data header names.
     * @param {array} data - The 2-D array of data to be displayed in the PivotTable.
     *                       Each element of this array is a column in table.
     * @param {array} selectCallback - The callback function triggered every time cells
     *                                 are selected.
     * @param {object} selection - The initial state of selected items in the PivotTable.
     */
    constructor(props) {
        super(props);

        this.initState(props);

        this.invertOrder = this.invertOrder.bind(this);
        this.moveField = this.moveField.bind(this);
        this.onBucketClick = this.onBucketClick.bind(this);
        this.flipDataAxis = this.flipDataAxis.bind(this);
    }

    /**
     * Helper function to initialize the state, given the props passed in to
     * the component.
     * @param {object} props - The props passed into this component.
     */
    initState(props) {
        const xAxis = props.xAxis.map(name => ({name: name, order: true}));
        const yAxis = props.yAxis.map(name => ({name: name, order: true}));
        const dataFields = props.dataFields.map(name => ({name: name, order: true}));
        const allFields = _.concat(xAxis, yAxis, dataFields);
        const dataHeaderAxis = Y_AXIS;
        const selected = {};
        selected[X_AXIS] = {};
        selected[Y_AXIS] = {};

        this.state = {
            allFields,
            xAxis,
            yAxis,
            dataFields,
            selected,
            dataHeaderAxis,
            hasComputedInitialState: false
        };
    }

    /**
     * Called whenever the props of this component is updated, as per the lifecycle of
     * this component.
     * @param {object} nextProps - The new props of this component.
     */
    componentWillReceiveProps(nextProps) {
        if (nextProps.shouldUpdateState) {
            this.initState(nextProps);
        }
    }

    /**
     * Computes the initial cells that are selected from the selection prop passed
     * into the PivotTable.
     */
    computeInitialSelectedState() {
        const { rowSpans, colSpans, colFields, rowFields } = this.cache;
        const { xAxis, yAxis } = this.state;
        const numXLabels = this.state.xAxis.length;
        const numYLabels = this.state.yAxis.length;
        const curSelectedX = this.state.selected[0];
        const curSelectedY = this.state.selected[1];
        const selectedItems = _.mapValues(this.props.selected, value => new Set(_.split(value, ',')));

        // Handle selected items in the y-axis.
        _.range(numYLabels).map(fieldIndex => {
            const fieldName = yAxis[fieldIndex].name;
            if (fieldName in selectedItems) {
                let fieldPos = 0;
                let fieldIter = 0;
                // Find row span with header value in selectedItems.
                _.forIn(rowSpans[fieldIndex], rowSpan => {
                    const endFieldIter = fieldIter + rowSpan;
                    const headerVal = rowFields[fieldIndex][fieldPos];
                    // Check if this header value is selected, and that its parent is also selected.
                    if (selectedItems[fieldName].has(headerVal) &&
                        (_.eq(fieldIndex, 0) || this.isInSelected(fieldIndex - 1, fieldIter, Y_AXIS))) {
                        if (!(fieldIndex in curSelectedY)) {
                            curSelectedY[fieldIndex] = new Set();
                        }
                        curSelectedY[fieldIndex].add(fieldIter);
                    }
                    fieldIter = endFieldIter;
                    fieldPos++;
                });
            }
        });

        // Handle selected items in the x-axis.
        _.range(numXLabels).map(fieldIndex => {
            const fieldName = xAxis[fieldIndex].name;
            if (fieldName in selectedItems) {
                let fieldPos = 0;
                let fieldIter = 0;
                // Find col span with header value in selectedItems.
                _.forIn(colSpans[fieldIndex], colSpan => {
                    const endFieldIter = fieldIter + colSpan;
                    const headerVal = colFields[fieldIndex][fieldPos];
                    // Check if this header value is selected, and that its parent is also selected.
                    if (selectedItems[fieldName].has(headerVal) &&
                        (_.eq(fieldIndex, 0) || this.isInSelected(fieldIndex - 1, fieldIter, X_AXIS))) {
                        if (!(fieldIndex in curSelectedX)) {
                            curSelectedX[fieldIndex] = new Set();
                        }
                        curSelectedX[fieldIndex].add(fieldIter);
                    }
                    fieldIter = endFieldIter;
                    fieldPos++;
                });
            }
        });
        this.state.hasComputedInitialState = true;
    }

    /**
     * The callback function called when a column/row header is dragged
     * over another header.
     * @param {number} startAxis - Initial axis (0: xAxis, 1: yAxis, 2: dataFields).
     * @param {number} endAxis - End axis (0: xAxis, 1: yAxis, 2: dataFields).
     * @param {number} dragIndex - Initial position in header list.
     * @param {number} hoverIndex - End position in header list.
     */
    moveField(startAxis, endAxis, dragIndex, hoverIndex) {
        if (_.eq(startAxis, endAxis) && _.eq(dragIndex, hoverIndex)) {
            return false;
        }
        if (_.eq(startAxis, DATA_AXIS) && _.eq(endAxis, DATA_AXIS)) {
            return false;
        }
        if (_.eq(startAxis, DATA_AXIS)) {
            // We are dragging a data header, so change the data axis.
            if (!_.eq(this.state.dataHeaderAxis, endAxis)) {
                this.setState({
                    dataHeaderAxis: endAxis
                });
            }
        }
        else {
            const fieldList = [
                _.cloneDeep(this.state.xAxis),
                _.cloneDeep(this.state.yAxis),
                _.cloneDeep(this.state.dataFields)
            ];
            const dragField = fieldList[startAxis][dragIndex];

            // Allow dragging to data axis only if other axis is empty,
            // resulting in filling the empty axis.
            if (_.eq(endAxis, DATA_AXIS)) {
                if (_.eq(fieldList[1 - startAxis].length, 0)) {
                    hoverIndex = 0;
                    endAxis = 1 - startAxis;
                }
                else {
                    return false;
                }
            }
            fieldList[startAxis].splice(dragIndex, 1);
            fieldList[endAxis].splice(hoverIndex, 0, dragField);

            const newSelected = {};
            newSelected[X_AXIS] = {};
            newSelected[Y_AXIS] = {};
            this.setState({
                xAxis: fieldList[0],
                yAxis: fieldList[1],
                dataFields: fieldList[2],
                selected: newSelected
            });
        }
        return true;
    }

    /**
     * The callback function called when the ordering of a column/row is
     * inverted.
     * @param {object} field - A {name, order} object.
     */
    invertOrder(field) {
        const xAxis = _.cloneDeep(this.state.xAxis);
        const yAxis = _.cloneDeep(this.state.yAxis);
        const dataFields = this.state.dataFields;
        // Iterate through the x-axis, and inverts the sort order of the
        // field if the name matches the field being passed in.
        _.forIn(_.range(xAxis.length), index => {
            if (_.eq(xAxis[index].name, field.name)) {
                xAxis[index].order = !xAxis[index].order;
            }
        });
        // Iterate through the y-axis, and inverts the sort order of the
        // field if the name matches the field being passed in.
        _.forIn(_.range(yAxis.length), index => {
            if (_.eq(yAxis[index].name, field.name)) {
                yAxis[index].order = !yAxis[index].order;
            }
        });
        this.setState({
            xAxis,
            yAxis,
            allFields: _.concat(xAxis, yAxis, dataFields)
        });
    }

    /**
     * Helper function for getSpans.
     * @param {array} data - The 2-D data array sorted in a certain order.
     * @param {array} fieldIndices - The indices in the data array of fields we are processing.
     * @param {array} spans - A reference to the 2-D array of col/row spans which we will compute.
     * @param {array} fields - A reference to the 2-D array of header values which we will compute.
     * @param {number} fieldIndex - The index of the field in fields we are processing right now.
     * @param {number} itemFirstIndex - The index of the first item in the field we are going to process.
     * @param {number} itemLastIndex - The index of the last item in the field we are going to process.
     */
    getSpansHelper(data, fieldIndices, spans, fields, fieldIndex, itemFirstIndex, itemLastIndex) {
        if (_.eq(fieldIndex, fieldIndices.length) || _.gt(itemFirstIndex, itemLastIndex)) {
            return 1;
        }
        const currentPos = data[fieldIndices[fieldIndex]];
        let counter = 0;
        let prevIndex = itemFirstIndex;
        let index = itemFirstIndex + 1;
        // Iterate from the first to the last item bounded by [itemFirstIndex, itemLastIndex]
        while (index <= itemLastIndex + 1) {
            if (_.eq(index, itemLastIndex + 1) || currentPos[index] !== currentPos[index - 1]) {
                // Compute the width of this span by recursively computing the width of individual
                // elements of the next field that this item covers.
                const width = this.getSpansHelper(data, fieldIndices, spans, fields, fieldIndex + 1,
                                                  prevIndex, index - 1);
                counter += width;
                fields[fieldIndex].push(currentPos[prevIndex]);
                spans[fieldIndex].push(width);
                prevIndex = index;
            }
            index += 1;
        }
        return counter;
    }

    /**
     * Calculates the row/col-spans given data sorted in a certain order and the
     * first dimension indexes into the data array.
     * @param {array} data - The 2D data array for the pivot table.
     * @param {array} fieldIndices - The array of indexes for which to calculate spans.
     */
    getSpans(data, fieldIndices) {
        // Initializes the column/row spans array.
        const spans = _.range(fieldIndices.length).reduce(lst => {
            lst.push([]);
            return lst;
        }, []);
        // Initializes the array of header values.
        const fields = _.range(fieldIndices.length).reduce(lst => {
            lst.push([]);
            return lst;
        }, []);
        this.getSpansHelper(data, fieldIndices, spans, fields, 0, 0, data[0].length - 1);
        return [spans, fields];
    }

    /**
     * Checks if a single cell is selected.
     * @param {number} fieldIndex - The index of the header field in either the x or y axis.
     * @param {number} itemIndex - The index of the header being clicked in the row or column.
     * @param {boolean} checkParent - Whether to check the parent of this span for selection.
     */
    isInSelected(fieldIndex, itemIndex, axisIndex, checkParent = false) {
        if (_.eq(fieldIndex, -1)) {
            return true;
        }
        const spans = _.eq(axisIndex, X_AXIS) ? this.cache.colSpans : this.cache.rowSpans;
        const curSelected = this.state.selected[axisIndex];
        // Nothing in this field is selected.
        if (!_.has(curSelected, fieldIndex)) {
            return false;
        }

        // Since any header cell can have a row or column span greater
        // than one, we check all the possible indices of a certain cell
        // when we encounter the cell that contains itemIndex.
        let fieldIter = 0;
        const retval = _.some(spans[fieldIndex], rowSpan => {
            const endFieldIter = fieldIter + rowSpan;
            // Check if itemIndex is in the range of this span. If so, check each index
            // in the range of the span for selection.
            if (_.inRange(itemIndex, fieldIter, endFieldIter)) {
                if (_.some(_.range(fieldIter, endFieldIter), j => curSelected[fieldIndex].has(j))) {
                    return true;
                }
            }
            fieldIter = endFieldIter;
            return false;
        });

        if (checkParent)
            return retval || this.isInSelected(fieldIndex - 1, itemIndex, axisIndex, true);
        return retval;
    }

    /**
     * Unselect a selected cell.
     * @param {number} fieldIndex - The index of the header field in either the x or y axis.
     * @param {number} itemIndex - The index of the header being clicked in the row or column.
     * @param {boolean} removeUpstream - removes the selection up repeatedly until
                                         the current field only has a single item selected.
     * @param {boolean} removeInRange - whether to remove the cells that contain or do not contain
     *                                  this cell from selection.
     */
    removeSelected(fieldIndex, itemIndex, axisIndex, removeUpstream = false, removeInRange = true) {
        const spans = _.eq(axisIndex, X_AXIS) ? this.cache.colSpans : this.cache.rowSpans;
        const curSelected = this.state.selected[axisIndex];
        if (!(fieldIndex in curSelected)) {
            return;
        }

        let itemCount = 0;
        let fieldIter = 0;
        // Count the number of spans in this field that is selected.
        _.forIn(spans[fieldIndex], rowSpan => {
            const endFieldIter = fieldIter + rowSpan;
            if (_.some(_.range(fieldIter, endFieldIter), j => curSelected[fieldIndex].has(j))) {
                itemCount++;
            }
            fieldIter = endFieldIter;
        });

        // If we are removing upstream, stop removing at the point where there is only
        // one single item being selected in the current field.
        if (removeUpstream && _.eq(itemCount, 1)) {
            return;
        }

        fieldIter = 0;
        _.forIn(spans[fieldIndex], rowSpan => {
            const endFieldIter = fieldIter + rowSpan;
            // Find the span which covers this itemIndex.
            if (_.eq(_.inRange(itemIndex, fieldIter, endFieldIter), removeInRange)) {
                for (let i = fieldIter; i < endFieldIter; i++) {
                    if ((fieldIndex in curSelected) && curSelected[fieldIndex].has(i)) {
                        curSelected[fieldIndex].delete(i);
                        if (_.eq(curSelected[fieldIndex].size, 0)) {
                            delete curSelected[fieldIndex];
                            break;
                        }
                        if (removeUpstream) {
                            this.removeSelected(fieldIndex - 1, i, axisIndex, removeUpstream);
                        }
                        // Clear all subsequent fields if we are clearing this field.
                        this.removeSelected(fieldIndex + 1, i, axisIndex);
                    }
                }
            }
            fieldIter = endFieldIter;
        });
    }

    triggerSelectCallback() {
        const selectedItems = {};
        const { rowSpans, colSpans, colFields, rowFields } = this.cache;
        const { xAxis, yAxis } = this.state;
        const numXLabels = this.state.xAxis.length;
        const numYLabels = this.state.yAxis.length;
        const curSelectedX = this.state.selected[0];
        const curSelectedY = this.state.selected[1];
        // Handle selected cells in the y-axis.
        _.range(numYLabels).map(fieldIndex => {
            if (fieldIndex in curSelectedY) {
                let fieldPos = 0;
                let fieldIter = 0;
                _.forIn(rowSpans[fieldIndex], rowSpan => {
                    const endFieldIter = fieldIter + rowSpan;
                    for (let i = fieldIter; i < endFieldIter; i++) {
                        if (curSelectedY[fieldIndex].has(i)) {
                            const headerVal = rowFields[fieldIndex][fieldPos];
                            addToListInDict(selectedItems, yAxis[fieldIndex].name, headerVal);
                            break;
                        }
                    }
                    fieldIter = endFieldIter;
                    fieldPos++;
                });
            }
        });
        // Handle selected cells in the x-axis.
        _.range(numXLabels).map(fieldIndex => {
            if (fieldIndex in curSelectedX) {
                let fieldPos = 0;
                let fieldIter = 0;
                _.forIn(colSpans[fieldIndex], colSpan => {
                    const endFieldIter = fieldIter + colSpan;
                    for (let i = fieldIter; i < endFieldIter; i++) {
                        if (curSelectedX[fieldIndex].has(i)) {
                            const headerVal = colFields[fieldIndex][fieldPos];
                            addToListInDict(selectedItems, xAxis[fieldIndex].name, headerVal);
                            break;
                        }
                    }
                    fieldIter = endFieldIter;
                    fieldPos++;
                });
            }
        });
        this.props.selectCallback(selectedItems);
    }

    /**
     * Callback function triggered when a cell is clicked.
     * @param {Object} event - The event object to check for a control-click action.
     * @param {number} fieldIndex - The index of the field in the list of fields.
     * @param {number} itemIndex - The index of the item in a field.
     * @param {number} axisIndex - Whether we are processing the x or y axis.
     */
    onBucketClick(event, fieldIndex, itemIndex, axisIndex) {
        // Don't process event if no select callback is passed in as a prop.
        if (!this.props.selectCallback) {
            return;
        }

        const curSelected = this.state.selected[axisIndex];
        let newSelected = {};
        newSelected[X_AXIS] = {};
        newSelected[Y_AXIS] = {};
        const maxFieldIndex = parseInt(_.max(_.keys(curSelected)) || -1, 10);
        // If the user pressed the control key, and if there is nothing selected or if
        // this field is the largest being selected and there is an item selected in this field,
        // process the event.
        if (event.ctrlKey && (_.eq(_.size(curSelected), 0) ||
                              (_.eq(maxFieldIndex, fieldIndex) &&
                               this.isInSelected(fieldIndex - 1, itemIndex, axisIndex, true)))) {
            newSelected[axisIndex] = curSelected;
            if (this.isInSelected(fieldIndex, itemIndex, axisIndex)) {
                // If this item is selected, remove this item from selection.
                const removeUpstream = _.gt(_.size(curSelected), 0) && _.gt(_.size(curSelected[maxFieldIndex]), 1);
                this.removeSelected(fieldIndex, itemIndex, axisIndex, removeUpstream);
            }
            else {
                // Add this item to the set of selections.
                _.forIn(_.range(fieldIndex + 1), i => {
                    if (!_.has(newSelected[axisIndex], i)) {
                        newSelected[axisIndex][i] = new Set();
                    }
                    newSelected[axisIndex][i].add(itemIndex);
                });
                // Remove different buckets that are currently selected.
                if (fieldIndex > 0) {
                    for (let i = 0; i < this.props.data[0].length; i++) {
                        this.removeSelected(fieldIndex - 1, itemIndex, axisIndex, true, false);
                    }
                }
            }
        }
        else if (!(_.eq(fieldIndex, maxFieldIndex) && _.eq(curSelected[maxFieldIndex].size, 1) &&
                   this.isInSelected(fieldIndex, itemIndex, axisIndex))) {
            // If control key wasn't pressed, clear all current selections and
            // start anew.
            _.forIn(_.range(fieldIndex + 1), i => {
                if (!_.has(newSelected[axisIndex], i)) {
                    newSelected[axisIndex][i] = new Set();
                }
                newSelected[axisIndex][i].add(itemIndex);
            });
        }
        // Copy over the current selections of the other axis.
        newSelected[1 - axisIndex] = this.state.selected[1 - axisIndex];
        this.setState({
            selected: newSelected
        }, this.triggerSelectCallback);
    }

    /**
     * Helper function to compute the data value that goes into a cell given
     * the row, column and data keys.
     * @param {object} dataMap - A 3-D map generated by getTableMapping.
     * @param {array} primaryKey - A list of field values.
     * @param {array} secondaryKey - A list of field values.
     * @param {number} tertiaryKey - The data index.
     */
    getCellContents(dataMap, primaryKey, secondaryKey, tertiaryKey) {
        if (primaryKey in dataMap && secondaryKey in dataMap[primaryKey]) {
            return dataMap[primaryKey][secondaryKey][tertiaryKey];
        }
        return '';
    }

    /**
     * Given a field object, returns its index in the list of field labels.
     * @param {Object} field - A {name, order} dictionary.
     */
    fieldToIndex(field) {
        return this.props.fieldLabels.indexOf(field.name);
    }

    /**
     * Updates some auxillary information in the cache. Called everytime this.render()
     * is called.
     */
    updateCache() {
        const colIndices = this.state.xAxis.map(field => this.fieldToIndex(field));
        const rowIndices = this.state.yAxis.map(field => this.fieldToIndex(field));
        const dataIndices = this.state.dataFields.map(field => this.fieldToIndex(field));
        // Get the data sorted by column and row orders.
        const dataByColOrder = sortDataRows(this.props.data, this.state.xAxis,
                                            (field) => this.fieldToIndex(field));
        const dataByRowOrder = sortDataRows(this.props.data, this.state.yAxis,
            (field) => this.fieldToIndex(field));
        // Compute the span widths and header values.
        const [colSpans, colFields] = this.getSpans(dataByColOrder, colIndices);
        const [rowSpans, rowFields] = this.getSpans(dataByRowOrder, rowIndices);

        const dataHeaderInX = _.eq(this.state.dataHeaderAxis, 0);
        const dataHeaderInY = _.eq(this.state.dataHeaderAxis, 1);
        const cacheData = {
            colIndices,
            rowIndices,
            dataByColOrder,
            colSpans,
            colFields,
            dataByRowOrder,
            rowSpans,
            rowFields,
            dataIndices,
            dataHeaderInX,
            dataHeaderInY
        };

        this.cache = cacheData;
    }

    /**
     * Moves the data header from the x-axis to the y-axis or vice versa.
     */
    flipDataAxis() {
        const dataHeaderAxis = 1 - this.state.dataHeaderAxis;
        this.setState({
            dataHeaderAxis
        });
    }

    /**
     * Computes the table header.
     */
    getTableHeader() {
        const numXLabels = this.state.xAxis.length;
        const numYLabels = this.state.yAxis.length;
        const dataFields = this.state.dataFields;
        const { colSpans, colFields, dataHeaderInX } = this.cache;
        let dataFieldsHeader = '';
        // We consider two cases for the y-axis headers. First, when the data headers
        // are in the x-axis and second, when the data headers are in the y-axis.
        let yAxisHeaderDataHeaderX = '';
        let yAxisHeaderDataHeaderY = '';
        let yAxisHeaderDataHeaderYEmptyX = '';
        if (dataHeaderInX) {
            // If the data header is in the x-axis, we have to generated a row of 
            // repeated data headers e.g. (Float, Country, Float, Country etc)
            const numDataCols = ((numXLabels > 0) ? _.last(colFields).length : 1) * dataFields.length;
            dataFieldsHeader = _.range(numDataCols).map(dataHeaderIter => {
                const dataHeaderIndex = dataHeaderIter % dataFields.length;
                const dataField = dataFields[dataHeaderIndex];
                return (
                  <Field
                    index={dataHeaderIndex}
                    moveField={this.moveField}
                    axis={DATA_AXIS}
                    getFieldLength={() => this.state.dataFields.length}
                    backgroundColor={COLOR_SCHEME[X_AXIS][Math.floor(dataHeaderIter / 2) % 2]}
                    field={dataField}
                  />
                );
            });
            yAxisHeaderDataHeaderX = (
              <tr>
                {this.state.yAxis.map((field, fieldIndex) => (
                  <Field
                    index={fieldIndex}
                    moveField={this.moveField}
                    axis={Y_AXIS}
                    backgroundColor={COLOR_SCHEME[Y_AXIS][1]}
                    getFieldLength={() => this.state.yAxis.length}
                    field={field}
                    invertOrder={this.invertOrder}
                  />
                ))}
                {dataFieldsHeader}
              </tr>
            );
            if (_.eq(numYLabels, 0)) {
                yAxisHeaderDataHeaderX = (
                  <tr>
                    <th style={{backgroundColor: COLOR_SCHEME[X_AXIS][1]}} />
                    {dataFieldsHeader}
                  </tr>
                );
            }
        }
        else {
            yAxisHeaderDataHeaderY = this.state.yAxis.map((field, fieldIndex) => (
              <Field
                index={fieldIndex}
                moveField={this.moveField}
                axis={Y_AXIS}
                backgroundColor={COLOR_SCHEME[Y_AXIS][1]}
                getFieldLength={() => this.state.yAxis.length}
                field={field}
                rowSpan={numXLabels}
                invertOrder={this.invertOrder}
              />
            ));
            if (_.eq(numXLabels, 0)) {
                yAxisHeaderDataHeaderYEmptyX = (
                  <tr>
                    {yAxisHeaderDataHeaderY}
                    <th style={{backgroundColor: COLOR_SCHEME[Y_AXIS][1]}} />
                    <th style={{backgroundColor: COLOR_SCHEME[Y_AXIS][1]}} />
                  </tr>
                );
            }
        }
        // Iterate through each field in the x-axis.
        return (
          <thead>
            {yAxisHeaderDataHeaderYEmptyX}
            {/* Iterate through each field.*/} 
            {_.range(numXLabels).map(fieldIndex => {
                let colIter = 0;
                // Iterate through each item in the field.
                const curField = _.range(colFields[fieldIndex].length).map(itemIndex => {
                    const colSpan = colSpans[fieldIndex][itemIndex] * (dataHeaderInX ? dataFields.length : 1);
                    // Set the rowspan to 2 if this is the last field we are processing.
                    const rowSpan = (_.eq(fieldIndex, colFields.length - 1) &&
                                     !dataHeaderInX) ? 2 : 1;
                    const colValue = colFields[fieldIndex][itemIndex];
                    const curColIter = colIter;
                    const isSelected = this.isInSelected(fieldIndex, curColIter, X_AXIS);
                    colIter += colSpans[fieldIndex][itemIndex];
                    return (
                      <SelectableCell
                        rowSpan={rowSpan}
                        colSpan={colSpan}
                        innerText={colValue}
                        tag="th"
                        isSelected={isSelected}
                        backgroundColor={COLOR_SCHEME[X_AXIS][curColIter % 2]}
                        onClick={event => this.onBucketClick(event, fieldIndex, curColIter, X_AXIS)}
                    />);
                });

                return (
                  <tr>
                    {fieldIndex === 0 ? yAxisHeaderDataHeaderY : ''} 
                    {/* The x-axis header label */}
                    <Field
                      index={fieldIndex}
                      moveField={this.moveField}
                      axis={X_AXIS}
                      colSpan={dataHeaderInX ? numYLabels : 1}
                      backgroundColor={COLOR_SCHEME[X_AXIS][1]}
                      getFieldLength={() => this.state.xAxis.length}
                      field={this.state.xAxis[fieldIndex]}
                      invertOrder={this.invertOrder}
                    />
                    {curField}
                  </tr>
                );
            })}
            {yAxisHeaderDataHeaderX}
          </thead>
        );
    }

    /**
     * Computes the table body.
     */
    getTableBody() {
        const { colIndices, rowIndices, dataIndices, rowSpans, rowFields,
                colSpans, colFields, dataHeaderInX, dataHeaderInY } = this.cache;
        const dataFields = this.state.dataFields;
        const numXLabels = this.state.xAxis.length;
        const numYLabels = this.state.yAxis.length;
        const rowIters = _.range(rowIndices.length).map(() => 0);
        const rowPositions = _.range(rowIndices.length).map(() => 0);
        const dataMap = getTableMapping(this.props.data, colIndices, rowIndices, dataIndices);

        // Iterate through every single row in the table.
        let bodyData;
        if (numYLabels > 0) {
            bodyData = _.range(_.sum(rowSpans[0])).map(rowIndex => {
                const secondaryKey = [''];
                // Computes the y-axis headers in the current row.
                const curHeader = _.range(numYLabels).reduce((lst, fieldIndex) => {
                    fieldIndex = parseInt(fieldIndex, 10);
                    const rowIter = rowIters[fieldIndex];
                    const rowSpan = rowSpans[fieldIndex][rowIter];
                    const rowVal = rowFields[fieldIndex][rowIter];
                    // Since the header can span multiple rows, we only want to render it once,
                    // and this occurs when the current row is equal to the start position of the span.
                    if (_.eq(rowIndex, rowPositions[fieldIndex])) {
                        const isSelected = this.isInSelected(fieldIndex, rowIndex, Y_AXIS);
                        // Multiply the row span by the number of data fields if the header is in the y-axis.
                        const auxRowSpan = rowSpan * (dataHeaderInY ? dataFields.length : 1);
                        lst.push(
                          <SelectableCell
                            rowSpan={auxRowSpan}
                            colSpan={1}
                            innerText={rowVal}
                            tag="td"
                            isSelected={isSelected}
                            backgroundColor={COLOR_SCHEME[Y_AXIS][rowIndex % 2]}
                            onClick={event => this.onBucketClick(event, fieldIndex, rowIndex, Y_AXIS)}
                          />);
                    }
                    // As above, we only update the position of the current field when we reach the
                    // end of the current span, so as to not lose auxillary information when doing other
                    // computations.
                    if (_.eq(rowIndex, rowPositions[fieldIndex] + (rowSpan - 1))) {
                        rowPositions[fieldIndex] += rowSpan;
                        rowIters[fieldIndex] += 1;
                    }
                    secondaryKey.push(rowVal);
                    return lst;
                }, []);

                if (dataHeaderInY) {
                    // Iterate through the data fields if the header is in the y-axis.
                    return dataIndices.map((dataIndex, iterIndex) => {
                        // Denotes the index in the column we are processing right now.
                        const colPositions = _.range(colIndices.length).map(() => 0);
                        // Denotes the span index we are processing right now.
                        const colIters = _.range(colIndices.length).map(() => 0);
                        let rowData;
                        if (numXLabels > 0) {
                            /* Handles the case where there are fields in both the x-axis and y-axis. */
                            // Generate the row data for the current data field, by iterating
                            // through each data column.
                            rowData = _.range(_.sum(colSpans[0])).map(colIndex => {
                                const primaryKey = colIters.reduce((lst, colIter, i) => {
                                    lst.push(colFields[i][colIter]);
                                    if (_.eq(colIndex, colPositions[i] + (colSpans[i][colIter] - 1))) {
                                        colPositions[i] += colSpans[i][colIter];
                                        colIters[i] += 1;
                                    }
                                    return lst;
                                }, ['']);
                                const dataValue = this.getCellContents(dataMap, primaryKey,
                                    secondaryKey, dataIndex);

                                const style = { backgroundColor: COLOR_SCHEME.body[rowIndex % 2][colIndex % 2],
                                                textAlign: 'right' };
                                return <td style={style}>{dataValue}</td>;
                            });
                        }
                        else {
                            /* Handles the case where there are fields in only the y-axis. */
                            const dataValue = this.getCellContents(dataMap, [''], secondaryKey, dataIndex);
                            const style = { backgroundColor: COLOR_SCHEME.body[rowIndex % 2][0],
                                            textAlign: 'right' };
                            rowData = <td style={style}>{dataValue}</td>;
                        }
                        return (
                          <tr>
                            {_.eq(iterIndex, 0) ? curHeader : null}
                            {/* The data header label. */}
                            <Field
                              index={iterIndex}
                              moveField={this.moveField}
                              axis={DATA_AXIS}
                              getFieldLength={() => this.state.dataFields.length}
                              field={this.state.dataFields[iterIndex]}
                              backgroundColor={COLOR_SCHEME[Y_AXIS][rowIndex % 2]}
                            />
                            {rowData}
                          </tr>
                        );
                    });
                }
                else {
                    // Denotes the index in the column we are processing right now.
                    const colPositions = _.range(colIndices.length).map(() => 0);
                    // Denotes the span index we are processing right now.
                    const colIters = _.range(colIndices.length).map(() => 0);
                    let rowData;
                    if (numXLabels > 0) {
                        // Generate the data for the current row by iterating through the number
                        // of columns.
                        /* Handles the case where there are fields in both the x-axis and y-axis. */
                        rowData = _.range(_.sum(colSpans[0])).map(colIndex => {
                            let lastColPosition;  
                            const primaryKey = colIters.reduce((lst, colIter, i) => {
                                lst.push(colFields[i][colIter]);
                                lastColPosition = colPositions[i];
                                if (_.eq(colIndex, colPositions[i] + (colSpans[i][colIter] - 1))) {
                                    colPositions[i] += colSpans[i][colIter];
                                    colIters[i] += 1;
                                }
                                return lst;
                            }, ['']);
                            // Iterate through each data field and generate the corresponding value.
                            return _.range(dataFields.length).map(dataFieldIndex => {
                                const dataIndex = dataIndices[dataFieldIndex % dataFields.length];
                                const dataValue = this.getCellContents(dataMap, primaryKey,
                                    secondaryKey, dataIndex);
                                const style = { backgroundColor: COLOR_SCHEME.body[rowIndex % 2][lastColPosition % 2],
                                                textAlign: 'right' };
                                return <td style={style}>{dataValue}</td>;
                            });
                        });
                    }
                    else {
                        /* Handles the case where there are fields in only the y-axis. */
                        rowData = _.range(dataFields.length).map(dataFieldIndex => {
                            const dataIndex = dataIndices[dataFieldIndex % dataFields.length];
                            const dataValue = this.getCellContents(dataMap, [''], secondaryKey, dataIndex);
                            const style = { backgroundColor: COLOR_SCHEME.body[rowIndex % 2][0],
                                            textAlign: 'right' };
                            return <td style={style}>{dataValue}</td>;
                        }); 
                    }
                    return (
                      <tr>
                        {curHeader}
                        {rowData}
                      </tr>
                    );
                }
            });
        }
        else if (dataHeaderInX) {
            /* Empty y-axis, and data header is in x-axis. */
            // Denotes the index in the column we are processing right now.
            const colPositions = _.range(colIndices.length).map(() => 0);
            // Denotes the span index we are processing right now.
            const colIters = _.range(colIndices.length).map(() => 0);
            // Generate the data for the current row by iterating through the number
            // of columns.
            const rowData = _.range(_.sum(colSpans[0])).map(colIndex => {
                let lastColPosition;  
                const primaryKey = colIters.reduce((lst, colIter, i) => {
                    lst.push(colFields[i][colIter]);
                    lastColPosition = colPositions[i];
                    if (_.eq(colIndex, colPositions[i] + (colSpans[i][colIter] - 1))) {
                        colPositions[i] += colSpans[i][colIter];
                        colIters[i] += 1;
                    }
                    return lst;
                }, ['']);
                // Iterate through each data field and generate the corresponding value.
                return _.range(dataFields.length).map(dataFieldIndex => {
                    const dataIndex = dataIndices[dataFieldIndex % dataFields.length];
                    const dataValue = this.getCellContents(dataMap, primaryKey,
                        [''], dataIndex);
                    const style = { backgroundColor: COLOR_SCHEME.body[0][lastColPosition % 2],
                                    textAlign: 'right' };
                    return <td style={style}>{dataValue}</td>;
                });
            });
            bodyData = (
              <tr>
                <td />
                {rowData}
              </tr>
            );
        }
        else {
            /* Empty x-axis, and data header is in y-axis. */
            bodyData = dataIndices.map((dataIndex, iterIndex) => {
                // Denotes the index in the column we are processing right now.
                const colPositions = _.range(colIndices.length).map(() => 0);
                // Denotes the span index we are processing right now.
                const colIters = _.range(colIndices.length).map(() => 0);
                // Generate the row data for the current data field, by iterating
                // through each data column.
                const rowData = _.range(_.sum(colSpans[0])).map(colIndex => {
                    const primaryKey = colIters.reduce((lst, colIter, i) => {
                        lst.push(colFields[i][colIter]);
                        if (_.eq(colIndex, colPositions[i] + (colSpans[i][colIter] - 1))) {
                            colPositions[i] += colSpans[i][colIter];
                            colIters[i] += 1;
                        }
                        return lst;
                    }, ['']);
                    const dataValue = this.getCellContents(dataMap, primaryKey, [''], dataIndex);

                    const style = { backgroundColor: COLOR_SCHEME.body[0][colIndex % 2],
                                    textAlign: 'right' };
                    return <td style={style}>{dataValue}</td>;
                });
                return (
                  <tr>
                    {/* The data header label. */}
                    <Field
                      index={iterIndex}
                      moveField={this.moveField}
                      axis={DATA_AXIS}
                      getFieldLength={() => this.state.dataFields.length}
                      field={this.state.dataFields[iterIndex]}
                      backgroundColor={COLOR_SCHEME[Y_AXIS][0]}
                    />
                    {rowData}
                  </tr>
                );
            });
        }
        return <tbody>{bodyData}</tbody>;
    }

    render() {
        this.updateCache();
        if (!this.state.hasComputedInitialState) {
            this.computeInitialSelectedState();
        }
        const header = this.getTableHeader();
        const body = this.getTableBody();
        return (
          <Table bordered condensed>
            {header}
            {body}
          </Table>
        );
    }
}

export default DragDropContext(HTML5Backend)(PivotTable);

