import 'react-notifications-component/dist/theme.css';
import 'styles/style.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import Noitems from 'images/NoItemsin.svg';
import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import * as InoIcons from 'react-icons/io';
import ReactNotification from 'react-notifications-component';
import { Col, Container, Row } from 'reactstrap';
import { getJwt } from 'service/authService';
import { addtoCart, getWishList, removeWishList } from 'service/profileService';


class Wishlist extends PureComponent {

  state = {
    data: {},
    isTableLoading: true
  }


  constructor(props) {
    super(props);
    this.notificationDOMRef = React.createRef();
  }

  componentDidMount = async () => {
    await this.getUserInfo();
    await this.wishlist()
  }

  async wishlist() {
    const { uid } = this.state;
    let params = `userId=${uid}`
    let res = await getWishList(params)
    if (res.data.statusCode === 1) {
      let r = res.data.data;
      r = r.reverse()
      await this.setState({ wishListDetails: r, isTableLoading: false })
      this.initTableData()
    } else {
      await this.setState({ wishListDetails: [], isTableLoading: false })
    }
  }

  getColumnHeaders(prefixUrl = "") { //dynamic headers 
    let allKeys = ["Items", "Description", "Add to Cart", "Remove"];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "Items": { dataField: 'productName', text: 'Items', sort: true, formatter: imageFormater, },
      "Description": { dataField: 'imageDescription', text: 'Description', formatter: this.descFormatter },
      "Add to Cart": { dataField: 'transactionStatus', text: 'Add to Cart', formatter: this.cartFormatter },
      "Remove": { dataField: 'actions', isDummyField: true, text: "Remove", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<InoIcons.IoMdTrash style={{ color: 'red' }} title="delete" onClick={() => this.deleteFun(row)} />)
    return <div className="actions">{links.concat(" ")}</div>
  }

  cartFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    links.push(<button type="button" className="btn btn-default" id="cardbtn1" onClick={() => this.addToCart(row)}><i className="fa fa-plus"  ></i><i className="fa fa-shopping-cart" style={{ margin: '5px' }}></i></button>)
    return <div className="actions">{links.concat(" ")}</div>
  }

  descFormatter(cell, row, rowIndex, formatExtraData) {
    let links = [];
    links.push(<div><h3 id="h3heading9">{row.productName}</h3>
      <span id="showrupeecolor"><i className="fa fa-rupee"></i> {row.sellingPrice}</span>
      <span id="hiderupeecolor"><i className="fa fa-rupee"></i> {row.mrp}</span>
      <span id="gmscolor"> {row.quantity} {row.productUom}</span><br /><br /></div>)
    return <div className="actions">{links.concat(" ")}</div>
  }

  async deleteFun(data) {
    let params = `wishlistId=${data.wishlistId}`
    let res = await removeWishList(params)
    if (res.data.statusCode !== 1) return this.addNotification(res.data.message, "warning");

    if (res.data.statusCode === 1) {
      this.addNotification(res.data.message);
      this.wishlist();
    }
  }

  getUserInfo = async () => {
    let res = await getJwt('__info');
    const { uid } = res;
    await this.setState({ uid: uid, userInfo: res });
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
    if (res.data.statusCode !== 1) return this.addNotification(res.data.message, 'warning');
    if (res.data.statusCode === 1) return this.addNotification(res.data.message);
  }


  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
    const columns = getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  render() {
    let { isTableLoading, wishListDetails, columns } = this.state;
    const breadCrumbItems = {
      title: 'Wishlist',
      items: [
        { name: 'Profile', active: false, link: '/' },
        { name: 'Wishlist', active: true },
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
        </Container>
        <ReactNotification ref={this.notificationDOMRef} />
        <Container>
          {wishListDetails && wishListDetails.length === 0 &&
            <Row className="bg-white">
              <Col md={3}></Col>
              <Col md={6}>
                <img src={Noitems} alt="NodataFound" />
              </Col>
              <Col md={3}></Col>
            </Row>
          }
          {!isTableLoading && wishListDetails && columns &&
            <Row>
              <Col className="bg-white p-3 table-div">
                <div className="row" >
                  <div className="col-md-7 cartcolumnpadding1">
                    <h3 id="h3heading10">Wishlist</h3>
                  </div>
                </div>
                <div className="table-responsive">
                  <BootstrapTable keyField='productId'
                    data={wishListDetails}
                    columns={columns}
                    bootstrap4
                    pagination={paginationFactory()} striped hover condensed />
                </div>
              </Col>
            </Row>
          }
        </Container>
      </Fragment>
    )
  }
}

export default withSnackbar(Wishlist);


function getColumns(columnsHeaders, hideColumns) {
  let columns = []
  const { keys, def } = columnsHeaders;

  _.forEach(keys, (key) => {
    columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
  })
  return columns;
}

function imageFormater(cell, row, rowIndex, formatExtraData) {
  return <img className="img-thumbnail" src={row.imageUrl} alt="Hello" style={{
    height: '100px',
    width: '100px'
  }} />
}