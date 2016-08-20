import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Grid } from 'react-bootstrap';

import { PivotTable } from '../src/components';

const useRealData = false;

const _ = require('lodash');

const COLUMNS = ['date', 'z_is_latte', 'z_exchange', 'z_site', 'z_dolord', 'z_doldon'];
const X_AXIS = ['z_exchange', 'z_site'];
const Y_AXIS = ['date', 'z_is_latte'];
const DATA_FIELDS = ['z_dolord', 'z_doldon'];
const DATA = [['Any_date', 'Any_date', 'Any_date', 'Any_date', 'Any_date', 'Any_date'
, 'Any_date', 'Any_date', 'Any_date', 'Any_date', 'Any_date', 'Any_date'
, 'Any_date', 'Any_date', 'Any_date', 'Any_date', 'Any_date', 'Any_date'
, 'Any_date', 'Any_date', 'Any_date', 'Any_date', 'Any_date', 'Any_date'
, 'Any_date', '.20160815', '.20160815', '.20160815', '.20160815', '.20160815'
, '.20160815', '.20160815', '.20160815', '.20160815', '.20160815', '.20160815'
, '.20160815', '.20160815', '.20160815', '.20160815', '.20160815', '.20160815'
, '.20160815', '.20160815', '.20160815', '.20160815', '.20160815', '.20160815'
, '.20160815', '.20160815', '.20160816', '.20160816', '.20160816', '.20160816'
, '.20160816', '.20160816', '.20160816', '.20160816', '.20160816', '.20160816'
, '.20160816', '.20160816', '.20160816', '.20160816', '.20160816', '.20160816'
, '.20160816', '.20160816', '.20160816', '.20160816', '.20160816', '.20160816'
, '.20160816', '.20160816', '.20160816', '.20160817', '.20160817', '.20160817'
, '.20160817', '.20160817', '.20160817', '.20160817', '.20160817', '.20160817'
, '.20160817', '.20160817', '.20160817', '.20160817', '.20160817', '.20160817'
, '.20160817', '.20160817', '.20160817', '.20160817', '.20160817', '.20160817'
, '.20160817', '.20160817', '.20160817', '.20160817']
, ['Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'N', 'N', 'N', 'N', 'N'
, 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'N', 'N', 'N', 'N', 'N', 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'N', 'N', 'N', 'N', 'N'
, 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte', 'Any_z_is_latte'
, 'Any_z_is_latte', 'N', 'N', 'N', 'N', 'N', 'N', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y']
, ['Any_z_exchange', 'Any_z_exchange', 'Any_z_exchange', 'Any_z_exchange'
, 'CHI_X', 'CHI_X', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.', 'U.K.', 'Any_z_exchange'
, 'Any_z_exchange', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.', 'Any_z_exchange'
, 'Any_z_exchange', 'Any_z_exchange', 'CHI_X', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.'
, 'Any_z_exchange', 'Any_z_exchange', 'Any_z_exchange', 'Any_z_exchange'
, 'CHI_X', 'CHI_X', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.', 'U.K.', 'Any_z_exchange'
, 'Any_z_exchange', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.', 'Any_z_exchange'
, 'Any_z_exchange', 'Any_z_exchange', 'CHI_X', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.'
, 'Any_z_exchange', 'Any_z_exchange', 'Any_z_exchange', 'Any_z_exchange'
, 'CHI_X', 'CHI_X', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.', 'U.K.', 'Any_z_exchange'
, 'Any_z_exchange', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.', 'Any_z_exchange'
, 'Any_z_exchange', 'Any_z_exchange', 'CHI_X', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.'
, 'Any_z_exchange', 'Any_z_exchange', 'Any_z_exchange', 'Any_z_exchange'
, 'CHI_X', 'CHI_X', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.', 'U.K.', 'Any_z_exchange'
, 'Any_z_exchange', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.', 'Any_z_exchange'
, 'Any_z_exchange', 'Any_z_exchange', 'CHI_X', 'CHI_X', 'CHI_X', 'U.K.', 'U.K.']
, ['Any_z_site', 'fra', 'guas', 'ld4', 'Any_z_site', 'fra', 'guas', 'ld4'
, 'Any_z_site', 'guas', 'ld4', 'Any_z_site', 'guas', 'Any_z_site', 'guas'
, 'Any_z_site', 'guas', 'Any_z_site', 'fra', 'ld4', 'Any_z_site', 'fra', 'ld4'
, 'Any_z_site', 'ld4', 'Any_z_site', 'fra', 'guas', 'ld4', 'Any_z_site', 'fra'
, 'guas', 'ld4', 'Any_z_site', 'guas', 'ld4', 'Any_z_site', 'guas', 'Any_z_site'
, 'guas', 'Any_z_site', 'guas', 'Any_z_site', 'fra', 'ld4', 'Any_z_site', 'fra'
, 'ld4', 'Any_z_site', 'ld4', 'Any_z_site', 'fra', 'guas', 'ld4', 'Any_z_site'
, 'fra', 'guas', 'ld4', 'Any_z_site', 'guas', 'ld4', 'Any_z_site', 'guas'
, 'Any_z_site', 'guas', 'Any_z_site', 'guas', 'Any_z_site', 'fra', 'ld4'
, 'Any_z_site', 'fra', 'ld4', 'Any_z_site', 'ld4', 'Any_z_site', 'fra', 'guas'
, 'ld4', 'Any_z_site', 'fra', 'guas', 'ld4', 'Any_z_site', 'guas', 'ld4'
, 'Any_z_site', 'guas', 'Any_z_site', 'guas', 'Any_z_site', 'guas', 'Any_z_site'
, 'fra', 'ld4', 'Any_z_site', 'fra', 'ld4', 'Any_z_site', 'ld4']
, ['1,181.734', '152.288', '108.745', '920.701', '623.256', '152.288', '67.138'
, '403.829', '558.478', '41.606', '516.872', '108.745', '108.745', '67.138'
, '67.138', '41.606', '41.606', '1,072.990', '152.288', '920.701', '556.118'
, '152.288', '403.829', '516.872', '516.872', '296.548', '35.346', '31.132'
, '230.070', '159.563', '35.346', '20.150', '104.067', '136.985', '10.982'
, '126.003', '31.132', '31.132', '20.150', '20.150', '10.982', '10.982', '265.416'
, '35.346', '230.070', '139.413', '35.346', '104.067', '126.003', '126.003'
, '413.093', '58.015', '40.482', '314.596', '213.804', '58.015', '24.189'
, '131.599', '199.290', '16.293', '182.997', '40.482', '40.482', '24.189'
, '24.189', '16.293', '16.293', '372.611', '58.015', '314.596', '189.614'
, '58.015', '131.599', '182.997', '182.997', '472.093', '58.927', '37.130'
, '376.036', '249.890', '58.927', '22.799', '168.164', '222.203', '14.331'
, '207.872', '37.130', '37.130', '22.799', '22.799', '14.331', '14.331', '434.963'
, '58.927', '376.036', '227.091', '58.927', '168.164', '207.872', '207.872']
, ['296.903', '22.488', '72.310', '202.105', '197.163', '22.488', '45.642'
, '129.032', '99.740', '26.667', '73.073', '72.310', '72.310', '45.642', '45.642'
, '26.667', '26.667', '224.593', '22.488', '202.105', '151.520', '22.488'
, '129.032', '73.073', '73.073', '75.453', '4.436', '19.725', '51.292', '50.550'
, '4.436', '13.122', '32.992', '24.903', '6.603', '18.300', '19.725', '19.725'
, '13.122', '13.122', '6.603', '6.603', '55.728', '4.436', '51.292', '37.428'
, '4.436', '32.992', '18.300', '18.300', '98.243', '8.215', '26.895', '63.132'
, '66.983', '8.215', '16.734', '42.033', '31.260', '10.161', '21.099', '26.895'
, '26.895', '16.734', '16.734', '10.161', '10.161', '71.347', '8.215', '63.132'
, '50.249', '8.215', '42.033', '21.099', '21.099', '123.207', '9.837', '25.689'
, '87.681', '79.629', '9.837', '15.786', '54.007', '43.578', '9.904', '33.674'
, '25.689', '25.689', '15.786', '15.786', '9.904', '9.904', '97.518', '9.837'
, '87.681', '63.844', '9.837', '54.007', '33.674', '33.674']];

class App extends React.Component {
    constructor(props) {
        super(props);
        this.updateState = this.updateState.bind(this);
        this.state = {dict: {}};
    }

    updateState(dict) {
        const dictCopy = _.cloneDeep(dict);
        this.setState({ dict: dictCopy });
    }

    render() {
        console.log(this.state.dict);
        const dictStr = Object.keys(this.state.dict).map(key => {
            const value = _.join(this.state.dict[key]);
            return <p>"<b>{key}</b>" : {value}</p>;
        });
        return (
          <Grid>
            <br/>{dictStr}<br/>
            <PivotTable
                data={DATA}
                fieldLabels={COLUMNS}
                xAxis={X_AXIS}
                yAxis={Y_AXIS}
                dataFields={DATA_FIELDS}
                selectCallback={this.updateState}
            />
          </Grid>
        );
    }
}

ReactDOM.render(
  <App />,
  document.getElementById('app')
);

