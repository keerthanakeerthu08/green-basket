import 'styles/forms.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import { Input } from 'components/common/forms/Input';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import * as InoIcons from 'react-icons/io';
import { Col, Row } from 'reactstrap';
import { getConfig, postConfig, putConfig } from 'service/configService';


class Configuration extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      data: {},
      tableData: [],
      isEditForm: false,
      isTableLoading: true,
      isFeildShown: false,
      columns: [
        { dataField: 'configId', text: "config Id" },
        { dataField: 'configName', text: 'Config Name ', sort: true, },
        { dataField: 'configValue', text: 'Config Value ', sort: true, },
        { dataField: 'actions', text: "Actions", formatter: this.actionsFormatter }
      ]
    }


    this.notificationDOMRef = React.createRef();


  }



  componentDidMount = async () => {
    await this.getConfig();

  }

  getConfig = async () => {
    await this.setState({ isTableLoading: true, tableData: [] })
    const res = await getConfig();
    const { data: { statusCode, data } } = res;
    if (!statusCode) return this.addNotification("Something went wrong. Please try again later", "danger")
    if (statusCode)
      await this.setState({ tableData: data, isTableLoading: false })
  }


  schema = {
    configName: Joi.string().required().label('configName'),
    configValue: Joi.string().required().label('configValue'),
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
    await this.setState({ [name]: value })
  }

  onSubmit = async () => {
    const { isEditForm } = this.state
    let response;
    const data = this.formApi.getState().values;
    try {
      if (!isEditForm)
        response = await postConfig(data)
      else
        response = await putConfig(data)
      const { data: { statusCode } } = response;

      if (!statusCode) return this.addNotification(response.data.message, "danger")
      if (statusCode) {
        this.addNotification(response.data.message)
        this.resetForm()
      }
    } catch (err) {
      this.addNotification("Something went wrong. Please try again later", "warning")
    }
  }



  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<InoIcons.IoMdCreate title="Edit" onClick={() => this.editFun(row)} />)
    // links.push(<InoIcons.IoMdTrash title="Delete" onClick={() => this.deleteFun(row)} />)
    return <div className="actions" > {links.concat(" ")}</div >
  }

  editFun = async (row) => {
    await this.setState({ isEditForm: true, isFeildShown: true });
    await this.formApi.setValues(row);
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  resetForm = async () => {
    await this.formApi.reset();
    await this.setState({ isEditForm: false, isFeildShown: false });
    await this.getConfig();
  }

  render() {
    let FromName = "Configuration Details";

    const breadCrumbItems = {
      title: `${FromName}`,
      items: [
        { name: "Home", link: "/dashboard" },
        { name: "Configuration", link: "/project/config" },
        { name: `${FromName}`, active: true },
      ]
    };
    const { isTableLoading, columns, tableData, isFeildShown } = this.state;
    return (
      <Fragment>
        <BreadCrumb data={breadCrumbItems} />
        {isFeildShown && <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
          {({ formApi, formState }) => (
            <div>
              <Row className="form-div">
                <Col md={3} sm={12} >
                  <Input
                    field="configName" label="Configuration Name" name="configName" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('configName', e)} readOnly
                  />
                </Col>
                <Col md={5} sm={12} >
                  <Input
                    field="configValue" label="Configuration Value" name="configValue" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('configValue', e)}
                  />
                </Col>

              </Row>
              <div className="d-flex justify-content-end">
                <button type="button" className="btn btn-warning btn-sm mr-3" id="cancelbtn" onClick={() => this.resetForm()}>Cancel</button>
                <button type="submit" className="btn btn-primary btn-sm">Submit</button>
              </div>
            </div>
          )}
        </Form>}

        {!isTableLoading && columns && !isFeildShown &&
          <div className="table-responsive table-div">
            <BootstrapTable keyField='configId' data={tableData} columns={columns} bootstrap4 pagination={paginationFactory()} striped hover condensed />
          </div>
        }
      </Fragment>
    )
  }
}

export default withSnackbar(Configuration);