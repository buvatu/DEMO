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
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { CurrencyFormatter } from '../../constants';
import {
  exportFuelReport,
  getEngineListByCompany,
  getFuelOrderList,
  getFuelStockQuantity,
  getSupplierList,
  saveFuelOrder,
  saveFuelStock,
  updateFuelStockQuantity,
} from '../../services';

const fuelMaterialList = [{ id: '000050001', label: 'Dầu Diesel' }];

class StockInFuelApprove extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fuelOrderList: [],
      fuelOrderListDisplay: [],
      supplier: '',
      supplierList: [],
      recipeNo: '',
      consumer: '',
      engineList: [],
      requestDate: '',
      fuelOrderType: '',
      fuelMaterialID: '',
      fuelMaterialName: '',
      fuelOrderNote: '',
      realFuelQuantity: '',
      standardFuelQuantity: '',
      amount: '',
      fromDate: '',
      toDate: '',
      filterOrderType: '',
      filterSupplier: '',
      filterConsumer: '',
      stockFuelQuantity: '',
      page: 1,
      pageSize: 10,
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    const getSupplierListResult = await getSupplierList();
    const getEngineListResult = await getEngineListByCompany(auth.companyID);
    const getFuelStockQuantityResult = await getFuelStockQuantity(auth.companyID, auth.userID);
    setLoading(false);
    this.setState({
      engineList: getEngineListResult.data.map((e) => {
        return { id: e.engine_id, label: e.engine_id };
      }),
      supplierList: getSupplierListResult.data
        .sort((a, b) => a.supplier_name.localeCompare(b.supplier_name))
        .map((e) => {
          return { id: e.supplier_id, label: e.supplier_id.concat(' - ').concat(e.supplier_name) };
        }),
      requestDate: this.formatDate(new Date()),
      stockFuelQuantity: getFuelStockQuantityResult.data.real_fuel_quantity,
    });
  };

  saveFuelOrder = async () => {
    const {
      fuelOrderType,
      fuelMaterialID,
      fuelOrderNote,
      realFuelQuantity,
      standardFuelQuantity,
      requestDate,
      supplier,
      recipeNo,
      consumer,
      fuelMaterialName,
      amount,
    } = this.state;
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    // eslint-disable-next-line no-restricted-globals
    if (isNaN(realFuelQuantity) || (fuelOrderType === 'I' && isNaN(standardFuelQuantity))) {
      setErrorMessage('Số lượng nhiên liệu không hợp lệ');
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (fuelOrderType === 'I' && (amount === '' || isNaN(amount))) {
      setErrorMessage('Thành tiền không hợp lệ');
      return;
    }
    setLoading(true);
    const getSaveFuelStockResult = await saveFuelStock(fuelOrderType, fuelMaterialID, realFuelQuantity, standardFuelQuantity, auth.companyID, auth.userID);
    setLoading(false);
    if (getSaveFuelStockResult.data === -1) {
      setErrorMessage('Có lỗi khi tạo đơn');
      return;
    }
    setLoading(true);
    const getSaveFuelOrderResult = await saveFuelOrder(
      fuelOrderType,
      fuelMaterialID,
      fuelMaterialName,
      fuelOrderNote,
      realFuelQuantity,
      standardFuelQuantity,
      requestDate,
      supplier,
      recipeNo,
      consumer,
      amount,
      auth.companyID,
      auth.userID
    );
    setLoading(false);
    if (getSaveFuelOrderResult.data === -1) {
      setErrorMessage('Có lỗi khi tạo đơn');
      return;
    }
    setSubmitResult('Đơn nhiên liệu được tạo thành công');
  };

  findFuelOrderList = async () => {
    const { setLoading, auth } = this.props;
    const { fromDate, toDate, filterOrderType, filterSupplier, filterConsumer } = this.state;
    setLoading(true);
    const getFuelOrderListResult = await getFuelOrderList(auth.companyID, fromDate, toDate, filterOrderType, filterSupplier, filterConsumer);
    setLoading(false);
    this.setState({
      fuelOrderList: getFuelOrderListResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
      fuelOrderListDisplay: getFuelOrderListResult.data
        .map((e, index) => {
          e.id = index.toString();
          return e;
        })
        .slice(0, 10),
    });
  };

  updateStockFuelQuantity = async () => {
    const { setLoading, auth, setErrorMessage, setSubmitResult } = this.props;
    const { stockFuelQuantity } = this.state;
    setLoading(true);
    const getUpdateFuelStockQuantityResult = await updateFuelStockQuantity(auth.companyID, stockFuelQuantity, auth.userID);
    setLoading(false);
    if (getUpdateFuelStockQuantityResult.data === -1) {
      setErrorMessage('Có lỗi khi cập nhật kho nhiên liệu');
      return;
    }
    setSubmitResult('Kho nhiên liệu được cập nhật thành công');
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  exportFuelReport = async () => {
    const { auth, setErrorMessage } = this.props;
    const { fromDate, toDate } = this.state;
    await exportFuelReport(fromDate, toDate, auth.companyID, auth.userID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bao_cao_nhien_lieu.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('Có lỗi xảy ra khi xuất file báo cáo. Vui lòng thử lại');
      });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      fuelOrderList,
      fuelOrderListDisplay,
      page,
      pageSize,
      engineList,
      fuelOrderType,
      fuelOrderNote,
      supplier,
      supplierList,
      requestDate,
      fuelMaterialID,
      realFuelQuantity,
      standardFuelQuantity,
      consumer,
      filterOrderType,
      stockFuelQuantity,
      amount,
    } = this.state;

    const fuelStockInReasonList = [
      { id: 'Nhập mới', label: 'Nhập mới' },
      { id: 'Nhập xả máy các cấp sửa chữa', label: 'Nhập xả máy các cấp sửa chữa' },
      { id: 'Nhập nhiên liệu xuất chạy tàu chưa hết', label: 'Nhập nhiên liệu xuất chạy tàu chưa hết' },
      { id: 'Nhập vay từ đơn vị khác', label: 'Nhập vay từ đơn vị khác' },
    ];
    const fuelStockOutReasonList = [
      { id: 'Xuất nhiên liệu chạy tàu', label: 'Xuất nhiên liệu chạy tàu' },
      { id: 'Xuất nhiên liệu cho các cấp sửa chữa', label: 'Xuất nhiên liệu cho các cấp sửa chữa' },
      { id: 'Xuất nhiên liệu phục vụ sản xuất', label: 'Xuất nhiên liệu phục vụ sản xuất' },
      { id: 'Xuất cho các đơn vị vay', label: 'Xuất cho các đơn vị vay' },
      { id: 'Xuất bù đầu máy chạy tàu', label: 'Xuất bù đầu máy chạy tàu' },
      { id: 'Xuất nhiên liệu vay cho đầu máy', label: 'Xuất nhiên liệu vay cho đầu máy' },
    ];

    return (
      <div className="fuel-report">
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
          <h4>Báo cáo nhiên liệu</h4>
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
              <Dropdown
                id="fuelOrderType-Dropdown"
                titleText="Loại đơn"
                label=""
                items={[
                  { id: 'I', label: 'Nhập nhiên liệu' },
                  { id: 'O', label: 'Xuất nhiên liệu' },
                ]}
                onChange={(e) => this.setState({ fuelOrderType: e.selectedItem.id, fuelOrderNote: '' })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="fuelMaterialID-Dropdown"
                titleText="Loại nhiên liệu"
                label=""
                items={fuelMaterialList}
                onChange={(e) => this.setState({ fuelMaterialID: e.selectedItem.id, fuelMaterialName: e.selectedItem.label })}
                disabled={fuelOrderType === ''}
              />
            </div>
            <div className="bx--col-lg-4">
              <Dropdown
                id="reason-Dropdown"
                titleText="Lý do"
                label=""
                items={fuelOrderType === 'I' ? fuelStockInReasonList : fuelStockOutReasonList}
                selectedItem={
                  // eslint-disable-next-line no-nested-ternary
                  fuelOrderNote === ''
                    ? null
                    : fuelOrderType === 'I'
                    ? fuelStockInReasonList.find((e) => e.id === fuelOrderNote)
                    : fuelStockOutReasonList.find((e) => e.id === fuelOrderNote)
                }
                onChange={(e) => this.setState({ fuelOrderNote: e.selectedItem.id, supplier: '', consumer: '' })}
                disabled={fuelOrderType === ''}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="recipeNo-TextInput"
                placeholder=""
                labelText="Số hoá đơn"
                onChange={(e) => this.setState({ recipeNo: e.target.value })}
                disabled={fuelOrderType === ''}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="engineID-Dropdown"
                titleText={
                  fuelOrderType === 'I' && (fuelOrderNote === 'Nhập xả máy các cấp sửa chữa' || fuelOrderNote === 'Nhập nhiên liệu xuất chạy tàu chưa hết')
                    ? 'Đầu máy xả'
                    : 'Đầu máy tiêu thụ'
                }
                label=""
                items={engineList}
                onChange={(e) =>
                  fuelOrderNote === 'Nhập xả máy các cấp sửa chữa' || fuelOrderNote === 'Nhập nhiên liệu xuất chạy tàu chưa hết'
                    ? this.setState({ supplier: e.selectedItem.id })
                    : this.setState({ consumer: e.selectedItem.id })
                }
                selectedItem={
                  // eslint-disable-next-line no-nested-ternary
                  fuelOrderType === 'I' && (fuelOrderNote === 'Nhập xả máy các cấp sửa chữa' || fuelOrderNote === 'Nhập nhiên liệu xuất chạy tàu chưa hết')
                    ? supplier === ''
                      ? null
                      : engineList.find((e) => e.id === supplier)
                    : consumer === ''
                    ? null
                    : engineList.find((e) => e.id === consumer)
                }
                disabled={
                  fuelOrderType === '' ||
                  (fuelOrderType === 'I' && fuelOrderNote !== 'Nhập xả máy các cấp sửa chữa' && fuelOrderNote !== 'Nhập nhiên liệu xuất chạy tàu chưa hết') ||
                  (fuelOrderType === 'O' && fuelOrderNote === 'Xuất cho các đơn vị vay')
                }
              />
            </div>
            <div className="bx--col-lg-5">
              <ComboBox
                id="supplier-ComboBox"
                titleText={fuelOrderType === 'O' && fuelOrderNote === 'Xuất cho các đơn vị vay' ? 'Đơn vị vay' : 'Đơn vị cung cấp'}
                placeholder=""
                label=""
                items={supplierList}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) =>
                  fuelOrderType === 'O' && fuelOrderNote === 'Xuất cho các đơn vị vay'
                    ? this.setState({ consumer: e.selectedItem == null ? '' : e.selectedItem.id })
                    : this.setState({ supplier: e.selectedItem == null ? '' : e.selectedItem.id })
                }
                selectedItem={
                  // eslint-disable-next-line no-nested-ternary
                  fuelOrderType === 'O' && fuelOrderNote === 'Xuất cho các đơn vị vay'
                    ? consumer === ''
                      ? null
                      : supplierList.find((e) => e.id === consumer)
                    : supplier === ''
                    ? null
                    : supplierList.find((e) => e.id === supplier)
                }
                disabled={
                  fuelOrderType === '' ||
                  (fuelOrderType === 'I' && (fuelOrderNote === 'Nhập xả máy các cấp sửa chữa' || fuelOrderNote === 'Nhập nhiên liệu xuất chạy tàu chưa hết')) ||
                  (fuelOrderType === 'O' && fuelOrderNote !== 'Xuất cho các đơn vị vay')
                }
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="real-amount-TextInput"
                placeholder="Vui lòng nhập số lượng"
                labelText="Số lượng (lít thực tế)"
                onChange={(e) => this.setState({ realFuelQuantity: e.target.value })}
                disabled={fuelOrderType === ''}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="standard-amount-TextInput"
                placeholder="Vui lòng nhập số lượng"
                labelText="Số lượng (lít tại 15°C)"
                onChange={(e) => this.setState({ standardFuelQuantity: e.target.value })}
                disabled={fuelOrderType === '' || fuelOrderType === 'O'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="amount-TextInput"
                placeholder="Vui lòng nhập thành tiền"
                labelText="Thành tiền"
                onChange={(e) => this.setState({ amount: e.target.value })}
                disabled={fuelOrderType === '' || fuelOrderType === 'O'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ requestDate: this.formatDate(e[0]) })} value={requestDate}>
                <DatePickerInput
                  datePickerType="single"
                  placeholder="dd/mm/yyyy"
                  labelText="Ngày tạo yêu cầu"
                  id="requestDate-datepicker"
                  disabled={fuelOrderType === ''}
                />
              </DatePicker>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                disabled={
                  fuelOrderType === '' ||
                  fuelMaterialID === '' ||
                  fuelOrderNote === '' ||
                  realFuelQuantity === '' ||
                  (fuelOrderType === 'I' && standardFuelQuantity === '') ||
                  (fuelOrderType === 'I' && supplier === '') ||
                  (fuelOrderType === 'I' && amount === '') ||
                  (fuelOrderType === 'O' && consumer === '')
                }
                onClick={() => this.saveFuelOrder()}
                style={{ marginTop: '1rem', marginLeft: '3rem' }}
              >
                {fuelOrderType === '' && 'Tạo đơn'}
                {fuelOrderType === 'I' && 'Tạo đơn nhập'}
                {fuelOrderType === 'O' && 'Tạo đơn xuất'}
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="filterFuelOrderType-Dropdown"
                titleText="Loại đơn"
                label=""
                items={[
                  { id: 'I', label: 'Nhập nhiên liệu' },
                  { id: 'O', label: 'Xuất nhiên liệu' },
                ]}
                onChange={(e) => this.setState({ filterOrderType: e.selectedItem.id, filterConsumer: '', filterSupplier: '' })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="filterEngineID-Dropdown"
                titleText="Đầu máy tiêu thụ"
                label=""
                items={engineList}
                onChange={(e) => this.setState({ filterConsumer: e.selectedItem.id })}
                disabled={filterOrderType === '' || filterOrderType === 'I'}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="filterSupplier-ComboBox"
                titleText="Đơn vị cung cấp"
                placeholder=""
                label=""
                items={supplierList}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) => this.setState({ filterSupplier: e.selectedItem == null ? '' : e.selectedItem.id })}
                disabled={filterOrderType === '' || filterOrderType === 'O'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="stockFuelQuantity-TextInput"
                placeholder=""
                labelText="Lượng tồn trong kho (lít thực tế)"
                value={stockFuelQuantity}
                onChange={(e) => this.setState({ stockFuelQuantity: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.updateStockFuelQuantity()} style={{ marginTop: '1rem' }}>
                Cập nhật kho
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ fromDate: this.formatDate(e[0]) })}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Đầu kì" id="fromDate-datepicker" />
              </DatePicker>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ toDate: this.formatDate(e[0]) })}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Cuối kì" id="toDate-datepicker" />
              </DatePicker>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.findFuelOrderList()} style={{ marginTop: '1rem' }}>
                Tìm
              </Button>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.exportFuelReport()} style={{ marginTop: '1rem' }}>
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
                rows={fuelOrderListDisplay}
                headers={[
                  { header: 'Mã đơn hàng', key: 'fuel_order_id' },
                  { header: 'Loại đơn', key: 'fuel_order_type' },
                  { header: 'Đơn vị cung cấp', key: 'supplier_name' },
                  { header: 'Đầu máy tiêu thụ', key: 'consumer' },
                  { header: 'Loại nhiên liệu', key: 'fuel_material_name' },
                  { header: 'Số lượng lít thực tế', key: 'real_fuel_quantity' },
                  { header: 'Số lượng (lít tại 15°C)', key: 'standard_fuel_quantity' },
                  { header: 'Ngày thực hiện', key: 'request_date' },
                ]}
                render={({ rows, headers }) => (
                  <div>
                    <TableContainer
                      title="Báo cáo xuất/nhập nhiên liệu trong kì"
                      description={
                        <div>
                          <br />
                          Số lượng nhập trong kì:{' '}
                          {CurrencyFormatter.format(
                            rows.reduce(
                              (previousValue, currentValue) => previousValue + (currentValue.cells[1].value === 'I' ? currentValue.cells[5].value : 0),
                              0
                            )
                          )}
                          <br />
                          <br />
                          Số lượng xuất trong kì:{' '}
                          {CurrencyFormatter.format(
                            rows.reduce(
                              (previousValue, currentValue) => previousValue + (currentValue.cells[1].value === 'O' ? currentValue.cells[5].value : 0),
                              0
                            )
                          )}
                        </div>
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
                              <TableCell key={row.cells[1].id}>{row.cells[1].value === 'I' ? 'Nhập nhiên liệu' : 'Xuất nhiên liệu'}</TableCell>
                              <TableCell key={row.cells[2].id}>{row.cells[2].value}</TableCell>
                              <TableCell key={row.cells[3].id}>{row.cells[3].value}</TableCell>
                              <TableCell key={row.cells[4].id}>{row.cells[4].value}</TableCell>
                              <TableCell key={row.cells[5].id}>{row.cells[5].value}</TableCell>
                              <TableCell key={row.cells[6].id}>{row.cells[6].value}</TableCell>
                              <TableCell key={row.cells[7].id}>{row.cells[7].value}</TableCell>
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
                      totalItems={fuelOrderList.length}
                      onChange={(target) => {
                        this.setState({
                          fuelOrderListDisplay: fuelOrderList.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                          page: target.page,
                          pageSize: target.pageSize,
                        });
                      }}
                    />
                  </div>
                )}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
        </div>
      </div>
    );
  }
}

StockInFuelApprove.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockInFuelApprove);
