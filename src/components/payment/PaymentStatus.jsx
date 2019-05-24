import React, { Fragment, PureComponent } from 'react';
import { Col, Container, Row } from 'reactstrap';

const orderFailed = "https://png.pngtree.com/svg/20170320/payment_failed__304515.png"
const orderSuccess = "https://www.roadmap-planner.io/static/img/icon_done.svg"
class PaymentStatus extends PureComponent {

  componentDidMount = () => {
  }

  paymentSummery = () => {
    const { props: { location: { state } } } = this.props;
    return <div className="payment-summery">
      <p className="payment-title">Payment Summery</p>
      <div className="info-div">
        <p> Your Order No is<span>{state["orderId"][0]}</span></p>
        <p>Ordered Date<span>{state["orderDate"]}</span></p>
        <p>GST<span>₹ {state["gstAmount"]}</span></p>
        <p>Net Amount<span>₹ {(+state["netAmount"]) - (+state["gstAmount"])}</span></p>
        <p className="divider" style={{ borderTop: "1px solid" }}> </p>
        <p>Order Total<span style={{ fontWeight: 500, color: "#333" }}>₹ {state["netAmount"]}</span></p>
      </div>
    </div>
  }

  render() {
    const { props: { location: { state } } } = this.props;
    return (
      <Fragment>
        <h2 className="text-center">Order Status</h2>
        <Container>
          <Row>
            <Col md={7} className="d-flex justify-content-center align-content-center text-center flex-column">
              <img src={state.transactionStatus ? orderFailed : orderSuccess} alt="Success Info" className="img-fluid" style={{maxWidth:"7rem",margin:"2rem auto"}} />
              {state.transactionStatus ? <p className="text-danger" style={{ fontSize: "2rem", fontWeight: 500 }}>Order was Canceled</p> : <p className="text-success"  style={{ fontSize: "2rem", fontWeight: 500 }}>Order Success ...</p>}
            </Col>
            <Col md={5}>
              {this.paymentSummery()}
            </Col>
          </Row>
        </Container>
      </Fragment>
    )
  }
}

export default PaymentStatus;