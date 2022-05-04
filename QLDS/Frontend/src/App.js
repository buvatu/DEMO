import {
  Content,
  Header,
  HeaderContainer,
  HeaderName,
  SideNav,
  SideNavDivider,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem,
  SkipToContent,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch, withRouter } from 'react-router-dom';
import { removeCurrentLoggedInUser, setCurrentLoggedInUser } from './actions/authAction';
import { assignErrorMessage, setLoadingValue } from './actions/commonAction';
import './App.scss';
import { ACCESS_TOKEN } from './constants';
import CompanyAdd from './pages/company/CompanyAdd';
import CompanyList from './pages/company/CompanyList';
import CompanyUpdate from './pages/company/CompanyUpdate';
import Engine from './pages/engine/Engine';
import EngineAnalysis from './pages/engine/EngineAnalysis';
import EngineAnalysisList from './pages/engine/EngineAnalysisList';
import FuelReport from './pages/fuel/FuelReport';
import Home from './pages/Home';
import Login from './pages/Login';
import MaterialAdd from './pages/material/MaterialAdd';
import MaterialList from './pages/material/MaterialList';
import MaterialUpdate from './pages/material/MaterialUpdate';
import OrderDetails from './pages/order/OrderDetails';
import OrderList from './pages/order/OrderList';
import StockInOrder from './pages/order/StockInOrder';
import StockOutOrder from './pages/order/StockOutOrder';
import OrderReport from './pages/report/OrderReport';
import StockInOrderReport from './pages/report/StockInOrderReport';
import StockOutOrderReport from './pages/report/StockOutOrderReport';
import StockReport from './pages/report/StockReport';
import Scrap from './pages/scrap/Scrap';
import ScrapPriceAdjust from './pages/scrap/ScrapPriceAdjust';
import StockUpdate from './pages/stock/StockUpdate';
import Supplier from './pages/supplier/Supplier';
import TechSpecAdd from './pages/tech/TechSpecAdd';
import TechSpecList from './pages/tech/TechSpecList';
import TechSpecUpdate from './pages/tech/TechSpecUpdate';
import TechStandard from './pages/tech/TechStandard';
import UserAdd from './pages/user/UserAdd';
import UserList from './pages/user/UserList';
import UserUpdate from './pages/user/UserUpdate';
import VCFAdjust from './pages/vcf/VCFAdjust';
import { getUserInfoByToken, signout } from './services';

class App extends Component {
  componentDidMount = async () => {
    const { removeUserInfo, history, setLoading, setErrorMessage, setUserInfo } = this.props;
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token == null) {
      removeUserInfo();
      history.push('/login');
      return;
    }
    setLoading(true);
    try {
      const getUserInfoByTokenResult = await getUserInfoByToken(token);
      setUserInfo(getUserInfoByTokenResult.data);
    } catch (error) {
      removeUserInfo();
      history.push('/login');
      setErrorMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    setLoading(false);
  };

  logout = async () => {
    const { removeUserInfo, auth, history } = this.props;
    const { userID } = auth;
    const token = localStorage.getItem(ACCESS_TOKEN);
    removeUserInfo();
    await signout(userID, token);
    history.push('/home');
  };

  render() {
    const { auth } = this.props;
    const { isAuthenticated, companyName, role, username, roleName, userID } = auth;

    return (
      <div>
        <HeaderContainer
          render={() => (
            <Header aria-label="Carbon Tutorial">
              <SkipToContent />
              <HeaderName element={Link} to="/" prefix="">
                {companyName}
              </HeaderName>
              <HeaderName element={Link} to="/" prefix="">
                <span className="bx--header-margin-right" style={isAuthenticated ? { minWidth: '15rem' } : { minWidth: '30rem' }} />
                <h3>CỔNG THÔNG TIN QUẢN LÝ ĐƯỜNG SẮT VIỆT NAM</h3>
              </HeaderName>
              {isAuthenticated && (
                <SideNav aria-label="Side navigation" expanded isPersistent>
                  <SideNavItems>
                    <SideNavMenu title="Quản lý chung" isActive>
                      <SideNavMenuItem element={Link} to="/user/list" disabled={role !== 'SysAdmin' && role !== 'CompanyAdmin'}>
                        Quản lý nhân sự
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/company/list" disabled={role !== 'SysAdmin'}>
                        Quản lý công ty
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    <SideNavMenu title="Quản lý kĩ thuật" isActive>
                      <SideNavMenuItem element={Link} to="/tech/standard">
                        Danh mục tiêu chuẩn kĩ thuật
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/tech/spec/list">
                        Danh mục thông số kĩ thuật
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/material/list">
                        Danh mục vật tư
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/engine">
                        Danh mục đầu máy
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/supplier">
                        Danh mục nhà cung cấp
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/scrap">
                        Danh mục phế liệu
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/scrap-price">
                        Định giá phế liệu
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    <SideNavMenu title="Quản lý vật tư" isActive>
                      {role === 'phongkehoach' && (
                        <SideNavMenuItem element={Link} to="/order/stock-in">
                          Yêu cầu nhập kho
                        </SideNavMenuItem>
                      )}
                      {role === 'phongkehoach' && (
                        <SideNavMenuItem element={Link} to="/order/stock-out">
                          Yêu cầu xuất kho
                        </SideNavMenuItem>
                      )}
                      <SideNavMenuItem element={Link} to="/order/list">
                        Danh sách yêu cầu chờ duyệt
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/stock/update">
                        Cập nhật kho đầu kì
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    <SideNavMenu title="Quản lý nhiêu liệu" isActive>
                      <SideNavMenuItem element={Link} to="/vcf">
                        Điều chỉnh VCF
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/fuel">
                        Báo cáo nhiên liệu
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    <SideNavMenu title="Báo cáo" isActive>
                      <SideNavMenuItem element={Link} to="/report/stock">
                        Báo cáo tồn kho
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/report/order">
                        Báo cáo xuất nhập kho tổng hợp
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/report/order/stock-in">
                        Báo cáo nhập kho
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/report/order/stock-out">
                        Báo cáo xuất kho
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/engine/analysis/list">
                        Biên bản giải thể đầu máy
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    <SideNavMenu title="Thông tin người dùng">
                      <SideNavMenuItem>Tên đăng nhập: {userID}</SideNavMenuItem>
                      <SideNavMenuItem>Tên đầy đủ: {username}</SideNavMenuItem>
                      <SideNavMenuItem>Vị trí: {roleName}</SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/login" onClick={async () => this.logout()}>
                        Đăng xuất
                      </SideNavMenuItem>
                    </SideNavMenu>
                  </SideNavItems>
                </SideNav>
              )}
            </Header>
          )}
        />
        <Content className={`${isAuthenticated ? 'bx--side-nav__navigation_margin' : ''}`}>
          <Switch>
            <Route exact path="/" component={Home} />
            <Route exact path="/home" component={Home} />
            <Route exact path="/login" component={Login} />

            <Route exact path="/user/list" component={isAuthenticated && (role === 'SysAdmin' || role === 'CompanyAdmin') ? UserList : Home} />
            <Route exact path="/user/add" component={isAuthenticated && (role === 'SysAdmin' || role === 'CompanyAdmin') ? UserAdd : Home} />
            <Route exact path="/user/update" component={isAuthenticated ? UserUpdate : Login} />

            <Route exact path="/company/list" component={isAuthenticated && role === 'SysAdmin' ? CompanyList : Home} />
            <Route exact path="/company/add" component={isAuthenticated && role === 'SysAdmin' ? CompanyAdd : Home} />
            <Route exact path="/company/update" component={isAuthenticated && role === 'SysAdmin' ? CompanyUpdate : Home} />

            <Route exact path="/engine" component={isAuthenticated ? Engine : Login} />
            <Route exact path="/engine/analysis/list" component={isAuthenticated ? EngineAnalysisList : Home} />
            <Route exact path="/engine/analysis/add" component={isAuthenticated ? EngineAnalysis : Home} />
            <Route exact path="/engine/analysis/update" component={isAuthenticated ? EngineAnalysis : Home} />

            <Route exact path="/supplier" component={isAuthenticated ? Supplier : Login} />

            <Route exact path="/tech/standard" component={isAuthenticated ? TechStandard : Home} />
            <Route exact path="/tech/spec/list" component={isAuthenticated ? TechSpecList : Home} />
            <Route exact path="/tech/spec/add" component={isAuthenticated ? TechSpecAdd : Home} />
            <Route exact path="/tech/spec/update" component={isAuthenticated ? TechSpecUpdate : Home} />

            <Route exact path="/material/list" component={isAuthenticated ? MaterialList : Home} />
            <Route exact path="/material/add" component={isAuthenticated ? MaterialAdd : Home} />
            <Route exact path="/material/update" component={isAuthenticated ? MaterialUpdate : Home} />

            <Route exact path="/scrap" component={isAuthenticated ? Scrap : Login} />
            <Route exact path="/scrap-price" component={isAuthenticated ? ScrapPriceAdjust : Login} />

            <Route exact path="/order/stock-in" component={isAuthenticated && role === 'phongkehoach' ? StockInOrder : Home} />
            <Route exact path="/order/stock-out" component={isAuthenticated && role === 'phongkehoach' ? StockOutOrder : Home} />
            <Route exact path="/order/list" component={isAuthenticated ? OrderList : Home} />
            <Route exact path="/order/details" component={isAuthenticated ? OrderDetails : Home} />

            <Route exact path="/report/stock" component={isAuthenticated ? StockReport : Home} />
            <Route exact path="/report/order" component={isAuthenticated ? OrderReport : Home} />
            <Route exact path="/report/order/stock-in" component={isAuthenticated ? StockInOrderReport : Home} />
            <Route exact path="/report/order/stock-out" component={isAuthenticated ? StockOutOrderReport : Home} />

            <Route exact path="/vcf" component={isAuthenticated ? VCFAdjust : Home} />
            <Route exact path="/fuel" component={isAuthenticated ? FuelReport : Home} />
            <Route exact path="/stock/update" component={isAuthenticated ? StockUpdate : Home} />
          </Switch>
        </Content>
      </div>
    );
  }
}

App.propTypes = {
  setUserInfo: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  removeUserInfo: PropTypes.func.isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    userID: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string,
    roleName: PropTypes.string,
    isActive: PropTypes.bool,
    companyID: PropTypes.string,
    companyName: PropTypes.string,
  }).isRequired,
  common: PropTypes.shape({ errorMessage: PropTypes.string }).isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  common: state.common,
});

const mapDispatchToProps = (dispatch) => ({
  setUserInfo: (userInfo) => dispatch(setCurrentLoggedInUser(userInfo)),
  removeUserInfo: () => dispatch(removeCurrentLoggedInUser()),
  setErrorMessage: (errorMessage) => dispatch(assignErrorMessage(errorMessage)),
  setLoading: (loading) => dispatch(setLoadingValue(loading)),
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
