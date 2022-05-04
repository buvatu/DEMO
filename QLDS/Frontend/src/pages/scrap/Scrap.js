import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
  ComposedModal,
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
import { deleteScrap, getMaterialList, getScrapList, insertScrap, updateScrap } from '../../services';

class Scrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrapList: [],

      newMaterialID: '',
      newMaterialIDErrorMessage: '',
      newMaterialName: '',
      newCopperVolume: '',
      newAluminumVolume: '',
      newCastIronVolume: '',
      newSteelVolume: '',
      newOtherVolume: '',

      updatedMaterialID: '',
      updatedCopperVolume: '',
      updatedAluminumVolume: '',
      updatedCastIronVolume: '',
      updatedSteelVolume: '',
      updatedOtherVolume: '',

      materialList: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getScrapListResult = await getScrapList();
    const getMaterialListResult = await getMaterialList('', '', '', '');
    const scrapList = getScrapListResult.data
      .map((e, index) => {
        e.id = index.toString();
        return e;
      })
      .sort((a, b) => a.material_name.localeCompare(b.material_name));
    const materialList = getMaterialListResult.data
      .filter((e) => scrapList.find((item) => item.material_id === e.material_id) == null)
      .sort((a, b) => a.material_name.localeCompare(b.material_name))
      .map((e) => {
        return {
          id: e.material_id,
          label: e.material_id.concat(' - ').concat(e.material_name),
        };
      });
    setLoading(false);
    this.setState({
      materialList,
      scrapList,
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    const { materialList } = this.state;
    setSubmitResult('');
    setLoading(true);
    const getScrapListResult = await getScrapList();
    const scrapList = getScrapListResult.data
      .map((e, index) => {
        e.id = index.toString();
        return e;
      })
      .sort((a, b) => a.material_name.localeCompare(b.material_name));

    setLoading(false);
    this.setState({
      materialList: materialList.filter((e) => scrapList.find((item) => item.material_id === e.id) == null),
      scrapList,
      newMaterialID: '',
      newMaterialIDErrorMessage: '',
      newCopperVolume: '',
      newAluminumVolume: '',
      newCastIronVolume: '',
      newSteelVolume: '',
      newOtherVolume: '',

      updatedMaterialID: '',
      updatedCopperVolume: '',
      updatedAluminumVolume: '',
      updatedCastIronVolume: '',
      updatedSteelVolume: '',
      updatedOtherVolume: '',
    });
  };

  addNewScrap = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const {
      scrapList,
      newMaterialID,

      newMaterialName,
      newCopperVolume,
      newAluminumVolume,
      newCastIronVolume,
      newSteelVolume,
      newOtherVolume,
    } = this.state;
    this.setState({ newMaterialIDErrorMessage: '' });
    let hasError = false;
    if (newMaterialID.trim() === '') {
      this.setState({ newMaterialIDErrorMessage: 'Mã vật tư không được bỏ trống' });
      hasError = true;
    }
    if (
      scrapList
        .map((e) => {
          return e.material_id;
        })
        .includes(newMaterialID.trim())
    ) {
      this.setState({ newMaterialIDErrorMessage: 'Mã vật tư đã tồn tại' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    const getAdScrapResult = await insertScrap(
      newMaterialID,
      newMaterialName,
      newCopperVolume,
      newAluminumVolume,
      newCastIronVolume,
      newSteelVolume,
      newOtherVolume,
      auth.userID
    );
    setLoading(false);
    if (getAdScrapResult.data === 1) {
      setSubmitResult('Vật tư phế liệu mới thêm thành công!');
    } else {
      setErrorMessage('Phế liệu mới đã tồn tại. Vui lòng kiểm tra lại.');
    }
  };

  updateScrap = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const { updatedMaterialID, updatedCopperVolume, updatedAluminumVolume, updatedCastIronVolume, updatedSteelVolume, updatedOtherVolume } = this.state;
    setLoading(true);
    const getUpdatEngineResult = await updateScrap(
      updatedMaterialID,
      updatedCopperVolume,
      updatedAluminumVolume,
      updatedCastIronVolume,
      updatedSteelVolume,
      updatedOtherVolume,
      auth.userID
    );
    setLoading(false);
    if (getUpdatEngineResult.data === 1) {
      setSubmitResult('Vật tư phế liệu được cập nhật thành công!');
    } else {
      setErrorMessage('Có lỗi khi cập nhật vật tư phế liệu. Vui lòng kiểm tra lại.');
    }
  };

  deleteScrap = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { updatedMaterialID } = this.state;
    setLoading(true);
    const getDeleteScrapResult = await deleteScrap(updatedMaterialID);
    setLoading(false);
    if (getDeleteScrapResult.data === 1) {
      setSubmitResult('Vật tư phế liệu được xoá thành công!');
    } else {
      setErrorMessage('Có lỗi khi xoá vật tư phế liệu. Vui lòng kiểm tra lại.');
    }
  };

  render() {
    // Props first
    const { setErrorMessage, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      scrapList,

      newMaterialID,
      newMaterialIDErrorMessage,
      newCopperVolume,
      newAluminumVolume,
      newCastIronVolume,
      newSteelVolume,
      newOtherVolume,

      updatedMaterialID,
      updatedCopperVolume,
      updatedAluminumVolume,
      updatedCastIronVolume,
      updatedSteelVolume,
      updatedOtherVolume,

      materialList,
    } = this.state;

    return (
      <div className="scrap">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal className="btn-success" open={submitResult !== ''} size="sm" onClose={() => this.reload()}>
          <ModalHeader iconDescription="Close" title={<div>Thao tác thành công</div>} />
          <ModalBody aria-label="Modal content">
            <div className="form-icon">
              <CloudUpload32 className="icon-prop" />
              <p className="bx--modal-content__text">{submitResult}</p>
            </div>
          </ModalBody>
          <ModalFooter onRequestSubmit={() => this.reload()} primaryButtonText="OK" secondaryButtonText="" />
        </ComposedModal>
        {/* Error Message */}
        <div className="bx--grid">
          <div className="bx--row">
            {errorMessage !== '' && <InlineNotification lowContrast kind="error" title={errorMessage} onCloseButtonClick={() => setErrorMessage('')} />}
          </div>
        </div>
        <br />
        <div className="view-header--box">
          <h4>Danh mục phế liệu</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <ComboBox
                id="newMaterialID-ComboBox"
                titleText="Loại vật tư"
                placeholder=""
                label=""
                items={materialList}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) =>
                  this.setState({
                    newMaterialID: e.selectedItem == null ? '' : e.selectedItem.id,
                    newMaterialName: e.selectedItem == null ? '' : e.selectedItem.label.split(' - ').slice(1).join(''),
                  })
                }
                selectedItem={newMaterialID === '' ? null : materialList.find((e) => e.material_id === newMaterialID)}
                invalid={newMaterialIDErrorMessage !== ''}
                invalidText={newMaterialIDErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.addNewScrap()} style={{ marginTop: '1rem' }}>
                Thêm
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newCopperVolume-TextInput"
                placeholder=""
                labelText="Khối lượng Đồng"
                value={newCopperVolume}
                onChange={(e) => this.setState({ newCopperVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newAluminumVolume-TextInput"
                placeholder=""
                labelText="Khối lượng Nhôm"
                value={newAluminumVolume}
                onChange={(e) => this.setState({ newAluminumVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newCastIronVolume-TextInput"
                placeholder=""
                labelText="Khối lượng Gang"
                value={newCastIronVolume}
                onChange={(e) => this.setState({ newCastIronVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newSteelVolume-TextInput"
                placeholder=""
                labelText="Khối lượng Sắt"
                value={newSteelVolume}
                onChange={(e) => this.setState({ newSteelVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newOtherVolume -TextInput"
                placeholder=""
                labelText="Vật liệu khác"
                value={newOtherVolume}
                onChange={(e) => this.setState({ newOtherVolume: e.target.value })}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <ComboBox
                id="updatedMaterialID-ComboBox"
                titleText="Loại vật tư phế liệu"
                placeholder=""
                label=""
                items={scrapList.map((e) => {
                  return {
                    id: e.material_id,
                    label: e.material_id.concat(' - ').concat(e.material_name),
                  };
                })}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                selectedItem={
                  updatedMaterialID === ''
                    ? null
                    : scrapList
                        .map((e) => {
                          return {
                            id: e.material_id,
                            label: e.material_id.concat(' - ').concat(e.material_name),
                          };
                        })
                        .find((e) => e.id === updatedMaterialID)
                }
                onChange={(e) => {
                  if (e.selectedItem == null) {
                    this.setState({
                      updatedMaterialID: '',
                      updatedCopperVolume: '',
                      updatedAluminumVolume: '',
                      updatedCastIronVolume: '',
                      updatedSteelVolume: '',
                      updatedOtherVolume: '',
                    });
                  } else {
                    const selectedMaterial = scrapList.find((item) => item.material_id === e.selectedItem.id);
                    this.setState({
                      updatedMaterialID: selectedMaterial.material_id,
                      updatedCopperVolume: selectedMaterial.copper_volume,
                      updatedAluminumVolume: selectedMaterial.aluminum_volume,
                      updatedCastIronVolume: selectedMaterial.cast_iron_volume,
                      updatedSteelVolume: selectedMaterial.steel_volume,
                      updatedOtherVolume: selectedMaterial.other_volume,
                    });
                  }
                }}
              />
            </div>
            <div className="bx--col-lg-4">
              <Button onClick={() => this.updateScrap()} style={{ marginTop: '1rem', marginRight: '1rem' }} disabled={updatedMaterialID === ''}>
                Cập nhật
              </Button>
              <Button onClick={() => this.deleteScrap()} style={{ marginTop: '1rem' }} disabled={updatedMaterialID === ''}>
                Xoá
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedCopperVolume-TextInput"
                placeholder=""
                labelText="Khối lượng Đồng"
                value={updatedCopperVolume}
                onChange={(e) => this.setState({ updatedCopperVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedAluminumVolume-TextInput"
                placeholder=""
                labelText="Khối lượng Nhôm"
                value={updatedAluminumVolume}
                onChange={(e) => this.setState({ updatedAluminumVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedCastIronVolume-TextInput"
                placeholder=""
                labelText="Khối lượng Gang"
                value={updatedCastIronVolume}
                onChange={(e) => this.setState({ updatedCastIronVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedSteelVolume-TextInput"
                placeholder=""
                labelText="Khối lượng Sắt"
                value={updatedSteelVolume}
                onChange={(e) => this.setState({ updatedSteelVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedOtherVolume -TextInput"
                placeholder=""
                labelText="Vật liệu khác"
                value={updatedOtherVolume}
                onChange={(e) => this.setState({ updatedOtherVolume: e.target.value })}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title={`Có tất cả ${scrapList.length} vật tư phế liệu.`}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader style={{ width: '15%' }}>Mã vật tư</TableHeader>
                      <TableHeader style={{ width: '35%' }}>Tên vật tư</TableHeader>
                      <TableHeader style={{ width: '10%' }}>Khối lượng Đồng</TableHeader>
                      <TableHeader style={{ width: '10%' }}>Khối lượng Nhôm</TableHeader>
                      <TableHeader style={{ width: '10%' }}>Khối lượng Gang</TableHeader>
                      <TableHeader style={{ width: '10%' }}>Khối lượng Sắt</TableHeader>
                      <TableHeader style={{ width: '10%' }}>Vật liệu khác</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scrapList.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell>{row.material_id}</TableCell>
                        <TableCell>{row.material_name}</TableCell>
                        <TableCell>{row.copper_volume}</TableCell>
                        <TableCell>{row.aluminum_volume}</TableCell>
                        <TableCell>{row.cast_iron_volume}</TableCell>
                        <TableCell>{row.steel_volume}</TableCell>
                        <TableCell>{row.other_volume}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

Scrap.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Scrap);
