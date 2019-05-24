import { Input } from 'components/common/forms/Input';
import loginImg from 'images/EFV-Logo.png';
import { Form } from 'informed';
import Joi from 'joi-browser';
import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Button, FormGroup } from 'reactstrap';
import { checkUser, sendOtp, signUp, storeData } from 'service/authService';

class SignUp extends PureComponent {

  constructor(props) {
    super(props)
    this.state = {
      data: {},
      btnName: "Send OTP",
      isFeildShown: false,
      isOTPverified: false,
    }
    this.notificationDOMRef = React.createRef();
  }
 
  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };


  schema = {
    name: Joi.string().required().label("Name"),
    email: Joi.string().email().required().label("Mail"),
    contact: Joi.string().min(10).max(10).regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).required().label("Contact Number"),
    otp: Joi.string().required().label("Password"),
    password: Joi.string().required().label("Password"),
    confirmPassword: Joi.string().required().label("Confirm Password"),
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({ data })
  }


  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  onSubmit = async () => {
    const { isFeildShown, isOTPverified } = this.state;

    if (!isOTPverified && !isFeildShown) return this.otpSend();
    if (!isOTPverified && isFeildShown) return this.verifyOTP();
    if (isOTPverified && !isFeildShown) return this.signUp();
  }

  otpSend = async () => {
    try {
      const data = this.formApi.getState().values;
      const { contact } = data
      let params = `mobileNo=${contact}`;
      let res = await sendOtp(params);
      const { data: { message, statusCode } } = res;
      if (statusCode === 1)
        return await this.setState({ serverOTP: message, isFeildShown: true, btnName: "Verify OTP" });
      return await this.addNotification("User already exist.", "warning");
    } catch (err) {
    }
  }

  verifyOTP = async () => {
    const data = this.formApi.getState().values;
    const { otp } = data;
    const { serverOTP } = this.state;
    if (serverOTP === otp)
      return this.setState({ isFeildShown: false, isOTPverified: true, btnName: "Sign Up" });
    await this.setState({ isFeildShown: true, isOTPverified: false, btnName: "Verify OTP" });
    await this.addNotification("OTP does't match", "warning");
  }

  signUp = async () => {
    const data = this.formApi.getState().values;
    if (data.password !== data.confirmPassword)
      return await this.addNotification("Password does't match", "warning");
    try {
      _.assign(data, { userRole: "U" })
      let res = await signUp(data)
      if (res.data.statusCode === 1) {
        await this.addNotification("User Register Successfully.");
        await this.resetForm();
        await this.checkUser(data.email);
      }
    } catch (err) {
    }
  }



  resetForm = async () => {
    this.formApi.reset();
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  checkUser = async (email) => {
    try {
      const res = await checkUser(email);
      const { data: { data } } = res;
      data[0].name = data[0].userName;
      this.storeData("__info", data[0])
    } catch (err) {
      this.handleError(err)
    }
    return { status: false, data: {} };
  }

  storeData = async (key, userInfo) => {
    await this.setState({ userInfo })
    const { access_token } = userInfo;
    await storeData('token', access_token);
    await storeData(key, userInfo);
    await this.redirect();
  }

  redirect = () => {
    const { props } = this.props;
    let endPoint = '/user/home';
    props.history.push(endPoint);
  }


  render() {
    const { isOTPverified, isFeildShown, btnName } = this.state
    return (
      <Fragment >
        <img src={loginImg} alt="LoginIMage" style={{ width: '100%' }} />
        <h2 className="text-center">Sign Up</h2>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <Input field="name" label="Name" name="name" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('name', e)} readOnly={isFeildShown} />
              <Input field="email" label="Email" name="email" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('email', e)} readOnly={isFeildShown} />
              <Input field="contact" label="Contact No" maxLength="10" name="contact" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('contact', e)} readOnly={isFeildShown} />
              {!isOTPverified && isFeildShown &&
                <Input field="otp" label="OTP" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('otp', e)} />}

              {isOTPverified &&
                <Fragment>
                  <Input field="password" type="password" label="Password" name="password" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('password', e)} />
                  <Input field="confirmPassword" type="password" label="Confirm Password" name="confirmPassword" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('confirmPassword', e)} />
                </Fragment>
              }
              <FormGroup className="text-right">
                <Button type="submit" value="Submit" color="success" size={"sm"} >{btnName}</Button>
              </FormGroup>
              <div>
                <p>If you have account please login<Link to="/auth/identifier"> here</Link> .</p>
              </div>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}

export default withSnackbar(SignUp);