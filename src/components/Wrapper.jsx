import Header from 'components/common/forms/Header';
import SideNav from 'components/common/forms/SideNav';
import Routes from 'components/common/Routes';
import React, { Fragment, PureComponent } from 'react';
import { Col, Container, Row } from 'reactstrap';


class Wrapper extends PureComponent {
  render() {
    const { userRole } = this.props;
    return (
      <Fragment>
        <Header />
        <Container fluid >
          <Row>
            <Col md={2} sm={12} className="p-0">
              <SideNav userRole={userRole} />
            </Col>
            <Col className="content" md={10} sm={12} >
              <Routes />
            </Col>
          </Row>
        </Container>
      </Fragment>
    )
  }
}

export default Wrapper;