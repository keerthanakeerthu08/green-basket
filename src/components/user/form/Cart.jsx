import { Step, StepLabel, Stepper, withStyles } from '@material-ui/core';
import BreadCrumb from 'components/common/forms/BreadCrumb';
import Payment from 'components/payment';
import Address from 'components/user/form/Address';
import Items from 'components/user/form/Items';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Fragment, PureComponent } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { getJwt } from 'service/authService';



function getSteps() {
  return ['Order Summary', 'Delivery Address', 'Payment Options'];
}

const styles = theme => ({
  root: {
    width: '100%',
  },
  backButton: {
    marginRight: theme.spacing.unit,
  },
  instructions: {
    marginTop: theme.spacing.unit,
    marginBottom: theme.spacing.unit,
  },
});



class Cart extends PureComponent {
  state = {
    activeStep: 0,
    cartItems: [],
    addressInfo: {},
    cartData: {},

    open: false,
    vertical: 'top',
    horizontal: 'center',
  };



  componentDidMount = () => {
    this.getUserInfo();
  }



  getUserInfo = async () => {
    let res = await getJwt('__info');
    const { uid } = res;
    await this.setState({ uid: uid, userInfo: res });
  }

  getStepContent(step) {
    const { uid, cartData } = this.state;
    switch (step) {
      case 0:
        return <Items uid={uid} handleNext={this.handleNext} cartDataStore={this.cartDataStore} />
      case 1:
        return <Address data={cartData} cartDataStore={this.cartDataStore} handleBack={this.handleBack} props={this.props.props} handleNext={this.handleNext} uid={uid} />
      case 2:
        return <Payment handleBack={this.handleBack} data={cartData} props={this.props.props} />
      default:
        return 'Unknown step';
    }
  }


  handleNext = () => {
    this.setState(state => ({
      activeStep: state.activeStep + 1,
    }));
  };

  handleBack = () => {
    this.setState(state => ({
      activeStep: state.activeStep - 1,
    }));
  };

  cartDataStore = async (value) => {
    let { cartData } = this.state;
    await _.assign(cartData, value);
    await this.setState({ cartData });
  }

  handleError = err => {
  }


  render() {
    const { classes } = this.props;
    const steps = getSteps();
    const { activeStep } = this.state;

    const breadCrumbItems = {
      title: 'Cart',
      items: [
        { name: 'Profile', active: false, link: '/userdetails/profile' },
        { name: 'Cart', active: true },
      ]
    };



    return (
      <Fragment>
        <Container>
          <Row>
            <Col>
              <div style={{ marginTop: '50px' }}>
                <BreadCrumb data={breadCrumbItems} />
              </div>
            </Col>
          </Row>
        </Container>
        <Container className="table-div" >
          <Row>
            <Col className="p-0">
              <div className={classes.root}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
                <div className="bg-white p-3 br-3">
                  {this.getStepContent(activeStep)}
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </Fragment>
    );
  }
}

Cart.propTypes = {
  classes: PropTypes.object,
};




export default withStyles(styles)(Cart);