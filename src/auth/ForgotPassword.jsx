import 'react-notifications-component/dist/theme.css';

import { Input } from 'components/common/forms/Input';
import loginImg from 'images/EFV-Logo.png';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import { Button, FormGroup } from 'reactstrap';
import { forgotPassword, sendOtp } from 'service/authService';

class ForgotPassword extends PureComponent {

  state = {
    data: {},
    otpFeild: false,
    passwordFeild: false,
    readOnly: "readOnly"
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    mobile: Joi.string().min(10).max(10).regex(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/).required().label("Mobile Number"),
    otp: Joi.string().required().label("OTP"),
    passWord: Joi.string().required().label("Password"),
    CpassWord: Joi.string().required().label("Confirm Password"),
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;

    await this.setState({ [name]: value })

  }

  onSubmit = async () => {
    const data = this.formApi.getState().values;
    if (!data.otp) return this.otpSend();
    if (data.otp) {
      if (data.otp !== this.state.userOtp) {
        this.addNotification("OTP mismatch", "warning");
        this.formApi.setValue('otp', '')
      } else if (data.otp === this.state.userOtp) {
        this.setState({ passwordFeild: true })
      }
    }

    if (data.passWord !== data.CpassWord) {

      this.addNotification("Password mismatch", "warning");
      this.formApi.setValue('passWord', '')
      this.formApi.setValue('CpassWord', '')

    } else if (data.CpassWord !== undefined && data.passWord === data.CpassWord) {
      let payload = {
        "email": data.mobile,
        "password": data.CpassWord
      }
      let res = await forgotPassword(payload);
      if (res.data.statusCode === 1) {
        await this.addNotification(res.data.message);
        await this.formApi.reset();
        await this.props.props.history.push(`/auth/identifier`)
      }
    }

  }


  otpSend = async () => {
    const data = this.formApi.getState().values;
    await this.setState({ otpFeild: true })
    let params = `mobileNo=${data.mobile}&type=forgot`;
    let res = await sendOtp(params);
    if (res.data.statusCode === 1)
      return await this.setState({ userOtp: res.data.message })
    return this.addNotification("Mobile No Not Registered", "warning");
  }


  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  render() {
    const { otpFeild, passwordFeild } = this.state

    let readOnly = "";
    let readmeOnly = ""
    if (otpFeild) {
      readOnly = "readOnly"
    }
    if (passwordFeild) {
      readmeOnly = "readOnly"
    }

    return (
      <Fragment>
        <img src={loginImg} alt="LoginIMage" style={{ width: '100%' }} />
        <h2 className="text-center">Account recovery</h2>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <Input field="mobile" label="Mobile No" name="mobile" maxLength="10" onChange={this.handleChange} readOnly={readOnly} validateOnBlur validate={e => this.validateProperty('mobile', e)} />
              {otpFeild &&
                <Input field="otp" label="OTP" name="otp" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('otp', e)} readOnly={readmeOnly} />
              }
              {
                passwordFeild &&
                <div>
                  <Input field="passWord" type="password" id="pwd" label="Password" name="passWord" validateOnBlur validate={e => this.validateProperty('passWord', e)} onChange={this.handleChange} />
                  <Input field="CpassWord" type="password" label="Confirm Password" name="CpassWord" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('CpassWord', e)} />
                </div>
              }
              <FormGroup className="text-right">
                {otpFeild && <Button type="button" value="Resend" color="warning" size={"sm"} className="mr-3" onClick={this.otpSend}>Resend OTP</Button>}
                <Button type="submit" value="Submit" color="success" size={"sm"}  >Submit</Button>
              </FormGroup>

            </div>
          )}
        </Form>
      </Fragment>
    )
  }
}

export default withSnackbar(ForgotPassword);