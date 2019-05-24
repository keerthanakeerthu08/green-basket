import BreadCrumb from 'components/common/forms/BreadCrumb';
import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import * as InoIcons from 'react-icons/io';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { deleteContactDetails, getContactList } from 'service/contactService';

const { SearchBar } = Search;

class ContactList extends Component {

  constructor(props) {
    super(props)
    this.notificationDOMRef = React.createRef();
  }

  state = {
    data: [],
    isTableLoading: true,
  }

  componentDidMount = async () => {
    await this.getContactList();
  }

  getContactList = async () => {
    const res = await getContactList();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ data: [], isTableLoading: false });
    await this.setState({ data, isTableLoading: false })
    await this.initTableData()
  }

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
    const columns = getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  getColumnHeaders(prefixUrl = "") {
    let allKeys = ["Email", "Phone No", "Primary Address", "Secondary Address", "Status", "actions"];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "Email": { dataField: 'email', text: 'Email ', sort: true, },
      "Phone No": { dataField: 'contactNo', text: 'Phone No', sort: true, },
      "Primary Address": { dataField: 'address1', text: 'Primary Address ', sort: true, },
      "Secondary Address": { dataField: 'address2', text: 'Secondary Address ', sort: true, },
      "Status": { dataField: 'pstatus', isDummyField: true, text: "Status", formatter: this.statusFormatter },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  statusFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    if (row.contactStatus === 'A') {
      links.push("Active")
      return <div className="actions">{links.concat(" ")}</div>
    } else {
      links.push("In-Active")
      return <div className="actions">{links.concat(" ")}</div>
    }
  }


  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<InoIcons.IoIosEye title="View" onClick={() => this.viewFun(`/contact/viewform`, row)} />)
    links.push(<InoIcons.IoMdCreate title="Edit" onClick={() => this.editFun(`/contact/editform`, row)} />)
    // links.push(<InoIcons.IoMdTrash title="Delete" onClick={() => this.deleteFun(row)} />)
    return <div className="actions" style={{ display: 'flex' }}>{links.concat(" ")}</div>
  }

  editFun = async (url, row) => {
    let path = url;
    this.props.props.history.push({
      pathname: path,
      state: { row },
    })
  }

  viewFun = async (url, row) => {
    let path = url;
    this.props.props.history.push({
      pathname: path,
      state: { row },
    })
  }

  deleteFun = async (row) => {
    await this.setState({ isTableLoading: true })
    let response;
    let params = `id=${row.contactId}`
    response = await deleteContactDetails(params)
    if (response.data.statusCode !== 1) return this.addNotification(response.data.message, "danger")
    if (response.data.statusCode === 1) {
      this.addNotification(response.data.message)
      await this.getContactList();
      await this.setState({ isTableLoading: false })
    }
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  render() {
    const breadCrumbItems = {
      title: "Contact List",
      items: [
        { name: "Home", active: false, link: "/dashboard" },
        { name: "Contact list", active: true },
      ]
    };
    const { data, columns, isTableLoading } = this.state;
    return (
      <React.Fragment >
        <BreadCrumb data={breadCrumbItems} />

        <div className="clearfix"> </div>
        {data && columns && !isTableLoading && <ToolkitProvider
          keyField="id"
          data={data}
          columns={columns}
          search
        >
          {
            props => (
              <div>
                <Row   >
                  <Col sm={10}>
                    <div className="d-flex justify-content-end">
                      <Link to="/contact/addform" >
                        {data.length === 0 && <Button size={'sm'} color="primary">
                          + Add Contact
                      </Button>}
                      </Link>
                    </div>
                  </Col>
                  <Col sm={2}><SearchBar {...props.searchProps} /></Col>
                </Row>
                <Row>
                  <Col>
                    <div className="table-responsive table-div">
                      <BootstrapTable
                        keyField="categoryId"
                        data={data}
                        columns={columns}
                        {...props.baseProps}
                        bootstrap4
                        pagination={paginationFactory()} striped hover condensed
                        classes="table table-bordered table-hover table-sm"
                        wrapperClasses="table-responsive"
                        noDataIndication={'No data to display here'}
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            )
          }
        </ToolkitProvider>
        }
      </React.Fragment>)
  }
}

export default withSnackbar(ContactList)

function getColumns(columnsHeaders, hideColumns) {
  let columns = []
  const { keys, def } = columnsHeaders;

  _.forEach(keys, (key) => {
    columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
  })
  return columns;
}

