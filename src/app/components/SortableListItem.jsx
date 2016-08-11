import React, { PropTypes } from 'react';
import { Sortable } from 'react-sortable';

class ListItem extends React.Component {
    static propTypes() {
        return {
            children: PropTypes.array
        };
    }

    render() {
        return (
          <div {...this.props} className="list-item">{this.props.children}</div>
        );
    }
}

const SortableListItem = Sortable(ListItem);
export default SortableListItem;
