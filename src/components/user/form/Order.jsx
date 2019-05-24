import 'react-notifications-component/dist/theme.css';
import 'styles/style.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import Noorders from 'images/noordersplaced.svg';
import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import { Col, Container, Row } from 'reactstrap';
import { getJwt } from 'service/authService';
import { getOrderbyId } from 'service/ordersService';
import { addtoCart } from 'service/profileService';


class Orders extends PureComponent {

  constructor(props) {
    super(props);

    this.notificationDOMRef = React.createRef();
    this.state = {
      isTableLoading: true
    }

  }


  componentDidMount = async () => {
    await this.getUserInfo()
    await this.getOrders()
  }

  getUserInfo = async () => {
    let res = await getJwt('__info');
    const { uid } = res;
    await this.setState({ uid: uid, userInfo: res });
  }


  getOrders = async () => {
    const { uid } = this.state
    let params = `userId=${uid}`
    let res = await getOrderbyId(params)
    if (res.data.statusCode === 1) {
      await this.setState({ myOrders: res.data.data, isTableLoading: false })
      await this.initTableData()
    } else {
      await this.setState({ myOrders: [], isTableLoading: false })
    }
  }

  getColumnHeaders(prefixUrl = "") { //dynamic headers 
    let allKeys = ["Order ID", "Items", "Description", "Status", "Delivery Date", "actions"];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "Order ID": { dataField: 'orderId', text: 'Order ID', sort: true, formatter: this.orderFormatter },
      "Items": { dataField: 'productUrl', text: 'Items', sort: true, formatter: imageFormater },
      "Delivery Date": { dataField: 'transactionStatus', text: 'Delivery Date', sort: true, formatter: this.deliveryFormater },
      "Description": { dataField: 'productName', text: 'Description', sort: true },
      "Status": { dataField: 'deliveryStatus', text: 'Status', sort: true, formatter: this.statusFormatter },
      "actions": { dataField: 'actions', isDummyField: true, text: "Action", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }



  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
    const columns = getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<button type="button" class="btn btn-default" onClick={() => this.addToCart(row)} id="cardbtn1"><i class="fa fa-plus"
      style={{ margin: "5px" }}></i><i class="fa fa-shopping-cart"></i>

    </button>)
    return <div className="actions">{links.concat(" ")}</div>
  }
  orderFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<div> <p id="footerparagraph">{row.orderId}</p>
      <p id="footerparagraph">{row.orderDate}</p></div>)
    return <div className="actions">{links.concat(" ")}</div>
  }

  statusFormatter = (cell, row, rowIndex, formatExtraData) => {
    return cell === 'Y' ? "Delivered" : "Pending";
  }
  deliveryFormater = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<div> <p>{row.deliveredDate}</p>
      <p>Payment Mode : {row.paymentMode}</p>
      {cell === 'S' ? <p style={{ color: 'green' }}>Transaction : Success</p> : <p style={{ color: 'red' }}>Transaction : Failed</p>}
    </div>)
    return <div className="actions">{links.concat(" ")}</div>
  }


  async addToCart(data) {
    const { userId, productId, categoryId, quantity, productUomId } = data
    let payload =
    {
      "userId": userId,
      "productId": productId,
      "categoryId": categoryId,
      "quantity": quantity,
      "productUom": productUomId,
      "noOfOrder": "1"
    }
    const res = await addtoCart(payload)
    if (res.data.statusCode !== 1) return this.addNotification(res.data.message, "warning");
    if (res.data.statusCode === 1) {
      this.addNotification(res.data.message)
    }
  }


  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  render() {

    const { isTableLoading, myOrders, columns } = this.state;

    const breadCrumbItems = {
      title: 'My Orders',
      items: [
        { name: 'Home', active: false, link: '/' },
        { name: 'My Orders', active: true },
      ]
    };

    return (
      <Fragment>
        <Container>
          <Row>
            <Col>
              <div style={{ marginTop: '50px' }}>
                <BreadCrumb data={breadCrumbItems} />
              </div>
            </Col>
          </Row>
          <Row>
            <Col className="p-3 bg-white table-div">
              {myOrders &&
                <div className="row" >
                  <div className="col-md-7 cartcolumnpadding1">
                    <h3 id="h3heading10">YOUR ORDERS ({myOrders.length})</h3>
                  </div>
                </div>
              }
              {!isTableLoading && myOrders && columns &&
                <div className="table-responsive">

                  <BootstrapTable keyField='orderId'
                    data={myOrders}
                    columns={columns}
                    bootstrap4
                    pagination={paginationFactory()} striped hover condensed />
                </div>
              }
            </Col>
          </Row>
          {myOrders && myOrders.length === 0 &&
            <Row style={{ marginTop: '50px' }}>
              <Col md={3}></Col>
              <Col md={6}>
                <img src={Noorders} alt="NodataFound" />
              </Col>
              <Col md={3}></Col>
            </Row>
          }
        </Container>
      </Fragment>
    )
  }
}




export default withSnackbar(Orders);

function getColumns(columnsHeaders, hideColumns) {
  let columns = []
  const { keys, def } = columnsHeaders;

  _.forEach(keys, (key) => {
    columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
  })
  return columns;
}


function imageFormater(cell, row, rowIndex, formatExtraData) {
  return <img className="img-thumbnail" src={row.productUrl} alt="Hello" style={{ height: '100px', width: '100px' }} />
}