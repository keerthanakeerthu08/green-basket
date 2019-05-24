import ChangePassword from 'auth/ChangePassword';
import ForgotPassword from 'auth/ForgotPassword';
import Login from 'auth/Login';
import SignUp from 'auth/SignUp';
import React, { Fragment, PureComponent } from 'react';
import { Col, Container, Row } from 'reactstrap';

class Auth extends PureComponent {


  frameLoad = () => {
    const { match: { params: { pageName } } } = this.props;
    switch (pageName) {
      case 'identifier':
        return <Login props={this.props} />
      case 'webcreateaccount':
        return <SignUp props={this.props} />
      case 'usernamerecovery':
        return <ForgotPassword props={this.props} />
      case 'changepassword':
        return <ChangePassword props={this.props} /> 
      default:
        return <Login />;
    }
  }

  render() {
    return (
      <Fragment>
        <Container>
          <Row className="loginformpadding">
            <Col md={4} className="login-sec">
              {this.frameLoad()}
            </Col>
            <Col md={8} className="banner-sec">
            </Col>
          </Row>
        </Container>
      </Fragment>
    )
  }
}






export default Auth;