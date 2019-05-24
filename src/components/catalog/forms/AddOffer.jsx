import 'rc-datetime-picker/dist/picker.min.css';
import 'styles/forms.css';

import { post } from 'axios';
import BreadCrumb from 'components/common/forms/BreadCrumb';
import { CustomSelect } from 'components/common/forms/custom-select';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import Joi from 'joi-browser';
import moment from 'moment';
import { withSnackbar } from 'notistack';
import { DatetimePickerTrigger } from 'rc-datetime-picker';
import React, { Fragment, PureComponent } from 'react';
import { Col, Row } from 'reactstrap';
import { getcategoryByStatus, getUoM } from 'service/catalogService';

import { addOffers, updateOffers } from '../../../service/catalogService';
import { getCategorybyId } from '../../../service/dashboardService';
import { apiUrl } from './../../../config.json';



class AddOffer extends PureComponent {

  constructor(props) {
    super(props)
    this.notificationDOMRef = React.createRef();
  }

  state = {
    allCatagoryList: [],
    uomList: [],
    isCatagoryLoading: true,
    isLoading: true,
    isload: true,
    data: {},
    status: [{ id: "A", name: "Active" }, { id: "D", name: "InActive" }],
    bestSelling: ["y", "n"],
    moment: moment(),
    offerStartDate: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm'),
    offerEndDate: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm')
  }

  componentDidMount = async () => {
    await this.getCategories();
    await this.getUom();
    const { formType } = this.props
    if (formType === "edit") {
      const { location: { state } } = this.props.props;
      return this.formStateCheck(state.row);
    }
  }

  formStateCheck = async (data) => {
    data.categoryId = data.categoryID
    data.productId = data.productID
    data.productUom = data.productUomId
    await this.setState({ data, offerId: data.offerId, value: data.categoryId });
    this.getProductDetails()
    try {
      await this.formApi.setValues(data);
    } catch (err) { }
  }

  schema = {
    categoryId: Joi.any().required().label('Category Name'),
    subCategoryId: Joi.any().required().label('SubCategory Name'),
    description: Joi.string().required().label('description'),
    productQty: Joi.number().required().label('Quantity'),
    productUom: Joi.number().required().label('Unit of Control'),
    mrp: Joi.number().required().label('MRP (Rs)'),
    sellingPrice: Joi.number().required().label('Selling Price(Rs)'),
    imageUrl: Joi.string().required().label('Product Image'),
    productStatus: Joi.string().required().label('Status'),
    productId: Joi.any().required().label('Product Name'),
    bestSelling: Joi.string().required().label('Best Selling'),
    offerStartDate: Joi.string().required().label('Start Date'),
    offerEndDate: Joi.string().required().label('End Date'),
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  getCategories = async () => {
    const res = await getcategoryByStatus();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ allCatagoryList: [], isCatagoryLoading: false });
    await this.setState({ allCatagoryList: data, isCatagoryLoading: false })
  }

  getProductDetails = async () => {
    let params, response;
    const { value } = this.state
    params = `categoryId=${value}`
    response = await getCategorybyId(params)
    const { data: { statusCode, data } } = response;
    if (!statusCode)
      return this.setState({ prodectList: [], isCatagoryLoading: false });
    await this.setState({ prodectList: data, isCatagoryLoading: false })
  }

  getUom = async () => {
    const res = await getUoM();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ uomList: [], isLoading: false });
    await this.setState({ uomList: data, isLoading: false });
  }

  setFormApi = formApi => {
    this.formApi = formApi;
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value, title } = Input;
    const { data } = this.state;
    const formData = this.formApi.getState().values;
    data[name] = value;
    if (title === 'productName') {
      formData[title] = Input.options[Input.selectedIndex]['text'];
      this.formApi.setValues(formData)
    }
    if (Input.name === 'categoryId') {
      await this.setState({ value })
      this.getProductDetails()
    }
  }

  handleImage = async e => {
    let imgUrl = await this.fileUpload(e.target.files[0]);
    const data = this.formApi.getState().values;
    data['imageUrl'] = imgUrl.data.data;
    await this.formApi.setValues(data);
  };

  fileUpload(file) {
    const url = `${apiUrl}/uploadImage`;
    const formData = new FormData();
    formData.append('image', file)
    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      }
    }
    return post(url, formData, config)
  }

  onSubmit = async () => {
    let response;
    const data = this.formApi.getState().values;
    const { offerId } = this.state;
    const { formType } = this.props
    if (formType === "add") {
      delete data.img
      response = await addOffers(data)
    } else {
      delete data.categoryID
      delete data.productID
      delete data.img
      data['offerId'] = offerId
      response = await updateOffers(data)
    }
    if (response.data.statusCode !== 1) return this.addNotification(response.data.message, "danger")
    if (response.data.statusCode === 1) {
      this.addNotification(response.data.message)
      this.resetForm()
    }
  }
  resetForm = async () => {
    this.formApi.reset()
    let path = `/catalog/offers`
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

  dateChange = async (moment) => {
    this.setState({ offerEndDate: moment.format('YYYY-MM-DD HH:mm') });
    await this.formApi.setValue("offerEndDate", moment.format('YYYY-MM-DD HH:mm'))
  }

  startdateChange = async (moment) => {
    this.setState({ offerStartDate: moment.format('YYYY-MM-DD HH:mm') });
    await this.formApi.setValue("offerStartDate", moment.format('YYYY-MM-DD HH:mm'))
  }

  render() {
    let FormName;
    const { formType } = this.props;
    if (formType === 'add') {
      FormName = 'Add Offers'
    } else {
      FormName = 'Edit Offer'
    }
    const breadCrumbItems = {
      title: `${FormName}`,
      items: [
        { name: "Home", link: "/dashboard" },
        { name: "Offers", link: "/catalog/offers" },
        { name: `${FormName}`, active: true },
      ]
    };
    const { offerStartDate, offerEndDate } = this.state
    return (
      <Fragment>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <BreadCrumb data={breadCrumbItems} /> 
              <Row className="form-div">
                <Col md={3} sm={12} >
                  <CustomSelect field="categoryId" label="Category Name" title="categoryName" name="categoryId" getOptionValue={option => option.categoryId} getOptionLabel={option => option.categoryName} options={this.state.allCatagoryList}
                    onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('categoryId', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <CustomSelect field="productId" label="product Name" title="productName" name="productName" getOptionValue={option => option.productId} getOptionLabel={option => option.productName} options={this.state.prodectList}
                    onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productId', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="productQty" label="Quantity" name="Quantity" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productQty', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <CustomSelect field="productUom" label="Unit of Control" name="Category Name" getOptionValue={option => option.configId} getOptionLabel={option => option.configValue} options={this.state.uomList} onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productUom', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="mrp" label="MRP(Rs)" name="MRP(Rs)" onChange={this.handleChange}
                    validateOnBlur validate={e => this.validateProperty('mrp', e)} />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="sellingPrice" label="Selling Price(Rs)" name="title" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('sellingPrice', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <DatetimePickerTrigger
                    moment={moment(offerStartDate)}
                    onChange={this.startdateChange}>
                    <Input field="offerStartDate" name="offerStartDate" label="Start Date" validateOnBlur validate={e => this.validateProperty('offerStartDate', e)} />
                  </DatetimePickerTrigger>
                </Col>
                <Col md={3} sm={12} >
                  <DatetimePickerTrigger
                    moment={moment(offerEndDate)}
                    onChange={this.dateChange}>
                    <Input field="offerEndDate" name="offerEndDate" label="End Date" validateOnBlur validate={e => this.validateProperty('offerEndDate', e)} />
                  </DatetimePickerTrigger>
                </Col>
                <Col md={3} sm={12} >
                  <CustomSelect field="productStatus" label="Status" name="productStatus" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.status} onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productStatus', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input field="img" type="file" multiple label="Choose Image"
                    name="img" onChange={this.handleImage}
                  />
                </Col>
                {formType !== 'add' && <Col md={6} sm={12} >
                  <Input field="imageUrl" label="Image Url"
                    name="imageUrl" readOnly validateOnBlur validate={e => this.validateProperty('imageUrl', e)}
                  />
                </Col>}
                <Col md={12} sm={12} >
                  <Textarea field="description" label="description" name="description" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('description', e)} />
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-warning btn-sm mr-3" id="cancelbtn" onClick={() => this.resetForm()}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>
      </Fragment >
    )
  }
}

export default withSnackbar(AddOffer);

