/**
 * Some helper functions.
 */

const _ = require('lodash');

/**
 * Generates a 3-D hash table.
 * The first key is an array containing the values of column headers.
 * The second key is an array containing the values of row headers.
 * The third key is a number denoting the index of a data field in our application
 * state.
 * The value stored in the hash table is the value of this data field corresponding
 * to the first and second keys.
 * @param {Array} data - The 2-D array of data.
 * @param {Array} columnIndexes - The indexes in the data array of the columns.
 * @param {Array} rowIndexes - The indexes in the data array of the rows.
 * @param {Array} dataIndexes - The indexes in the data array of the data headers.
 */
export function getTableMapping(data, columnIndexes, rowIndexes, dataIndexes) {
    const map = {};
    // Iterate through each row of the data. Note that the each element of the data
    // array is a column.
    _.forIn(_.range(data[0].length), i => {
        const primaryKey = [''];
        const secondaryKey = [''];
        // Generate the primary key by iterating through columns.
        _.forIn(_.range(columnIndexes.length), j => {
            const columnIndex = columnIndexes[j];
            primaryKey.push(data[columnIndex][i]);
        });
        // Generate the secondary key by iterating through rows.
        _.forIn(_.range(rowIndexes.length), j => {
            const rowIndex = rowIndexes[j];
            secondaryKey.push(data[rowIndex][i]);
        });
        if (!(primaryKey in map)) {
            map[primaryKey] = {};
        }
        if (!(secondaryKey in map[primaryKey])) {
            map[primaryKey][secondaryKey] = {};
        }
        // Put the value in the map for every data field.
        _.forIn(_.range(dataIndexes.length), j => {
            const dataIndex = dataIndexes[j];
            map[primaryKey][secondaryKey][dataIndex] = data[dataIndex][i];
        });
    });
    return map;
}

/**
 * Takes in a 2-D array where each element is a array of data for
 * a certain column, and indexes of columns to sort by in lexicographic
 * order, and returns a new sorted copy of the array.
 * @param {Array} data - The 2-D array of data.
 * @param {Array} fieldInfo - The array of {name, order} objects corresponding to fields.
 * @param {Function} fieldToIndex - The function mapping a field to its index.
 */
export function sortDataRows(data, fieldInfo, fieldToIndex) {
    // Transpose the data into a row order array.
    const dataCopy = _.zip.apply(_, data);
    // Sort with a custom compare function.
    dataCopy.sort((a, b) => {
        if (!_.eq(a.length, b.length)) {
            throw new Error(`${a} and ${b} have different lengths.`);
        }
        for (let i = 0; i < fieldInfo.length; i++) {
            // Denotes whether we are sorting by ascending or descending order.
            const multiplier = (fieldInfo[i].order) ? 1 : -1;
            const colIndex = fieldToIndex(fieldInfo[i]);

            // We want strings that are case-insensitive prefixed by 'any_' to appear first in
            // all columns.
            const aIsAny = typeof a[colIndex] === 'string' && a[colIndex].toLowerCase().startsWith('any_');
            const bIsAny = typeof b[colIndex] === 'string' && b[colIndex].toLowerCase().startsWith('any_');
            if (aIsAny && !bIsAny) {
                return -1;
            }
            else if (!aIsAny && bIsAny) {
                return 1;
            }
            if (a[colIndex] < b[colIndex]) {
                return -multiplier;
            }
            else if (a[colIndex] > b[colIndex]) {
                return multiplier;
            }
        }
        return 0;
    });
    return _.unzip(dataCopy);
}

export function addToListInDict(dict, key, item) {
    if (!(key in dict)) {
        dict[key] = [];
    }
    dict[key].push(item);
}

