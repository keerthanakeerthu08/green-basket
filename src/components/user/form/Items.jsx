import 'styles/userstyle.css';

import nodataFound from 'images/cartisempty.svg';
import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import * as IonIcons from 'react-icons/io';
import ReactNotification from 'react-notifications-component';
import { Link } from 'react-router-dom';
import { Button } from 'reactstrap';
import { getJwt } from 'service/authService';
import { deleteCartItem, getCartItems, getGSTdetails } from 'service/cartService';


class Items extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {
      uid: '',
      data: [],
      userInfo: {},
      grantTotal: 0,
      gstPercentage: 0,
      isDataAvailable: false,

      isLoading: true
    }
    this.notificationDOMRef = React.createRef();
  }

  componentDidMount = async () => {
    await this.setState({ isLoading: true, isDataAvailable: false });
    await this.getUserInfo();
    await this.getGSTvalue();
    await this.getCartItems();
    // await this.subTotal();

  }

  componentWillUnmount = async () => {
    await this.cartDataStore();
  }

  getGSTvalue = async () => {
    try {
      const res = await getGSTdetails();
      const { gstPercentage, minDelChargeLimit, deliveryCharges } = res.data.data[0];
      await this.setState({ gstPercentage: gstPercentage, minDelChargeLimit: minDelChargeLimit, deliveryCharges: deliveryCharges });
    } catch (err) {
      this.handleError(err)
    }
  }

  getUserInfo = async () => {
    try {
      let res = await getJwt('__info');
      const { uid } = res;
      await this.setState({ uid: uid, userInfo: res });
    } catch (err) {
      this.handleError(err)
    }
  }

  getCartItems = async () => {
    try {
      const { uid } = this.state;
      const res = await getCartItems(uid);
      const { data, statusCode } = res.data;
      if (statusCode) {
        await this.setState({ data, isLoading: false, isDataAvailable: true })
        return await this.subTotal();
      }
      await this.setState({ data: [], isLoading: true, isDataAvailable: false });
      await this.subTotal();
    } catch (err) {
      this.handleError(err)
    }
  }

  deleteItems = async (cartId) => {
    await this.setState({ isLoading: true })
    await deleteCartItem(cartId);
    await this.getCartItems();
    await this.addNotification("Item deleted Successfully.");
  }


  itemsLoad = () => {
    const { data } = this.state;
    return _.map(data, (f, i) => <tr key={i}>
      <td> <img src={f["productImg"]} className="img-responisve" id="tableitemimage" alt="" /></td>
      <td>
        <h3 id="h3heading9">{f["productName"]}</h3>
        <span id="showrupeecolor">₹ {f["sellingPrice"]}</span>
        <span id="hiderupeecolor">₹ {f["productMrp"]}</span>
        <span id="gmscolor"> {f["quantity"] + " " + f["ProductUom"]}</span>
      </td>
      <td>
        <input type="button" value="-" id="subs3" className="minusbtn" onClick={() => this.subItem(i)} />
        <input type="text" id="noOfRoom3" value={f["noOfOrders"]} className="quantitybox" />
        <input type="button" value="+" id="adds3" className="plusbtn" onClick={() => this.addItem(i)} />
      </td>
      <td>
        <span>₹ {f["sellingPrice"] * f["noOfOrders"]}</span>
      </td>
      <td> <IonIcons.IoMdTrash style={{ fontSize: "1.7rem", color: 'red' }} onClick={() => this.deleteItems(f["cartId"])} />
      </td>
    </tr>)
  }

  addItem = async (index) => {
    await this.setState({ isLoading: true })
    const { data } = this.state;
    if (data[index]["noOfOrders"] < 10)
      data[index]["noOfOrders"] += 1;
    await this.setState({ data, isLoading: false });
    await this.subTotal();

  }

  subItem = async (index) => {
    await this.setState({ isLoading: true })
    const { data } = this.state;
    if (data[index]["noOfOrders"] !== 1)
      data[index]["noOfOrders"] -= 1;
    await this.setState({ data, isLoading: false });
    await this.subTotal();
  }

  subTotal = async () => {
    const { data, gstPercentage } = this.state;
    let subTotal = 0;
    await _.map(data, v => { subTotal += (v["noOfOrders"] * v["sellingPrice"]) });
    const gst = Math.round(subTotal * (gstPercentage / 100));
    await this.setState({ subTotal: subTotal, gst: gst });
  }



  cartDataStore = async () => {
    const { cartDataStore } = this.props;
    const { subTotal, gst, deliveryCharges, minDelChargeLimit, gstPercentage } = this.state;
    let { data } = this.state;
    await _.map(data, v => v["productUom"] = v["productUomId"])
    await _.map(data, v => v["noOfOrder"] = v["noOfOrders"])
    await _.map(data, v => v["totalAmount"] = v["noOfOrders"] * v["sellingPrice"])

    let obj = {
      "products": data,
      "gstPercentage": gstPercentage,
      "gstAmount": gst,
      "shippingCharge": (minDelChargeLimit < subTotal ? 0 : deliveryCharges),
      "netAmount": subTotal + gst + (minDelChargeLimit < subTotal ? 0 : deliveryCharges),
      "totalAmount": subTotal

    }
    await cartDataStore(obj);
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }


  handleError = err => {
  }

  render() {
    const { isLoading, isDataAvailable, subTotal, gst, deliveryCharges, minDelChargeLimit } = this.state;
    const { handleNext } = this.props;
    return (
      <Fragment>
        <ReactNotification ref={this.notificationDOMRef} />

        {isDataAvailable && <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>ITEMS</th>
                <th>DESCRIPTION</th>
                <th>QUANTITY</th>
                <th>SUB-TOTAL</th>
                <th>DELETE</th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && this.itemsLoad()}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}></td>
                <td className="lft" >Sub-Total</td>
                <td className="rht" colSpan={1}>₹ {subTotal || 0}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td className="lft" >GST</td>
                <td className="rht" colSpan={1}>₹ {gst || 0}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td className="lft" >Shipping Charges</td>
                <td className="rht" colSpan={1}> {minDelChargeLimit < subTotal ? 'FREE' : '₹' + deliveryCharges}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan={2}></td>
                <td className="lft" >Grand-Total</td>
                <td className="rht" colSpan={1}>₹ {subTotal + gst + (minDelChargeLimit < subTotal ? 0 : deliveryCharges)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>}
        {isDataAvailable && <div className="text-right">
          {/* <Button disabled onClick={() => handleBack()} size={"sm"} > Back</Button> */}
          <Button variant="contained" color="primary" size={"sm"} className="ml-3" onClick={() => handleNext()} > Check Out </Button>
        </div>}

        {
          !isDataAvailable &&
          <Fragment>
            <div className="text-center">
              <img src={nodataFound} className="img-fluid" alt="No data Found" />
            </div>
            <h3 style={{ textAlign: 'center', padding: '1rem', boxShadow: '-1px 5px 20px -8px #ddd', borderRadius: '0.5rem', fontWeight: 400, fontSize: "1rem" }}>No Cart Item Found  <Link to="/user/home">click here</Link> Continue shopping.</h3>
          </Fragment>
        }
      </Fragment>
    )
  }
}

export default withSnackbar(Items);