import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
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
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { CurrencyFormatter } from '../../constants';
import { exportOrderReport, getFilteredOrders, getRelatedData } from '../../services';

class StockInOrderReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromDate: '',
      toDate: '',
      materialID: '',
      materialList: [],
      consumer: '',
      consumerList: [],
      supplier: '', // Tổ sửa chữa
      deliver: '', // Cấp sửa chữa
      recipeNo: '', // Khoản mục
      recipeNoList: [],

      orderList: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    const getRelatedDataResult = await getRelatedData('O', auth.companyID);
    this.setState({
      materialList: getRelatedDataResult.data
        .map((e) => {
          return { id: e.material_id, label: e.material_id.concat(' - ').concat(e.material_name) };
        })
        .filter(({ id }, index, a) => a.findIndex((e) => id === e.id) === index),
      consumerList: getRelatedDataResult.data
        .filter((e) => e.consumer)
        .map((e) => {
          return { id: e.consumer, label: e.consumer };
        })
        .filter(({ id }, index, a) => a.findIndex((e) => id === e.id) === index),
      recipeNoList: getRelatedDataResult.data
        .filter((e) => e.recipe_no)
        .map((e) => {
          return { id: e.recipe_no, label: e.recipe_no };
        })
        .filter(({ id }, index, a) => a.findIndex((e) => id === e.id) === index),
    });
    setLoading(false);
  };

  getOrderList = async () => {
    const { setLoading, auth } = this.props;
    const { fromDate, toDate, materialID, supplier, consumer, recipeNo, deliver } = this.state;
    setLoading(true);
    const getFilteredOrderListResult = await getFilteredOrders('O', auth.companyID, materialID, supplier, consumer, recipeNo, deliver, fromDate, toDate);
    setLoading(false);
    this.setState({
      orderList: getFilteredOrderListResult.data.map((e, index) => {
        e.id = index.toString();
        e.stt = index + 1;
        return e;
      }),
    });
  };

  exportStockOutOrderReport = async () => {
    const { auth, setErrorMessage } = this.props;
    const { fromDate, toDate } = this.state;
    await exportOrderReport(fromDate, toDate, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bao cao xuat nhap.xlsx');
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
    const { fromDate, toDate, orderList, materialID, materialList, consumer, consumerList, supplier, recipeNo, recipeNoList, deliver } = this.state;

    const supplierList = [
      { id: 'Tổ Điện', label: 'Tổ Điện' },
      { id: 'Tổ Khung Gầm', label: 'Tổ Khung Gầm' },
      { id: 'Tổ Động cơ', label: 'Tổ Động cơ' },
      { id: 'Tổ Hãm', label: 'Tổ Hãm' },
      { id: 'Tổ Cơ khí', label: 'Tổ Cơ khí' },
      { id: 'Tổ Truyền động', label: 'Tổ Truyền động' },
    ];

    const deliverList = [
      { id: 'Đột xuất', label: 'Đột xuất' },
      { id: 'Ro', label: 'Ro' },
      { id: 'Rt', label: 'Rt' },
      { id: 'R1', label: 'R1' },
      { id: 'R2', label: 'R2' },
      { id: 'Đại tu', label: 'Đại tu' },
    ];

    return (
      <div className="stock-out-order-report">
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
          <h4>Báo cáo xuất kho</h4>
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
            <div className="bx--col-lg-4">
              <ComboBox
                id="materialID-ComboBox"
                titleText="Mã vật tư"
                placeholder=""
                label=""
                items={materialList}
                selectedItem={materialID === '' ? null : materialList.find((e) => e.id === materialID)}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) => this.setState({ materialID: e.selectedItem == null ? '' : e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="consumer-Dropdown"
                titleText="Đối tượng chi phí"
                label=""
                items={consumerList}
                selectedItem={consumer === '' ? null : consumerList.find((e) => e.id === consumer)}
                onChange={(e) => this.setState({ consumer: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="deliver-Dropdown"
                titleText="Cấp sửa chữa"
                label=""
                items={deliverList}
                selectedItem={deliver === '' ? null : deliverList.find((e) => e.id === deliver)}
                onChange={(e) => this.setState({ deliver: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="supplier-Dropdown"
                titleText="Tổ"
                label=""
                items={supplierList}
                selectedItem={supplier === '' ? null : supplierList.find((e) => e.id === supplier)}
                onChange={(e) => this.setState({ supplier: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="recipeNo-Dropdown"
                titleText="Khoản mục"
                label=""
                items={recipeNoList}
                selectedItem={recipeNo === '' ? null : recipeNoList.find((e) => e.id === recipeNo)}
                onChange={(e) => this.setState({ recipeNo: e.selectedItem.id })}
              />
            </div>
          </div>
          <br />
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
                  { header: 'Mã vật tư', key: 'material_id' },
                  { header: 'Tên vật tư', key: 'material_name' },
                  { header: 'Chất lượng', key: 'quality' },
                  { header: 'Số lượng xuất', key: 'quantity' },
                  { header: 'Thành tiền', key: 'amount' },
                  { header: 'Đối tượng chi phí', key: 'consumer' },
                  { header: 'Tổ', key: 'supplier' },
                  { header: 'Cấp sửa chữa', key: 'deliver' },
                  { header: 'Ngày xuất', key: 'approve_date' },
                ]}
                render={({ rows, headers }) => (
                  <TableContainer
                    title="Báo cáo xuất kho"
                    description={
                      rows.length === 0
                        ? ''
                        : `Tổng xuất trong kỳ: ${CurrencyFormatter.format(
                            rows.reduce((previousValue, currentValue) => previousValue + currentValue.cells[5].value, 0)
                          )}`
                    }
                  >
                    <Table>
                      <TableHead>
                        <TableRow>
                          {headers.map((header) => (
                            <TableHeader key={header.key}>{header.header}</TableHeader>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.map((row) => (
                          <TableRow key={row.id}>
                            <TableCell key={row.cells[0].id}>{row.cells[0].value}</TableCell>
                            <TableCell key={row.cells[1].id}>{row.cells[1].value}</TableCell>
                            <TableCell key={row.cells[2].id}>{row.cells[2].value}</TableCell>
                            <TableCell key={row.cells[3].id}>{row.cells[3].value}</TableCell>
                            <TableCell key={row.cells[4].id}>{row.cells[4].value}</TableCell>
                            <TableCell key={row.cells[5].id}>{CurrencyFormatter.format(row.cells[5].value)}</TableCell>
                            <TableCell key={row.cells[6].id}>{row.cells[6].value}</TableCell>
                            <TableCell key={row.cells[7].id}>{row.cells[7].value}</TableCell>
                            <TableCell key={row.cells[8].id}>{row.cells[8].value}</TableCell>
                            <TableCell key={row.cells[9].id}>{row.cells[9].value}</TableCell>
                          </TableRow>
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
