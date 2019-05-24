import 'styles/nav.css';

import loginImg from 'images/EFV-Logo.png';
import React, { Fragment, PureComponent } from 'react';
import * as InoIcons from 'react-icons/io';
import {
  Collapse,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Nav,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
  UncontrolledDropdown,
} from 'reactstrap';
import { logout } from 'service/authService';

class Header extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
  }

  toggle = async () => {
    await this.setState({ isOpen: !this.state.isOpen });
  }

  logout = async () => {
    await logout();
    return window.location.replace("/user/home")
  }


  render() {
    return (
      <Fragment>
        <section className="header-section">
          <Navbar color="light" light expand="md">
            <NavbarBrand href="/"><img src={loginImg} alt="EASYFRUITVEG" style={{width:'50%',height:'50%'}}/>  </NavbarBrand>
            <NavbarToggler onClick={this.toggle} />
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto" navbar>
                <NavItem>
                  <NavLink className="p-0 pl-3 pr-3">
                    <UncontrolledDropdown>
                      <DropdownToggle className="p-0 bg-white border-0" >
                        <span style={{ color: '#1c89fe' }}>  Admin</span>
                        <InoIcons.IoIosContact style={{color: '#1c89fe', height: '25px',width: '35px'
                        }} />
                      </DropdownToggle>
                      <DropdownMenu right>
                        <DropdownItem className="pl-3 text-dark" onClick={this.logout}>Logout</DropdownItem>
                      </DropdownMenu>
                    </UncontrolledDropdown>
                  </NavLink>

                </NavItem>
              </Nav>
            </Collapse>
          </Navbar>
        </section>
      </Fragment>
    )
  }
}

export default Header;