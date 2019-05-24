import 'styles/table.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import * as InoIcons from 'react-icons/io';
import { Col, Row } from 'reactstrap';
import { getAllOrders } from 'service/ordersService';

const { SearchBar } = Search;

export default class OrderList extends PureComponent {

  state = {
    data: [],
    isTableLoading: true
  }

  componentDidMount = async () => {
    this.getOrederDetails();
  }

  getOrederDetails = async () => {
    const res = await getAllOrders();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ data: [], isTableLoading: false })
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
    let allKeys = ["Order Id", "Product Name", "Quantity", "No of Order", "Status", "actions"];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "Order Id": { dataField: 'orderId', text: 'Order Id', sort: true },
      "Product Name": { dataField: 'productName', text: 'Product Name', sort: true },
      "Quantity": { dataField: 'quantity', text: 'Quantity', sort: true },
      "No of Order": { dataField: 'noOfOrder', text: 'No of Order', sort: true },
      "Status": { dataField: 'ostatus', isDummyField: true, text: "Status", formatter: this.statusFormatter },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }


  statusFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    if (row.deliveryStatus === 'Y') {
      links.push("Delivered")
      return <div className="actions">{links.concat(" ")}</div>
    } else {
      links.push("In-Progress")
      return <div className="actions">{links.concat(" ")}</div>
    }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<InoIcons.IoIosEye title="View" onClick={() => this.viewFun(`/orders/order-view`, row)} />)
    return <div className="actions">{links.concat(" ")}</div>
  }

  viewFun = async (url, row) => {
    let path = url;
    this.props.props.history.push({
      pathname: path,
      state: { row },
    })
  }

  render() {
    const breadCrumbItems = {
      title: 'Order List',
      items: [
        { name: 'Home', active: false, link: '/dashboard' },
        { name: 'Order List', active: true },
      ]
    };

    const { data, columns } = this.state
    return (
      <Fragment>
        <BreadCrumb data={breadCrumbItems} />
        <Row>
          <Col>
          </Col>
        </Row>
        <div className="clearfix"></div>

        {data && columns && <ToolkitProvider
          keyField="id"
          data={data}
          columns={columns}
          search
        >
          {
            props => (
              <div>
                <Row>
                  <Col sm={10}></Col>
                  <Col sm={2}><SearchBar {...props.searchProps} /></Col>
                </Row>
                <Row>
                  <Col>
                    <div className="table-responsive table-div">
                      <BootstrapTable
                        keyField="id"
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
      </Fragment>
    )
  }
}

function getColumns(columnsHeaders, hideColumns) {
  let columns = []
  const { keys, def } = columnsHeaders;

  _.forEach(keys, (key) => {
    columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
  })
  return columns;
}


