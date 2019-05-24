import 'styles/forms.css';

import { post } from 'axios';
import BreadCrumb from 'components/common/forms/BreadCrumb';
import { CustomSelect } from 'components/common/forms/custom-select';
import { Input } from 'components/common/forms/Input';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import { Col, Row } from 'reactstrap';

import { addCategory, updateCategory } from '../../../service/catalogService';
import { apiUrl } from './../../../config.json';

class AddCatagory extends PureComponent {

  constructor(props) {
    super(props)
    this.notificationDOMRef = React.createRef();
  }

  state = {
    data: {},
    status: [{ id: "A", name: "Active" }, { id: "D", name: "InActive" },]
  }

  async componentDidMount() {
    const { formType } = this.props
    if (formType === "edit") {
      const { location: { state } } = this.props.props;
      return this.formStateCheck(state.row);
    }
  }

  formStateCheck = async (data) => {
    await this.setState({ data, categoryId: data.categoryId });
    try {
      await this.formApi.setValues(data);
    } catch (err) {
    }
  }

  setFormApi = formApi => {
    this.formApi = formApi;
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({ [name]: value })
  }

  handleImage = async e => {
    let imgUrl = await this.fileUpload(e.target.files[0]);
    const data = this.formApi.getState().values;
    data['categoryImage'] = imgUrl.data.data;
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

  schema = {
    categoryName: Joi.string().required().label('Category Name'),
    categoryImage: Joi.string().required().label('Category Image'),
    categoryStatus: Joi.string().required().label('Satus'),
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  onSubmit = async () => {
    let response;
    const data = this.formApi.getState().values;
    const { formType } = this.props
    const { categoryId } = this.state;
    if (formType === "add") {
      delete data.categoryimage
      response = await addCategory(data)
    } else {
      delete data.categoryimage
      data['categoryId'] = categoryId
      response = await updateCategory(data)
    }
    if (response.data.statusCode !== 1) return await this.addNotification(response.data.data, "danger")
    if (response.data.statusCode === 1) {
      await this.addNotification(response.data.data)
      await this.resetForm()
    }
  }

  resetForm = async () => {
    this.formApi.reset()
    let path = `/catalog/categories`
    const { formType } = this.props
    if (formType === "edit") {
      setTimeout(() => {
        this.props.props.history.push(path)
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
      FormName = 'Add Catagories'
    } else {
      FormName = 'Edit Catagories'
    }
    const breadCrumbItems = {
      title: `${FormName}`,
      items: [
        { name: "Home", link: "/dashboard" },
        { name: "Categories", link: "/catalog/categories" },
        { name: `${FormName}  `, active: true },
      ]
    };

    return (
      <Fragment> 
        <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <BreadCrumb data={breadCrumbItems} />
              <div className="form-div">
                <Row>
                  <Col md={3} sm={12} >
                    <Input
                      field="categoryName" label="Category Name" name="categoryName" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('categoryName', e)}
                    />
                  </Col>
                  <Col md={3} sm={12} >
                    <CustomSelect field="categoryStatus" label="Status" name="categoryStatus" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.status} onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('categoryStatus', e)}
                    />
                  </Col>
                  <Col md={3} sm={12} >
                    <Input field="categoryimage" type="file" multiple label="Choose Category Image"
                      name="categoryimage" onChange={this.handleImage}
                    />
                  </Col>
                </Row>
                <Row>
                  {formType !== 'add' && <Col md={6} sm={12} >
                    <Input field="categoryImage" label="Category Image"
                      name="categoryImage" readOnly validateOnBlur validate={e => this.validateProperty('categoryImage', e)}
                    />
                  </Col>}
                </Row>
              </div>
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

export default withSnackbar(AddCatagory);