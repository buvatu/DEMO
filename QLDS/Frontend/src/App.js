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
import { Component } from 'react';
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
import OrderList from './pages/order/OrderList';
import PriceAdjust from './pages/order/PriceAdjust';
import StockInOrder from './pages/order/StockInOrder';
import StockInOrderApprove from './pages/order/StockInOrderApprove';
import StockInOrderDetail from './pages/order/StockInOrderDetail';
import StockInOrderTest from './pages/order/StockInOrderTest';
import StockOutOrder from './pages/order/StockOutOrder';
import StockOutOrderApprove from './pages/order/StockOutOrderApprove';
import StockOutOrderDetail from './pages/order/StockOutOrderDetail';
import StockOutOrderTest from './pages/order/StockOutOrderTest';
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
      setErrorMessage('Phi??n ????ng nh???p ???? h???t h???n. Vui l??ng ????ng nh???p l???i.');
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
                <h3>C???NG TH??NG TIN QU???N L?? ???????NG S???T VI???T NAM</h3>
              </HeaderName>
              {isAuthenticated && (
                <SideNav aria-label="Side navigation" expanded isPersistent>
                  <SideNavItems>
                    <SideNavMenu title="Qu???n l?? chung" isActive>
                      <SideNavMenuItem element={Link} to="/user/list" disabled={role !== 'SysAdmin' && role !== 'CompanyAdmin'}>
                        Qu???n l?? nh??n s???
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/company/list" disabled={role !== 'SysAdmin'}>
                        Qu???n l?? c??ng ty
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    <SideNavMenu title="Qu???n l?? k?? thu???t" isActive>
                      <SideNavMenuItem element={Link} to="/tech/standard">
                        Danh m???c ti??u chu???n k?? thu???t
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/tech/spec/list">
                        Danh m???c th??ng s??? k?? thu???t
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/material/list">
                        Danh m???c v???t t??
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/engine">
                        Danh m???c ?????u m??y
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/supplier">
                        Danh m???c nh?? cung c???p
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/scrap">
                        Danh m???c ph??? li???u
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/scrap-price">
                        ?????nh gi?? ph??? li???u
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    <SideNavMenu title="Qu???n l?? v???t t??" isActive>
                      {role === 'phongkehoachvattu' && (
                        <SideNavMenuItem element={Link} to="/order/stock-in">
                          Y??u c???u nh???p kho
                        </SideNavMenuItem>
                      )}
                      {role === 'phongkehoachvattu' && (
                        <SideNavMenuItem element={Link} to="/order/stock-out">
                          Y??u c???u xu???t kho
                        </SideNavMenuItem>
                      )}
                      <SideNavMenuItem element={Link} to="/order/list">
                        Danh s??ch y??u c???u
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/stock/update">
                        C???p nh???t kho ?????u k??
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/order/price/adjust">
                        C???p nh???t gi?? th??ng tr?????c
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    {/* <SideNavMenu title="Qu???n l?? nhi??u li???u" isActive>
                      <SideNavMenuItem element={Link} to="/vcf">
                        ??i???u ch???nh VCF
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/fuel">
                        B??o c??o nhi??n li???u
                      </SideNavMenuItem>
                    </SideNavMenu> <SideNavDivider /> */}
                    <SideNavMenu title="B??o c??o" isActive>
                      <SideNavMenuItem element={Link} to="/report/stock">
                        B??o c??o t???n kho
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/report/order">
                        B??o c??o xu???t nh???p kho t???ng h???p
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/report/order/stock-in">
                        B??o c??o nh???p kho
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/report/order/stock-out">
                        B??o c??o xu???t kho
                      </SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/engine/analysis/list">
                        Bi??n b???n gi???i th??? ?????u m??y
                      </SideNavMenuItem>
                    </SideNavMenu>
                    <SideNavDivider />
                    <SideNavMenu title="Th??ng tin ng?????i d??ng">
                      <SideNavMenuItem>T??n ????ng nh???p: {userID}</SideNavMenuItem>
                      <SideNavMenuItem>T??n ?????y ?????: {username}</SideNavMenuItem>
                      <SideNavMenuItem>V??? tr??: {roleName}</SideNavMenuItem>
                      <SideNavMenuItem element={Link} to="/login" onClick={async () => this.logout()}>
                        ????ng xu???t
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
            <Route exact path="/engine/analysis" component={isAuthenticated ? EngineAnalysis : Home} />

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

            <Route exact path="/order/stock-in" component={isAuthenticated && role === 'phongkehoachvattu' ? StockInOrder : Home} />
            <Route exact path="/order/stock-in/test" component={isAuthenticated && role === 'phongkythuat' ? StockInOrderTest : Home} />
            <Route exact path="/order/stock-in/approve" component={isAuthenticated && role === 'phongketoantaichinh' ? StockInOrderApprove : Home} />
            <Route exact path="/order/stock-in/detail" component={isAuthenticated ? StockInOrderDetail : Home} />

            <Route exact path="/order/stock-out" component={isAuthenticated && role === 'phongkehoachvattu' ? StockOutOrder : Home} />
            <Route exact path="/order/stock-out/test" component={isAuthenticated && role === 'phongkythuat' ? StockOutOrderTest : Home} />
            <Route exact path="/order/stock-out/approve" component={isAuthenticated && role === 'phongketoantaichinh' ? StockOutOrderApprove : Home} />
            <Route exact path="/order/stock-out/detail" component={isAuthenticated ? StockOutOrderDetail : Home} />
            <Route exact path="/order/list" component={isAuthenticated ? OrderList : Home} />

            <Route exact path="/report/stock" component={isAuthenticated && role === 'phongketoantaichinh' ? StockReport : Home} />
            <Route exact path="/report/order" component={isAuthenticated ? OrderReport : Home} />
            <Route exact path="/report/order/stock-in" component={isAuthenticated && role === 'phongketoantaichinh' ? StockInOrderReport : Home} />
            <Route exact path="/report/order/stock-out" component={isAuthenticated && role === 'phongketoantaichinh' ? StockOutOrderReport : Home} />

            <Route exact path="/vcf" component={isAuthenticated ? VCFAdjust : Home} />
            <Route exact path="/fuel" component={isAuthenticated ? FuelReport : Home} />
            <Route exact path="/stock/update" component={isAuthenticated ? StockUpdate : Home} />

            <Route exact path="/order/price/adjust" component={isAuthenticated && role === 'phongketoantaichinh' ? PriceAdjust : Home} />
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
