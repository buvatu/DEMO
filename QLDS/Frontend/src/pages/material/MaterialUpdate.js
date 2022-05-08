import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
  ComposedModal,
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
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { getMaterialInfo, getSpecList, getTechSpecStandards, updateMaterialInfo } from '../../services';

class MaterialUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      materialID: '',
      materialName: '',
      materialNameErrorMessage: '',
      unit: '',
      unitList: [],
      unitErrorMessage: '',
      productCode: '',
      materialGroupID: '',
      materialGroupErrorMessage: '',
      materialGroupName: '',
      materialGroups: [],
      minimumQuantity: '',
      minimumQuantityErrorMessage: '',
      materialTypeID: '',
      materialTypeIDErrorMessage: '',
      materialTypeName: '',
      materialTypes: [],
      specID: '',
      techSpecList: [],
      specStandardList: [],
    };
  }

  componentDidMount = async () => {
    const { setErrorMessage, setLoading, location } = this.props;
    const params = new URLSearchParams(location.search);
    if (params == null) {
      setErrorMessage('Không có mã vật tư!!!');
      return;
    }
    const materialID = params.get('materialID');
    setLoading(true);
    try {
      const getMaterialInfoResult = await getMaterialInfo(materialID);
      const getTechSpecListResult = await getSpecList();
      const { specID } = getMaterialInfoResult.data;
      let specStandardList = [];
      if (specID != null && specID !== '') {
        const getSpecStandardLitResult = await getTechSpecStandards(specID);
        specStandardList = getSpecStandardLitResult.data;
      }
      this.setState({
        id: getMaterialInfoResult.data.id,
        materialID,
        materialName: getMaterialInfoResult.data.materialName,
        unit: getMaterialInfoResult.data.unit,
        productCode: getMaterialInfoResult.data.productCode,
        materialGroupID: getMaterialInfoResult.data.materialGroupID,
        materialGroupName: getMaterialInfoResult.data.materialGroupName,
        minimumQuantity: getMaterialInfoResult.data.minimumQuantity,
        materialTypeID: getMaterialInfoResult.data.materialTypeID,
        materialTypeName: getMaterialInfoResult.data.materialTypeName,
        specID,
        specStandardList,
        materialGroups: [
          { id: 'phutungmuamoi', label: 'Phụ tùng mua mới' },
          { id: 'phutunggiacongcokhi', label: 'Phụ tùng gia công cơ khí' },
          { id: 'phutungkhoiphuc', label: 'Phụ tùng khôi phục' },
        ],
        materialTypes: [
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
        ],
        techSpecList: [].concat({ id: '', label: '' }).concat(
          getTechSpecListResult.data.map((e) => {
            return { id: e.specID, label: e.specID.concat(' - ').concat(e.specName) };
          })
        ),
        unitList: [
          { id: 'bộ', label: 'bộ' },
          { id: 'cái', label: 'cái' },
          { id: 'cặp', label: 'cặp' },
          { id: 'cụm', label: 'cụm' },
          { id: 'cuộn', label: 'cuộn' },
          { id: 'vòng', label: 'vòng' },
          { id: 'ống', label: 'ống' },
          { id: 'dây', label: 'dây' },
          { id: 'vòng', label: 'vòng' },
          { id: 'kg', label: 'kg' },
          { id: 'l', label: 'l' },
          { id: 'l (15°C)', label: 'l (15°C)' },
          { id: 'bình', label: 'bình' },
          { id: 'lọ', label: 'lọ' },
          { id: 'hộp', label: 'hộp' },
          { id: 'm', label: 'm' },
          { id: 'm2', label: 'm2' },
          { id: 'sợi', label: 'sợi' },
          { id: 'tấm', label: 'tấm' },
          { id: 'túi', label: 'túi' },
          { id: 'viên', label: 'viên' },
          { id: 'quyển', label: 'quyển' },
        ],
      });
    } catch {
      setErrorMessage('Mã vật tư không tồn tại!!!');
    }
    setLoading(false);
  };

  updateMaterial = async () => {
    this.setState({
      materialNameErrorMessage: '',
      unitErrorMessage: '',
      materialGroupErrorMessage: '',
      minimumQuantityErrorMessage: '',
      materialTypeIDErrorMessage: '',
    });
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    setErrorMessage('');

    const { id, materialID, materialName, unit, productCode, materialGroupID, materialGroupName, minimumQuantity, materialTypeID, materialTypeName, specID } =
      this.state;
    let hasError = false;
    if (materialName.trim() === '') {
      hasError = true;
      this.setState({ materialNameErrorMessage: 'Tên vật tư không thể bỏ trống' });
    }
    if (unit.trim() === '') {
      hasError = true;
      this.setState({ unitErrorMessage: 'Đơn vị tính không thể bỏ trống' });
    }
    if (materialGroupID === '') {
      hasError = true;
      this.setState({ materialGroupErrorMessage: 'Nhóm vật tư không thể bỏ trống' });
    }
    if (materialTypeID === '') {
      hasError = true;
      this.setState({ materialTypeIDErrorMessage: 'Loại vật tư không thể bỏ trống' });
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      await updateMaterialInfo({
        id,
        materialID,
        materialName,
        unit,
        productCode,
        materialGroupID,
        materialGroupName,
        minimumQuantity,
        materialTypeID,
        materialTypeName,
        specID,
      });
      setSubmitResult('Thông tin vật tư được cập nhật thành công!');
    } catch {
      setErrorMessage('Có lỗi trong khi cập nhật vật tư. Vui lòng kiểm tra lại.');
    }
    setLoading(false);
  };

  loadSpecStandardTable = async (specID) => {
    if (specID === '') {
      this.setState({
        specStandardList: [],
        specID,
      });
      return;
    }
    const { setLoading } = this.props;
    setLoading(true);
    const getSpecStandardLitResult = await getTechSpecStandards(specID);
    setLoading(false);
    this.setState({
      specStandardList: getSpecStandardLitResult.data,
      specID,
    });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      materialID,
      materialName,
      materialNameErrorMessage,
      unit,
      unitErrorMessage,
      unitList,
      productCode,
      materialGroupID,
      materialGroupErrorMessage,
      materialGroups,
      minimumQuantity,
      minimumQuantityErrorMessage,
      materialTypeID,
      materialTypeIDErrorMessage,
      materialTypes,
      specID,
      techSpecList,
      specStandardList,
    } = this.state;

    return (
      <div className="material-update">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal
          className="btn-success"
          open={submitResult !== ''}
          size="sm"
          onClose={() => {
            setSubmitResult('');
            history.push('/material/list');
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
              history.push('/material/list');
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
          <h4>Cập nhật danh mục vật tư mới</h4>
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
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput id="materialID-TextInput" placeholder="Vui lòng nhập mã vật tư" labelText="Mã định danh vật tư" value={materialID} disabled />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Dropdown
                id="materialType-Dropdown"
                titleText="Loại vật tư"
                label=""
                items={materialTypes}
                selectedItem={materialTypeID === '' ? null : materialTypes.find((e) => e.id === materialTypeID)}
                onChange={(e) => this.setState({ materialTypeID: e.selectedItem.id, materialTypeName: e.selectedItem.label, materialTypeIDErrorMessage: '' })}
                invalid={materialTypeIDErrorMessage !== ''}
                invalidText={materialTypeIDErrorMessage}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="materialName-TextInput"
                placeholder="Vui lòng nhập tên vật tư"
                labelText="Tên vật tư"
                value={materialName}
                onChange={(e) => this.setState({ materialName: e.target.value, materialNameErrorMessage: '' })}
                invalid={materialNameErrorMessage !== ''}
                invalidText={materialNameErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Dropdown
                id="materialGroup-Dropdown"
                titleText="Nhóm vật tư"
                label=""
                items={materialGroups}
                selectedItem={materialGroupID === '' ? null : materialGroups.find((e) => e.id === materialGroupID)}
                onChange={(e) => this.setState({ materialGroupID: e.selectedItem.id, materialGroupName: e.selectedItem.label, materialGroupErrorMessage: '' })}
                invalid={materialGroupErrorMessage !== ''}
                invalidText={materialGroupErrorMessage}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="minimumQuantity-TextInput"
                placeholder="Vui lòng nhập số lượng tồn tối thiểu"
                labelText="Số lượng tồn tối thiểu"
                value={minimumQuantity}
                onChange={(e) => this.setState({ minimumQuantity: e.target.value, minimumQuantityErrorMessage: '' })}
                invalid={minimumQuantityErrorMessage !== ''}
                invalidText={minimumQuantityErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Dropdown
                id="unit-Dropdown"
                titleText="Đơn vị tính"
                label=""
                items={unitList}
                selectedItem={unit === '' ? null : unitList.find((e) => e.id === unit)}
                onChange={(e) => this.setState({ unit: e.selectedItem.id, unitErrorMessage: '' })}
                invalid={unitErrorMessage !== ''}
                invalidText={unitErrorMessage}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <ComboBox
                id="specID-ComboBox"
                titleText="Mã thông số kĩ thuật"
                label=""
                items={techSpecList}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                selectedItem={specID === '' ? null : techSpecList.find((e) => e.id === specID)}
                onChange={async (e) => this.loadSpecStandardTable(e.selectedItem == null ? '' : e.selectedItem.id)}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="productCode-TextInput"
                placeholder="Vui lòng nhập mã nhà sản xuất"
                labelText="Mã nhà sản xuất"
                value={productCode}
                onChange={(e) => this.setState({ productCode: e.target.value })}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-12">
              {specID && (
                <TableContainer title="Bảng thông số kĩ thuật tương ứng">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader key="standardID">Mã tiêu chuẩn kĩ thuật</TableHeader>
                        <TableHeader key="standardName">Tên tiêu chuẩn kĩ thuật</TableHeader>
                        <TableHeader key="unit">Đơn vị đo</TableHeader>
                        <TableHeader key="minValue">Giá trị nhỏ nhất</TableHeader>
                        <TableHeader key="maxValue">Giá trị lớn nhất</TableHeader>
                        <TableHeader key="defaultValue">Giá trị mặc định</TableHeader>
                        <TableHeader key="value">Giá trị thực tế</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {specStandardList.map((specStandard, index) => (
                        <TableRow key={`row-${index.toString()}`}>
                          <TableCell>{specStandard.standardID}</TableCell>
                          <TableCell>{specStandard.standardName}</TableCell>
                          <TableCell>{specStandard.unit}</TableCell>
                          <TableCell>{specStandard.minValue}</TableCell>
                          <TableCell>{specStandard.maxValue}</TableCell>
                          <TableCell>{specStandard.defaultValue}</TableCell>
                          <TableCell>{specStandard.value}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Button onClick={() => this.updateMaterial()}>Cập nhật thông tin vật tư</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MaterialUpdate.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialUpdate);
