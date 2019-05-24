import 'styles/login.css';

import { loadProgressBar } from 'axios-progress-bar';
import { Input } from 'components/common/forms/Input';
import { facebookAppId, gooogleClientId } from 'config.json';
import loginImg from 'images/EFV-Logo.png';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import FacebookLogin from 'react-facebook-login';
import { GoogleLogin } from 'react-google-login';
import * as IonIcon from 'react-icons/io';
import { Link } from 'react-router-dom';
import { Button, FormGroup } from 'reactstrap';
import { checkUser, login, signUp, storeData } from 'service/authService';

import { staticToken } from './../config.json';



class Login extends PureComponent {
  _isMounted = false;

  state = {
    data: {}
  }
  componentWillMount = () => {
    this._isMounted = false;
  }

  componentDidMount = () => {
    loadProgressBar();
    this._isMounted = true;
    if (this._isMounted)
      this.sampleData();
  }

  componentWillUnmount = () => {
    this._isMounted = false;
  }

  sampleData = async () => {
    let data = this.dataGenerator();
    await this.setState({ data })
    await this.formApi.setValues(data);
  }

  dataGenerator = () => ({ loginId: 'veera@gmail.com', password: '123' })

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  }

  schema = {
    loginId: Joi.string().required().label("User Name"),
    password: Joi.string().required().label("Password"),
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { id: name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({ data })
  }

  onSubmit = async () => {
    const formData = this.formApi.getState().values;
    try {
      const res = await login(formData);
      const { data } = res;
      data.name = data.userName;
      await this.addNotification("Login Success");
      return await this.storeData('__info', data);

    } catch (err) {
      this.addNotification("Check your user name and password", "warning");
      this.handleError(err)
    }
  }



  responseGoogle = async (response) => {
    try {
      const { profileObj } = response;
      const { email } = profileObj;
      const { status, data } = await this.checkUser(email);
      if (status) {
        this.storeData('__info', data);
        this.storeData('token', staticToken);
      } else {
        this.signUp(profileObj);
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  responseFacebook = async (response) => {
    try {
      const profileObj = response;
      const { email } = response;
      const { status, data } = await this.checkUser(email);
      if (status) {
        this.storeData('__info', data);
        this.storeData('token', staticToken);
      } else {
        this.signUp(profileObj);
      }
    } catch (err) {
      this.handleError(err)
    }
  }

  signUp = async (data = {}) => {
    try {
      let payload = data;
      payload.password = "";
      payload.contactno = '';
      payload.userRole = 'U';
      await signUp(payload);
      await this.responseFacebook(payload);
      await this.storeData('token', staticToken);
      this.addNotification("Login Success");
    } catch (err) {
      this.addNotification("Something went wrong. Please try again later", "warning");
      this.handleError(err)
    }

  }


  checkUser = async (email) => {
    try {
      const res = await checkUser(email);
      const { data: { data } } = res;
      data[0].name = data[0].userName;
      return { status: true, data: data[0] };
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
    const { userInfo: { userRole } } = this.state;
    let endPoint = '/user/home';
    switch (userRole) {
      case 'U':
        endPoint = '/user/home';
        break;
      case 'D':
      case 'A':
        endPoint = '/dashboard';
        break;
      default:
        endPoint = '/user/home';
        break;
    }
    props.history.push(endPoint);
    window.location.reload();
  }

  /**
   * @param {string} message It was messsage for toast or a snack bar.
   * 
   */


  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }


  handleError = (err) => {
  }

  render() {
    return (
      <Fragment>
        <img src={loginImg} alt="LoginIMage" style={{ width: '100%' }} />
        <h2 className="text-center">Sign In</h2>

        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <Input field="loginId" label="User Name" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('loginId', e)} />

              <Input field="password" type="password" label="Password" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('password', e)} />
              <FormGroup >
                <Link to="/auth/usernamerecovery"> Forgot password?</Link>
                <Button type="submit" className="float-right" value="Submit" color="success" size={"sm"} disabled={formState.invalid} >
                  Submit</Button>
              </FormGroup>
              <div className="social-media text-center">
                <GoogleLogin
                  clientId={gooogleClientId}
                  render={renderProps => (
                    <IonIcon.IoLogoGoogle className="google" onClick={renderProps.onClick} disabled={renderProps.disabled} />
                  )}
                  onSuccess={this.responseGoogle}
                  onFailure={this.responseGoogle}
                  cookiePolicy={'single_host_origin'}
                />
                <FacebookLogin
                  appId={facebookAppId}
                  autoLoad={false}
                  callback={this.responseFacebook}
                  icon={<IonIcon.IoLogoFacebook className="facebook" />}
                  fields="name,email,picture"
                  tag="a"
                  textButton=""
                  size="small"
                  cssClass="facebook-btn-style"
                />
              </div>
              <div>
                <p>If you don't have account please <Link to="/auth/webcreateaccount"> Sign
                                up</Link> here.</p>
              </div>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}

export default withSnackbar(Login);

