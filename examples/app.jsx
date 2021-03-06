import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Grid, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import multiline from 'multiline';
import Convert from 'ansi-to-html';

import { PivotTable } from '../src/components';

const convert = new Convert;
const _ = require('lodash');

const COLUMNS = ['date', 'Title3', 'Title1', 'Title2', '11', '22'];
const X_AXIS = ['Title1', 'Title2'];
const Y_AXIS = ['date', 'Title3'];
const DATA_FIELDS = ['11', '22'];
const DATA = [['Any Date', 'Any Date', 'Any Date', 'Any Date', 'Any Date', 'Any Date'
, 'Any Date', 'Any Date', 'Any Date', 'Any Date', 'Any Date', 'Any Date'
, 'Any Date', 'Any Date', 'Any Date', 'Any Date', 'Any Date', 'Any Date'
, 'Any Date', 'Any Date', 'Any Date', 'Any Date', 'Any Date', 'Any Date'
, 'Any Date', '20160815', '20160815', '20160815', '20160815', '20160815'
, '20160815', '20160815', '20160815', '20160815', '20160815', '20160815'
, '20160815', '20160815', '20160815', '20160815', '20160815', '20160815'
, '20160815', '20160815', '20160815', '20160815', '20160815', '20160815'
, '20160815', '20160815', '20160816', '20160816', '20160816', '20160816'
, '20160816', '20160816', '20160816', '20160816', '20160816', '20160816'
, '20160816', '20160816', '20160816', '20160816', '20160816', '20160816'
, '20160816', '20160816', '20160816', '20160816', '20160816', '20160816'
, '20160816', '20160816', '20160816', '20160817', '20160817', '20160817'
, '20160817', '20160817', '20160817', '20160817', '20160817', '20160817'
, '20160817', '20160817', '20160817', '20160817', '20160817', '20160817'
, '20160817', '20160817', '20160817', '20160817', '20160817', '20160817'
, '20160817', '20160817', '20160817', '20160817']
, ['M', 'M', 'M', 'M'
, 'M', 'M', 'M', 'M'
, 'M', 'M', 'M', 'N', 'N', 'N', 'N', 'N'
, 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'M', 'M'
, 'M', 'M', 'M', 'M'
, 'M', 'M', 'M', 'M'
, 'M', 'N', 'N', 'N', 'N', 'N', 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'
, 'M', 'M', 'M', 'M'
, 'M', 'M', 'M', 'M'
, 'M', 'M', 'M', 'N', 'N', 'N', 'N', 'N'
, 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'M', 'M'
, 'M', 'M', 'M', 'M'
, 'M', 'M', 'M', 'M'
, 'M', 'N', 'N', 'N', 'N', 'N', 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y']
, ['AA', 'BB', 'BB', 'BB'
, 'CC', 'CC', 'CC', 'CC', 'DD', 'DD', 'DD', 'AA'
, 'AA', 'CC', 'CC', 'DD', 'DD', 'BB'
, 'AA', 'BB', 'CC', 'CC', 'CC', 'DD', 'DD'
, 'AA', 'BB', 'BB', 'BB'
, 'CC', 'CC', 'CC', 'CC', 'DD', 'DD', 'DD', 'AA'
, 'AA', 'CC', 'CC', 'DD', 'DD', 'BB'
, 'AA', 'BB', 'CC', 'CC', 'CC', 'DD', 'DD'
, 'AA', 'BB', 'BB', 'BB'
, 'CC', 'CC', 'CC', 'CC', 'DD', 'DD', 'DD', 'AA'
, 'AA', 'CC', 'CC', 'DD', 'DD', 'BB'
, 'AA', 'BB', 'CC', 'CC', 'CC', 'DD', 'DD'
, 'AA', 'BB', 'BB', 'BB'
, 'CC', 'CC', 'CC', 'CC', 'DD', 'DD', 'DD', 'AA'
, 'AA', 'CC', 'CC', 'DD', 'DD', 'BB'
, 'AA', 'BB', 'CC', 'CC', 'CC', 'DD', 'DD']
, ['A', 'B', 'C', 'D', 'A', 'B', 'C', 'D'
, 'A', 'C', 'D', 'A', 'C', 'A', 'C'
, 'A', 'C', 'A', 'B', 'D', 'A', 'B', 'D'
, 'A', 'D', 'A', 'B', 'C', 'D', 'A', 'B'
, 'C', 'D', 'A', 'C', 'D', 'A', 'C', 'A'
, 'C', 'A', 'C', 'A', 'B', 'D', 'A', 'B'
, 'D', 'A', 'D', 'A', 'B', 'C', 'D', 'A'
, 'B', 'C', 'D', 'A', 'C', 'D', 'A', 'C'
, 'A', 'C', 'A', 'C', 'A', 'B', 'D'
, 'A', 'B', 'D', 'A', 'D', 'A', 'B', 'C'
, 'D', 'A', 'B', 'C', 'D', 'A', 'C', 'D'
, 'A', 'C', 'A', 'C', 'A', 'C', 'A'
, 'B', 'D', 'A', 'B', 'D', 'A', 'D']
, ['1,181.734', '152288', '108.745', '920.701', '623256', '152288', '67.138'
, '403.829', '558.478', '41.606', '516.872', '108.745', '108.745', '67.138'
, '67.138', '41.606', '41.606', '1,072.990', '152288', '920.701', '556.118'
, '152288', '403.829', '516.872', '516.872', '296.548', '35.346', '31.132'
, '230.070', '159.563', '35.346', '20.150', '104.067', '136.985', '10.982'
, '126.003', '31.132', '31.132', '20.150', '20.150', '10.982', '10.982', '265.416'
, '35.346', '230.070', '139.413', '35.346', '104.067', '126.003', '126.003'
, '413.093', '58.015', '40.482', '314.596', '213.804', '58.015', '24.189'
, '131.599', '199290', '16293', '182.997', '40.482', '40.482', '24.189'
, '24.189', '16293', '16293', '372.611', '58.015', '314.596', '189.614'
, '58.015', '131.599', '182.997', '182.997', '472.093', '58.927', '37.130'
, '376.036', '249.890', '58.927', '22.799', '168.164', '222203', '14.331'
, '207.872', '37.130', '37.130', '22.799', '22.799', '14.331', '14.331', '434.963'
, '58.927', '376.036', '227.091', '58.927', '168.164', '207.872', '207.872']
, ['296.903', '22.488', '72.310', '202.105', '197.163', '22.488', '45.642'
, '129.032', '99.740', '26.667', '73.073', '72.310', '72.310', '45.642', '45.642'
, '26.667', '26.667', '224.593', '22.488', '202.105', '151.520', '22.488'
, '129.032', '73.073', '73.073', '75.453', '4.436', '19.725', '51292', '50.550'
, '4.436', '13.122', '32.992', '24.903', '6.603', '18.300', '19.725', '19.725'
, '13.122', '13.122', '6.603', '6.603', '55.728', '4.436', '51292', '37.428'
, '4.436', '32.992', '18.300', '18.300', '98243', '8215', '26.895', '63.132'
, '66.983', '8215', '16.734', '42.033', '31260', '10.161', '21.099', '26.895'
, '26.895', '16.734', '16.734', '10.161', '10.161', '71.347', '8215', '63.132'
, '50249', '8215', '42.033', '21.099', '21.099', '123207', '9.837', '25.689'
, '87.681', '79.629', '9.837', '15.786', '54.007', '43.578', '9.904', '33.674'
, '25.689', '25.689', '15.786', '15.786', '9.904', '9.904', '97.518', '9.837'
, '87.681', '63.844', '9.837', '54.007', '33.674', '33.674']];

const exampleCode =
`import numpy as np

numbers = [1, 2, 3, 4, 5]
names = ['John', 'Gary', 'Mary', 'Jane', 'Max']
prices = [1.00, 2.00, 3.00, 4.00, 5.00]
colors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet']
exchanges = ['NYSE', 'NASDAQ', 'ARCA', 'EDGX', 'IEX']
states = ['New York', 'California', 'Florida', 'Texas', 'Alaska']

n = 20
data = [
    list(np.random.choice(numbers, n, True)),
    list(np.random.choice(names, n, True)),
    list(np.random.choice(prices, n, True)),
    list(np.random.choice(colors, n, True)),
    list(np.random.choice(exchanges, n, True)),
    list(np.random.choice(states, n, True))
];
field_labels = ['numbers', 'names', 'prices', 'colors', 'exchanges', 'states']
x_axis = ['numbers', 'names']
y_axis = ['colors', 'exchanges']
data_fields = ['prices', 'states']

return {'data': data, 'field_labels': field_labels, 'x_axis': x_axis, 'y_axis': y_axis, 'data_fields': data_fields}
`;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.updateState = this.updateState.bind(this);
        this.state = {
            dict: {},
            data: DATA,
            fieldLabels: COLUMNS,
            xAxis: X_AXIS,
            yAxis: Y_AXIS,
            dataFields: DATA_FIELDS,
            selectCallback: this.updateState,
            selected: {},
            errorText: ''
        };
    }

    updateState(dict) {
        const dictCopy = _.cloneDeep(dict);
        this.setState({ dict: dictCopy });
    }

    render() {
        const dictStr = Object.keys(this.state.dict).map(key => {
            const value = _.join(this.state.dict[key]);
            return <p>"<b>{key}</b>" : {value}</p>;
        });
        const { data, fieldLabels, xAxis, yAxis, dataFields, selected } = this.state;
        const pivotTable = (
            <PivotTable
                data={data}
                fieldLabels={fieldLabels}
                xAxis={xAxis}
                yAxis={yAxis}
                dataFields={dataFields}
                selectCallback={this.updateState}
                selected={selected}
                shouldUpdateState={this.shouldUpdateState}
                sortOrder={data}
            />
        );
        this.shouldUpdateState = false;
        return (
          <Grid>
            <h2>React PivotTable</h2>
            {pivotTable}
            <p className="lead">Selected Items:</p>
            {dictStr.length ? dictStr : 'None.'}<br/><br/>
          </Grid>
        );
    }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

