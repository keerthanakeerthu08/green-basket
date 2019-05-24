import { post } from 'axios';
import BreadCrumb from 'components/common/forms/BreadCrumb';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import Joi from 'joi-browser';
import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import Dropzone from 'react-dropzone';
import * as IosIcons from 'react-icons/io';
import ReactNotification from 'react-notifications-component';
import { Button, Col, Container, Row } from 'reactstrap';
import { getHomeConfig, updateHomeConfig } from 'service/homeSettings';

class HomeSettings extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      homeData: [],
      files: [],
      isFormHidden: true,
      isFileAvailable: true,
      isLoading: true
    }
    this.notificationDOMRef = React.createRef();
  }

  componentDidMount = async () => {
    this.getHomeConfig();
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    heading: Joi.string().required().label("Title"),
    description: Joi.string().required().label("Description"),
  };


  getHomeConfig = async () => {
    try {
      const res = await getHomeConfig();
      const { data: { statusCode, data: homeData } } = res;
      if (!statusCode) return this.addNotification(homeData, 'warning');
      await this.setState({ homeData, isLoading: false, isFormHidden: true })
    } catch (err) {
    }
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  onDrop = (files = []) => {
    if (files.length !== 1) return
    _.map(files, v => _.assign(v, { preview: URL.createObjectURL(v) }))
    this.setState({ files, isFileAvailable: true });
  };


  imagePreviewList = () => {
    const { files } = this.state;
    return _.map(files, file => (
      <li key={file.name} className="d-flex">
        <img src={file.preview} alt={file.name} className="img-thumbnail mr-3" style={{ maxWidth: "6rem" }} />
        <div style={{ color: "#03A9F4" }}>
          <p className="m-0"> {file.name} </p> <p style={{
            color: "#021a2d",
            fontWeight: 500
          }}>{Math.round((file.size / 1024))} KB </p>
        </div>
      </li >
    ))
  }

  editInfo = async (id) => {
    const { homeData } = this.state;
    const filteredData = _.filter(homeData, v => v["id"] === id);
    await this.setState({ filteredData: filteredData[0], isFormHidden: false })
    await this.formApi.setValues(filteredData[0])
  }

  handleSubmit = async () => {
    let data = this.formApi.getState().values
    await this.setState({ isFileAvailable: this.isFileAvailable() });
    const { isFileAvailable, filteredData } = this.state;
    if (!isFileAvailable) return this.addNotification("Please Select atleast one image", 'warning');
    let image = await this.fileUpload();
    data["image"] = image;
    _.assign(filteredData, data);
    await this.updateContent(filteredData);
  }


  updateContent = async (data) => {
    try {
      let res = await updateHomeConfig(data);
      const { data: { statusCode, message } } = res;
      if (!statusCode) return this.addNotification(message, 'warning');
      await this.setState({ files: [] })
      this.addNotification("Updated Successfully", 'warning');
      await this.getHomeConfig()
    }
    catch (err) {
    }
  }



  fileUpload = async () => {
    try {
      const { files } = this.state;
      const url = `http://paypre.info/green-basket-api/uploadImage`;
      const formData = new FormData();
      formData.append('image', files[0])
      const config = {
        headers: { 'content-type': 'multipart/form-data' }
      }
      let res = await post(url, formData, config);
      const { data: { statusCode, data } } = res;
      if (statusCode) return data;
      return 'https://cdn5.vectorstock.com/i/1000x1000/70/79/delivery-truck-icon-fast-shipping-cargo-vector-12077079.jpg';
    }
    catch (err) {
    }
  }


  isFileAvailable = () => this.state.files.length === 0 ? false : true;

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  render() {
    const { isLoading, isFormHidden, isFileAvailable, homeData } = this.state;
    const breadCrumbItems = {
      title: 'Home Settings',
      items: [
        { name: 'Home', active: false, link: '/' },
        { name: 'Home Settings', active: true },
      ]
    };
    const fileUploadOptions = {
      accept: "image/*",
      multiple: false
    }



    return (
      <Fragment>
        <ReactNotification ref={this.notificationDOMRef} />

        <BreadCrumb data={breadCrumbItems} />
        {isFormHidden && !isLoading && <Container className="mycard  mt-3" style={{ zIndex: 1 }}>
          <Row>
            <Col sm={4} className="borderright">
              <IosIcons.IoMdCreate className="pencil" onClick={() => this.editInfo(homeData[0]["id"])} />
              <img src={homeData[0]["image"]} alt="images" className="img-fluid" />
              <h3>{homeData[0]["heading"]}</h3>
              <p className="p-3">{homeData[0]["description"]}</p>
            </Col>
            <Col sm={4} className="borderright">
              <IosIcons.IoMdCreate className="pencil" onClick={() => this.editInfo(homeData[1]["id"])} />
              <img src={homeData[1]["image"]} alt="images" className="img-fluid" />
              <h3>{homeData[1]["heading"]}</h3>
              <p className="p-3">{homeData[1]["description"]}</p>
            </Col>
            <Col sm={4}>
              <IosIcons.IoMdCreate className="pencil mr-3" onClick={() => this.editInfo(homeData[2]["id"])} />
              <img src={homeData[2]["image"]} alt="images" className="img-fluid" />
              <h3>{homeData[2]["heading"]}</h3>
              <p className="p-3">{homeData[2]["description"]}</p>
            </Col>
          </Row>
        </Container>}
        <Form getApi={this.setFormApi} onSubmit={this.handleSubmit}>
          {({ formApi, formState }) => (
            <Fragment>

              {!isFormHidden && <Container>
                <Row className="bg-white p-3 row-style">
                  <Col sm={6} className="pl-0">
                    <Dropzone onDrop={this.onDrop}>
                      {({ getRootProps, getInputProps }) => (
                        <section className={(isFileAvailable && !formState.invalid) ? "dropzone-section" : "dropzone-section file-error"} >
                          <div {...getRootProps({ className: 'dropzone' })}>
                            <input accept="image/*" {...getInputProps(fileUploadOptions)} />
                            <p>Drag 'n' drop some files here, or click to select files</p>
                          </div>
                          <aside>
                            <ul className="pl-2">{this.imagePreviewList()}</ul>
                          </aside>
                        </section>
                      )}
                    </Dropzone>
                  </Col>
                  <Col sm={6}>
                    <Fragment>
                      <Input field="heading" label="Title"
                        name="heading" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('heading', e)} />
                      <Textarea field="description" label="Description" name="description" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('description', e)} />
                      <div className="text-right">
                        <Button size="sm" color="warning" className="mr-3" onClick={() => this.setState({ isFormHidden: true })} >Cancel</Button>
                        <Button size="sm" color="success">Update</Button>
                      </div>
                    </Fragment>
                  </Col>
                </Row>
              </Container>}
            </Fragment>
          )}
        </Form>
      </Fragment>

    )
  }
}
export default withSnackbar(HomeSettings);