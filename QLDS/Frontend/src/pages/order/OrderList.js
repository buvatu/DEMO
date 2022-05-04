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
import React, { Component } from 'react';
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
    const requestor = auth.role === 'phongkehoach' ? auth.userID : '';
    const tester = auth.role === 'phongkythuat' ? auth.userID : '';
    const approver = auth.role === 'phongketoan' ? auth.userID : '';
    if (requestor === '' && tester === '' && approver === '') {
      setErrorMessage('Bạn không đủ quyền truy cập trang này');
      return;
    }
    setLoading(true);
    const getRequestorListResult = await getUserList('', '', auth.companyID, 'phongkehoach');
    const getTesterListResult = await getUserList('', '', auth.companyID, 'phongkythuat');
    const getApproverListResult = await getUserList('', '', auth.companyID, 'phongketoan');
    const getOrderListResult = await getOrderList(requestor, tester, approver, '', '');
    setLoading(false);
    this.setState({
      requestorList: getRequestorListResult.data.map((e) => {
        return { id: e.user_id, label: e.username };
      }),
      testerList: getTesterListResult.data.map((e) => {
        return { id: e.user_id, label: e.username };
      }),
      approverList: getApproverListResult.data.map((e) => {
        return { id: e.user_id, label: e.username };
      }),
      requestor,
      tester,
      approver,
      orderList: getOrderListResult.data,
      orderListDisplay: getOrderListResult.data.slice(0, pageSize),
      statusList: [
        { id: 'need test', label: 'Chờ nghiệm thu' },
        { id: 'need approve', label: 'Chờ phê duyệt' },
        { id: 'completed', label: 'Đã hoàn thành' },
      ],
      requestDate: this.formatDate(new Date()),
    });
  };

  findOrderList = async () => {
    const { status, requestor, tester, approver, requestDate, pageSize } = this.state;
    const getOrderListResult = await getOrderList(requestor, tester, approver, status, requestDate);
    this.setState({
      orderList: getOrderListResult.data,
      orderListDisplay: getOrderListResult.data.slice(0, pageSize),
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
            {auth.role !== 'phongkehoach' && (
              <div className="bx--col-lg-2 bx--col-md-2">
                <Dropdown
                  id="requestor-Dropdown"
                  titleText="Người tạo yêu cầu"
                  label=""
                  items={requestorList}
                  selectedItem={requestor === '' ? null : requestorList.find((e) => e.id === requestor)}
                  onChange={(e) => this.setState({ requestor: e.selectedItem.id })}
                />
              </div>
            )}
            {auth.role !== 'phongkythuat' && (
              <div className="bx--col-lg-2 bx--col-md-2">
                <Dropdown
                  id="tester-Dropdown"
                  titleText="Người nghiệm thu"
                  label=""
                  items={testerList}
                  selectedItem={tester === '' ? null : testerList.find((e) => e.id === tester)}
                  onChange={(e) => this.setState({ tester: e.selectedItem.id })}
                />
              </div>
            )}
            {auth.role !== 'phongketoan' && (
              <div className="bx--col-lg-2 bx--col-md-2">
                <Dropdown
                  id="approver-Dropdown"
                  titleText="Người phê duyệt"
                  label=""
                  items={approverList}
                  selectedItem={approver === '' ? null : approverList.find((e) => e.id === approver)}
                  onChange={(e) => this.setState({ approver: e.selectedItem.id })}
                />
              </div>
            )}
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
                      <TableHeader>Mã yêu cầu</TableHeader>
                      <TableHeader>Loại yêu cầu</TableHeader>
                      <TableHeader>Người yêu cầu</TableHeader>
                      <TableHeader>Ngày tạo</TableHeader>
                      <TableHeader>Lý do lập</TableHeader>
                      <TableHeader>Trạng thái</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderListDisplay.map((order) => (
                      <TableRow>
                        <TableCell>
                          <Link
                            to={{
                              pathname: '/order/details',
                              search: `?orderID=${order.order_id}`,
                            }}
                          >
                            {order.order_id}
                          </Link>
                        </TableCell>
                        <TableCell>{order.order_name}</TableCell>
                        <TableCell>{order.requestor}</TableCell>
                        <TableCell>{order.request_date}</TableCell>
                        <TableCell>{order.request_note}</TableCell>
                        <TableCell>
                          {order.status === 'need test' && 'Chờ nghiệm thu'}
                          {order.status === 'need approve' && 'Chờ phê duyệt'}
                          {order.status === 'completed' && 'Đã hoàn thành'}
                          {order.status === 'cancel' && 'Đã huỷ'}
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
