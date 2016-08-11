import React, { PropTypes } from 'react';

import { SortableListItem } from '../components';

const _ = require('lodash');

class SortableList extends React.Component {
    static propTypes() {
        return {
            data: PropTypes.array,
            updateColumns: PropTypes.function
        };
    }

    getInitialState() {
        return {
            draggingIndex: null,
            data: this.props.data
        };
    }

    updateState(obj) {
        if (_.has(obj, 'items')) {
            this.props.updateColumns(obj.items);
        }
    }

    render() {
        const listItems = this.state.data.map((item, i) =>
          <SortableListItem
            key={i}
            updateState={this.updateState}
            items={this.state.data}
            draggingIndex={this.state.draggingIndex}
            sortId={i}
            outline="list"
          >{item}</SortableListItem>
        );

        return (
          <div className="list">{listItems}</div>
        );
    }
}

export default SortableList;
