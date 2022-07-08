import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComposedModal,
  DataTable,
  DatePicker,
  DatePickerInput,
  Dropdown,
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
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { CurrencyFormatter } from '../../constants';
import { exportStockInReport, getCompletedStockInOrderList, getMaterialListWithStockQuantity, getSupplierList } from '../../services';

class StockInOrderReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromDate: this.formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
      toDate: this.formatDate(new Date()),
      materialTypeID: '',
      materialList: [],
      supplierList: [],
      orderList: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    const { fromDate, toDate } = this.state;
    if (auth.role !== 'phongketoantaichinh') {
      setErrorMessage('Chỉ có người của phòng tài chính kế toán mới có thể truy cập chức năng này.');
      return;
    }

    setLoading(true);
    let materialList = [];
    let supplierList = [];
    try {
      const getCompletedOrderListResult = await getCompletedStockInOrderList(fromDate, toDate, auth.companyID);
      const getMaterialListResult = await getMaterialListWithStockQuantity(auth.companyID);
      const getSupplierListResult = await getSupplierList();

      materialList = getMaterialListResult.data;
      supplierList = getSupplierListResult.data;
      this.setState({
        orderList: getCompletedOrderListResult.data.map((e, index) => {
          e.id = e.orderInfo.id.toString();
          e.stt = index + 1;
          e.orderName = e.orderInfo.orderName;
          e.requestNote = e.orderInfo.requestNote;
          e.supplierName = supplierList.find((item) => item.supplierID === e.orderInfo.supplier).supplierName;
          e.deliver = e.orderInfo.deliver;
          e.approveDate = e.orderInfo.approveDate;
          e.orderDetailList.forEach((detail) => {
            const material = materialList.find((item) => item.materialID === detail.materialID);
            // eslint-disable-next-line no-param-reassign
            detail.materialName = material.materialName;
            // eslint-disable-next-line no-param-reassign
            detail.unit = material.unit;
            // eslint-disable-next-line no-param-reassign
            detail.materialTypeID = material.materialTypeID;
          });
          e.totalAmount = e.orderDetailList.reduce((previousValue, currentValue) => previousValue + currentValue.approveAmount, 0);
          return e;
        }),
        materialList,
        supplierList,
      });
    } catch {
      setErrorMessage('Có lỗi khi tải trang. Vui lòng thử lại sau.');
    }
    setLoading(false);
  };

  getOrderList = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    const { fromDate, toDate, materialList, materialTypeID, supplierList } = this.state;
    if (fromDate === '' || toDate === '') {
      setErrorMessage('Đầu kì và cuối kì không được bỏ trống');
      return;
    }
    setLoading(true);
    try {
      const getCompletedOrderListResult = await getCompletedStockInOrderList(fromDate, toDate, auth.companyID);
      this.setState({
        orderList: getCompletedOrderListResult.data.map((e, index) => {
          e.id = e.orderInfo.id.toString();
          e.stt = index + 1;
          e.orderName = e.orderInfo.orderName;
          e.requestNote = e.orderInfo.requestNote;
          e.supplierName = supplierList.find((item) => item.supplierID === e.orderInfo.supplier).supplierName;
          e.deliver = e.orderInfo.deliver;
          e.approveDate = e.orderInfo.approveDate;
          e.orderDetailList.forEach((detail) => {
            const material = materialList.find((item) => item.materialID === detail.materialID);
            // eslint-disable-next-line no-param-reassign
            detail.materialName = material.materialName;
            // eslint-disable-next-line no-param-reassign
            detail.unit = material.unit;
            // eslint-disable-next-line no-param-reassign
            detail.materialTypeID = material.materialTypeID;
          });
          if (materialTypeID !== '') {
            e.orderDetailList = e.orderDetailList.filter((detail) => detail.materialTypeID === materialTypeID);
          }
          e.totalAmount = e.orderDetailList.reduce((previousValue, currentValue) => previousValue + currentValue.approveAmount, 0);
          return e;
        }),
      });
    } catch {
      setErrorMessage('Có lỗi khi tải trang. Vui lòng thử lại sau.');
    }
    setLoading(false);
  };

  exportStockInOrderReport = async () => {
    const { auth, setErrorMessage } = this.props;
    const { fromDate, toDate, materialTypeID } = this.state;
    await exportStockInReport(fromDate, toDate, auth.companyID, materialTypeID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bao_cao_nhap_kho.xlsx');
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
    const { fromDate, toDate, orderList, materialTypeID } = this.state;

    const materialTypes = [
      { id: '', label: '' },
      { id: '1521', label: 'Kho nguyên vật liệu chính' },
      { id: '1522', label: 'Kho vật liệu xây dựng cơ bản' },
      { id: '1523', label: 'Kho dầu mỡ bôi trơn' },
      { id: '1524', label: 'Kho phụ tùng' },
      { id: '1525', label: 'Kho nhiên liệu' },
      { id: '1526', label: 'Kho nguyên vật liệu phụ' },
      { id: '1527', label: 'Kho phế liệu' },
      { id: '1528', label: 'Kho phụ tùng gia công cơ khí' },
      { id: '1529', label: 'Kho nhiên liệu tồn trên phương tiện' },
      { id: '1531', label: 'Kho công cụ dụng cụ' },
    ];

    return (
      <div className="stock-in-order-report">
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
          <h4>Báo cáo nhập kho</h4>
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
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="materialType-Dropdown"
                titleText="Kho"
                label=""
                items={materialTypes}
                selectedItem={materialTypeID === '' ? null : materialTypes.find((e) => e.id === materialTypeID)}
                onChange={(e) => this.setState({ materialTypeID: e.selectedItem.id })}
              />
            </div>
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
            <div className="bx--col-lg-3 bx--col-md-3">
              <Button onClick={() => this.getOrderList()} style={{ marginTop: '1rem' }}>
                Tìm
              </Button>
              <Button onClick={() => this.exportStockInOrderReport()} style={{ marginTop: '1rem', marginLeft: '1rem' }}>
                Xuất báo cáo
              </Button>
            </div>
          </div>
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
                  { header: 'Lý do tạo', key: 'requestNote' },
                  { header: 'Nhà cung cấp', key: 'supplierName' },
                  { header: 'Ngày nhập', key: 'approveDate' },
                  { header: 'Người giao hàng', key: 'deliver' },
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
                              <TableCell key={row.cells[2].id}>{row.cells[2].value}</TableCell>
                              <TableCell key={row.cells[3].id}>{row.cells[3].value}</TableCell>
                              <TableCell key={row.cells[4].id}>{row.cells[4].value}</TableCell>
                              <TableCell key={row.cells[5].id}>{row.cells[5].value}</TableCell>
                              <TableCell key={row.cells[6].id}>{CurrencyFormatter.format(row.cells[6].value)}</TableCell>
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

StockInOrderReport.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockInOrderReport);
