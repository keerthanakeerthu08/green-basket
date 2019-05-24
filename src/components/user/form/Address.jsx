import 'rc-datetime-picker/dist/picker.min.css';

import { CustomRadio } from 'components/common/forms/custom-radio';
import { CustomSelect } from 'components/common/forms/custom-select';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import Joi from 'joi-browser';
import _ from 'lodash';
import moment from 'moment';
import { DatetimePickerTrigger } from 'rc-datetime-picker';
import React, { Fragment, PureComponent } from 'react';
import * as IosIcons from 'react-icons/io';
import ReactNotification from 'react-notifications-component';
import { Button, Col, Container, Row } from 'reactstrap';
import { getJwt, sendOtp } from 'service/authService';
import { getPincodedetails } from 'service/cartService';
import { getLocation } from 'service/location';
import { placeOrder } from 'service/ordersService';
import { getProfileDetails, updateProfileDetails } from 'service/profileService';



class Address extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      newAddress: false,
      otpfeild: false,
      isCOD: false,
      isOTPsended: false,
      isOTPverified: false,
      btnName: "Send OTP",
      data: {},
      paymode: ["Online Payment", "Cash on Delivery"],
      addressList: [],
      pincodes: [],
      deliverytime: ["Standard Delivery Time", "Preferred Delivery Time"],
      addressTypeList: ["Home", "Office"],
      date: new Date(),
      stdDeliveryTime: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm'),
      preDeliveryTime: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm'),

    }

    this.notificationDOMRef = React.createRef();

  }

  schema = {
    paymode: Joi.string().required().label('Payment Mode'),
    address: Joi.string().required().label('Address'),
    city: Joi.string().required().label('City'),
    state: Joi.string().required().label('State'),
    pincode: Joi.number().required().label('Pincode'),
    mobileNo: Joi.string().min(10).max(10).regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).required().label("Mobile No"),
    otp: Joi.string().min(4).max(4).required().label("OTP"),
    preDeliveryTime: Joi.string().required().label('Pre Delivery Time'),
    delName: Joi.string().required().label('Delivery Name'),
    deliverytime: Joi.string().required().label("Standard Delivery Time"),
    addType2: Joi.string().required().label("Address Type")
  }



  componentDidMount = async () => {
    await this.getUserInfo();
    await this.profileDetails();
    await this.pincodeDetails();
    await this.dataSet()

    let res = await getLocation()

    if (res.data.statusCode === 1) {
      await this.setState({
        locations: res.data.data
      })
    }
  }

  componentWillReceiveProps = async () => {

  }


  dataSet = async () => {
    const { profileData } = this.state;
    profileData[0].delName = profileData[0].userName;
    await this.formApi.setValues(profileData[0])
    await this.setState({ delName: profileData[0].userName })
  }


  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };


  async pincodeDetails() {
    let res = await getPincodedetails()
    if (res.data.statusCode === 1) {
      await this.setState({ pincodes: res.data.data })
    }
  }

  getUserInfo = async () => {
    let res = await getJwt('__info');
    const { uid } = res;
    await this.setState({ uid: uid, userInfo: res });
  }


  setFormApi = (formApi) => {
    this.formApi = formApi;
  }




  toggleAddress = async () => {
    await this.setState(state => ({ newAddress: !state.newAddress }))
  }

  profileDetails = async () => {
    const { uid } = this.state
    let params = `userId=${uid}`
    let res = await getProfileDetails(params)
    if (res.data.statusCode) {
      await this.setState({ profileData: res.data.data })
      return await this.addressListPrepare();
    }
    else
      return await this.setState({ profileData: [] });
  }


  addressListPrepare = async () => {
    try {
      const { address1, address2, city1, city2, pincode1, pincode2, phone, secondaryContactNo, userName, state1, state2 } = this.state.profileData[0];
      let addressList = [
        { address: address1, city: city1, pinCode: pincode1, state: state1, phone: phone, name: userName },
        { address: address2, city: city2, pinCode: pincode2, state: state2, phone: secondaryContactNo, name: userName },
      ];
      await this.setState({ addressList });
    } catch (err) {
      await this.setState({ addressList: [] });
    }
  }

  addressLoad = () => {
    const { addressList } = this.state;

    return _.map(addressList, (v, i) =>
      <div className="hole-div">
        <div >
          <div className="address-div">
            <p className="cover-p">
              <span className="name">{v["name"]}</span>
              <span className="ml-3 name">{v["phone"]}</span>
            </p>
            <span className="cover-p info">{v["address"] ? v["address"] + ',' : null}{v["city"] ? v["city"]
              + "," : null}{v["state"] ? v["state"] + "-" : null} <span className="name">{v["pinCode"]}</span>
            </span>
            {v["address"] && v["city"] && v["state"] ?
              <button className="btn-style btn-font btn-bg" onClick={async () => await this.setState({ addressIndex: i })}>Delivery Here</button> : <span style={{ fontSize: "0.7rem", background: "red", padding: "0.1rem 01rem", borderRadius: "1rem", color: "#fff" }}>Update your Address</span>}
          </div>
          <div className="edit-btn-div">
            <button type="button" className="edit-btn" onClick={() => this.editAddress(i)}>EDIT</button>
          </div>
        </div>
      </div>

    );
  }

  editAddress = async (index) => {
    await this.setState({ addressIndex: index })
    await this.toggleAddress();
    const obj = this.state.profileData[0];
    if (!index) {
      obj["address2"] = obj["address1"];
      obj["city2"] = obj["city1"];
      obj["pincode2"] = obj["pincode1"];
      obj["state2"] = obj["state1"];
      obj["secondaryContactNo"] = obj["phone"];
    }
    await this.formApi.setValues(obj)
  }

  updateAddress = async () => {
    if (!this.checkPincode())
      return this.addNotification("Our Service is not available for this zone. Soon we will give a best Service", "warning");
    try {
      const data = this.formApi.getState().values;
      const { address2, pincode2, city2, state2, secondaryContactNo, addType2 } = data;
      const { addressIndex } = this.state;
      let postData = this.state.profileData[0];

      postData["defaultAddress"] = "1";
      postData["name"] = postData["userName"];
      postData["primaryContactNo"] = postData["phone"];
      if (!addressIndex) {
        let obj = {
          "address1": address2,
          "city1": city2,
          "pincode1": pincode2,
          "state1": state2,
          "primaryContactNo": secondaryContactNo,
          "addType1": addType2
        }
        await _.assign(postData, obj);
      } else {
        let obj = {
          "address2": address2,
          "city2": city2,
          "pincode2": pincode2,
          "state2": state2,
          "secondaryContactNo": secondaryContactNo,
          "addType2": addType2
        }
        await _.assign(postData, obj);
      }
      let res = await updateProfileDetails(postData);
      if (res.data.statusCode === 1) {
        await this.profileDetails();
        await this.toggleAddress();
        return this.addNotification(res.data.message);
      }
      return this.addNotification(res.data.message, "warning");
    } catch (err) {
      return this.addNotification("Update your profile first!!!", "warning");
    }

  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({ [name]: value })

  }

  onSubmit = async () => {
    const { isCOD, isOTPverified, newAddress, otpfeild, isOTPsended } = this.state;

    if (isCOD && !isOTPverified && !newAddress && !isOTPsended) return await this.sendOtp();
    if (isCOD && otpfeild && isOTPsended) return await this.checkOtp();
    if (newAddress) return await this.updateAddress();

    return await this.delAddressChoose();
  }

  sendOtp = async () => {
    const data = this.formApi.getState().values;
    const { phone } = data;
    let params = `mobileNo=${phone}&type=COD`
    let res = await sendOtp(params)
    if (res.data.statusCode === 1)
      return await this.setState({ sentOtp: res.data.message, otpfeild: true, isOTPsended: true, btnName: "Verify OTP" })
    return await this.setState({ sentOtp: "", otpfeild: false, isOTPsended: false, btnName: "Verify OTP" });
  }

  checkOtp = async () => {
    const data = this.formApi.getState().values;
    const { sentOtp } = this.state;
    if (sentOtp !== data.otp)
      return this.addNotification("please Enter a valid OTP", "danger");
    await this.setState({ otpfeild: false, isOTPverified: true })
  }

  checkPincode = () => {
    const data = this.formApi.getState().values;
    const { pincodes } = this.state
    if (pincodes) {
      let temp = _.filter(pincodes, v => v["configValue"] === data.pincode2);
      if (temp.length !== 0)
        return true;
      return false;
    }
  }

  getValue = async (data) => {
    const { target: { value } } = data;
    await this.setState({ isCOD: value === "Cash on Delivery" ? true : false });
  }

  getDeliveryValue = async (data) => {
    const { name, value } = data;
    await this.setState({ [name]: value })
  }

  delAddressChoose = async () => {
    const { stdDeliveryTime, preDeliveryTime, uid, addressIndex: index, delName, isCOD, isOTPverified, newAddress, } = this.state;
    const data = this.formApi.getState().values;
    const { phone } = data;
    const { address1, address2, city1, city2, pincode1, pincode2, email } = this.state.profileData[0];
    let address = {
      email,
      stdDeliveryTime,
      preDeliveryTime,
      "userId": uid,
      "delName": delName,
      "delPhone": phone,
      "delAddress": address1,
      "delCity": city1,
      "delPincode": pincode1,
    };
    if (!index) {
      const address1 = {
        "delPhone": phone,
        "delAddress": address2,
        "delCity": city2,
        "delPincode": pincode2,
      };
      _.assign(address, address1)
    }

    if (isCOD && isOTPverified) return await this.paymentLoad(address);
    if (!isCOD && !newAddress) return await this.cartDataStore(address);
  }

  paymentLoad = async (address) => {
    const { data } = this.props;

    const obj = {
      "deliveryStatus": "N",
      "deliveredTime": "0000-00-00 00:00:00",
      "deliveredBy": "",
      "deliveredTo": "",

      "cancellationFlag": "Y",
      "cancellationReason": "",
      "paymentMode": "COD",

      "transactionStatus": "S",
      "failureReason": "",
    }
    await _.assign(data, address);
    await _.assign(data, obj);
    await _.assign(data, this.state);
    await this.placeOrder(data)
  }

  placeOrder = async (payload) => {
    try {
      const res = await placeOrder(payload);
      const { data: { statusCode, data } } = res;
      if (statusCode) {
        this.addNotification("Order was Placed Successfully")
        return this.redirectTo(data[0], "forward")
      }
      return this.addNotification("Something went wrong please try again after some time", "danger");
    } catch (err) {
    }
  }

  cartDataStore = async (address) => {
    const { cartDataStore, handleNext } = this.props;
    await cartDataStore(address)
    await handleNext();
  }


  dateChange = async (dateTime) => {
    const currentHour = dateTime.format("HH");
    if (parseInt(currentHour) >= 7 && parseInt(currentHour) < 21) {
      this.setState({ preDeliveryTime: dateTime.format('YYYY-MM-DD HH:mm') });
      await this.formApi.setValue("preDeliveryTime", dateTime.format('YYYY-MM-DD HH:mm'))
    } else {
      this.addNotification("we cant deliver this timings", "danger");
    }
  }

  addNotification(data, type = "success") {
    this.notificationDOMRef.current.addNotification({
      message: data,
      type: type,
      insert: "top",
      container: "top-right",
      animationIn: ["animated", "fadeIn"],
      animationOut: ["animated", "fadeOut"],
      dismiss: { duration: 2000 },
      dismissable: { click: true }
    });
  }

  redirectTo = (data = {}, direction = "back") => {
    const { props } = this.props;
    if (direction === 'back')
      return props.history.push('user/home');
    return props.history.push({
      pathname: '/user/payment',
      state: data
    });
  }


  render() {
    const { newAddress, btnName, otpfeild, isOTPverified, isCOD, delivery, preDeliveryTime, addressTypeList } = this.state;
    const { handleBack } = this.props;

    return (
      <Fragment>
        <ReactNotification ref={this.notificationDOMRef} />

        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formState }) => (
            <Container>
              <div className="well cartwell ">

                <Row className="adddetails" >
                  <Col md={12} className="contactformrowpadding">
                    <Row>
                      <Col sm={6} md={6}>
                        <p style={{ color: '#FF9800' }}>Your Standard Delivery Time : {this.state.stdDeliveryTime}</p>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={3} sm={12} >
                        <CustomRadio field="deliverytime" label="Delivery Time" name="delivery" options={this.state.deliverytime} checked={this.state.checked} validateOnBlur validate={e => this.validateProperty('deliverytime', e)} onChange={(e) => this.getDeliveryValue(e)} />
                      </Col>
                    </Row>
                    <Row>
                      {delivery === 'Preferred Delivery Time' &&
                        <Col md={6} sm={12} >
                          <DatetimePickerTrigger
                            minDate={moment()}
                            maxDate={moment().add(1, "day")}
                            moment={moment(preDeliveryTime)}
                            format={"YYYY-MM-DD HH:mm"}
                            onChange={this.dateChange}>
                            <Input field="preDeliveryTime" name="preDeliveryTime" autocomplete="off" label="Pre Delevery Time" validateOnBlur validate={e => this.validateProperty('preDeliveryTime', e)} />
                          </DatetimePickerTrigger>
                        </Col>
                      }
                    </Row>
                    <Row>
                      <Col md={3} sm={12} >
                        <CustomRadio field="paymode" label="Payment Mode" name="paymode" options={this.state.paymode} validateOnBlur validate={e => this.validateProperty('paymode', e)} onChange={(e) => this.getValue(e)} />
                      </Col>
                    </Row>
                    <Row>
                      <Col md={3}>
                        <Input field="delName" name="delName" label="Delivery Name" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('delName', e)} />
                      </Col>
                      <Col md={3}>
                        <Input field="phone" name="mobile" label="Mobile No" onChange={this.handleChange} readOnly={isOTPverified} validateOnBlur validate={e => this.validateProperty('mobileNo', e)} />
                      </Col>
                      {isCOD && !isOTPverified && otpfeild &&
                        <Fragment>
                          <Col md={3}>
                            <Input field="otp" name="otp" label="OTP" validateOnBlur validate={e => this.validateProperty('otp', e)} onChange={this.handleChange} />
                          </Col>


                        </Fragment>

                      }
                      <Col md={3} style={{ paddingTop: "0.4rem" }}>
                        {isCOD && !isOTPverified && otpfeild && <Button type="button" onClick={this.sendOtp} color={"warning"} className="mt-3 mr-2" size={"sm"}   >Resend OTP</Button>}
                        {isCOD && !isOTPverified ? <Fragment>
                          <Button type="submit" color={"success"} size={"sm"} className="mt-3" >{btnName}</Button>
                        </Fragment>
                          : isOTPverified && <p className="otp-verified"> <IosIcons.IoIosCheckmark style={{ fontSize: "1.5rem" }} />  OTP Verified</p>}
                      </Col>

                    </Row>
                    <Row>
                      {!newAddress && <Col md={12} id="savedaddress" name="btn">
                        {this.addressLoad()}
                      </Col>}
                      <br />
                      {/* {!newAddress && <Col md={12} name="btn">
                      <p>Click <span style={{ color: "#004cff" }} onClick={() => this.toggleAddress()}>here </span> add new address.</p>
                    </Col>} */}
                    </Row>
                    {
                      newAddress &&
                      <Fragment>
                        <Row>
                          <Col md={3} sm={12} >
                            <CustomRadio field="addType2" label="Address Type" name="addType2" options={addressTypeList} checked={this.state.checked} validateOnBlur validate={e => this.validateProperty('addType2', e)} onChange={(e) => this.getDeliveryValue(e)} />
                          </Col>
                        </Row>

                        <Row>
                          <Col md={3} name="btn">
                            <Input field="city2" name="city" label="City" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('city', e)} />
                          </Col>
                          <Col md={3} name="btn">
                            <Input field="state2" name="state" label="State" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('state', e)} />
                          </Col>
                          <Col md={3} name="btn">
                            {/* <Input field="pincode2" name="pincode" label="Pincode" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('pincode', e)} /> */}
                            <div class="form-group">
                              <CustomSelect field="pincode2" name="pincode" label="Pincode" required
                                getOptionValue={option => option.configValue}
                                getOptionLabel={option => option.configValue}
                                options={this.state.locations} onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('pincode', e)}
                              />
                              <div class="help-block with-errors"></div>
                            </div>
                          </Col>
                          <Col md={3} name="btn">
                            <Input field="secondaryContactNo" name="Mobile No" label="Mobile No" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('mobileNo', e)} />
                          </Col>
                        </Row>
                        <Row>
                          <Col md={12} name="btn">
                            <Textarea field="address2" label="Address" name="address1" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('address', e)} />
                          </Col>

                          <Col style={{ textAlign: 'right' }}>
                            <Button color={"warning"} className="mr-3" size={"sm"} onClick={this.toggleAddress} >Cancel</Button>
                            <Button disabled={formState.invalid} color={"success"} size={"sm"}>Update</Button>
                          </Col>
                        </Row>
                      </Fragment>

                    }

                  </Col>
                </Row>

              </div>
            </Container>
          )}
        </Form>
        <div className="text-right">
          <Button variant="contained" color="primary" size={"sm"} className="ml-3" onClick={() => handleBack()} > Back </Button>
        </div>


      </Fragment>
    )
  }
}

export default Address;

