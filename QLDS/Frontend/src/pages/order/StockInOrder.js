import { CloudUpload32 } from '@carbon/icons-react';
import {
  Accordion,
  AccordionItem,
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
import { addOrder, getCategoryList, getMaterialListWithStockQuantity, getSupplierList, getUserList } from '../../services';

class StockInOrder extends Component {
  constructor(props) {
    super(props);
    const { auth } = this.props;
    this.state = {
      orderInfo: {
        orderName: '',
        orderType: 'I',
        status: 'created',
        requestor: auth.userID,
        requestNote: '',
        requestDate: this.formatDate(new Date()),
        tester: '',
        testNote: '',
        testDate: '',
        approver: '',
        approveNote: '',
        approveDate: '',
        supplier: '',
        no: '',
        co: '',
        recipeNo: '',
        recipeDate: this.formatDate(new Date()),
        deliver: '',
        attachedDocument: '',
        stockName: '',
        address: '',
        category: '',
        companyID: auth.companyID,
      },
      orderNameErrorMessage: '',
      requestNoteErrorMessage: '',
      testerErrorMessage: '',
      testerList: [],
      approverErrorMessage: '',
      approverList: [],
      supplierErrorMessage: '',
      supplierList: [],
      orderDetailList: [],
      quantityErrorMessages: [],
      amountErrorMessages: [],
      categoryList: [],
      materialList: [],
      searchResult: [],
      materialListDisplay: [],
      page: 1,
      pageSize: 5,
      filterMaterialID: '',
      filterMaterialGroup: '',
      filterMatetrialName: '',
      filterMaterialType: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    setLoading(true);
    try {
      const getTesterListResult = await getUserList('', '', auth.companyID, 'phongkythuat');
      const getApproverListResult = await getUserList('', '', auth.companyID, 'phongketoantaichinh');
      const getMaterialListResult = await getMaterialListWithStockQuantity(auth.companyID);
      const getSupplierListResult = await getSupplierList();
      const getCategoryListResult = await getCategoryList();
      this.setState({
        testerList: getTesterListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        approverList: getApproverListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        materialList: getMaterialListResult.data,
        searchResult: getMaterialListResult.data,
        materialListDisplay: getMaterialListResult.data.slice(0, 5),
        supplierList: getSupplierListResult.data
          .sort((a, b) => a.supplierName.localeCompare(b.supplierName))
          .map((e) => {
            return { id: e.supplierID, label: e.supplierID.concat(' - ').concat(e.supplierName) };
          }),
        categoryList: [
          { id: '', label: '' },
          ...getCategoryListResult.data.map((e) => {
            return { id: e.categoryID, label: e.categoryName };
          }),
        ],
      });
    } catch {
      setErrorMessage('Không thể tải trang. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  save = async () => {
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    const { orderInfo, orderDetailList, quantityErrorMessages, amountErrorMessages } = this.state;

    this.setState({
      orderNameErrorMessage: '',
      requestNoteErrorMessage: '',
      testerErrorMessage: '',
      approverErrorMessage: '',
      quantityErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
      amountErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
    });
    setErrorMessage('');

    let hasError = false;
    if (orderInfo.orderName.trim() === '') {
      hasError = true;
      this.setState({ orderNameErrorMessage: 'Tên yêu cầu không thể bỏ trống' });
    }
    if (orderInfo.requestNote.trim() === '') {
      hasError = true;
      this.setState({ requestNoteErrorMessage: 'Lý do không thể bỏ trống' });
    }
    if (orderInfo.tester === '') {
      hasError = true;
      this.setState({ testerErrorMessage: 'Người nghiệm thu không thể bỏ trống' });
    }
    if (orderInfo.approver === '') {
      hasError = true;
      this.setState({ approverErrorMessage: 'Người phê duyệt không thể bỏ trống' });
    }
    if (orderInfo.supplier === '') {
      hasError = true;
      this.setState({ supplierErrorMessage: 'Nhà cung cấp không thể bỏ trống' });
    }

    if (orderDetailList.length === 0) {
      hasError = true;
      setErrorMessage('Mỗi yêu cầu cần ít nhất 1 danh mục vật tư');
    }

    orderDetailList.forEach((e, index) => {
      if (e.requestQuantity === '') {
        hasError = true;
        quantityErrorMessages[index] = 'Cần nhập vào số lượng';
      }
      if ((e.requestQuantity !== '' && !e.requestQuantity.match(/^\d+$/)) || Number(e.requestQuantity) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'Số lượng cần phải là số nguyên dương';
      }
      if (e.requestAmount === '') {
        hasError = true;
        amountErrorMessages[index] = 'Cần nhập vào thành tiền';
      }
      if ((e.requestAmount !== '' && !e.requestAmount.match(/^\d+$/)) || Number(e.requestAmount) < 1) {
        hasError = true;
        amountErrorMessages[index] = 'Thành tiền không đúng định dạng';
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

    setLoading(true);
    try {
      await addOrder({ orderInfo, orderDetailList });
    } catch {
      setErrorMessage('Có lỗi khi thêm yêu cầu. Vui lòng thử lại.');
    }
    setSubmitResult('Yêu cầu được thêm thành công');
    setLoading(false);
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  findMaterial = () => {
    const { filterMaterialID, filterMaterialGroup, filterMatetrialName, filterMaterialType, pageSize, materialList } = this.state;
    let filterResult = JSON.parse(JSON.stringify(materialList));
    if (filterMaterialID !== '') {
      filterResult = filterResult.filter((e) => e.materialID.includes(filterMaterialID));
    }
    if (filterMatetrialName !== '') {
      filterResult = filterResult.filter((e) => e.materialName.includes(filterMatetrialName));
    }
    if (filterMaterialGroup !== '') {
      filterResult = filterResult.filter((e) => e.materialGroupID === filterMaterialGroup);
    }
    if (filterMaterialType !== '') {
      filterResult = filterResult.filter((e) => e.materialTypeID === filterMaterialType);
    }
    this.setState({
      searchResult: filterResult,
      materialListDisplay: filterResult.slice(0, pageSize),
    });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      orderInfo,
      orderNameErrorMessage,
      requestNoteErrorMessage,
      testerList,
      approverList,
      orderDetailList,
      testerErrorMessage,
      approverErrorMessage,
      quantityErrorMessages,
      amountErrorMessages,
      supplierList,
      supplierErrorMessage,
      categoryList,
      filterMaterialID,
      filterMaterialGroup,
      filterMatetrialName,
      filterMaterialType,
      materialListDisplay,
      searchResult,
      page,
      pageSize,
    } = this.state;

    const materialGroups = [
      { id: '', label: '' },
      { id: 'phutungmuamoi', label: 'Phụ tùng mua mới' },
      { id: 'phutunggiacongcokhi', label: 'Phụ tùng gia công cơ khí' },
      { id: 'phutungkhoiphuc', label: 'Phụ tùng khôi phục' },
    ];
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
      <div className="stock-in">
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
              <TextInput
                id="orderName-TextInput"
                placeholder="Vui lòng nhập tên yêu cầu"
                labelText="Tên yêu cầu"
                value={orderInfo.orderName}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, orderName: e.target.value } }))}
                invalid={orderNameErrorMessage !== ''}
                invalidText={orderNameErrorMessage}
              />
            </div>
            <div className="bx--col-lg-4">
              <TextInput
                id="requestNote-TextInput"
                placeholder="Vui lòng nhập lý do lập bảng"
                labelText="Lý do"
                value={orderInfo.requestNote}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, requestNote: e.target.value } }))}
                invalid={requestNoteErrorMessage !== ''}
                invalidText={requestNoteErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, requestDate: this.formatDate(e[0]) } }))}
                value={orderInfo.requestDate}
              >
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày tạo yêu cầu" id="requestDate-datepicker" />
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
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, tester: e.selectedItem.id } }))}
                invalid={testerErrorMessage !== ''}
                invalidText={testerErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="approver-Dropdown"
                titleText="Người phê duyệt"
                label=""
                items={approverList}
                selectedItem={orderInfo.approver === '' ? null : approverList.find((e) => e.id === orderInfo.approver)}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, approver: e.selectedItem.id } }))}
                invalid={approverErrorMessage !== ''}
                invalidText={approverErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="deliver-TextInput"
                placeholder=""
                labelText="Người giao hàng"
                value={orderInfo.deliver}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, deliver: e.target.value } }))}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="stockName-TextInput"
                placeholder=""
                labelText="Nhập vào kho"
                value={orderInfo.stockName}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, stockName: e.target.value } }))}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="address-TextInput"
                placeholder=""
                labelText="Địa chỉ kho"
                value={orderInfo.address}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, address: e.target.value } }))}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <ComboBox
                id="supplier-Dropdown"
                titleText="Đơn vị cung cấp"
                placeholder="Nhà cung cấp"
                label=""
                items={supplierList}
                selectedItem={orderInfo.supplier === '' ? null : supplierList.find((e) => e.id === orderInfo.supplier)}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, supplier: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                invalid={supplierErrorMessage !== ''}
                invalidText={supplierErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="recipeNo-TextInput"
                placeholder=""
                labelText="Số hoá đơn"
                value={orderInfo.recipeNo}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, recipeNo: e.target.value } }))}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="attachedDocument-TextInput"
                placeholder=""
                labelText="Số chứng từ gốc kèm theo"
                value={orderInfo.attachedDocument}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, attachedDocument: e.target.value } }))}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, recipeDate: this.formatDate(e[0]) } }))}
                value={orderInfo.recipeDate}
              >
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày trên hoá đơn" id="recipeDate-datepicker" />
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
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
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
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="category-ComboBox"
                titleText="Khoản mục"
                placeholder=""
                label=""
                items={categoryList}
                selectedItem={orderInfo.category === '' ? null : categoryList.find((e) => e.id === orderInfo.category)}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, category: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.save()} style={{ marginTop: '1rem' }}>
                Lưu thông tin
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
        </div>
        <div className="bx--grid">
          <Accordion>
            <AccordionItem title={<strong>Tìm kiếm nhanh vật tư</strong>}>
              <div className="bx--row">
                <div className="bx--col-lg-4">
                  <TextInput
                    id="filterMaterialID-TextInput"
                    placeholder="Vui lòng nhập một phần mã vật tư để tìm kiếm"
                    labelText="Mã vật tư"
                    value={filterMaterialID}
                    onChange={(e) => this.setState({ filterMaterialID: e.target.value })}
                  />
                </div>
                <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
                <div className="bx--col-lg-4">
                  <Dropdown
                    id="filterMaterialGroup-Dropdown"
                    titleText="Nhóm vật tư"
                    label=""
                    items={materialGroups}
                    selectedItem={filterMaterialGroup === '' ? null : materialGroups.find((e) => e.id === filterMaterialGroup)}
                    onChange={(e) => this.setState({ filterMaterialGroup: e.selectedItem.id })}
                  />
                </div>
                <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
                <div className="bx--col-lg-2 bx--col-md-2">
                  <Button onClick={() => this.findMaterial()} style={{ marginTop: '1rem' }}>
                    Tìm
                  </Button>
                </div>
              </div>
              <br />
              <div className="bx--row">
                <div className="bx--col-lg-4">
                  <TextInput
                    id="filterMaterialName-TextInput"
                    placeholder="Vui lòng nhập một phần tên vật tư để tìm kiếm"
                    labelText="Tên vật tư"
                    value={filterMatetrialName}
                    onChange={(e) => this.setState({ filterMatetrialName: e.target.value })}
                  />
                </div>
                <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
                <div className="bx--col-lg-4">
                  <Dropdown
                    id="filterMaterialType-Dropdown"
                    titleText="Loại vật tư (tài khoản kho)"
                    label=""
                    items={materialTypes}
                    selectedItem={filterMaterialType === '' ? null : materialTypes.find((e) => e.id === filterMaterialType)}
                    onChange={(e) => this.setState({ filterMaterialType: e.selectedItem.id })}
                  />
                </div>
                <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
                <div className="bx--col-lg-2 bx--col-md-2">
                  <Button
                    style={{ marginTop: '1rem' }}
                    onClick={() => this.setState({ filterMaterialID: '', filterMaterialGroup: '', filterMatetrialName: '', filterMaterialType: '' })}
                  >
                    Xoá bộ lọc
                  </Button>
                </div>
              </div>
              <br />
              <hr className="LeftNav-module--divider--1Z49I" />
              <div className="bx--row">
                <div className="bx--col-lg-2 bx--col-md-2" />
                <div className="bx--col-lg-12">
                  <TableContainer title={`Kết quả tìm kiếm cho ra ${searchResult.length} mục vật tư tương ứng.`}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeader key="materialID">Mã vật tư</TableHeader>
                          <TableHeader key="materialName">Tên vật tư</TableHeader>
                          <TableHeader key="materialTypeName">Loại vật tư</TableHeader>
                          <TableHeader key="materialGroupName">Nhóm vật tư</TableHeader>
                          <TableHeader key="unit">Đơn vị tính</TableHeader>
                          <TableHeader key="minimumQuantity">Lượng tồn tối thiểu</TableHeader>
                          <TableHeader key="stockQuantity">Lượng tồn trong kho</TableHeader>
                          <TableHeader />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {materialListDisplay.map((material, index) => (
                          <TableRow key={`row-${index.toString()}}`}>
                            <TableCell key={`materialID-${index.toString()}`}>{material.materialID}</TableCell>
                            <TableCell key={`materialName-${index.toString()}`}>{material.materialName}</TableCell>
                            <TableCell key={`materialTypeName-${index.toString()}`}>{material.materialTypeName}</TableCell>
                            <TableCell key={`materialGroupName-${index.toString()}`}>{material.materialGroupName}</TableCell>
                            <TableCell key={`unit-${index.toString()}`}>{material.unit}</TableCell>
                            <TableCell key={`minimumQuantity-${index.toString()}`}>{material.minimumQuantity}</TableCell>
                            <TableCell key={`stockQuantity-${index.toString()}`}>{material.stockQuantity}</TableCell>
                            <TableCell>
                              <Button
                                disabled={orderDetailList.find((e) => e.materialID === material.materialID)}
                                onClick={() => {
                                  orderDetailList.push({
                                    materialID: material.materialID,
                                    materialName: material.materialName,
                                    materialTypeName: material.materialTypeName,
                                    materialGroupName: material.materialGroupName,
                                    unit: material.unit,
                                    requestQuantity: '',
                                    requestAmount: '',
                                  });
                                  quantityErrorMessages.push('');
                                  amountErrorMessages.push('');
                                  this.setState({ orderDetailList, quantityErrorMessages, amountErrorMessages });
                                }}
                              >
                                Thêm
                              </Button>
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
                    pageSizes={[5, 10, 15]}
                    totalItems={searchResult.length}
                    onChange={(target) => {
                      this.setState({
                        materialListDisplay: searchResult.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                        page: target.page,
                        pageSize: target.pageSize,
                      });
                    }}
                  />
                </div>
              </div>
              <br />
            </AccordionItem>
          </Accordion>
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
                      <TableHeader />
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
                              orderDetailList[index].requestQuantity = e.target.value;
                              quantityErrorMessages[index] = '';
                              this.setState({ orderDetailList, quantityErrorMessages });
                            }}
                            value={orderDetailList[index].requestQuantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`amount-${index.toString()}`}>
                          <TextInput
                            id={`amount-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetailList[index].requestAmount = e.target.value;
                              amountErrorMessages[index] = '';
                              this.setState({ orderDetailList, amountErrorMessages });
                            }}
                            value={orderDetailList[index].requestAmount}
                            invalid={amountErrorMessages[index] !== ''}
                            invalidText={amountErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`remove-button-${index.toString()}`}>
                          <Button
                            onClick={() => {
                              this.setState({
                                orderDetailList: orderDetailList.filter((e) => e.materialID !== row.materialID),
                              });
                            }}
                          >
                            Xoá
                          </Button>
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

StockInOrder.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockInOrder);
