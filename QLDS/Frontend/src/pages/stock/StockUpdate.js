import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComposedModal,
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
import { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setMaterialListValue, setSubmitValue } from '../../actions/commonAction';
import { getMaterialListWithStockQuantity, getStockList, stockUpdate } from '../../services';

class StockUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stockList: [],
      quantityErrorMessages: [],
      amountErrorMessages: [],

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
    const { setLoading, auth, setErrorMessage, setMaterialList, common } = this.props;
    if (auth.role !== 'phongketoantaichinh') {
      setErrorMessage('Chỉ có người của phòng tài chính kế toán mới có thể truy cập chức năng này.');
      return;
    }

    setLoading(true);
    let { materialList } = common;
    try {
      if (materialList.length === 0) {
        const getMaterialListResult = await getMaterialListWithStockQuantity(auth.companyID);
        materialList = getMaterialListResult.data;
        setMaterialList(materialList);
      }
      const getStockListResult = await getStockList(auth.companyID);
      const stockList = getStockListResult.data.map((e) => {
        e.quantity = e.stockQuantity;
        return e;
      });

      this.setState({
        materialList,
        searchResult: materialList,
        materialListDisplay: materialList.slice(0, 5),
        stockList,
        quantityErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
        amountErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
      });
    } catch {
      setErrorMessage('Có lỗi khi tải trang. Vui lòng thử lại sau.');
    }
    setLoading(false);
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

  saveUpdatedStock = async () => {
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    const { stockList, quantityErrorMessages, amountErrorMessages } = this.state;

    this.setState({
      quantityErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
      amountErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
    });
    setErrorMessage('');

    let hasError = false;
    stockList.forEach((e, index) => {
      if (e.quantity === '') {
        hasError = true;
        quantityErrorMessages[index] = 'Cần nhập vào số lượng';
      }
      if ((e.quantity !== '' && !e.quantity.toString().match(/^\d+$/)) || Number(e.quantity) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'Số lượng cần phải là số nguyên dương';
      }
      if (e.amount === '') {
        hasError = true;
        amountErrorMessages[index] = 'Cần nhập vào thành tiền';
      }
      if ((e.amount !== '' && !e.amount.toString().match(/^\d+$/)) || Number(e.amount) < 1) {
        hasError = true;
        amountErrorMessages[index] = 'Thành tiền không đúng định dạng';
      }
    });
    this.setState({ quantityErrorMessages, amountErrorMessages });

    if (hasError) {
      return;
    }

    setLoading(true);
    try {
      await stockUpdate(stockList, auth.companyID);
    } catch {
      setErrorMessage('Cập nhật kho đầu kì bị lỗi. Vui lòng thử lại sau.');
    }
    setLoading(false);
    setSubmitResult('Danh mục kho được câp nhật thành công');
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common, auth } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

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

    // Then state
    const {
      filterMaterialID,
      filterMaterialGroup,
      filterMatetrialName,
      filterMaterialType,
      materialListDisplay,
      searchResult,
      page,
      pageSize,
      quantityErrorMessages,
      amountErrorMessages,
      stockList,
    } = this.state;

    return (
      <div className="stock-update">
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
          <h4>Cập nhật kho đầu kì</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
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
                            disabled={stockList.find((e) => e.materialID === material.materialID) != null}
                            onClick={() => {
                              stockList.push({
                                materialID: material.materialID,
                                materialName: material.materialName,
                                materialTypeName: material.materialTypeName,
                                materialGroupName: material.materialGroupName,
                                unit: material.unit,
                                quantity: '',
                                amount: '',
                                status: 'A',
                                companyID: auth.companyID,
                              });
                              quantityErrorMessages.push('');
                              amountErrorMessages.push('');
                              this.setState({ stockList, quantityErrorMessages, amountErrorMessages });
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
        </div>
        <br />
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-12">
              <Button onClick={() => this.saveUpdatedStock()}>Cập nhật kho</Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title="Chi tiết danh mục kho">
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
                    {stockList.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                        <TableCell key={`materialID-${index.toString()}`}>{stockList[index].materialID}</TableCell>
                        <TableCell key={`materialName-${index.toString()}`}>{stockList[index].materialName}</TableCell>
                        <TableCell key={`unit-${index.toString()}`}>{stockList[index].unit}</TableCell>
                        <TableCell key={`materialTypeName-${index.toString()}`}>{stockList[index].materialTypeName}</TableCell>
                        <TableCell key={`materialGroupName-${index.toString()}`}>{stockList[index].materialGroupName}</TableCell>
                        <TableCell key={`quantity-${index.toString()}`}>
                          <TextInput
                            id={`quantity-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              stockList[index].quantity = e.target.value;
                              quantityErrorMessages[index] = '';
                              this.setState({ stockList, quantityErrorMessages });
                            }}
                            value={stockList[index].quantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`amount-${index.toString()}`}>
                          <TextInput
                            id={`amount-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              stockList[index].amount = e.target.value;
                              amountErrorMessages[index] = '';
                              this.setState({ stockList, amountErrorMessages });
                            }}
                            value={stockList[index].amount}
                            invalid={amountErrorMessages[index] !== ''}
                            invalidText={amountErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`remove-button-${index.toString()}`}>
                          <Button
                            onClick={() => {
                              this.setState({
                                stockList: stockList.filter((e) => e.materialID !== row.materialID),
                                quantityErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
                                amountErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
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

StockUpdate.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockUpdate);
