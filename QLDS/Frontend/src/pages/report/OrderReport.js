import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComposedModal,
  DataTable,
  DatePicker,
  DatePickerInput,
  InlineNotification,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  StructuredListBody,
  StructuredListCell,
  StructuredListHead,
  StructuredListRow,
  StructuredListWrapper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableExpandedRow,
  TableExpandHeader,
  TableExpandRow,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setMaterialListValue, setSubmitValue } from '../../actions/commonAction';
import { CurrencyFormatter } from '../../constants';
import { exportOrderReport, getCompletedOrderList, getMaterialListWithStockQuantity, getUserList } from '../../services';

class OrderReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromDate: this.formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      toDate: this.formatDate(new Date()),
      orderList: [],
      materialList: [],
      userList: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth, setErrorMessage, common, setMaterialList } = this.props;
    const { fromDate, toDate } = this.state;
    if (auth.role !== 'phongketoantaichinh') {
      setErrorMessage('Chỉ có người của phòng tài chính kế toán mới có thể truy cập chức năng này.');
      return;
    }

    setLoading(true);
    let { materialList } = common;
    let userList = [];
    try {
      if (materialList.length === 0) {
        const getMaterialListResult = await getMaterialListWithStockQuantity(auth.companyID);
        materialList = getMaterialListResult.data;
        setMaterialList(materialList);
      }
      const getCompletedOrderListResult = await getCompletedOrderList(fromDate, toDate, auth.companyID);
      const getUserListResult = await getUserList('', '', auth.companyID, '');

      userList = getUserListResult.data;
      this.setState({
        orderList: getCompletedOrderListResult.data.map((e, index) => {
          e.id = e.orderInfo.id.toString();
          e.stt = index + 1;
          e.orderName = e.orderInfo.orderName;
          e.orderType = e.orderInfo.orderType;
          e.requestNote = e.orderInfo.requestNoteeeee;
          e.requestor = userList.find((user) => user.userID === e.orderInfo.requestor).username;
          e.tester = userList.find((user) => user.userID === e.orderInfo.tester).username;
          e.approver = userList.find((user) => user.userID === e.orderInfo.approver).username;
          e.approveDate = e.orderInfo.approveDate;
          e.totalAmount = e.orderDetailList.reduce((previousValue, currentValue) => previousValue + currentValue.approveAmount, 0);
          e.orderDetailList.forEach((detail) => {
            const material = materialList.find((item) => item.materialID === detail.materialID);
            // eslint-disable-next-line no-param-reassign
            detail.materialName = material.materialName;
            // eslint-disable-next-line no-param-reassign
            detail.unit = material.unit;
          });
          return e;
        }),
        materialList,
        userList,
      });
    } catch {
      setErrorMessage('Có lỗi khi tải trang. Vui lòng thử lại sau.');
    }
    setLoading(false);
  };

  getOrderList = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    const { fromDate, toDate, materialList, userList } = this.state;
    if (fromDate === '' || toDate === '') {
      setErrorMessage('Đầu kì và cuối kì không được bỏ trống');
      return;
    }
    setLoading(true);
    const getCompletedOrderListResult = await getCompletedOrderList(fromDate, toDate, auth.companyID);
    setLoading(false);
    this.setState({
      orderList: getCompletedOrderListResult.data.map((e, index) => {
        e.id = e.orderInfo.id.toString();
        e.stt = index + 1;
        e.orderName = e.orderInfo.orderName;
        e.orderType = e.orderInfo.orderType;
        e.requestNote = e.orderInfo.requestNoteeeee;
        e.requestor = userList.find((user) => user.userID === e.orderInfo.requestor).username;
        e.tester = userList.find((user) => user.userID === e.orderInfo.tester).username;
        e.approver = userList.find((user) => user.userID === e.orderInfo.approver).username;
        e.approveDate = e.orderInfo.approveDate;
        e.totalAmount = e.orderDetailList.reduce((previousValue, currentValue) => previousValue + currentValue.approveAmount, 0);
        e.orderDetailList.forEach((detail) => {
          const material = materialList.find((item) => item.materialID === detail.materialID);
          // eslint-disable-next-line no-param-reassign
          detail.materialName = material.materialName;
          // eslint-disable-next-line no-param-reassign
          detail.unit = material.unit;
        });
        return e;
      }),
    });
  };

  exportOrderReport = async () => {
    const { auth, setErrorMessage } = this.props;
    const { fromDate, toDate } = this.state;
    await exportOrderReport(fromDate, toDate, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bao_cao_xuat_nhap_ton.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('Có lỗi xảy ra khi xuất file báo cáo. Vui lòng thử lại');
      });
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { fromDate, toDate, orderList } = this.state;

    return (
      <div className="order-report">
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
          <h4>Báo cáo xuất nhập kho</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-3 bx--col-md-3" />
            <div className="bx--col-lg-4" />
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ fromDate: this.formatDate(e[0]) })} value={fromDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/MM/yyyy" labelText="Ngày bắt đầu" id="fromDate-datepicker" />
              </DatePicker>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ toDate: this.formatDate(e[0]) })} value={toDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/MM/yyyy" labelText="Ngày kết thúc" id="toDate-datepicker" />
              </DatePicker>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.getOrderList()} style={{ marginTop: '1rem' }}>
                Tìm
              </Button>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.exportOrderReport()} style={{ marginTop: '1rem' }}>
                Xuất báo cáo
              </Button>
            </div>
          </div>
          <br />
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <DataTable
                rows={orderList}
                headers={[
                  { header: 'STT', key: 'stt' },
                  { header: 'Tên đơn', key: 'orderName' },
                  { header: 'Phân loại', key: 'orderType' },
                  { header: 'Người yêu cầu', key: 'requestor' },
                  { header: 'Người nghiệm thu', key: 'tester' },
                  { header: 'Người phê duyệt', key: 'approver' },
                  { header: 'Ngày phê duyệt', key: 'approveDate' },
                  { header: 'Tổng giá trị', key: 'totalAmount' },
                ]}
                render={({ rows, headers, getRowProps }) => (
                  <TableContainer title={`Có tất cả ${orderList.length} đơn xuất nhập trong kì.`}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableExpandHeader />
                          {headers.map((header) => (
                            <TableHeader key={header.key}>{header.header}</TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row, index) => (
                          <React.Fragment key={row.id.toString()}>
                            <TableExpandRow
                              // eslint-disable-next-line react/jsx-props-no-spreading
                              {...getRowProps({ row })}
                            >
                              <TableCell key={row.cells[0].id}>{index + 1}</TableCell>
                              <TableCell key={row.cells[1].id}>{row.cells[1].value}</TableCell>
                              <TableCell key={row.cells[2].id}>{row.cells[2].value === 'I' ? 'Nhập kho' : 'Xuất kho'}</TableCell>
                              <TableCell key={row.cells[3].id}>{row.cells[3].value}</TableCell>
                              <TableCell key={row.cells[4].id}>{row.cells[4].value}</TableCell>
                              <TableCell key={row.cells[5].id}>{row.cells[5].value}</TableCell>
                              <TableCell key={row.cells[6].id}>{row.cells[6].value}</TableCell>
                              <TableCell key={row.cells[7].id}>{CurrencyFormatter.format(row.cells[7].value)}</TableCell>
                            </TableExpandRow>
                            <TableExpandedRow colSpan={headers.length + 1}>
                              <StructuredListWrapper>
                                <StructuredListHead>
                                  <StructuredListRow head>
                                    <StructuredListCell head key={`row-${index.toString()}-materialID`}>
                                      Mã vật tư
                                    </StructuredListCell>
                                    <StructuredListCell head key={`row-${index.toString()}-materialName`}>
                                      Tên vật tư
                                    </StructuredListCell>
                                    <StructuredListCell head key={`row-${index.toString()}-unit`}>
                                      Đơn vị
                                    </StructuredListCell>
                                    <StructuredListCell head key={`row-${index.toString()}-quantity`}>
                                      Số lượng
                                    </StructuredListCell>
                                    <StructuredListCell head key={`row-${index.toString()}-amount   `}>
                                      Thành tiền
                                    </StructuredListCell>
                                  </StructuredListRow>
                                </StructuredListHead>
                                <StructuredListBody>
                                  {orderList
                                    .find((e) => e.id === row.id)
                                    .orderDetailList.map((detail) => (
                                      <StructuredListRow key={`row-${detail.id}`}>
                                        <StructuredListCell key={`row-${index.toString()}-${detail.id}-materialID`}>{detail.materialID}</StructuredListCell>
                                        <StructuredListCell key={`row-${index.toString()}-${detail.id}-materialName`}>{detail.materialName}</StructuredListCell>
                                        <StructuredListCell key={`row-${index.toString()}-${detail.id}-unit`}>{detail.unit}</StructuredListCell>
                                        <StructuredListCell key={`row-${index.toString()}-${detail.id}-quantity`}>{detail.approveQuantity}</StructuredListCell>
                                        <StructuredListCell key={`row-${index.toString()}-${detail.id}-amount`}>
                                          {CurrencyFormatter.format(detail.approveAmount)}
                                        </StructuredListCell>
                                      </StructuredListRow>
                                    ))}
                                </StructuredListBody>
                              </StructuredListWrapper>
                            </TableExpandedRow>
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
          <br />
          <br />
        </div>
      </div>
    );
  }
}

OrderReport.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setSubmitResult: PropTypes.func.isRequired,
  setMaterialList: PropTypes.func.isRequired,
  common: PropTypes.shape({ submitResult: PropTypes.string, errorMessage: PropTypes.string, isLoading: PropTypes.bool, materialList: PropTypes.arrayOf })
    .isRequired,
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
  setMaterialList: (materialList) => dispatch(setMaterialListValue(materialList)),
});

export default connect(mapStateToProps, mapDispatchToProps)(OrderReport);
