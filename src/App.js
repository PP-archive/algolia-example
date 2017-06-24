import React, {Component} from 'react';
import 'bootstrap/dist/css/bootstrap.css';

import {Container, Row, Col, Input, Card, CardBlock, CardText} from 'reactstrap';
import _ from 'lodash';
import axios, {CancelToken} from 'axios';

class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            products: []
        };

        // global variable, available between the 'query' calls
        let source;

        // query algolia
        this.query = _.debounce(async (event) => {
            // cancel previous HTTP request
            if(source) {
                source.cancel();
            }

            const query = event.target.value;
            source = CancelToken.source();
            try {
                const result = await axios.get(`https://efounbqifq-dsn.algolia.net/1/indexes/Product_v2_en?query=${query}&hitsPerPage=5`, {
                    cancelToken: source.token,
                    headers: {
                        'X-Algolia-API-Key': '%API_KEY%',
                        'X-Algolia-Application-Id': '%APPLICATION_ID%'
                    }
                });
                console.log(`result: ${result.data.hits.length} products`);

                // assign results to the state
                this.setState((prevState, props) => {
                    const _state = _.cloneDeep(prevState);
                    // we are only interested in the images and description properties
                    _state.products = _.map(result.data.hits, record => _.pick(record, ['images', 'description']));
                    return _state;
                });
            } catch (error) {
                if (axios.isCancel(error)) {
                    console.log(`request was cancelled`);
                } else {
                    throw error;
                }
            }
        }, 100);
    }

    onChange(event) {
        event.persist();

        this.query(event);
    }

    render() {
        return (
            <Container style={{ paddingTop: '3rem' }}>
                <Row>
                    <Col>
                        <Input name="query" onChange={this.onChange.bind(this)}/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        { this.state.products.map((product, index) => <Card key={index}>
                            <CardBlock>
                                <CardText>{product.description}</CardText>
                                <CardText>
                                    <code>
                                        {JSON.stringify(product.images)}
                                    </code>
                                </CardText>
                            </CardBlock>
                        </Card>)}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default App;
