import BreadCrumb from 'components/common/forms/BreadCrumb';
import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Component } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import * as InoIcons from 'react-icons/io';
import ReactNotification from 'react-notifications-component';
import { Col, Row } from 'reactstrap';
import { deleteUserFeedback, getFeedbacks } from 'service/customerService';


const { SearchBar } = Search;

class CatagoryList extends Component {

  constructor(props) {
    super(props)
    this.notificationDOMRef = React.createRef();
  }

  state = {
    data: [],
    isTableLoading: true,
  }

  componentDidMount = async () => {
    await this.getFeedbacks();
  }

  getFeedbacks = async () => {
    const res = await getFeedbacks();
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

  getColumnHeaders(prefixUrl = "") { //dynamic headers 
    let allKeys = ["UserId", "Email", "Rating", "Comments", "actions"];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "UserId": { dataField: 'userId', text: 'UserId', sort: true, },
      "Email": { dataField: 'email', text: 'Email', sort: true, },
      "Rating": { dataField: 'ratings', text: ' Rating ', sort: true, formatter: this.ratingFormater },
      "Comments": { dataField: 'comments', text: 'Comments', sort: true, },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<InoIcons.IoMdTrash title="Delete" onClick={() => this.deleteFun(row)} />)
    return <div className="actions">{links.concat(" ")}</div>
  }

  ratingFormater(cell, row, rowIndex, formatExtraData) {
    return _.fill(Array(cell)).map((v, i) => <InoIcons.IoIosStar />);
  }

  deleteFun = async (row) => {
    await this.setState({ isTableLoading: true })
    let response;
    let params = `feedbackId=${row.feedbackId}`
    response = await deleteUserFeedback(params)
    if (response.data.statusCode !== 1) return await this.addNotification(response.data.data, "warning")
    if (response.data.statusCode === 1) {
      await this.addNotification(response.data.data)
      await this.getFeedbacks();
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
      title: 'User FeedBack',
      items: [
        { name: 'Home', active: false, link: '/dashboard' },
        { name: 'User FeedBack', active: true },
      ]
    };
    const { data, columns, isTableLoading } = this.state;
    return (
      <React.Fragment >
        <BreadCrumb data={breadCrumbItems} />
        <ReactNotification ref={this.notificationDOMRef} />
        {data && columns && !isTableLoading && <ToolkitProvider
          keyField="categoryId"
          data={data}
          columns={columns}
          search
        >
          {
            props => (
              <div>
                <Row   >
                  <Col sm={10}></Col>
                  <Col sm={2}><SearchBar {...props.searchProps} /></Col>
                </Row>
                <Row>
                  <Col>
                    <div className="table-responsive table-div">
                      {/* <h6>User Details</h6> */}
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

