import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComposedModal,
  DatePicker,
  DatePickerInput,
  Dropdown,
  InlineNotification,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { getOrderList, getUserList } from '../../services';

class OrderList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: '',
      statusList: [],
      requestDate: '',
      requestor: '',
      requestorList: [],
      tester: '',
      testerList: [],
      approver: '',
      approverList: [],
      orderList: [],
      orderListDisplay: [],
      page: 1,
      pageSize: 10,
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    const { pageSize } = this.state;
    if (auth.role !== 'phongkehoachvattu' && auth.role !== 'phongkythuat' && auth.role !== 'phongketoantaichinh') {
      setErrorMessage('Bạn không đủ quyền truy cập trang này');
      return;
    }
    setLoading(true);
    try {
      const getRequestorListResult = await getUserList('', '', auth.companyID, 'phongkehoachvattu');
      const getTesterListResult = await getUserList('', '', auth.companyID, 'phongkythuat');
      const getApproverListResult = await getUserList('', '', auth.companyID, 'phongketoantaichinh');
      const getOrderListResult = await getOrderList(auth.role, auth.userID);
      const orderList = getOrderListResult.data;
      let searchResultList = [];
      if (auth.role === 'phongkehoachvattu') {
        searchResultList = orderList.filter((e) => e.status === 'requested' || e.status === 'tested');
      }
      if (auth.role === 'phongkythuat') {
        searchResultList = orderList.filter((e) => e.status === 'requested');
      }
      if (auth.role === 'phongketoantaichinh') {
        searchResultList = orderList.filter((e) => e.status === 'tested');
      }
      this.setState({
        requestor: auth.role === 'phongkehoachvattu' ? auth.userID : '',
        requestorList: getRequestorListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        tester: auth.role === 'phongkythuat' ? auth.userID : '',
        testerList: getTesterListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        approver: auth.role === 'phongketoantaichinh' ? auth.userID : '',
        approverList: getApproverListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        orderList,
        orderListDisplay: searchResultList.slice(0, pageSize),
        statusList: [
          { id: 'requested', label: 'Chờ nghiệm thu' },
          { id: 'tested', label: 'Chờ phê duyệt' },
          { id: 'completed', label: 'Đã hoàn thành' },
          { id: 'canceled', label: 'Bị huỷ' },
        ],
      });
    } catch {
      setErrorMessage('Có lỗi khi tải trang. Vui lòng thử lại');
      return;
    }

    setLoading(false);
  };

  findOrderList = async () => {
    const { status, requestor, tester, approver, requestDate, pageSize, orderList } = this.state;
    let searchResultList = [];
    if (status !== '') {
      searchResultList = orderList.filter((e) => e.status === status);
    }
    if (requestor !== '') {
      searchResultList = orderList.filter((e) => e.requestor === requestor);
    }
    if (tester !== '') {
      searchResultList = orderList.filter((e) => e.tester === tester);
    }
    if (approver !== '') {
      searchResultList = orderList.filter((e) => e.approver === approver);
    }
    if (requestDate !== '') {
      searchResultList = orderList.filter((e) => e.requestDate === requestDate);
    }
    this.setState({
      page: 1,
      orderListDisplay: searchResultList.slice(0, pageSize),
    });
  };

  formatDate = (inputDate) => {
    if (inputDate === undefined) {
      return '';
    }
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  getOrderPath = (order) => {
    const { auth } = this.props;
    if (auth.role === 'phongkythuat' && order.status === 'requested') {
      return 'test';
    }
    if (auth.role === 'phongketoantaichinh' && order.status === 'tested') {
      return 'approve';
    }
    return 'detail';
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common, auth } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { status, statusList, requestDate, requestor, requestorList, tester, testerList, approver, approverList, orderList, orderListDisplay, page, pageSize } =
      this.state;

    return (
      <div className="order-list">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal
          className="btn-success"
          open={submitResult !== ''}
          size="sm"
          onClose={() => {
            setSubmitResult('');
            history.push('/home');
          }}
        >
          <ModalHeader iconDescription="Close" title={<div>Thao tác thành công</div>} />
          <ModalBody aria-label="Modal content">
            <div className="form-icon">
              <CloudUpload32 className="icon-prop" />
              <p className="bx--modal-content__text">{submitResult}</p>
            </div>
          </ModalBody>
          <ModalFooter
            onRequestSubmit={() => {
              setSubmitResult('');
              history.push('/home');
            }}
            primaryButtonText="OK"
            secondaryButtonText=""
          />
        </ComposedModal>
        {/* Error Message */}
        <div className="bx--grid">
          <div className="bx--row">
            {errorMessage !== '' && <InlineNotification lowContrast kind="error" title={errorMessage} onCloseButtonClick={() => setErrorMessage('')} />}
          </div>
        </div>
        <br />
        <div className="view-header--box">
          <h4>Danh sách yêu cầu</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="status-Dropdown"
                titleText="Trạng thái"
                label=""
                items={statusList}
                selectedItem={statusList.find((e) => e.id === status)}
                onChange={(e) => this.setState({ status: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="requestor-Dropdown"
                titleText="Người tạo yêu cầu"
                label=""
                items={requestorList}
                selectedItem={requestor === '' ? null : requestorList.find((e) => e.id === requestor)}
                onChange={(e) => this.setState({ requestor: e.selectedItem.id })}
                disabled={auth.role === 'phongkehoachvattu'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="tester-Dropdown"
                titleText="Người nghiệm thu"
                label=""
                items={testerList}
                selectedItem={tester === '' ? null : testerList.find((e) => e.id === tester)}
                onChange={(e) => this.setState({ tester: e.selectedItem.id })}
                disabled={auth.role === 'phongkythuat'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="approver-Dropdown"
                titleText="Người phê duyệt"
                label=""
                items={approverList}
                selectedItem={approver === '' ? null : approverList.find((e) => e.id === approver)}
                onChange={(e) => this.setState({ approver: e.selectedItem.id })}
                disabled={auth.role === 'phongketoantaichinh'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ requestDate: this.formatDate(e[0]) })} value={requestDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày tạo yêu cầu" id="requestDate-datepicker" />
              </DatePicker>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.findOrderList()} style={{ marginTop: '1rem' }}>
                Tìm
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-12">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Tên yêu cầu</TableHeader>
                      <TableHeader>Loại yêu cầu</TableHeader>
                      <TableHeader>Người yêu cầu</TableHeader>
                      <TableHeader>Lý do lập</TableHeader>
                      <TableHeader>Ngày tạo</TableHeader>
                      <TableHeader>Người nghiệm thu</TableHeader>
                      <TableHeader>Người phê duyệt</TableHeader>
                      <TableHeader>Trạng thái</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderListDisplay.map((order) => (
                      <TableRow>
                        <TableCell>
                          <Link
                            to={{
                              pathname: (order.orderType === 'I' ? '/order/stock-in/' : '/order/stock-out/').concat(this.getOrderPath(order)),
                              search: `?orderID=${order.id}`,
                            }}
                          >
                            {order.orderName}
                          </Link>
                        </TableCell>
                        <TableCell>{order.orderType === 'I' ? 'Yêu cầu nhập kho' : 'Yêu cầu xuất kho'}</TableCell>
                        <TableCell>{order.requestor}</TableCell>
                        <TableCell>{order.requestNote}</TableCell>
                        <TableCell>{order.requestDate}</TableCell>
                        <TableCell>{order.tester}</TableCell>
                        <TableCell>{order.approver}</TableCell>
                        <TableCell>
                          {order.status === 'requested' && 'Chờ nghiệm thu'}
                          {order.status === 'tested' && 'Chờ phê duyệt'}
                          {order.status === 'completed' && 'Đã hoàn thành'}
                          {order.status === 'canceled' && 'Đã huỷ'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Pagination
                className="fixed-pagination"
                backwardText="Previous page"
                forwardText="Next page"
                itemsPerPageText="Items per page:"
                page={page}
                pageNumberText="Page Number"
                pageSize={pageSize}
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={orderList.length}
                onChange={(target) => {
                  this.setState({
                    orderListDisplay: orderList.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                    page: target.page,
                    pageSize: target.pageSize,
                  });
                }}
              />
            </div>
          </div>
          <br />
          <br />
        </div>
      </div>
    );
  }
}

OrderList.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setSubmitResult: PropTypes.func.isRequired,
  common: PropTypes.shape({ submitResult: PropTypes.string, errorMessage: PropTypes.string, isLoading: PropTypes.bool }).isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    userID: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string,
    roleName: PropTypes.string,
    address: PropTypes.string,
    isActive: PropTypes.bool,
    companyID: PropTypes.string,
    companyName: PropTypes.string,
  }).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  common: state.common,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({
  setErrorMessage: (errorMessage) => dispatch(assignErrorMessage(errorMessage)),
  setLoading: (loading) => dispatch(setLoadingValue(loading)),
  setSubmitResult: (submitResult) => dispatch(setSubmitValue(submitResult)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderList);
