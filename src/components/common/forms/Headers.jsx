import 'styles/userstyle.css';

import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import { Dropdown } from 'react-bootstrap';
import * as IonIcons from 'react-icons/io';
import { Link } from 'react-router-dom';
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
  UncontrolledDropdown,
} from 'reactstrap';
import { getCurrentUser, getJwt, logout } from 'service/authService';
import { getCategories } from 'service/catalogService';
import { getContactList } from 'service/contactService';
import Static from 'service/static';

import logo from './../../../images/userimages/EFV-Logo.png';


var classNames = require('classnames');
class Headers extends PureComponent {


  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false,
      categoryData: [],
      allCategories: '',
      isLogedIn: false,
      userName: ''
    };
  }

  toggle = () => {
    this.setState(state => ({ isOpen: !state.isOpen }));
  }

  componentDidMount = async () => {
    await this.verifyUser();
    await this.getUserInfo();
    await this.getCategories()
    await this.getContactList();
    await this.navlinkGenerate()
  }

  verifyUser = async () => {
    const isStateCheck = this.stateCheck();
    this.setState({ isLogedIn: isStateCheck })
    if (!isStateCheck) {
    } else {
      await this.setState({ isUser: false, })
    }
  }

  getContactList = async () => {
    const res = await getContactList();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ data: [], isTableLoading: false });
    await this.setState({ data, isTableLoading: false })
  }

  stateCheck = () => {
    let isLogedIn = getCurrentUser();
    return isLogedIn;
  }

  getUserInfo = async () => {
    try {
      if (this.stateCheck()) {
        let res = await getJwt('__info');
        const { name } = res;
        await this.setState({ userName: name })
      }
    }
    catch (err) {
    }
  }



  displaycategories = []
  async getCategories() {
    let res = await getCategories()

    if (res.data.statusCode === 1) {
      await this.setState({ allCategories: res.data.data })

      this.displaycategories.push({ "categoryName": "Home" })

      for (let item of this.state.allCategories) {

        if (item.categoryStatus === 'A') {
          this.displaycategories.push(item)
        }
      }

      var datas = this.displaycategories
      await this.setState({ categoryData: datas });
    }

  }

  navlinkGenerate = async () => {
    const { onClick } = this.props;

    const { categoryData } = this.state;
    let navlink = [];
    let morelink = [];
    await _.map(categoryData, function (pageName, i) {
      if (i < 13) {
        navlink.push(<Link key={i} to={`/user/` + pageName['categoryName'].toLowerCase().replace(" ", "-")} onClick={() => onClick(pageName['categoryId'])} className={classNames('btn btn-link')} activeclassname="btn-primary" exact="true">{pageName['categoryName']} </Link>)
      } else {
        morelink.push(
          <DropdownItem key={i}>
            <Link key={i} to={`/user/` + pageName['categoryName'].toLowerCase().replace(" ", "-")} onClick={() => onClick(pageName['categoryId'])} className={classNames('btn btn-link')} activeclassname="btn-primary" exact="true" style={{ color: '#000' }}>{pageName['categoryName']} </Link>
          </DropdownItem>
        )
      }
    });
    if (navlink.length > 0) {
      await this.setState({
        nav: true,
        navlink: navlink
      })

    }
    if (morelink.length > 0) {
      await this.setState({
        more: true,
        morelink: morelink
      })
    }

  }


  logout = async () => {
    const { props } = this.props;
    await logout();
    props.history.push('/user/home');
    window.location.reload();
  }


  render() {

    let { keys: formTypeKey, order: formTypeOrders } = Static.dropdownitems();
    const { onChange } = this.props;
    const { nav, more, navlink, morelink, data, isLogedIn, userName } = this.state

    return (
      <Fragment>
        <div className="container-fluid topheader">
          <div className="row">
            <div className="col-12">
              <div className="topnav">
                <ul>
                  {data && data.length > 0 &&
                    <li>
                      <Link> <IonIcons.IoIosCall />  {data[0].contactNo}  | </Link>
                    </li>
                  }
                  {data && data.length > 0 &&
                    <li>
                      <Link> <IonIcons.IoIosMail /> {data[0].email} |</Link>
                    </li>
                  }
                  {!isLogedIn && <li>
                    <Link to="/auth/identifier">
                      <IonIcons.IoIosPerson />  Sign In |
                    </Link>
                  </li>}

                  {isLogedIn && <li>
                    <Dropdown className="topdropdown">
                      <Dropdown.Toggle id="dropdown-basic"> <IonIcons.IoIosPerson />  {userName} </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item componentClass='span'>
                          {formTypeOrders.map((type) => {
                            if (type === "logout") return <Link key={type} to={{ pathname: `/user/${type}` }} onClick={() => this.logout()} className={classNames('btn btn-link')} activeclassname="btn-primary" exact="true" >{formTypeKey[type]['label']}</Link>;
                            return <Link key={type} to={{ pathname: `/user/${type}` }} on className={classNames('btn btn-link')} activeclassname="btn-primary" exact="true" >{formTypeKey[type]['label']}
                            </Link>
                          }
                          )}
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="container-fluid topheader1">
          <div className="row"  >
            <div className="col-sm-4">
            </div>
            <div className="col-sm-4 "  >
              <img src={logo} className="logoimg" alt="" />
            </div>
            <div className="col-sm-4 d-flex align-items-center">
              <div className="input-group">
                <Input className="form-control3 txt-box" onChange={({ currentTarget: Input }) => onChange(Input.value)} placeholder="search" name="q" autoComplete="off" />
                <div className="input-group-btn">
                  <button className="btn btn-default searchformbutton" type="submit"><IonIcons.IoIosSearch /></button>
                </div>
              </div>
            </div>
          </div>
        </div>


        <Navbar light expand="md" className="navbar navbar-inverse sticky-top navbg animated slideInDown" style={{ zIndex: '999' }}>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              {nav &&
                <NavItem>
                  {navlink}
                </NavItem>
              }

              {more &&
                <UncontrolledDropdown nav inNavbar>
                  <DropdownToggle nav caret>
                    More
                  </DropdownToggle>
                  <DropdownMenu>
                    {morelink}
                  </DropdownMenu>
                </UncontrolledDropdown>
              }

            </Nav>
          </Collapse>
        </Navbar>
      </Fragment>
    )
  }
}

export default Headers;