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
import { deleteCategory, getCategories, updateCategory } from 'service/catalogService';

const { SearchBar } = Search;
class CatagoryList extends Component {


  state = {
    data: [],
    isTableLoading: true,
  }

  componentDidMount = async () => {
    await this.getCategories();
  }

  getCategories = async () => {
    const res = await getCategories();
    const { data: { statusCode, data } } = res;
    if (!statusCode) return this.setState({ data: [], isTableLoading: false });
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
    let allKeys = ["Category Id", "Category Name", "Category Image", "Category Status", "actions"];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "Category Id": { dataField: 'categoryId', text: 'Category Id ', sort: true, },
      "Category Name": { dataField: 'categoryName', text: 'Category Name ', sort: true, },
      "Category Image": { dataField: 'categoryImage', text: 'Category Image ', formatter: imageFormater, sort: true, },
      "Category Status": { dataField: 'pstatus', isDummyField: true, text: "Category Status", formatter: this.statusFormatter },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  statusFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    if (row.categoryStatus === 'A') {
      links.push("Active")
      return <div className="actions">{links.concat(" ")}</div>
    } else {
      links.push("In-Active")
      return <div className="actions">{links.concat(" ")}</div>
    }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    if (row.categoryStatus === 'A') {
      links.push(<InoIcons.IoMdCreate title="Edit" onClick={() => this.editFun(`/catalog/catagory/edit`, row)} />)
      links.push(<InoIcons.IoMdTrash title="Delete" onClick={() => this.deleteFun(row)} />)
      return <div className="actions">{links.concat(" ")}</div>
    } else {
      links.push(<InoIcons.IoMdCreate title="Edit" onClick={() => this.editFun(`/catalog/catagory/edit`, row)} />)
      links.push(<InoIcons.IoIosRedo title="View" onClick={() => this.changeStatus(row)} />)
      return <div className="actions">{links.concat(" ")}</div>
    }
  }

  changeStatus = async (row) => {
    await this.setState({ isTableLoading: true })
    row.categoryStatus = 'A'
    let response = await updateCategory(row)
    if (response.data.statusCode === 1) {
      await this.getCategories();
      this.addNotification("Status  " + response.data.data)
      await this.setState({ isTableLoading: false })
    }
  }

  editFun = async (url, row) => {
    let path = url;
    this.props.props.history.push({
      pathname: path,
      state: { row }
    })
  }

  deleteFun = async (row) => {
    await this.setState({ isTableLoading: true })
    let response;
    let params = `categoryId=${row.categoryId}`
    response = await deleteCategory(params)
    if (response.data.statusCode !== 1) return this.addNotification(response.data.data, "danger")
    if (response.data.statusCode === 1) {
      this.addNotification(response.data.data)
      await this.getCategories();
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
      title: "Categories",
      items: [
        { name: "Home", active: false, link: "/dashboard" },
        { name: "Categories", active: true },
      ]
    };
    const { data, columns, isTableLoading } = this.state;
    return (
      <React.Fragment >
        <BreadCrumb data={breadCrumbItems} />
        {/* <div className="d-flex justify-content-start">
          <Link to="/catalog/catagory/add">
            <Button size={'sm'} color="primary">
              Add Category
            </Button>
          </Link>
        </div> */}
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
                      <Link to="/catalog/catagory/add">
                        <Button size={'sm'} color="primary">
                          + Add Category
                        </Button>
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

export default withSnackbar(CatagoryList)

function getColumns(columnsHeaders, hideColumns) {
  let columns = []
  const { keys, def } = columnsHeaders;

  _.forEach(keys, (key) => {
    columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
  })
  return columns;
}

function imageFormater(cell, row, rowIndex, formatExtraData) {
  return <img className="img-thumbnail" src={cell} alt="Hello" style={{ height: '50px', width: "50px" }} />
}

