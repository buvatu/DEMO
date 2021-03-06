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
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import {
  acceptOrder,
  cancelOrder,
  getAccountTitleList,
  getCategoryList,
  getMaterialListWithStockQuantity,
  getOrder,
  getSupplierList,
  getUserList,
} from '../../services';

class StockInOrderTest extends Component {
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
        tester: auth.userID,
        testNote: '',
        testDate: '',
        approver: '',
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
      testRecipe: {
        id: '',
        orderID: '',
        leader: '',
        leaderPosition: '',
        leaderRepresentation: '',
        firstCommissioner: '',
        firstCommissionerPosition: '',
        firstCommissionerRepresentation: '',
        secondCommissioner: '',
        secondCommissionerPosition: '',
        secondCommissionerRepresentation: '',
        comment: '',
      },
      testNoteErrorMessage: '',
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
    const { setErrorMessage, setLoading, location, auth, common, setMaterialList } = this.props;
    const params = new URLSearchParams(location.search);
    if (params == null) {
      setErrorMessage('Kh??ng c?? m?? y??u c???u nh???p kho!!!');
      return;
    }
    const orderID = params.get('orderID');
    setLoading(true);
    let { materialList } = common;
    try {
      const getStockInOrderInfoResult = await getOrder(orderID);
      if (getStockInOrderInfoResult.data.orderInfo.tester !== auth.userID) {
        setErrorMessage('B???n kh??ng c?? quy???n truy c???p ');
        setLoading(false);
        return;
      }
      if (getStockInOrderInfoResult.data.orderInfo.status !== 'created') {
        setErrorMessage('Y??u c???u ???? b??? hu??? ho???c ???? ho??n th??nh. Vui l??ng th??? l???i.');
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
          e.testQuantity = e.requestQuantity;
          e.testAmount = e.requestAmount;
          return e;
        }),
        testRecipe: getStockInOrderInfoResult.data.testRecipe,
        quantityErrorMessages: Array(getStockInOrderInfoResult.data.orderDetailList.length).fill('', 0, getStockInOrderInfoResult.data.orderDetailList.length),
        amountErrorMessages: Array(getStockInOrderInfoResult.data.orderDetailList.length).fill('', 0, getStockInOrderInfoResult.data.orderDetailList.length),
      });
      this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, testDate: this.formatDate(new Date()) } }));
    } catch {
      setErrorMessage('M?? y??u c???u nh???p kho kh??ng t???n t???i!!!');
    }
    setLoading(false);
  };

  acceptOrder = async () => {
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    const { orderInfo, orderDetailList, quantityErrorMessages, amountErrorMessages, testRecipe } = this.state;

    this.setState({
      testNoteErrorMessage: '',
      quantityErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
      amountErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
    });
    setErrorMessage('');

    let hasError = false;

    orderDetailList.forEach((e, index) => {
      if (e.testQuantity === '') {
        hasError = true;
        quantityErrorMessages[index] = 'C???n nh???p v??o s??? l?????ng';
      }
      // eslint-disable-next-line no-restricted-globals
      if ((e.testQuantity !== '' && isNaN(e.testQuantity)) || Number(e.testQuantity) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'S??? l?????ng kh??ng h???p l???';
      }
      if (e.testAmount === '') {
        hasError = true;
        amountErrorMessages[index] = 'C???n nh???p v??o th??nh ti???n';
      }
      // eslint-disable-next-line no-restricted-globals
      if ((e.testAmount !== '' && isNaN(e.testAmount)) || Number(e.testAmount) < 1) {
        hasError = true;
        amountErrorMessages[index] = 'Th??nh ti???n kh??ng ????ng ?????nh d???ng';
      }
      if ((e.requestQuantity !== e.testQuantity || e.requestAmount !== e.testAmount) && orderInfo.testNote.trim() === '') {
        hasError = true;
        this.setState({ testNoteErrorMessage: 'N???i dung ??i???u ch???nh kh??ng th??? b??? tr???ng' });
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
      setErrorMessage('C?? m?? v???t t?? b??? tr??ng. Vui l??ng ki???m tra l???i');
    }
    if (hasError) {
      return;
    }

    orderInfo.status = 'tested';

    setLoading(true);
    try {
      await acceptOrder({ orderInfo, orderDetailList, testRecipe });
    } catch {
      setErrorMessage('C?? l???i khi nghi???m thu y??u c???u. Vui l??ng th??? l???i.');
    }
    setSubmitResult('Y??u c???u ???????c nghi???m thu th??nh c??ng');
    setLoading(false);
  };

  cancelOrder = async () => {
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    const { orderInfo } = this.state;
    if (orderInfo.testNote.trim() === '') {
      this.setState({ testNoteErrorMessage: 'N???i dung ??i???u ch???nh kh??ng th??? b??? tr???ng' });
      return;
    }
    orderInfo.status = 'canceled';
    setLoading(true);
    try {
      await cancelOrder(orderInfo);
    } catch {
      setErrorMessage('C?? l???i khi hu??? y??u c???u. Vui l??ng th??? l???i.');
    }
    setSubmitResult('Y??u c???u ???????c hu??? th??nh c??ng');
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
      testRecipe,
      testNoteErrorMessage,
    } = this.state;

    return (
      <div className="stock-in-test">
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
          <ModalHeader iconDescription="Close" title={<div>Thao t??c th??nh c??ng</div>} />
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
          <h4>Y??u c???u nh???p kho</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput id="orderName-TextInput" placeholder="" labelText="T??n y??u c???u" value={orderInfo.orderName} disabled />
            </div>
            <div className="bx--col-lg-4">
              <TextInput id="requestNote-TextInput" placeholder="" labelText="L?? do" value={orderInfo.requestNote} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" value={orderInfo.requestDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ng??y t???o y??u c???u" id="requestDate-datepicker" disabled />
              </DatePicker>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="tester-Dropdown"
                titleText="Ng?????i nghi???m thu"
                label=""
                items={testerList}
                selectedItem={orderInfo.tester === '' ? null : testerList.find((e) => e.id === orderInfo.tester)}
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="approver-Dropdown"
                titleText="Ng?????i ph?? duy???t"
                label=""
                items={approverList}
                selectedItem={orderInfo.approver === '' ? null : approverList.find((e) => e.id === orderInfo.approver)}
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="deliver-TextInput" placeholder="" labelText="Ng?????i giao h??ng" value={orderInfo.deliver} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="stockName-TextInput" placeholder="" labelText="Nh???p v??o kho" value={orderInfo.stockName} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="address-TextInput" placeholder="" labelText="?????a ch??? kho" value={orderInfo.address} disabled />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <ComboBox
                id="supplier-Dropdown"
                titleText="????n v??? cung c???p"
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
              <TextInput id="recipeNo-TextInput" placeholder="" labelText="S??? ho?? ????n" value={orderInfo.recipeNo} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="attachedDocument-TextInput" placeholder="" labelText="S??? ch???ng t??? g???c k??m theo" value={orderInfo.attachedDocument} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" value={orderInfo.recipeDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ng??y tr??n ho?? ????n" id="recipeDate-datepicker" disabled />
              </DatePicker>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="no-ComboBox"
                titleText="N???"
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
                titleText="C??"
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
                titleText="Kho???n m???c"
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
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="leader-TextInput"
                placeholder="Tr?????ng ban ki???m nghi???m"
                labelText="Tr?????ng ban"
                value={testRecipe.leader}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, leader: e.target.value } }))}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="leaderPosition-TextInput"
                placeholder="Ch???c v??? tr?????ng ban ki???m nghi???m"
                labelText="Ch???c v???"
                value={testRecipe.leaderPosition}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, leaderPosition: e.target.value } }))}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="leaderRepresentation-TextInput"
                placeholder="?????i di???n tr?????ng ban ki???m nghi???m"
                labelText="?????i di???n"
                value={testRecipe.leaderRepresentation}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, leaderRepresentation: e.target.value } }))}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="firstCommissioner-TextInput"
                placeholder="U??? vi??n ban ki???m nghi???m"
                labelText="U??? vi??n"
                value={testRecipe.firstCommissioner}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, firstCommissioner: e.target.value } }))}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="firstCommissionerPosition-TextInput"
                placeholder="Ch???c v???"
                labelText="Ch???c v???"
                value={testRecipe.firstCommissionerPosition}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, firstCommissionerPosition: e.target.value } }))}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="firstCommissionerRepresentation-TextInput"
                placeholder="?????i di???n"
                labelText="?????i di???n"
                value={testRecipe.firstCommissionerRepresentation}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, firstCommissionerRepresentation: e.target.value } }))}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="secondCommissioner-TextInput"
                placeholder="U??? vi??n ban ki???m nghi???m"
                labelText="U??? vi??n"
                value={testRecipe.secondCommissioner}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, secondCommissioner: e.target.value } }))}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="secondCommissionerPosition-TextInput"
                placeholder="Ch???c v???"
                labelText="Ch???c v???"
                value={testRecipe.secondCommissionerPosition}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, secondCommissionerPosition: e.target.value } }))}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="secondCommissionerRepresentation-TextInput"
                placeholder="?????i di???n"
                labelText="?????i di???n"
                value={testRecipe.secondCommissionerRepresentation}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, secondCommissionerRepresentation: e.target.value } }))}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="comment-TextInput"
                placeholder=""
                labelText="?? ki???n ban ki???m nghi???m"
                value={testRecipe.comment}
                onChange={(e) => this.setState((prevState) => ({ testRecipe: { ...prevState.testRecipe, comment: e.target.value } }))}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, testDate: this.formatDate(e[0]) } }))}
                value={orderInfo.testDate}
              >
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ng??y nghi???m thu" id="testDate-datepicker" />
              </DatePicker>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="testNote-TextInput"
                placeholder=""
                labelText="N???i dung ??i???u ch???nh"
                value={orderInfo.testNote}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, testNote: e.target.value }, testNoteErrorMessage: '' }))}
                invalid={testNoteErrorMessage !== ''}
                invalidText={testNoteErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.acceptOrder()} style={{ marginTop: '1rem' }} disabled={orderInfo.status !== 'created'}>
                Nghi???m thu
              </Button>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.cancelOrder()} style={{ marginTop: '1rem', backgroundColor: '#da1e28' }} disabled={orderInfo.status !== 'created'}>
                Hu??? y??u c???u
              </Button>
            </div>
            <div className="bx--col-lg-4" style={{ marginTop: '1rem' }}>
              <strong>Ch?? ??:</strong>
              <br />
              <ul>
                <li> - N???u c???n ??i???u ch???nh, vui l??ng nh???p l?? do ??i???u ch???nh.</li>
                <li> - N???u ph???i hu??? b??? y??u c???u, vui l??ng nh???p l?? do trong ph???n ??i???u ch???nh.</li>
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
              <TableContainer title="Chi ti???t danh m???c nh???p kho">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader key="stt">STT</TableHeader>
                      <TableHeader key="materialID">M?? v???t t??</TableHeader>
                      <TableHeader key="materialName">T??n v???t t??</TableHeader>
                      <TableHeader key="unit">????n v???</TableHeader>
                      <TableHeader key="materialTypeName">Thu???c kho</TableHeader>
                      <TableHeader key="materialGroupName">Lo???i v???t t??</TableHeader>
                      <TableHeader key="quantity">S??? l?????ng</TableHeader>
                      <TableHeader key="amount">Th??nh ti???n</TableHeader>
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
                              orderDetailList[index].testQuantity = e.target.value;
                              quantityErrorMessages[index] = '';
                              this.setState({ orderDetailList, quantityErrorMessages });
                            }}
                            value={orderDetailList[index].testQuantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`amount-${index.toString()}`}>
                          <TextInput
                            id={`amount-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetailList[index].testAmount = e.target.value;
                              amountErrorMessages[index] = '';
                              this.setState({ orderDetailList, amountErrorMessages });
                            }}
                            value={orderDetailList[index].testAmount}
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

StockInOrderTest.propTypes = {
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
});

export default connect(mapStateToProps, mapDispatchToProps)(StockInOrderTest);
