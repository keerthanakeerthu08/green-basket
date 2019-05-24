import 'styles/forms.css';

import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import ReactNotification from 'react-notifications-component';
import { Button } from 'reactstrap';
import { placeOrder } from 'service/ordersService';


class Payment extends PureComponent {


  constructor(props) {
    super(props)
    this.notificationDOMRef = React.createRef();
  }

  state = {
    transactionStatus: "",
    orderId: "",
    paymentMode: "",
    failureReason: ""
  }

  componentDidMount = () => {
  }

  paymentLoad = () => {
    const { data: { netAmount, email, delPhone } } = this.props;
    return <iframe title="Payment" id="paymentFrame" ref={"paymentFrame"} className="payment-frame" src={`http://localhost:3002/about?amt=${netAmount}&email=${email}&mobileno=${delPhone}`} onLoad={this.iframeLoad}>
    </iframe>
  }

  iframeLoad = async (e) => {
    var ipath = document.getElementById("paymentFrame");
    const htmlcont = ipath.contentWindow.document.body.innerHTML;
    const frameURL = ipath.contentWindow.location.href;
    if (frameURL === 'http://localhost:3002/ccavRequestHandler') {
    }
    if (frameURL === 'http://localhost:3002/ccavResponseHandler') {
      let obj = {
        "deliveryStatus": "N",
        "deliveredTime": "0000-00-00 00:00:00",
        "deliveredBy": "",
        "deliveredTo": "",

        "cancellationFlag": "Y",
        "cancellationReason": htmlcont.split('&amp;')[8].split('=')[1],
        "paymentMode": "Online" || '',

        "transactionStatus": htmlcont.split('&amp;')[3].split('=')[1] === "Aborted" ? "N" : "S",
        "failureReason": htmlcont.split('&amp;')[4].split('=')[1] || '',
      }
      // "paymentMode": "htmlcont.split('&amp;')[5].split('=')[1]" || '',
      // if (htmlcont.split('&amp;')[3].split('=')[1] !== "Aborted")
      return this.payloadForm(obj);
      // this.addNotification("Order was canceled", "danger")
      // return setTimeout(() => { this.redirectTo({}, "back") }, 300)
    }
  }



  payloadForm = async (payment = {}) => {
    let { data } = this.props;
    payment["orderId"] = ["OD65989649654"];
    payment["orderDate"] = data["preDeliveryTime"]
    await _.assign(data, payment);
    if (payment.transactionStatus === 'S') return await this.placeOrder(data);
    return this.redirectTo(data, "forward")

    // await this.placeOrder(data)
  }

  placeOrder = async (payload) => {
    try {
      const res = await placeOrder(payload);
      const { data: { statusCode, data } } = res;
      if (statusCode) {
        await this.addNotification("Order was Placed Successfully")
        return setTimeout(() => { this.redirectTo(data[0], "forward") }, 300)
      }
      return this.addNotification("Something went wrong please try again after some time", "danger");
    } catch (err) {
    }
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  redirectTo = (data = {}, direction = "back") => {
    const { props } = this.props;
    // if (direction === 'back')
    //   return props.history.push('/user/home');
    return props.history.push({
      pathname: '/user/payment',
      state: data
    });
  }

  

  render() {
    const { handleBack } = this.props;
    return (
      <Fragment>
        <ReactNotification ref={this.notificationDOMRef} />
        {this.paymentLoad()}
        <Button onClick={() => handleBack()} size={"sm"} > Back</Button>
      </Fragment>
    )
  }
}


export default withSnackbar(Payment);