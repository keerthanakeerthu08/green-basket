import BreadCrumb from 'components/common/forms/BreadCrumb';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import ReactNotification from 'react-notifications-component';
import { Col, Row } from 'reactstrap';
import { signUp } from 'service/authService';
import { updateUserDetails } from 'service/customerService';



class AddUser extends PureComponent {

  constructor(props) {
    super(props)
    this.notificationDOMRef = React.createRef();
  }

  state = {
    data: {}
  }

  async componentDidMount() {
    const { formType } = this.props
    if (formType === "edit") {
      const { location: { state } } = this.props.props;
      return this.formStateCheck(state.row);
    }
  }

  formStateCheck = async (data) => {
    data.name = data.userName
    data.contact = data.phone
    await this.setState({ data, userId: data.userId });
    try {
      await this.formApi.setValues(data);
    } catch (err) { }
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
    password: Joi.string().required().label("Password"),
    confirmPassword: Joi.string().required().label("Confirm Password"),
    address1: Joi.string().required().label('Address'),
    city1: Joi.string().required().label('City'),
    state1: Joi.string().required().label('State'),
    pincode1: Joi.string().required().label('Pincode'),
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
    let response;
    const data = this.formApi.getState().values;
    const { formType } = this.props
    if (formType === "add") {
      if (data.password !== data.confirmPassword) {
        this.addNotification('Password Mismatch', "warning")
        this.formApi.setValue('password', '')
        this.formApi.setValue('confirmPassword', '')
      } else {
        const { password, name, email, contact } = data
        let payload = {
          "password": password,
          "name": name,
          "email": email,
          "contact": contact,
          "userRole": "D"
        }
        let res = await signUp(payload)
        if (res.data.statusCode === 1) {
          this.addNotification(res.data.message)
          this.resetForm()
          this.props.props.history.push(`/customer/details`)
        } else if (res.data.statusCode !== 1) {
          this.addNotification(res.data.message, "warning")
        }
      }
    } else if (formType === "edit") {
      const { name, email, contact, userId, address1, city1, pincode1, state1 } = data
      let payload = {
        "address1": address1,
        "city1": city1,
        "pincode1": pincode1,
        "address2": "",
        "city2": "",
        "pincode2": "",
        "state2": "",
        "addType2": "",
        "email": email,
        "defaultAddress": "",
        "state1": state1,
        "name": name,
        "secondaryContactNo": "",
        "primaryContactNo": contact,
        "addType1": "o",
        "userId": userId
      }
      response = await updateUserDetails(payload)
      if (response.data.statusCode !== 1) return this.addNotification(response.data.message, "warning")
      if (response.data.statusCode === 1) {
        this.addNotification(response.data.message)
        this.resetForm()
      }
    }

  }

  resetForm = async () => {
    this.formApi.reset();
    let path = `/customer/details`
    const { formType } = this.props
    if (formType === "edit") {
      setTimeout(() => {
        this.props.props.history.push({
          pathname: path,
        })
      }, 3000);

    }
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  render() {
    const { formType } = this.props;
    const breadCrumbItems = {
      title: formType + " Customer",
      items: [
        { name: "Home", link: "/dashboard" },
        { name: "User Details", link: "/customer/details" },
        { name: `${formType} Customer `, active: true },
      ]
    };
    return (
      <Fragment >
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <BreadCrumb data={breadCrumbItems} />
              <ReactNotification ref={this.notificationDOMRef} />
              <div className="form-div">
                <Row style={{ margin: '10px' }}>
                  <Col md={4} sm={12} >
                    <Input field="name" label="Name" name="name" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('name', e)} />
                  </Col>
                  <Col md={4} sm={12} >
                    <Input field="email" label="Email" name="email" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('email', e)} />
                  </Col>
                  <Col md={4} sm={12} >
                    <Input field="contact" label="Contact No" maxLength="10" name="contact" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('contact', e)} />
                  </Col>
                </Row>
                {this.props.formType === 'add' &&
                  <Row style={{ margin: '10px' }}>
                    <Col md={4} sm={12} >
                      <Input field="password" type="password" label="Password" name="password" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('password', e)} />
                    </Col>
                    <Col md={4} sm={12} >
                      <Input field="confirmPassword" type="password" label="Confirm Password" name="confirmPassword" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('confirmPassword', e)} />
                    </Col>
                  </Row>
                }
                {this.props.formType === 'edit' &&
                  <Row style={{ margin: '10px' }}>
                    <Col md={4} sm={12} >
                      <Textarea field="address1" label="Address" name="address1" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('address1', e)} />
                    </Col>
                    <Col md={4} sm={12} >
                      <Input field="city1" label="City" name="city1" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('city1', e)} />
                    </Col>
                    <Col md={4} sm={12} >
                      <Input field="state1" label="State" name="state1" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('state1', e)} />
                    </Col>
                    <Col md={4} sm={12} >
                      <Input field="pincode1" label="Pincode" name="pincode1" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('pincode1', e)} />
                    </Col>
                  </Row>
                }
              </div>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-warning btn-sm mr-3" id="cancelbtn" onClick={() => this.resetForm()}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>
      </Fragment>
    );
  }
}

export default withSnackbar(AddUser);