import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import * as IONIcons from 'react-icons/io';
import { NavLink } from 'react-router-dom';
import { Collapse, Nav, Navbar, NavItem } from 'reactstrap';


const menuOptions = [
  {
    "url": "/dashboard",
    "icon": <IONIcons.IoIosCube className="icon1" />,
    "text": "Dashboard",
    "userTypes": ["A", "D", "S"]
  },
  {
    "url": "/orders/order-list",
    "icon": <IONIcons.IoIosApps className="icon1" />,
    "text": "Orders",
    "userTypes": ["A", "D", "S"],
    // "submenu": [
    //   { "text": "Order List", "url": "/orders/order-list", "userTypes": ["A", "D", "S"] },
    //   // { "text": "Statics", "url": "/orders/order-statistics", "userTypes": ["A", "D", "S"] },
    // ]
  },
  {
    "url": "/dashboard",
    "icon": <IONIcons.IoMdBookmarks className="icon1" />,
    "text": "Catalog",
    "userTypes": ["A", "S"],
    "submenu": [
      { "text": "Categories", "url": "/catalog/categories", "userTypes": ["A", "S"] },
      { "text": "Products", "url": "/catalog/products", "userTypes": ["A", "S"] },
      { "text": "Offers", "url": "/catalog/offers", "userTypes": ["A", "S"] },
    ]
  },
  {
    "url": "/dashboard",
    "icon": <IONIcons.IoIosPeople className="icon1" />,
    "text": "Customers",
    "userTypes": ["A", "S"],
    "submenu": [
      { "text": "Users List", "url": "/customer/details", "userTypes": ["A", "S"] },
      { "text": "Feedback", "url": "/customer/feedback", "userTypes": ["A", "S"] },
    ]
  },
  {
    "url": "/banner/list",
    "icon": <IONIcons.IoMdImages className="icon1" />,
    "text": "Banners",
    "userTypes": ["A", "S"],
    // "submenu": [
    //   { "text": "Banners", "url": "/banner/list", "userTypes": ["A", "S"] },
    // ]
  },
  {
    "url": "/contact/list",
    "icon": <IONIcons.IoMdContact className="icon1" />,
    "text": "Contact Details",
    "userTypes": ["A", "S"],
    // "submenu": [
    //   { "text": "Contact Details", "url": "/contact/list", "userTypes": ["A", "S"] },
    // ]
  },
  {
    "url": "/project/config",
    "icon": <IONIcons.IoIosConstruct className="icon1" />,
    "text": "URL Config",
    "userTypes": ["S"]
  },
]
class SideNav extends PureComponent {
  state = {
    collapse: 0,
  }

  componentDidMount = async () => {    
    await this.menuFormation();
  }


  menuFormation = () => {
    const { userRole } = this.props;
    const { collapse } = this.state
    const rightsList = _.filter(menuOptions, v => _.includes(v["userTypes"], userRole));
    return <div className="left-panel">
      <Navbar className="sidemenu pl-0 pr-0" >
        {rightsList &&
          <Nav navbar style={{ width: "100%" }}>
            {_.map(rightsList, (item, i) =>
              <NavItem key={i}>
                {!item["submenu"] &&
                  <NavLink to={item.url} onClick={this.toggle} data-event={i} className="nav-link  ">{item.icon} {item.text}</NavLink>
                }
                {item["submenu"] &&
                  <div onClick={this.toggle} data-event={i} className="nav-link  ">  {item.icon}  {item.text}</div>
                }
                {item.submenu &&
                  <Collapse isOpen={collapse === i} >
                    {_.map(item.submenu, (sm, i) =>
                      <NavLink to={sm.url} className="nav-link inner-a"> {sm.text}</NavLink>
                    )}
                  </Collapse>
                }
              </NavItem>
            )}
          </Nav>
        }
      </Navbar>
    </div>
  }

  toggle = async (e) => {
    let event = e.target.dataset.event;
    await this.setState(state => ({ collapse: state.collapse === Number(event) ? 0 : Number(event) }));
  }

  render() {
    return (
      <Fragment>
        {this.menuFormation()}
      </Fragment>
    )
  }
}


export default SideNav;