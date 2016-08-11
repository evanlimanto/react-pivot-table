const _ = require('lodash');

/**
 * Generates a 2-D hash table where the first key is the values of
 * the column headers, the second key is the values of row headers and
 * the value is an entry in a certain column;
 * @param {Array} data
 * @param {Array} columnIndexes
 * @param {Array} rowIndexes
 * @param {Array} dataIndexes
 */
export function getTableMapping(data, columnIndexes, rowIndexes, dataIndexes) {
    const map = {};
    _.forIn(_.range(data[0].length), i => {
        const primaryKey = [''];
        const secondaryKey = [''];
        _.forIn(_.range(columnIndexes.length), j => {
            const columnIndex = columnIndexes[j];
            primaryKey.push(data[columnIndex][i]);
        });
        _.forIn(_.range(rowIndexes.length), j => {
            const rowIndex = rowIndexes[j];
            secondaryKey.push(data[rowIndex][i]);
        });
        if (!_.has(map, primaryKey)) {
            map[primaryKey] = {};
        }
        if (!_.has(map[primaryKey], secondaryKey)) {
            map[primaryKey][secondaryKey] = [];
        }
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
 * @param {Array} data
 * @param {Array} fieldInfo
 * @param {Array} fieldToIndex
 */
export function sortDataRows(data, fieldInfo, fieldToIndex) {
    const dataCopy = _.zip.apply(_, data);
    dataCopy.sort((a, b) => {
        if (!_.eq(a.length, b.length)) {
            throw new Error(`${a} and ${b} have different lengths.`);
        }
        for (let i = 0; i < fieldInfo.length; i++) {
            const multiplier = (fieldInfo[i].order) ? 1 : -1;
            const colIndex = fieldToIndex[fieldInfo[i].name];
            if (typeof a[colIndex] === 'string' && a[colIndex].toLowerCase().startsWith('any_')) {
                return -1;
            }
            else if (typeof b[colIndex] === 'string' && b[colIndex].toLowerCase().startsWith('any_')) {
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

/**
 * Testing functionality.
 */
export const COLUMNS = ['Alphabet', 'Number', 'Name', 'Float', 'Time'];
const ALPHABET = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const NAMES = ['JOHN', 'MAX', 'DANIEL', 'STEVEN', 'MARY', 'JANE', 'SOPHIE'];
const FLOATS = ['100.0', '250.0', '300.0', '1000.0', '1250.0'];
const TIMES = ['01:00', '02:00', '05:00', '14:00', '20:00'];

export function generateData(numElements = 10) {
    return [
        _.concat(_.range(numElements).map(() => _.sample(ALPHABET, numElements)), ['ANY_ALPHA']),
        _.concat(_.range(numElements).map(() => _.sample(NUMBERS, numElements)), ['ANY_NUMBER']),
        _.concat(_.range(numElements).map(() => _.sample(NAMES, numElements)), ['ANY_NAME']),
        _.concat(_.range(numElements).map(() => _.sample(FLOATS, numElements)), ['ANY_FLOAT']),
        _.concat(_.range(numElements).map(() => _.sample(TIMES, numElements)), ['ANY_TIME'])
    ];
}

