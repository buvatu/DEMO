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
import { getTechSpecs, getTechSpecStandards, insertMaterialInfo } from '../../services';

class MaterialAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      materialID: '',
      materialIDErrorMessage: '',
      materialName: '',
      materialNameErrorMessage: '',
      unit: '',
      unitErrorMessage: '',
      unitList: [],
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
      techSpecID: '',
      techSpecList: [],
      techSpecStandardList: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getTechSpecsResult = await getTechSpecs();
    setLoading(false);
    this.setState({
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
      techSpecList: getTechSpecsResult.data.map((e) => {
        return { id: e.spec_id, label: e.spec_name };
      }),
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
  };

  addMaterial = async () => {
    this.setState({
      materialIDErrorMessage: '',
      materialNameErrorMessage: '',
      unitErrorMessage: '',
      materialGroupErrorMessage: '',
      minimumQuantityErrorMessage: '',
      materialTypeIDErrorMessage: '',
    });
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    setErrorMessage('');

    const { materialID, materialName, unit, productCode, materialGroupID, materialGroupName, minimumQuantity, materialTypeID, materialTypeName, techSpecID } =
      this.state;
    let hasError = false;
    if (materialID.trim() === '') {
      hasError = true;
      this.setState({ materialIDErrorMessage: 'Mã vật tư không thể bỏ trống' });
    }
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
    const getAddMaterialResult = await insertMaterialInfo(
      materialID,
      materialName,
      unit,
      productCode,
      materialGroupID,
      materialGroupName,
      minimumQuantity,
      materialTypeID,
      materialTypeName,
      techSpecID,
      auth.userID
    );
    setLoading(false);
    if (getAddMaterialResult.data === 1) {
      setSubmitResult('Thông tin vật tư được thêm thành công!');
    } else {
      setErrorMessage('Vật tư đã tồn tại. Vui lòng kiểm tra lại.');
    }
  };

  loadSpecStandardTable = async (techSpecID) => {
    if (techSpecID === '') {
      return;
    }
    const { setLoading } = this.props;
    setLoading(true);
    const getTechSpecStandardResult = await getTechSpecStandards(techSpecID);
    setLoading(false);
    this.setState({
      techSpecStandardList: getTechSpecStandardResult.data,
      techSpecID,
    });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      materialID,
      materialIDErrorMessage,
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
      techSpecID,
      techSpecList,
      techSpecStandardList,
    } = this.state;

    return (
      <div className="material-add">
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
          <h4>Thêm danh mục vật tư mới</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="materialID-TextInput"
                placeholder="Vui lòng nhập mã vật tư"
                labelText="Mã định danh vật tư"
                helperText="Ví dụ: VT_000001"
                value={materialID}
                onChange={(e) => this.setState({ materialID: e.target.value })}
                invalid={materialIDErrorMessage !== ''}
                invalidText={materialIDErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Dropdown
                id="materialType-Dropdown"
                titleText="Loại vật tư"
                label=""
                items={materialTypes}
                selectedItem={materialTypes.find((e) => e.id === materialTypeID)}
                onChange={(e) => this.setState({ materialTypeID: e.selectedItem.id, materialTypeName: e.selectedItem.label })}
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
                onChange={(e) => this.setState({ materialName: e.target.value })}
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
                selectedItem={materialGroups.find((e) => e.id === materialGroupID)}
                onChange={(e) => this.setState({ materialGroupID: e.selectedItem.id, materialGroupName: e.selectedItem.label })}
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
                onChange={(e) => this.setState({ minimumQuantity: e.target.value })}
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
                onChange={(e) => this.setState({ unit: e.selectedItem.id })}
                invalid={unitErrorMessage !== ''}
                invalidText={unitErrorMessage}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Dropdown
                id="techSpecID-Dropdown"
                titleText="Mã thông số kĩ thuật"
                label=""
                items={techSpecList}
                selectedItem={techSpecList.find((e) => e.id === techSpecID)}
                onChange={async (e) => this.loadSpecStandardTable(e.selectedItem.id)}
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
              {techSpecID && (
                <TableContainer title="Bảng thông số kĩ thuật tương ứng">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader>Mã tiêu chuẩn kĩ thuật</TableHeader>
                        <TableHeader>Tên tiêu chuẩn kĩ thuật</TableHeader>
                        <TableHeader>Đơn vị đo</TableHeader>
                        <TableHeader>Giá trị nhỏ nhất</TableHeader>
                        <TableHeader>Giá trị lớn nhất</TableHeader>
                        <TableHeader>Giá trị mặc định</TableHeader>
                        <TableHeader>Giá trị thực tế</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {techSpecStandardList.map((techSpecStandard) => (
                        <TableRow>
                          <TableCell>{techSpecStandard.standard_id}</TableCell>
                          <TableCell>{techSpecStandard.standard_name}</TableCell>
                          <TableCell>{techSpecStandard.unit}</TableCell>
                          <TableCell>{techSpecStandard.min_value}</TableCell>
                          <TableCell>{techSpecStandard.max_value}</TableCell>
                          <TableCell>{techSpecStandard.default_value}</TableCell>
                          <TableCell>{techSpecStandard.value}</TableCell>
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
              <Button onClick={() => this.addMaterial()}>Thêm vật tư mới</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

MaterialAdd.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialAdd);
