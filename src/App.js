import React, { Component } from 'react';

import { getData } from './utils';
import Chart from './chart';


class App extends Component {

    componentDidMount() {
        getData().then(data => {
            this.setState(data);
        });
    }

    render() {
        if (this.state == null) {
            return <div>Loading...</div>
        }
        return (
            <div>
                <Chart type='svg' data={this.state.Data} />
            </div>
        );
    }
}

export default App;
