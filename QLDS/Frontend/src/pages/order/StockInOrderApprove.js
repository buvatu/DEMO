import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
  ComposedModal,
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
  TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setMaterialListValue, setSubmitValue } from '../../actions/commonAction';
import {
  approveOrder,
  cancelOrder,
  getAccountTitleList,
  getCategoryList,
  getMaterialListWithStockQuantity,
  getOrder,
  getSupplierList,
  getUserList,
} from '../../services';

class StockInOrderApprove extends Component {
  constructor(props) {
    super(props);
    const { auth } = this.props;
    this.state = {
      orderInfo: {
        id: '',
        orderName: '',
        status: '',
        requestor: '',
        requestNote: '',
        requestDate: '',
        tester: '',
        testNote: '',
        testDate: '',
        approver: auth.userID,
        approveNote: '',
        approveDate: '',
        supplier: '',
        no: '',
        co: '',
        recipeNo: '',
        recipeDate: '',
        deliver: '',
        attachedDocument: '',
        stockName: '',
        address: '',
        category: '',
        companyID: auth.companyID,
      },
      orderDetailList: [],
      changedOrderDetailList: [],
      approveNoteErrorMessage: '',
      testerList: [],
      approverList: [],
      supplierList: [],
      quantityErrorMessages: [],
      amountErrorMessages: [],
      categoryList: [],
      accountList: [],
    };
  }

  componentDidMount = async () => {
    const { setErrorMessage, setLoading, location, auth, setMaterialList, common } = this.props;
    const params = new URLSearchParams(location.search);
    if (params == null) {
      setErrorMessage('Không có mã yêu cầu nhập kho!!!');
      return;
    }
    const orderID = params.get('orderID');
    setLoading(true);
    let { materialList } = common;
    try {
      const getStockInOrderInfoResult = await getOrder(orderID);
      if (getStockInOrderInfoResult.data.orderInfo.approver !== auth.userID) {
        setErrorMessage('Bạn không có quyền truy cập');
        setLoading(false);
        return;
      }
      if (getStockInOrderInfoResult.data.orderInfo.status !== 'tested') {
        setErrorMessage('Trạng thái yêu cầu đã bị thay đổi. Vui lòng thử lại.');
        setLoading(false);
        return;
      }
      if (materialList.length === 0) {
        const getMaterialListResult = await getMaterialListWithStockQuantity(auth.companyID);
        materialList = getMaterialListResult.data;
        setMaterialList(materialList);
      }
      const getTesterListResult = await getUserList('', '', auth.companyID, 'phongkythuat');
      const getApproverListResult = await getUserList('', '', auth.companyID, 'phongketoantaichinh');
      const getSupplierListResult = await getSupplierList();
      const getCategoryListResult = await getCategoryList();
      const getAccountListResult = await getAccountTitleList();
      this.setState({
        testerList: getTesterListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        approverList: getApproverListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        supplierList: getSupplierListResult.data
          .sort((a, b) => a.supplierName.localeCompare(b.supplierName))
          .map((e) => {
            return { id: e.supplierID, label: e.supplierID.concat(' - ').concat(e.supplierName) };
          }),
        categoryList: [
          { id: '', label: '' },
          ...getCategoryListResult.data.map((e) => {
            return { id: e.categoryID, label: e.categoryID.concat(' - ').concat(e.categoryName) };
          }),
        ],
        accountList: [
          { id: '', label: '' },
          ...getAccountListResult.data.map((e) => {
            return { id: e.accountID, label: e.accountTitle.concat(' - ').concat(e.accountName) };
          }),
        ],
        orderInfo: getStockInOrderInfoResult.data.orderInfo,
        orderDetailList: getStockInOrderInfoResult.data.orderDetailList.map((e) => {
          const selectedMaterial = materialList.find((item) => item.materialID === e.materialID);
          e.materialName = selectedMaterial.materialName;
          e.unit = selectedMaterial.unit;
          e.materialGroupName = selectedMaterial.materialGroupName;
          e.materialTypeName = selectedMaterial.materialTypeName;
          e.approveQuantity = e.testQuantity;
          e.approveAmount = e.testAmount;
          return e;
        }),
        changedOrderDetailList: getStockInOrderInfoResult.data.orderDetailList
          .map((e) => {
            const selectedMaterial = materialList.find((item) => item.materialID === e.materialID);
            e.materialName = selectedMaterial.materialName;
            e.unit = selectedMaterial.unit;
            e.materialGroupName = selectedMaterial.materialGroupName;
            e.materialTypeName = selectedMaterial.materialTypeName;
            e.approveQuantity = e.testQuantity;
            e.approveAmount = e.testAmount;
            return e;
          })
          .filter((e) => e.requestQuantity !== e.testQuantity || e.requestAmount !== e.testAmount),
        quantityErrorMessages: Array(getStockInOrderInfoResult.data.orderDetailList.length).fill('', 0, getStockInOrderInfoResult.data.orderDetailList.length),
        amountErrorMessages: Array(getStockInOrderInfoResult.data.orderDetailList.length).fill('', 0, getStockInOrderInfoResult.data.orderDetailList.length),
      });
      this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, approveDate: this.formatDate(new Date()) } }));
    } catch {
      setErrorMessage('Mã yêu cầu nhập kho không tồn tại!!!');
    }
    setLoading(false);
  };

  approveOrder = async () => {
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    const { orderInfo, orderDetailList, quantityErrorMessages, amountErrorMessages } = this.state;

    this.setState({
      approveNoteErrorMessage: '',
      quantityErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
      amountErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
    });
    setErrorMessage('');

    let hasError = false;

    orderDetailList.forEach((e, index) => {
      if (e.approveQuantity === '') {
        hasError = true;
        quantityErrorMessages[index] = 'Cần nhập vào số lượng';
      }
      // eslint-disable-next-line no-restricted-globals
      if ((e.approveQuantity !== '' && isNaN(e.approveQuantity)) || Number(e.approveQuantity) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'Số lượng không hợp lệ';
      }
      if (e.approveAmount === '') {
        hasError = true;
        amountErrorMessages[index] = 'Cần nhập vào thành tiền';
      }
      // eslint-disable-next-line no-restricted-globals
      if ((e.approveAmount !== '' && isNaN(e.approveAmount)) || Number(e.approveAmount) < 1) {
        hasError = true;
        amountErrorMessages[index] = 'Thành tiền không đúng định dạng';
      }
      if ((e.approveQuantity !== e.testQuantity || e.approveAmount !== e.testAmount) && orderInfo.approveNote.trim() === '') {
        hasError = true;
        this.setState({ approveNoteErrorMessage: 'Nội dung điều chỉnh không thể bỏ trống' });
      }
    });
    this.setState({ quantityErrorMessages, amountErrorMessages });

    if (
      orderDetailList.length > 0 &&
      new Set(
        orderDetailList.map((e) => {
          return e.materialID;
        })
      ).size !== orderDetailList.length
    ) {
      hasError = true;
      setErrorMessage('Có mã vật tư bị trùng. Vui lòng kiểm tra lại');
    }
    if (hasError) {
      return;
    }

    orderInfo.status = 'completed';

    setLoading(true);
    try {
      await approveOrder({ orderInfo, orderDetailList, testRecipe: null });
    } catch {
      setErrorMessage('Có lỗi khi nghiệm thu yêu cầu. Vui lòng thử lại.');
    }
    setSubmitResult('Yêu cầu được nghiệm thu thành công');
    setLoading(false);
  };

  cancelOrder = async () => {
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    const { orderInfo } = this.state;
    if (orderInfo.approveNote.trim() === '') {
      this.setState({ approveNoteErrorMessage: 'Nội dung điều chỉnh không thể bỏ trống' });
      return;
    }
    orderInfo.status = 'canceled';
    setLoading(true);
    try {
      await cancelOrder(orderInfo);
    } catch {
      setErrorMessage('Có lỗi khi huỷ yêu cầu. Vui lòng thử lại.');
    }
    setSubmitResult('Yêu cầu được huỷ thành công');
    setLoading(false);
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
    const {
      orderInfo,
      testerList,
      approverList,
      orderDetailList,
      quantityErrorMessages,
      amountErrorMessages,
      supplierList,
      categoryList,
      accountList,
      approveNoteErrorMessage,
      changedOrderDetailList,
    } = this.state;

    return (
      <div className="stock-in-approve">
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
          <h4>Yêu cầu nhập kho</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput id="orderName-TextInput" placeholder="" labelText="Tên yêu cầu" value={orderInfo.orderName} disabled />
            </div>
            <div className="bx--col-lg-4">
              <TextInput id="requestNote-TextInput" placeholder="" labelText="Lý do" value={orderInfo.requestNote} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" value={orderInfo.requestDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày tạo yêu cầu" id="requestDate-datepicker" disabled />
              </DatePicker>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="tester-Dropdown"
                titleText="Người nghiệm thu"
                label=""
                items={testerList}
                selectedItem={orderInfo.tester === '' ? null : testerList.find((e) => e.id === orderInfo.tester)}
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="approver-Dropdown"
                titleText="Người phê duyệt"
                label=""
                items={approverList}
                selectedItem={orderInfo.approver === '' ? null : approverList.find((e) => e.id === orderInfo.approver)}
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="deliver-TextInput" placeholder="" labelText="Người giao hàng" value={orderInfo.deliver} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="stockName-TextInput" placeholder="" labelText="Nhập vào kho" value={orderInfo.stockName} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="address-TextInput" placeholder="" labelText="Địa chỉ kho" value={orderInfo.address} disabled />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <ComboBox
                id="supplier-Dropdown"
                titleText="Đơn vị cung cấp"
                placeholder=""
                label=""
                items={supplierList}
                selectedItem={orderInfo.supplier === '' ? null : supplierList.find((e) => e.id === orderInfo.supplier)}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, supplier: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="recipeNo-TextInput" placeholder="" labelText="Số hoá đơn" value={orderInfo.recipeNo} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="attachedDocument-TextInput" placeholder="" labelText="Số chứng từ gốc kèm theo" value={orderInfo.attachedDocument} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" value={orderInfo.recipeDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày trên hoá đơn" id="recipeDate-datepicker" disabled />
              </DatePicker>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="no-ComboBox"
                titleText="Nợ"
                placeholder=""
                label=""
                items={categoryList}
                selectedItem={orderInfo.no === '' ? null : categoryList.find((e) => e.id === orderInfo.no)}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, no: e.selectedItem == null ? '' : e.selectedItem.id } }))}
                disabled
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="co-ComboBox"
                titleText="Có"
                placeholder=""
                label=""
                items={categoryList}
                selectedItem={orderInfo.co === '' ? null : categoryList.find((e) => e.id === orderInfo.co)}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, co: e.selectedItem == null ? '' : e.selectedItem.id } }))}
                disabled
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="category-ComboBox"
                titleText="Khoản mục"
                placeholder=""
                label=""
                items={accountList}
                selectedItem={orderInfo.category === '' ? null : accountList.find((e) => e.id === orderInfo.category)}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, category: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                disabled
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
        </div>
        <div className="bx--grid">
          {changedOrderDetailList.length > 0 && (
            <div className="bx--row">
              <div className="bx--col-lg-2 bx--col-md-2" />
              <div className="bx--col-lg-12">
                <TableContainer title="Chi tiết thay đổi">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader key="stt">STT</TableHeader>
                        <TableHeader key="materialID">Mã vật tư</TableHeader>
                        <TableHeader key="materialName">Tên vật tư</TableHeader>
                        <TableHeader key="unit">Đơn vị</TableHeader>
                        <TableHeader key="requestQuantity">Số lượng ban đầu</TableHeader>
                        <TableHeader key="requestAmount">Thành tiền ban đầu</TableHeader>
                        <TableHeader key="testQuantity">Số lượng điều chỉnh</TableHeader>
                        <TableHeader key="testAmount">Thành tiền điều chỉnh</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {changedOrderDetailList.map((e, index) => (
                        <TableRow key={`row-${index.toString()}`}>
                          <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                          <TableCell key={`materialID-${index.toString()}`}>{e.materialID}</TableCell>
                          <TableCell key={`materialName-${index.toString()}`}>{e.materialName}</TableCell>
                          <TableCell key={`unit-${index.toString()}`}>{e.unit}</TableCell>
                          <TableCell key={`requestQuantity-${index.toString()}`}>{e.requestQuantity}</TableCell>
                          <TableCell key={`requestAmount-${index.toString()}`}>{e.requestAmount}</TableCell>
                          <TableCell key={`testQuantity-${index.toString()}`}>{e.testQuantity}</TableCell>
                          <TableCell key={`testAmount-${index.toString()}`}>{e.testAmount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <div className="bx--col-lg-2 bx--col-md-2" />
            </div>
          )}
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput id="testNote-TextInput" placeholder="" labelText="Nội dung điều chỉnh bởi phòng kỹ thuật" value={orderInfo.testNote} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" value={orderInfo.testDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày nghiệm thu" id="testDate-datepicker" disabled />
              </DatePicker>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="approveNote-TextInput"
                placeholder=""
                labelText="Nội dung điều chỉnh"
                value={orderInfo.approveNote}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, approveNote: e.target.value }, approveNoteErrorMessage: '' }))
                }
                invalid={approveNoteErrorMessage !== ''}
                invalidText={approveNoteErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                value={orderInfo.approveDate}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, approveDate: this.formatDate(e[0]) } }))}
              >
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày phê duyệt" id="approveDate-datepicker" />
              </DatePicker>
            </div>
            <div className="bx--col-lg-1 bx--col-md-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.approveOrder()} style={{ marginTop: '1rem' }} disabled={orderInfo.status !== 'tested'}>
                Phê duyệt
              </Button>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.cancelOrder()} style={{ marginTop: '1rem', backgroundColor: '#da1e28' }} disabled={orderInfo.status !== 'tested'}>
                Huỷ yêu cầu
              </Button>
            </div>
            <div className="bx--col-lg-4" style={{ marginTop: '1rem' }}>
              <strong>Chú ý:</strong>
              <br />
              <ul>
                <li> - Nếu cần điều chỉnh, vui lòng nhập lý do điều chỉnh.</li>
                <li> - Nếu phải huỷ bỏ yêu cầu, vui lòng nhập lý do trong phần điều chỉnh.</li>
              </ul>
            </div>
          </div>
        </div>
        <br />
        <br />
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title="Chi tiết danh mục nhập kho">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader key="stt">STT</TableHeader>
                      <TableHeader key="materialID">Mã vật tư</TableHeader>
                      <TableHeader key="materialName">Tên vật tư</TableHeader>
                      <TableHeader key="unit">Đơn vị</TableHeader>
                      <TableHeader key="materialTypeName">Thuộc kho</TableHeader>
                      <TableHeader key="materialGroupName">Loại vật tư</TableHeader>
                      <TableHeader key="quantity">Số lượng</TableHeader>
                      <TableHeader key="amount">Thành tiền</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetailList.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                        <TableCell key={`materialID-${index.toString()}`}>{orderDetailList[index].materialID}</TableCell>
                        <TableCell key={`materialName-${index.toString()}`}>{orderDetailList[index].materialName}</TableCell>
                        <TableCell key={`unit-${index.toString()}`}>{orderDetailList[index].unit}</TableCell>
                        <TableCell key={`materialTypeName-${index.toString()}`}>{orderDetailList[index].materialTypeName}</TableCell>
                        <TableCell key={`materialGroupName-${index.toString()}`}>{orderDetailList[index].materialGroupName}</TableCell>
                        <TableCell key={`quantity-${index.toString()}`}>
                          <TextInput
                            id={`quantity-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetailList[index].approveQuantity = e.target.value;
                              quantityErrorMessages[index] = '';
                              this.setState({ orderDetailList, quantityErrorMessages });
                            }}
                            value={orderDetailList[index].approveQuantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`amount-${index.toString()}`}>
                          <TextInput
                            id={`amount-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetailList[index].approveAmount = e.target.value;
                              amountErrorMessages[index] = '';
                              this.setState({ orderDetailList, amountErrorMessages });
                            }}
                            value={orderDetailList[index].approveAmount}
                            invalid={amountErrorMessages[index] !== ''}
                            invalidText={amountErrorMessages[index]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
        </div>
      </div>
    );
  }
}

StockInOrderApprove.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockInOrderApprove);
