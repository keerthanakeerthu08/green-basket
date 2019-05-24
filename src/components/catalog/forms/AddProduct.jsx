import 'styles/forms.css';

import { post } from 'axios';
import BreadCrumb from 'components/common/forms/BreadCrumb';
import { CustomRadio } from 'components/common/forms/custom-radio';
import { CustomSelect } from 'components/common/forms/custom-select';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import { Col, Row } from 'reactstrap';
import { getcategoryByStatus, getSubCategory, getUoM } from 'service/catalogService';

import { addProduct, updateProduct } from '../../../service/catalogService';
import { apiUrl } from './../../../config.json';

class AddProduct extends PureComponent {

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
    bestSelling: ["Y", "N"],
  }

  componentDidMount = async () => {
    await this.getCategories();
    await this.getUom();
    await this.getSubCategory();
    const { formType } = this.props
    if (formType === "edit") {
      const { location: { state } } = this.props.props;
      return this.formStateCheck(state.row);
    }
  }

  formStateCheck = async (data) => {
    data.productImage = data.image
    data.productUom = data.productUomId
    data.productMrp = data.mrp
    data.productSellingPrice = data.sellingPrice
    await this.setState({ data, productId: data.productId });
    try {
      await this.formApi.setValues(data);
    } catch (err) { }
  }

  schema = {
    categoryId: Joi.number().required().label('Category Name'),
    description: Joi.string().required().label('Description'),
    productQuantity: Joi.number().required().label('Quantity'),
    productUom: Joi.number().required().label('Unit of Control'),
    productMrp: Joi.number().required().label('MRP (Rs)'),
    productSellingPrice: Joi.number().required().label('Selling Price(Rs)'),
    productImage: Joi.string().required().label('Product Image'),
    productStatus: Joi.string().required().label('Status'),
    productName: Joi.string().required().label('Product Name'),
    bestSelling: Joi.string().required().label('Best Selling'),
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

  getUom = async () => {
    const res = await getUoM();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ uomList: [], isLoading: false });
    await this.setState({ uomList: data, isLoading: false });
  }

  getSubCategory = async () => {
    const res = await getSubCategory();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ subCategory: [], isload: false });
    await this.setState({ subCategory: data, isload: false })
  }

  setFormApi = formApi => {
    this.formApi = formApi;
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value,
    })
  }

  handleImage = async e => {
    let imgUrl = await this.fileUpload(e.target.files[0]);
    const data = this.formApi.getState().values;
    data['productImage'] = imgUrl.data.data;
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
    const { productId } = this.state;
    const { formType } = this.props
    if (formType === "add") {
      delete data.productimage
      response = await addProduct(data)
    } else {
      delete data.productimage
      data['productId'] = productId
      response = await updateProduct(data)
    }
    if (response.data.statusCode !== 1) return this.addNotification(response.data.message, "danger")
    if (response.data.statusCode === 1) {
      this.addNotification(response.data.message)
      this.resetForm()
    }
  }

  resetForm = async () => {
    this.formApi.reset()
    let path = `/catalog/products`
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
    let FormName;
    const { formType } = this.props;
    if (formType === 'add') {
      FormName = 'Add Products'
    } else {
      FormName = 'Edit Product'
    }
    const breadCrumbItems = {
      title: `${FormName}`,
      items: [
        { name: "Home", link: "/dashboard" },
        { name: "Products", link: "/catalog/products" },
        { name: `${FormName}`, active: true },
      ]
    };
    return (
      <Fragment>
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <BreadCrumb data={breadCrumbItems} /> 
              <Row className="form-div">
                <Col md={3} sm={12} >
                  <CustomSelect field="categoryId" label="Category Name" name="categoryId" getOptionValue={option => option.categoryId} getOptionLabel={option => option.categoryName} options={this.state.allCatagoryList}
                    onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('categoryId', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <CustomSelect field="subCategoryId" label="SubCategory Name" name="subCategoryId" getOptionValue={option => option.subcategoryId} getOptionLabel={option => option.subcategoryName} options={this.state.subCategory} onChange={this.handleChange}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="productName" label="Product Name" name="productName" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productName', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="productQuantity" label="Quantity" name="Quantity" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productQuantity', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <CustomSelect field="productUom" label="Unit of Control" name="Category Name" getOptionValue={option => option.configId} getOptionLabel={option => option.configValue} options={this.state.uomList} onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productUom', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="productMrp" label="MRP(Rs)" name="MRP(Rs)" onChange={this.handleChange}
                    validateOnBlur validate={e => this.validateProperty('productMrp', e)} />
                </Col>
                <Col md={3} sm={12} >
                  <Input
                    field="productSellingPrice" label="Selling Price(Rs)" name="title" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productSellingPrice', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <CustomSelect field="productStatus" label="Status" name="categoryStatus" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.status} onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('productStatus', e)}
                  />
                </Col>
                <Col md={3} sm={12} >
                  <CustomRadio field="bestSelling" label="Best Selling" name="bestSelling" options={this.state.bestSelling} validateOnBlur validate={e => this.validateProperty('bestSelling', e)} />
                </Col>
                <Col md={3} sm={12} >
                  <Input field="productimage" type="file" multiple label="Choose Image"
                    name="image" onChange={this.handleImage}
                  />
                </Col>
                {formType !== 'add' && <Col md={6} sm={12} >
                  <Input field="productImage" label="Image Url"
                    name="productImage" readOnly validateOnBlur validate={e => this.validateProperty('productImage', e)}
                  />
                </Col>}
                <Col md={12} sm={12} >
                  <Textarea field="description" label="Description" name="Description" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('description', e)} />
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

export default withSnackbar(AddProduct);