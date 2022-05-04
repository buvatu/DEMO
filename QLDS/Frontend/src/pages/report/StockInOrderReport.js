import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
  ComposedModal,
  DataTable,
  DatePicker,
  DatePickerInput,
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
import { getFilteredOrders, getRelatedData } from '../../services';

class StockInOrderReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromDate: '',
      toDate: '',
      materialID: '',
      materialList: [],
      supplier: '',
      supplierList: [],
      recipeNo: '',
      recipeNoList: [],
      deliver: '',
      deliverList: [],
      orderList: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    const getRelatedDataResult = await getRelatedData('I', auth.companyID);
    this.setState({
      materialList: getRelatedDataResult.data
        .map((e) => {
          return { id: e.material_id, label: e.material_id.concat(' - ').concat(e.material_name) };
        })
        .filter(({ id }, index, a) => a.findIndex((e) => id === e.id) === index),
      supplierList: getRelatedDataResult.data
        .filter((e) => e.supplier_id)
        .map((e) => {
          return { id: e.supplier_id, label: e.supplier_id.concat(' - ').concat(e.supplier_name) };
        })
        .filter(({ id }, index, a) => a.findIndex((e) => id === e.id) === index),
      recipeNoList: getRelatedDataResult.data
        .filter((e) => e.recipe_no)
        .map((e) => {
          return { id: e.recipe_no, label: e.recipe_no };
        })
        .filter(({ id }, index, a) => a.findIndex((e) => id === e.id) === index),
      deliverList: getRelatedDataResult.data
        .filter((e) => e.deliver)
        .map((e) => {
          return { id: e.deliver, label: e.deliver };
        })
        .filter(({ id }, index, a) => a.findIndex((e) => id === e.id) === index),
    });
    setLoading(false);
  };

  getOrderList = async () => {
    const { setLoading, auth } = this.props;
    const { fromDate, toDate, materialID, supplier, recipeNo, deliver } = this.state;
    setLoading(true);
    const getFilteredOrderListResult = await getFilteredOrders('I', auth.companyID, materialID, supplier, '', recipeNo, deliver, fromDate, toDate);
    setLoading(false);
    this.setState({
      orderList: getFilteredOrderListResult.data.map((e, index) => {
        e.id = index.toString();
        e.stt = index + 1;
        return e;
      }),
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
    const { fromDate, toDate, orderList, materialID, recipeNo, supplier, supplierList, materialList, recipeNoList, deliver, deliverList } = this.state;

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
            <div className="bx--col-lg-4">
              <ComboBox
                id="supplier-Dropdown"
                titleText="Nhà cung cấp"
                label=""
                items={supplierList}
                selectedItem={supplier === '' ? null : supplierList.find((e) => e.id === supplier)}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) => this.setState({ supplier: e.selectedItem == null ? '' : e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <ComboBox
                id="recipeNo-Dropdown"
                titleText="Số hoá đơn"
                label=""
                items={recipeNoList}
                selectedItem={recipeNo === '' ? null : recipeNoList.find((e) => e.id === recipeNo)}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) => this.setState({ recipeNo: e.selectedItem == null ? '' : e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <ComboBox
                id="recipeNo-Dropdown"
                titleText="Người giao hàng"
                label=""
                items={deliverList}
                selectedItem={deliver === '' ? null : deliverList.find((e) => e.id === deliver)}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) => this.setState({ deliver: e.selectedItem == null ? '' : e.selectedItem.id })}
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
                  { header: 'Số lượng nhập', key: 'quantity' },
                  { header: 'Thành tiền', key: 'amount' },
                  { header: 'Đơn vị cung cấp', key: 'supplier_name' },
                  { header: 'Ngày nhập', key: 'approve_date' },
                ]}
                render={({ rows, headers }) => (
                  <TableContainer
                    title="Báo cáo nhập trong kì"
                    description={
                      rows.length === 0
                        ? ''
                        : `Tổng nhập trong kỳ: ${CurrencyFormatter.format(
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
