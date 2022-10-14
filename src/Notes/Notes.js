import React, { Component } from 'react';
import NotesForm from './NotesForm';
import AllNotes from './AllNotes';
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Container,
  Row,
  Col,
} from "react-bootstrap";

export default class Notes extends Component {
  render() {
    return (
      <>
        <Container fluid>
          <Row>
            <Col md="12">
              <Card>
                <Card.Header>
                  <Card.Title as="h4">Calculator</Card.Title>
                </Card.Header>
                <Card.Body>
                  <React.Fragment>


                    <NotesForm />
                    <hr />
                    <AllNotes />
                  </React.Fragment>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </>

    );
  }
}
