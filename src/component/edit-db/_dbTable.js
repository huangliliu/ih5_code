//数据库表格
import React from 'react';
import $class from 'classnames';

import WidgetActions from '../../actions/WidgetActions';
import WidgetStore from '../../stores/WidgetStore';

class DbTable extends React.Component {
    constructor (props) {
        super(props);
        this.state = {

        };

    }

    componentDidMount() {

    }

    componentWillUnmount() {

    }

    render() {
        return (
            <div className='DbTable'>
                <button onClick={ this.props.editDbHide }>关闭</button>
            </div>
        );
    }
}

module.exports = DbTable;



