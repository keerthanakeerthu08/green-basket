import 'styles/table.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import DashBox from 'components/common/forms/DashBox';
import Filter from 'components/common/forms/Filter';
import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import * as IonIcons from 'react-icons/io';
import { Col, Row } from 'reactstrap';
import { getDeliveryDetails, getToptenValues } from 'service/ordersService';

export default class Statistics extends PureComponent {

  state = {
    data: [],
    isTableLoading: true
  }


  componentDidMount = async () => {
    this.getDeliveryDetails();
    this.getToptenValues();
  }

  getDeliveryDetails = async () => {
    const res = await getDeliveryDetails();
    if (res.data) {
      await this.setState({
        deliveredCount: res.data.deliveredCount,
        pendingCount: res.data.pendingCount,
      })
    }
  }

  getToptenValues = async () => {
    const res = await getToptenValues();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ data: [], isTableLoading: false })
    await this.setState({ data, isTableLoading: false })
    await this.initTableData()
    console.info(data);
  }

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
    const columns = getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  getColumnHeaders(prefixUrl = "") { 
    let allKeys = ["Category Name", "Product Name", "Quantity", "SellingPrice", "MRP", "Status",];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "Product Name": { dataField: 'productName', text: 'Product Name ', sort: true, },
      "Quantity": { dataField: 'productQuantity', text: 'Quantity', sort: true, },
      "Category Name": { dataField: 'categoryName', text: 'Category Name', sort: true, },
      "SellingPrice": { dataField: 'sellingPrice', text: 'SellingPrice', sort: true },
      "MRP": { dataField: 'mrp', text: 'MRP', sort: true },
      "Status": { dataField: 'productStatus', text: 'Status', sort: true, },
    }
    return { "keys": keys, "def": def }
  }

  render() {
    const option = {
      paginationSize: 4,
      pageStartIndex: 1,
      sizePerPage: 100,
      alwaysShowAllBtns: true,
      hideSizePerPage: true,
      hidePageListOnlyOnePage: true,
      firstPageText: 'First',
      prePageText: 'Back',
      nextPageText: 'Next',
      lastPageText: 'Last',
      nextPageTitle: 'First page',
      prePageTitle: 'Pre page',
      firstPageTitle: 'Next page',
      lastPageTitle: 'Last page',
      showTotal: true
    };
    const breadCrumbItems = {
      title: 'Order Statistics',
      items: [
        { name: 'Home', active: false, link: '/dashboard' },
        { name: 'Order Statistics', active: true },
      ]
    };
    const options = ["All time", "Last 24h", "Past Week", "Past Month", "Past Year"];
    const { deliveredCount, pendingCount, data, columns } = this.state
    return (
      <Fragment>
        <BreadCrumb data={breadCrumbItems} />
        <Row>
          <Col>
            <div className="filters">
              <Filter options={options} title="All time" />
            </div>
          </Col>
        </Row>
        <div className="clearfix"></div>
        <Row>
          {deliveredCount &&
            <Col md={4} sm={12}>
              <DashBox bgClass="fst-div" topic="Completed" value={deliveredCount} status="Increased by 60%" icon={<IonIcons.IoMdDoneAll />} />
            </Col>}
          {
            pendingCount && <Col md={4} sm={12}>
              <DashBox bgClass="snd-div" topic="In-Process" value={pendingCount} status="Increased by 30%" icon={<IonIcons.IoIosTime />} />
            </Col>}
          <Col md={4} sm={12}>
            <DashBox bgClass="trd-div" topic="Cancelled" value="150000" status="Decreased by 50%" icon={<IonIcons.IoIosCloseCircleOutline />} />
          </Col>
        </Row>
        <div className="clearfix"></div>
        <Row>
          {data && columns &&
            <Col>
              <h6>Top Selling Products</h6>
              <div className="table-responsive table-div">
                <BootstrapTable keyField='id'
                  data={data}
                  columns={columns}
                  bootstrap4
                  pagination={paginationFactory(option)}
                  striped hover condensed
                  wrapperClasses="table-responsive"
                  noDataIndication={'No data to display here'} />
              </div>
            </Col>
          }
        </Row>
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


