import 'styles/forms.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import { CustomSelect } from 'components/common/forms/custom-select';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import { Col, Row } from 'reactstrap';

import { addContactDetails, updateContactDetails } from '../../../service/contactService';

class AddContact extends PureComponent { 
  state = {
    data: {},
    status: [{ id: "A", name: "Active" }, { id: "D", name: "InActive" },]
  }

  async componentDidMount() {
    const { match: { params: { pageName } } } = this.props.props;
    if (pageName === 'editform') {
      const { location: { state } } = this.props.props;
      return this.formStateCheck(state.row);
    }
  }

  formStateCheck = async (data) => {
    data.delCharges = data.deliveryCharges
    await this.setState({ data, id: data.contactId });
    try {
      await this.formApi.setValues(data);
    } catch (err) {
    }
  }

  schema = {
    email: Joi.string().required().label('Email'),
    contactNo: Joi.number().required().label('ContactNo'),
    address1: Joi.string().required().label('Primary Address'),
    facebook: Joi.string().required().label('Facebook'),
    whatsapp: Joi.string().required().label('Whatsapp'),
    twitter: Joi.string().required().label('Twitter'),
    aboutus: Joi.string().required().label('About Us'),
    terms: Joi.string().required().label('Terms'),
    policy: Joi.string().required().label('Policy'),
    minDelChargeLimit: Joi.number().required().label('Charge Limit'),
    delCharges: Joi.number().required().label('Delivery charge'),
    gstPercentage: Joi.number().required().label('Gst Percentage'),
    contactStatus: Joi.string().required().label('Status'),
    youtube: Joi.string().required().label('Youtube'),

  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  setFormApi = formApi => {
    this.formApi = formApi;
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value
    })
  }

  onSubmit = async () => {
    let response;
    const { id } = this.state
    const data = this.formApi.getState().values;
    const { match: { params: { pageName } } } = this.props.props;
    if (pageName === 'addform') {
      response = await addContactDetails(data)
    } else {
      data['id'] = id
      delete data.deliveryCharges
      delete data.contactId
      response = await updateContactDetails(data)
    }
    if (response.data.statusCode !== 1) return this.addNotification(response.data.data, "danger")
    if (response.data.statusCode === 1) {
      this.addNotification(response.data.data)
      this.resetForm()
    }
  }

  resetForm = async () => {
    this.formApi.reset()
    let path = `/contact/list`
    const { match: { params: { pageName } } } = this.props.props;
    if (pageName === 'editform') {
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
    let FromName;
    const { match: { params: { pageName } } } = this.props.props;
    if (pageName === 'addform') {
      FromName = 'Add Contacts'
    } else {
      FromName = 'Edit Contact'
    }
    const breadCrumbItems = {
      title: `${FromName}`,
      items: [
        { name: "Home", link: "/dashboard" },
        { name: "Contact List", link: "/contact/list" },
        { name: `${FromName}`, active: true },
      ]
    };
    return (
      <Fragment>
        <BreadCrumb data={breadCrumbItems} /> 
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <Row className="form-div">
                <Col md={3} sm={12} >
                  <Input
                    field="email" label="Email" name="email" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('email', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="contactNo" label="Contact No" name="contactNo" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('contactNo', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="facebook" label="Facebook" name="facebook" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('facebook', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="whatsapp" label="Whatsapp" name="whatsapp" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('whatsapp', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="twitter" label="Twitter" name="twitter" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('twitter', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="youtube" label="Youtube" name="youtube" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('youtube', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="minDelChargeLimit" label="Charge Limit" name="minDelChargeLimit" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('minDelChargeLimit', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="delCharges" label="Delivery Charges" name="delCharges" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('delCharges', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="gstPercentage" label="GST Percentage" name="gstPercentage" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('gstPercentage', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <CustomSelect field="contactStatus" label="Status" name="contactStatus" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.status} onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('contactStatus', e)}
                  />
                </Col>
                <Col md={12} sm={12} >
                  <Textarea field="address1" label="Primary Address" name="address1" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('address1', e)} />
                </Col>
                <Col md={12} sm={12} >
                  <Textarea field="address2" label="Secondary Address" name="address2" onChange={this.handleChange} />
                </Col>
                <Col md={12} sm={12} >
                  <Textarea field="aboutus" label="About Us" name="aboutus" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('aboutus', e)} />
                </Col>
                <Col md={12} sm={12} >
                  <Textarea field="terms" label="Terms" name="terms" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('terms', e)} />
                </Col>
                <Col md={12} sm={12} >
                  <Textarea field="policy" label="Policy" name="policy" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('policy', e)} />
                </Col>

              </Row>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-warning btn-sm mr-3" id="cancelbtn" onClick={() => this.resetForm()}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>

      </Fragment>
    )
  }
}


export default withSnackbar(AddContact);