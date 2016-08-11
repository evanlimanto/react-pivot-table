/**
 * Web component for the deshaw.util.pivot_table python module.
 * 
 * Author: limanto
 */

import React, { PropTypes } from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { Button, Table } from 'react-bootstrap';
import { DragDropContext } from 'react-dnd';

import { sortDataRows, getTableMapping } from '../utils';
import { Card, SelectableCell, ToggleableChevron } from '../components';

const _ = require('lodash');

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
     * @param {array} xAxis - The list of column headers, containing
                              {name: 'name', order: true} like dictionaries.
     * @param {array} yAxis - Same as xAxis, but for row headers.
     * @param {array} dataFields - Same as xAxis, but for data fields.
     */
    constructor(props) {
        super(props);

        const xAxis = _.cloneDeep(this.props.xAxis);
        const yAxis = _.cloneDeep(this.props.yAxis);
        const dataFields = _.cloneDeep(this.props.dataFields);
        const allFields = _.concat(xAxis, yAxis, dataFields);
        const selected = {};
        const dataHeaderCol = 0;

        this.state = {
            allFields,
            xAxis,
            yAxis,
            dataFields,
            selected,
            dataHeaderCol
        };

        this.render = this.render.bind(this);
        this.moveCard = this.moveCard.bind(this);
        this.getSpans = this.getSpans.bind(this);
        this.flipData = this.flipData.bind(this);
        this.updateCache = this.updateCache.bind(this);
        this.fieldToIndex = this.fieldToIndex.bind(this);
        this.getTableBody = this.getTableBody.bind(this);
        this.invertOrder = this.invertOrder.bind(this);
        this.isInSelected = this.isInSelected.bind(this);
        this.onBucketClick = this.onBucketClick.bind(this);
        this.equalizeFields = this.equalizeFields.bind(this);
        this.getSpansHelper = this.getSpansHelper.bind(this);
        this.removeSelected = this.removeSelected.bind(this);
        this.getTableHeader = this.getTableHeader.bind(this);
        this.getFieldToIndex = this.getFieldToIndex.bind(this);
        this.hasParentSelected = this.hasParentSelected.bind(this);
    }

    /**
     * The callback function called when a column/row header is dragged
     * over another header.
     * @param {number} startCol - Initial column (0: xAxis, 1: yAxis).
     * @param {number} endCol - End column (0: xAxis, 1: yAxis).
     * @param {number} dragIndex - Initial position in header list.
     * @param {number} hoverIndex - End position in header list.
     */
    moveCard(startCol, endCol, dragIndex, hoverIndex) {
        if (_.eq(startCol, endCol) && _.eq(dragIndex, hoverIndex)) {
            return;
        }
        const cardList = [
            _.cloneDeep(this.state.xAxis),
            _.cloneDeep(this.state.yAxis),
            _.cloneDeep(this.state.dataFields),
        ];
        const dragCard = cardList[startCol][dragIndex];

        cardList[startCol].splice(dragIndex, 1);
        cardList[endCol].splice(hoverIndex, 0, dragCard);

        this.setState({
            xAxis: cardList[0],
            yAxis: cardList[1],
            dataFields: cardList[2],
            selected: {}
        });
    }

    /**
     * The callback function called when a chevron triggering the inverting
     * of a column/row order is clicked.
     * @param {object} field - A {name, order} object.
     */
    invertOrder(field) {
        const xAxis = _.cloneDeep(this.state.xAxis);
        const yAxis = _.cloneDeep(this.state.yAxis);
        const dataFields = this.state.dataFields;
        _.forIn(_.range(xAxis.length), index => {
            if (_.eq(xAxis[index].name, field.name)) {
                xAxis[index].order = !xAxis[index].order;
            }
        });
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
     */
    getSpansHelper(data, fieldIndexes, spans, fields, colIndex, rowLeftIndex, rowRightIndex) {
        if (_.eq(colIndex, fieldIndexes.length) || _.gt(rowLeftIndex, rowRightIndex)) {
            return 1;
        }
        const currentCol = data[fieldIndexes[colIndex]];
        let counter = 0;
        let prevIndex = rowLeftIndex;
        let index = rowLeftIndex + 1;
        while (index <= rowRightIndex + 1) {
            if (_.eq(index, rowRightIndex + 1) || currentCol[index] !== currentCol[index - 1]) {
                const width = this.getSpansHelper(data, fieldIndexes, spans, fields, colIndex + 1,
                                                  prevIndex, index - 1);
                counter += width;
                fields[colIndex].push(currentCol[prevIndex]);
                spans[colIndex].push(width);
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
     * @param {array} fieldIndexes - The array of indexes for which to calculate spans.
     */
    getSpans(data, fieldIndexes) {
        const spans = _.range(fieldIndexes.length).reduce(lst => {
            lst.push([]);
            return lst;
        }, []);
        const fields = _.range(fieldIndexes.length).reduce(lst => {
            lst.push([]);
            return lst;
        }, []);
        this.getSpansHelper(data, fieldIndexes, spans, fields, 0, 0, data[0].length - 1);
        return [spans, fields];
    }

    /**
     * Checks if a single cell is selected.
     * @param {number} fieldIndex - The index of the y-axis headers.
     * @param {number} itemIndex - The row index.
     */
    isInSelected(fieldIndex, itemIndex) {
        const rowSpans = this.cache.rowSpans;
        const curSelected = this.state.selected;
        if (!_.has(curSelected, fieldIndex)) {
            return false;
        }

        let fieldIter = 0;
        const retval = _.some(rowSpans[fieldIndex], rowSpan => {
            const endFieldIter = fieldIter + rowSpan;
            if (_.inRange(itemIndex, fieldIter, endFieldIter)) {
                if (_.some(_.range(fieldIter, endFieldIter), j => curSelected[fieldIndex].has(j))) {
                    return true;
                }
            }
            fieldIter = endFieldIter;
            return false;
        });
        return retval;
    }

    /**
     * Checks if a single cell has its direct or indirect parent (horizontally left) selected.
     * @param {number} fieldIndex - The index of the y-axis headers.
     * @param {number} itemIndex - The row index.
     */
    hasParentSelected(fieldIndex, itemIndex) {
        const rowSpans = this.cache.rowSpans;
        const curSelected = this.state.selected;
        if (_.eq(fieldIndex, 0)) {
            return false;
        }

        let fieldIter = 0;
        const retval = _.some(rowSpans[fieldIndex - 1], rowSpan => {
            const endFieldIter = fieldIter + rowSpan;
            if (_.inRange(itemIndex, fieldIter, endFieldIter)) {
                if (_.some(_.range(fieldIter, endFieldIter),
                           j => curSelected[fieldIndex - 1].has(j))) {
                    return true;
                }
            }
            fieldIter = endFieldIter;
            return false;
        });
        return retval || this.hasParentSelected(fieldIndex - 1, itemIndex);
    }

    /**
     * Unselected a selected cell.
     * @param {boolean} removeUpstream - removes the selection up repeatedly until
                                         the current field only has a single item selected.
     */
    removeSelected(fieldIndex, itemIndex, removeUpstream = false) {
        const rowSpans = this.cache.rowSpans;
        const curSelected = this.state.selected;
        if (!_.has(curSelected, fieldIndex)) {
            return;
        }

        let itemCount = 0;
        let fieldIter = 0;
        _.forIn(rowSpans[fieldIndex], rowSpan => {
            const endFieldIter = fieldIter + rowSpan;
            if (_.some(_.range(fieldIter, endFieldIter), j => curSelected[fieldIndex].has(j))) {
                itemCount++;
            }
            fieldIter = endFieldIter;
        });

        if (removeUpstream && _.eq(itemCount, 1)) {
            return;
        }

        fieldIter = 0;
        _.forIn(rowSpans[fieldIndex], rowSpan => {
            const endFieldIter = fieldIter + rowSpan;
            if (_.inRange(itemIndex, fieldIter, endFieldIter)) {
                for (let j = fieldIter; j < endFieldIter; j++) {
                    if (curSelected[fieldIndex].has(j)) {
                        curSelected[fieldIndex].delete(j);
                        if (_.eq(curSelected[fieldIndex].size, 0)) {
                            delete curSelected[fieldIndex];
                            break;
                        }
                        if (removeUpstream) {
                            this.removeSelected(fieldIndex - 1, itemIndex, removeUpstream);
                        }
                        else {
                            this.removeSelected(fieldIndex + 1, j);
                        }
                    }
                }
            }
            fieldIter = endFieldIter;
        });
    }

    /**
     * Callback function triggered when a cell is clicked.
     */
    onBucketClick(event, fieldIndex, itemIndex) {
        const curSelected = this.state.selected;

        let newSelected = {};
        const maxFieldRow = parseInt(_.max(_.keys(curSelected)) || -1, 10);
        if (event.ctrlKey && (_.eq(_.size(curSelected), 0) ||
                             (_.eq(maxFieldRow, fieldIndex) && this.hasParentSelected(fieldIndex, itemIndex)))) {
            newSelected = curSelected;
            if (this.isInSelected(fieldIndex, itemIndex)) {
                const removeUpstream = _.gt(_.size(curSelected), 0) && _.gt(_.size(curSelected[maxFieldRow]), 1);
                this.removeSelected(fieldIndex, itemIndex, removeUpstream);
            }
            else {
                _.forIn(_.range(fieldIndex + 1), i => {
                    if (!_.has(newSelected, i)) {
                        newSelected[i] = new Set();
                    }
                    newSelected[i].add(itemIndex);
                });
            }
        }
        else {
            _.forIn(_.range(fieldIndex + 1), i => {
                if (!_.has(newSelected, i)) {
                    newSelected[i] = new Set();
                }
                newSelected[i].add(itemIndex);
            });
        }

        this.setState({
            selected: newSelected
        });
    }

    /**
     * Computes the table header.
     */
    getTableHeader() {
        const numXLabels = this.state.xAxis.length;
        const numYLabels = this.state.yAxis.length;
        const dataFields = this.state.dataFields;
        const { colSpans, colFields, dataHeaderInX, dataHeaderInY } = this.cache;
        let auxTableHeader = '';
        let dataFieldsHeader = '';
        if (_.gt(numYLabels, 0)) {
            if (_.gt(numXLabels, 0)) {
                auxTableHeader = <th colSpan="1" />;
            }
            else if (dataHeaderInY) {
                auxTableHeader = <th colSpan="2" />;
            }
        }
        if (dataHeaderInX) {
            if (_.gt(colFields.length, 0)) {
                dataFieldsHeader = _.range(_.last(colFields).length * dataFields.length).map(dataHeaderIndex => {
                    const dataField = dataFields[dataHeaderIndex % dataFields.length];
                    return (
                      <th key={dataHeaderIndex}>
                        {dataField.name}
                      </th>
                    );
                });
                if (_.eq(numYLabels, 0)) {
                    dataFieldsHeader.splice(0, 0, <th />);
                }
            }
            else {
                dataFieldsHeader = dataFields.map((dataField, key) => (
                  <th key={key}>
                    {dataField.name}
                  </th>
                ));
            }
        }
        return (
          <thead>
            {_.range(numXLabels).map(fieldIndex => {
                const curField = _.range(colFields[fieldIndex].length).map(itemIndex => {
                    let colSpan = colSpans[fieldIndex][itemIndex];
                    const rowSpan = (_.eq(fieldIndex, colFields.length - 1) &&
                                     !dataHeaderInX) ? 2 : 1;
                    const colValue = colFields[fieldIndex][itemIndex];
                    if (dataHeaderInX) {
                        colSpan *= dataFields.length;
                    }
                    return (
                      <SelectableCell
                        key={itemIndex}
                        colSpan={colSpan}
                        rowSpan={rowSpan}
                        tag="th"
                        innerText={colValue}
                      />);
                });
                const chevron = (
                  <ToggleableChevron
                    axis="x"
                    field={this.state.xAxis[fieldIndex]}
                    invertOrder={this.invertOrder}
                  />
                );
                return (
                  <tr key={fieldIndex}>
                    {(_.eq(fieldIndex, 0) && _.gt(numYLabels, 0)) ?
                      <th colSpan={numYLabels} rowSpan={numXLabels} /> : null }
                      <Card
                        key={fieldIndex}
                        index={fieldIndex}
                        text={this.state.xAxis[fieldIndex].name}
                        moveCard={this.moveCard}
                        col={0}
                        tag="th"
                        chevron={chevron}
                      />
                    {curField}
                  </tr>
                );
            })}
            <tr>
              {this.state.yAxis.map((field, fieldIndex) => {
                  const chevron = (
                    <ToggleableChevron
                      axis="y"
                      field={field}
                      invertOrder={this.invertOrder}
                    />
                  );
                  return (
                    <Card
                      key={fieldIndex}
                      index={fieldIndex}
                      text={field.name}
                      moveCard={this.moveCard}
                      col={1}
                      tag="th"
                      chevron={chevron}
                    />
                  );
              })}
              {auxTableHeader}
              {dataFieldsHeader}
            </tr>
          </thead>
        );
    }

    /**
     * Helper function to compute the data value that goes into a cell given
     * the row, column and data keys.
     */
    accessDataMapping(dataMap, primaryKey, secondaryKey, tertiaryKey) {
        if (primaryKey in dataMap && secondaryKey in dataMap[primaryKey]) {
            return dataMap[primaryKey][secondaryKey][tertiaryKey];
        }
        return '';
    }

    /**
     * Computes the table body.
     */
    getTableBody() {
        const { colIndexes, rowIndexes, dataIndexes, rowSpans, rowFields,
                colSpans, colFields, dataHeaderInY, dataHeaderInX } = this.cache;
        const curSelected = this.state.selected;
        const dataFields = this.state.dataFields;
        const numXLabels = this.state.xAxis.length;
        const numYLabels = this.state.yAxis.length;
        const numDataFields = this.state.dataFields.length;
        const rowIters = _.range(rowIndexes.length).map(() => 0);
        const rowPositions = _.range(rowIndexes.length).map(() => 0);
        const dataMap = getTableMapping(this.props.data, colIndexes, rowIndexes, dataIndexes);

        let bodyData = '';
        if (_.gt(numYLabels, 0)) {
            bodyData = _.range(_.sum(rowSpans[0])).map(rowIndex => {
                const secondaryKey = [''];
                const curHeader = _.range(numYLabels).reduce((lst, fieldIndex) => {
                    fieldIndex = parseInt(fieldIndex, 10);
                    const rowIter = rowIters[fieldIndex];
                    const rowSpan = rowSpans[fieldIndex][rowIter];
                    const rowVal = rowFields[fieldIndex][rowIter];
                    if (_.eq(rowIndex, rowPositions[fieldIndex])) {
                        let isSelected = false;
                        const endRowIndex = rowIndex + rowSpan;
                        isSelected = _.has(curSelected, fieldIndex) &&
                                     _.some(_.range(rowIndex, endRowIndex),
                                            i => curSelected[fieldIndex].has(i));

                        let auxRowSpan = rowSpan * (dataHeaderInY ? dataFields.length : 1);
                        lst.push(
                          <SelectableCell
                            key={fieldIndex}
                            rowSpan={auxRowSpan}
                            colSpan={1}
                            innerText={rowVal}
                            tag="td"
                            isSelected={isSelected}
                            onClick={event => this.onBucketClick(event, fieldIndex, rowIndex)}
                          />);
                    }
                    if (_.eq(rowIndex, rowPositions[fieldIndex] + (rowSpan - 1))) {
                        rowPositions[fieldIndex] += rowSpan;
                        rowIters[fieldIndex] += 1;
                    }
                    secondaryKey.push(rowVal);
                    return lst;
                }, []);

                let rowData = '';
                let chunkData = '';
                const colPositions = _.range(colIndexes.length).map(() => 0);
                const colIters = _.range(colIndexes.length).map(() => 0);
                if (dataHeaderInY) {
                    chunkData = dataIndexes.map((dataIndex, iterIndex) => {
                        if (_.gt(numXLabels, 0)) {
                            rowData = _.range(_.sum(colSpans[0])).map(colIndex => {
                                const primaryKey = colIters.reduce((lst, colIter, i) => {
                                    lst.push(colFields[i][colIter]);
                                    if (_.eq(colIndex, colPositions[i] + (colSpans[i][colIter] - 1))) {
                                        colPositions[i] += colSpans[i][colIter];
                                        colIters[i] += 1;
                                    }
                                    return lst;
                                }, ['']);
                                const dataStr = this.accessDataMapping(dataMap, primaryKey,
                                                                       secondaryKey, dataIndex);
                                return <td key={colIndex}>{dataStr}</td>;
                            });
                        }
                        else {
                            const dataValue = dataMap[['']][secondaryKey][dataIndex];
                            rowData = <td key={0}>{dataValue}</td>;
                        }
                        return (
                          <tr key={iterIndex}>
                            {_.eq(iterIndex, 0) ? curHeader : null}
                            {dataHeaderInY ? (<td><b>{dataFields[iterIndex].name}</b></td>) : <td />}
                            {rowData}
                          </tr>
                        );
                    });
                }
                else {
                    if (_.gt(numXLabels, 0)) {
                        rowData = _.range(_.sum(colSpans[0])).map(colIndex => {
                            const primaryKey = colIters.reduce((lst, colIter, i) => {
                                lst.push(colFields[i][colIter]);
                                if (_.eq(colIndex, colPositions[i] + (colSpans[i][colIter] - 1))) {
                                    colPositions[i] += colSpans[i][colIter];
                                    colIters[i] += 1;
                                }
                                return lst;
                            }, ['']);
                            return _.range(dataFields.length).map(dataFieldIndex => {
                                const dataIndex = dataIndexes[dataFieldIndex % dataFields.length];
                                let dataStr = this.accessDataMapping(dataMap, primaryKey,
                                                                     secondaryKey, dataIndex);
                                return <td key={_.join(colIndex, dataFieldIndex)}>{dataStr}</td>;
                            });
                        });
                        rowData.splice(0, 0, <td />);
                    }
                    else {
                        rowData = _.range(dataFields.length).map(colIndex => {
                            const dataIndex = dataIndexes[colIndex];
                            let dataStr = this.accessDataMapping(dataMap, [''],
                                                                 secondaryKey, dataIndex);
                            return <td key={colIndex}>{dataStr}</td>;
                        });
                    }
                    chunkData = (
                      <tr key={rowIndex}>
                        {curHeader}
                        {rowData}
                      </tr>
                    );
                }
                return chunkData;
            });
        }
        else if (dataHeaderInX) {
            const colPositions = _.range(colIndexes.length).map(() => 0);
            const colIters = _.range(colIndexes.length).map(() => 0);
            const secondaryKey = [''];
            const rowData = _.range(_.sum(colSpans[0])).map(colIndex => {
                const primaryKey = colIters.reduce((lst, colIter, i) => {
                    lst.push(colFields[i][colIter]);
                    if (_.eq(colIndex, colPositions[i] + (colSpans[i][colIter] - 1))) {
                        colPositions[i] += colSpans[i][colIter];
                        colIters[i] += 1;
                    }
                    return lst;
                }, ['']);
                return _.range(dataFields.length).map(dataFieldIndex => {
                    const dataIndex = dataIndexes[dataFieldIndex % dataFields.length];
                    let dataStr = this.accessDataMapping(dataMap, primaryKey,
                                                         secondaryKey, dataIndex);
                    return <td key={_.join(colIndex, dataFieldIndex)}>{dataStr}</td>;
                });
            });
            bodyData = <tr><td />{rowData}</tr>;
        }
        else {
            bodyData = _.range(numDataFields).map(iterIndex => {
                const dataIndex = dataIndexes[iterIndex];
                const colPositions = _.range(colIndexes.length).map(() => 0);
                const colIters = _.range(colIndexes.length).map(() => 0);
                const secondaryKey = [''];
                const rowData = _.range(_.sum(colSpans[0])).map(colIndex => {
                    const primaryKey = colIters.reduce((lst, colIter, i) => {
                        lst.push(colFields[i][colIter]);
                        if (_.eq(colIndex, colPositions[i] + (colSpans[i][colIter] - 1))) {
                            colPositions[i] += colSpans[i][colIter];
                            colIters[i] += 1;
                        }
                        return lst;
                    }, ['']);
                    let dataStr = this.accessDataMapping(dataMap, primaryKey,
                                                         secondaryKey, dataIndex);
                    return <td key={colIndex}>{dataStr}</td>;
                });

                let curRowHeader = (
                  <td>
                    <b>{dataFields[iterIndex].name}</b>
                    <ToggleableChevron
                      axis="x"
                      field={dataFields[iterIndex]}
                      invertOrder={this.invertOrder}
                    />
                  </td>
                );

                return (
                  <tr key={iterIndex}>
                    {curRowHeader}
                    {rowData}
                  </tr>
                );
            });
        }
        return <tbody>{bodyData}</tbody>;
    }

    fieldToIndex(field) {
        return this.props.fieldLabels.indexOf(field.name);
    }

    /**
     * Returns a dictionary mapping a field name to its index.
     */
    getFieldToIndex() {
        const fieldLabels = this.props.fieldLabels;
        return fieldLabels.reduce((dict, item, index) => {
            dict[item] = index;
            return dict;
        }, {});
    }

    /**
     * Updates some auxillary information the cache. Called everytime this.render()
     * is called.
     */
    updateCache() {
        const colIndexes = this.state.xAxis.map(field => this.fieldToIndex(field));
        const rowIndexes = this.state.yAxis.map(field => this.fieldToIndex(field));
        const dataIndexes = this.state.dataFields.map(field => this.fieldToIndex(field));
        const dataByColOrder = sortDataRows(this.props.data, this.state.xAxis,
                                            this.getFieldToIndex());
        const dataByRowOrder = sortDataRows(this.props.data, this.state.yAxis,
                                            this.getFieldToIndex());
        const [colSpans, colFields] = this.getSpans(dataByColOrder, colIndexes);
        const [rowSpans, rowFields] = this.getSpans(dataByRowOrder, rowIndexes);

        const dataHeaderInX = _.eq(this.state.dataHeaderCol, 0);
        const dataHeaderInY = _.eq(this.state.dataHeaderCol, 1);
        const cacheData = {
            colIndexes,
            rowIndexes,
            dataByColOrder,
            colSpans,
            colFields,
            dataByRowOrder,
            rowSpans,
            rowFields,
            dataIndexes,
            dataHeaderInX,
            dataHeaderInY
        };

        this.cache = cacheData;
    }

    getTable() {
        if (_.eq(this.state.dataFields.length, 0)) {
            return <h2 style={{ textAlign: 'center' }}>No Data Columns</h2>;
        }

        const header = this.getTableHeader();
        const body = this.getTableBody();
        return (
          <Table bordered condensed striped>
            {header}
            {body}
          </Table>
        );
    }

    /**
     * Callback function triggered to "un-zero" an axis length by moving
     * a single field from one axis to the other.
     */
    equalizeFields() {
        const xAxis = this.state.xAxis;
        const yAxis = this.state.yAxis;
        if (_.eq(xAxis.length, 0) && _.gt(yAxis.length, 1)) {
            xAxis.splice(xAxis.length - 1, 0, _.last(yAxis));
            yAxis.splice(yAxis.length - 1, 1);
        }
        else if (_.eq(yAxis.length, 0) && _.gt(xAxis.length, 1)) {
            yAxis.splice(yAxis.length - 1, 0, _.last(xAxis));
            xAxis.splice(xAxis.length - 1, 1);
        }
        this.setState({
            xAxis,
            yAxis
        });
    }

    /**
     * Moves the data header from the x-axis to the y-axis or vice versa.
     */
    flipData() {
        const dataHeaderCol = 1 - this.state.dataHeaderCol;
        this.setState({
            dataHeaderCol
        });
    }

    render() {
        this.updateCache();
        const pivotTable = this.getTable();
        return (
          <div>
            <Button bsStyle="info" onClick={() => this.equalizeFields()}>Equalize</Button>
            <Button bsStyle="success" onClick={() => this.flipData()} style={{ marginLeft: '5px' }}>
                Flip Data Column
            </Button>
            {pivotTable}
          </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(PivotTable);

