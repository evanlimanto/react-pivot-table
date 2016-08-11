import React from 'react';
import ReactDOM from 'react-dom';
import { Grid } from 'react-bootstrap';

import { PivotTable } from './app/components';
import { generateData, COLUMNS } from './app/utils';

require('./index.css');

const App = () => (
  <Grid>
    <PivotTable data={generateData()} fieldLabels={COLUMNS} 
        xAxis={[
            {
                name: 'Number',
                order: true
            },
            {
                name: 'Time',
                order: true
            }
        ]}
        yAxis={[
            {
                name: 'Alphabet',
                order: true
            },
            {
                name: 'Name',
                order: true
            }
        ]}
        dataFields={[
            {
                name: 'Float',
                order: true
            }
        ]}
        selected={{}}
    />
  </Grid>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);
