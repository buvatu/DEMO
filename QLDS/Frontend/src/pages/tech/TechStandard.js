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
import { getTechStandards, insertTechStandard, updateTechStandard } from '../../services';

class TechStandard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      standardList: [],
      standardListDisplay: [],
      newStandardID: '',
      newStandardIDErrorMessage: '',
      newStandardName: '',
      newStandardNameErrorMessage: '',
      newStandardUnit: '',
      newStandardUnitErrorMessage: '',
      newMinValue: '',
      newMaxValue: '',
      newDefaultValue: '',
      id: '',
      updatedStandardID: '',
      updatedStandardName: '',
      updatedStandardNameErrorMessage: '',
      updatedStandardUnit: '',
      updatedStandardUnitErrorMessage: '',
      updatedMinValue: '',
      updatedMaxValue: '',
      updatedDefaultValue: '',
      page: 1,
      pageSize: 10,
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getTechStandardsResult = await getTechStandards();
    setLoading(false);
    const { pageSize } = this.state;
    this.setState({
      standardList: getTechStandardsResult.data,
      standardListDisplay: getTechStandardsResult.data.slice(0, pageSize),
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    setSubmitResult('');
    setLoading(true);
    const getTechStandardsResult = await getTechStandards();
    setLoading(false);
    const { pageSize } = this.state;
    this.setState({
      standardList: getTechStandardsResult.data,
      standardListDisplay: getTechStandardsResult.data.slice(0, pageSize),
      newStandardID: '',
      newStandardIDErrorMessage: '',
      newStandardName: '',
      newStandardNameErrorMessage: '',
      newStandardUnit: '',
      newStandardUnitErrorMessage: '',
      newMinValue: '',
      newMaxValue: '',
      newDefaultValue: '',
      updatedStandardID: '',
      updatedStandardName: '',
      updatedStandardNameErrorMessage: '',
      updatedStandardUnit: '',
      updatedStandardUnitErrorMessage: '',
      updatedMinValue: '',
      updatedMaxValue: '',
      updatedDefaultValue: '',
    });
  };

  addNewStandard = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { standardList, newStandardID, newStandardName, newStandardUnit, newMinValue, newMaxValue, newDefaultValue } = this.state;
    let hasError = false;
    if (newStandardID.trim() === '') {
      this.setState({ newStandardIDErrorMessage: 'Mã tiêu chuẩn không được bỏ trống' });
      hasError = true;
    }
    if (
      standardList
        .map((e) => {
          return e.standardID;
        })
        .includes(newStandardID.trim())
    ) {
      this.setState({ newStandardIDErrorMessage: 'Mã tiêu chuẩn đã tồn tại' });
      hasError = true;
    }
    if (newStandardName.trim() === '') {
      this.setState({ newStandardNameErrorMessage: 'Tên tiêu chuẩn không được bỏ trống' });
      hasError = true;
    }
    if (
      standardList
        .map((e) => {
          return e.standardName;
        })
        .includes(newStandardName.trim())
    ) {
      this.setState({ newStandardNameErrorMessage: 'Tên tiêu chuẩn đã tồn tại' });
      hasError = true;
    }
    if (newStandardUnit.trim() === '') {
      this.setState({ newStandardUnitErrorMessage: 'Đơn vị không được bỏ trống' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      await insertTechStandard({
        standardID: newStandardID,
        standardName: newStandardName,
        unit: newStandardUnit,
        minValue: newMinValue,
        maxValue: newMaxValue,
        defaultValue: newDefaultValue,
      });
      setSubmitResult('Tiêu chuẩn mới được thêm thành công!');
    } catch {
      setErrorMessage('Tiêu chuẩn mới đã tồn tại. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  updateStandard = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { id, standardList, updatedStandardID, updatedStandardName, updatedStandardUnit, updatedMinValue, updatedMaxValue, updatedDefaultValue } = this.state;
    let hasError = false;
    if (updatedStandardName.trim() === '') {
      this.setState({ updatedStandardNameErrorMessage: 'Tên tiêu chuẩn không được bỏ trống' });
      hasError = true;
    }
    if (standardList.find((e) => e.standardName === updatedStandardID) !== undefined) {
      this.setState({ updatedStandardNameErrorMessage: 'Tên tiêu chuẩn đã tồn tại' });
      hasError = true;
    }
    if (updatedStandardUnit.trim() === '') {
      this.setState({ updatedStandardUnitErrorMessage: 'Đơn vị không được bỏ trống' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      await updateTechStandard({
        id,
        standardID: updatedStandardID,
        standardName: updatedStandardName,
        unit: updatedStandardUnit,
        minValue: updatedMinValue,
        maxValue: updatedMaxValue,
        defaultValue: updatedDefaultValue,
      });
      setSubmitResult('Tiêu chuẩn được cập nhật thành công!');
    } catch {
      setErrorMessage('Tiêu chuẩn mới đã tồn tại. Vui lòng kiểm tra lại.');
    }
    setLoading(false);
  };

  render() {
    // Props first
    const { setErrorMessage, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      standardList,
      newStandardID,
      newStandardIDErrorMessage,
      newStandardName,
      newStandardNameErrorMessage,
      newStandardUnit,
      newStandardUnitErrorMessage,
      newMinValue,
      newMaxValue,
      newDefaultValue,
      updatedStandardID,
      updatedStandardName,
      updatedStandardNameErrorMessage,
      updatedStandardUnit,
      updatedStandardUnitErrorMessage,
      updatedMinValue,
      updatedMaxValue,
      updatedDefaultValue,

      standardListDisplay,
      page,
      pageSize,
    } = this.state;

    return (
      <div className="tech-standard">
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
          <h4>Danh sách tiêu chuẩn kĩ thuật</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-5">
              <TextInput
                id="newStandardName-TextInput"
                placeholder="Vui lòng tên tiêu chuẩn kĩ thuật"
                labelText="Tên tiêu chuẩn kĩ thuật"
                value={newStandardName}
                onChange={(e) => this.setState({ newStandardName: e.target.value })}
                invalid={newStandardNameErrorMessage !== ''}
                invalidText={newStandardNameErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newStandardUnit-TextInput"
                placeholder=""
                labelText="Đơn vị đo"
                value={newStandardUnit}
                onChange={(e) => this.setState({ newStandardUnit: e.target.value })}
                invalid={newStandardUnitErrorMessage !== ''}
                invalidText={newStandardUnitErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newStandardID-TextInput"
                placeholder=""
                helperText="Ví dụ: TCKT_000001"
                labelText="Mã tiêu chuẩn"
                value={newStandardID}
                onChange={(e) => this.setState({ newStandardID: e.target.value })}
                invalid={newStandardIDErrorMessage !== ''}
                invalidText={newStandardIDErrorMessage}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newMinValue-TextInput"
                placeholder=""
                labelText="Giá trị nhỏ nhất"
                value={newMinValue}
                onChange={(e) => this.setState({ newMinValue: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newMaxValue-TextInput"
                placeholder=""
                labelText="Giá trị lớn nhất"
                value={newMaxValue}
                onChange={(e) => this.setState({ newMaxValue: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newDefaultValue-TextInput"
                placeholder=""
                labelText="Giá trị mặc định"
                value={newDefaultValue}
                onChange={(e) => this.setState({ newDefaultValue: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.addNewStandard()} style={{ marginTop: '1rem' }}>
                Thêm
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-5">
              <ComboBox
                id="updatedStandardName-ComboBox"
                titleText="Tiêu chuẩn kĩ thuật"
                placeholder=""
                label=""
                items={standardList.map((e) => {
                  return {
                    id: e.standardID,
                    label: e.standardID.concat(' - ').concat(e.standardName),
                  };
                })}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                selectedItem={
                  updatedStandardID === ''
                    ? null
                    : standardList
                        .map((e) => {
                          return {
                            id: e.standardID,
                            label: e.standardID.concat(' - ').concat(e.standardName),
                          };
                        })
                        .find((e) => e.id === updatedStandardID)
                }
                onChange={(e) => {
                  if (e.selectedItem == null) {
                    this.setState({
                      id: '',
                      updatedStandardID: '',
                      updatedStandardName: '',
                      updatedStandardUnit: '',
                      updatedMinValue: '',
                      updatedMaxValue: '',
                      updatedDefaultValue: '',
                    });
                  } else {
                    const selectedStandard = standardList.find((item) => item.standardID === e.selectedItem.id);
                    this.setState({
                      id: selectedStandard.id,
                      updatedStandardID: selectedStandard.standardID,
                      updatedStandardName: selectedStandard.standardName,
                      updatedStandardUnit: selectedStandard.unit,
                      updatedMinValue: selectedStandard.minValue,
                      updatedMaxValue: selectedStandard.maxValue,
                      updatedDefaultValue: selectedStandard.defaultValue,
                    });
                  }
                }}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedStandardUnit-TextInput"
                placeholder=""
                labelText="Đơn vị đo"
                value={updatedStandardUnit}
                onChange={(e) => this.setState({ updatedStandardUnit: e.target.value })}
                invalid={updatedStandardUnitErrorMessage !== ''}
                invalidText={updatedStandardUnitErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedStandardName-TextInput"
                placeholder=""
                labelText="Tên tiêu chuẩn"
                value={updatedStandardName}
                onChange={(e) => this.setState({ updatedStandardName: e.target.value })}
                invalid={updatedStandardNameErrorMessage !== ''}
                invalidText={updatedStandardNameErrorMessage}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedMinValue-TextInput"
                placeholder=""
                labelText="Giá trị nhỏ nhất"
                value={updatedMinValue}
                onChange={(e) => this.setState({ updatedMinValue: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedMaxValue-TextInput"
                placeholder=""
                labelText="Giá trị lớn nhất"
                value={updatedMaxValue}
                onChange={(e) => this.setState({ updatedMaxValue: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedDefaultValue-TextInput"
                placeholder=""
                labelText="Giá trị mặc định"
                value={updatedDefaultValue}
                onChange={(e) => this.setState({ updatedDefaultValue: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.updateStandard()} style={{ marginTop: '1rem' }}>
                Cập nhật
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title={`Có tất cả ${standardList.length} tiêu chuẩn.`}>
                <Table style={{ maxHeigh: '50vh', overFlowY: 'auto' }}>
                  <TableHead>
                    <TableRow>
                      <TableHeader key="standardID">Mã tiêu chuẩn</TableHeader>
                      <TableHeader key="standardName">Tên tiêu chuẩn</TableHeader>
                      <TableHeader key="unit">Đơn vị</TableHeader>
                      <TableHeader key="minValue">Giá trị nhỏ nhất</TableHeader>
                      <TableHeader key="maxValue">Giá trị lớn nhất</TableHeader>
                      <TableHeader key="defaultValue">Giá trị mặc định</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {standardListDisplay.map((standard, index) => (
                      <TableRow key={standard.id}>
                        <TableCell key={`standardID-cell-${index.toString()}`}>{standard.standardID}</TableCell>
                        <TableCell key={`standardName-cell-${index.toString()}`}>{standard.standardName}</TableCell>
                        <TableCell key={`unit-cell-${index.toString()}`}>{standard.unit}</TableCell>
                        <TableCell key={`minValue-cell-${index.toString()}`}>{standard.minValue}</TableCell>
                        <TableCell key={`maxValue-cell-${index.toString()}`}>{standard.maxValue}</TableCell>
                        <TableCell key={`defaultValue-cell-${index.toString()}`}>{standard.defaultValue}</TableCell>
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
                totalItems={standardList.length}
                onChange={(target) => {
                  this.setState({
                    standardListDisplay: standardList.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                    page: target.page,
                    pageSize: target.pageSize,
                  });
                }}
              />
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

TechStandard.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(TechStandard);
