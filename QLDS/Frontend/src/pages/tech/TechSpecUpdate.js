import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  Checkbox,
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
import { getStandardList, getTechSpec, updateTechSpec } from '../../services';

class TechSpecUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '', // id of spec
      specID: '',
      specName: '',
      specNameErrorMessage: '',

      specStandardList: [],
      selectedSpecStandardList: [],

      standardList: [],
      standardIDErrors: [],

      originalSpecStandardList: [],
      allSpecStandardList: [],
      originalSpecName: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, setErrorMessage, location } = this.props;
    const params = new URLSearchParams(location.search);
    if (params == null) {
      setErrorMessage('Không có mã thông số kĩ thuật!!!');
      return;
    }
    setLoading(true);
    try {
      const specID = params.get('specID');
      const getTechSpecResult = await getTechSpec(specID);
      const getStandardListResult = await getStandardList();
      this.setState({
        id: getTechSpecResult.data.spec.id,
        specID: getTechSpecResult.data.spec.specID,
        specName: getTechSpecResult.data.spec.specName,
        originalSpecName: getTechSpecResult.data.spec.specName,

        specStandardList: getTechSpecResult.data.specStandardList.filter((e) => e.status === 'A'),
        originalSpecStandardList: getTechSpecResult.data.specStandardList.filter((e) => e.status === 'A'),
        allSpecStandardList: getTechSpecResult.data.specStandardList,

        standardList: getStandardListResult.data,
      });
    } catch {
      setErrorMessage('Mã thông số kĩ thuật không tồn tại!!!');
    }
    setLoading(false);
  };

  save = async () => {
    const {
      id,
      specID,
      specName,

      specStandardList,

      standardIDErrors,
      originalSpecStandardList,
      originalSpecName,
    } = this.state;
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    this.setState({
      specNameErrorMessage: '',
      standardIDErrors: Array(specStandardList.length).fill(false, 0, specStandardList.length),
    });
    setErrorMessage('');

    let hasError = false;
    specStandardList.forEach((e, index) => {
      if (e.standardID === '') {
        hasError = true;
        standardIDErrors[index] = true;
      }
    });
    if (specStandardList.length === 0) {
      hasError = true;
      setErrorMessage('Mỗi thông số kĩ thuật cần ít nhất 1 tiêu chuẩn kĩ thuật');
    }
    this.setState({ standardIDErrors });
    if (JSON.stringify(originalSpecStandardList) === JSON.stringify(specStandardList) && originalSpecName === specName) {
      setErrorMessage('Bạn chưa thay đổi gì cả');
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    try {
      await updateTechSpec({
        spec: { id, specID, specName },
        specStandardList: specStandardList.map((e) => {
          e.specID = specID;
          return e;
        }),
      });
      setSubmitResult('Thông số kĩ thuật được cập nhật thành công!');
    } catch {
      setErrorMessage('Có lỗi khi cập nhật thông số kĩ thuật. Vui lòng thử lại sau');
    }
    setLoading(false);
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      specID,
      specName,
      specNameErrorMessage,

      specStandardList,
      selectedSpecStandardList,

      standardList,
      standardIDErrors,

      allSpecStandardList,
    } = this.state;

    const standardIDList = standardList.map((e) => {
      return { id: e.standardID, label: e.standardID.concat(' - ').concat(e.standardName) };
    });

    return (
      <div className="spec-add">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal
          className="btn-success"
          open={submitResult !== ''}
          size="sm"
          onClose={() => {
            setSubmitResult('');
            history.push('/tech/spec/list');
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
              history.push('/tech/spec/list');
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
          <h4>Cập nhật thông số kĩ thuật</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="specID-TextInput"
                labelText="Mã thông số kĩ thuật"
                value={specID}
                disabled
                onChange={(e) => this.setState({ specID: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="specName-TextInput"
                placeholder="Vui lòng nhập tên thông số kĩ thuật"
                labelText="Tên thông số kĩ thuật"
                value={specName}
                onChange={(e) => this.setState({ specName: e.target.value })}
                invalid={specNameErrorMessage !== ''}
                invalidText={specNameErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  specStandardList.push({
                    standardID: '',
                    standardName: '',
                    unit: '',
                    value: '',
                    minValue: '',
                    maxValue: '',
                    defaultValue: '',
                    status: 'A',
                  });
                  standardIDErrors.push(false);
                  this.setState({ specStandardList, standardIDErrors });
                }}
                style={{ marginTop: '1rem' }}
              >
                Thêm tiêu chuẩn mới
              </Button>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  this.setState({
                    specStandardList: specStandardList.filter((e, index) => !selectedSpecStandardList.includes(index)),
                    standardIDErrors: standardIDErrors.filter((e, index) => !selectedSpecStandardList.includes(index)),
                    selectedSpecStandardList: [],
                  });
                }}
                style={{ marginTop: '1rem' }}
              >
                Xoá tiêu chuẩn
              </Button>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.save()} style={{ marginTop: '1rem' }}>
                Lưu thông tin
              </Button>
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
              <TableContainer title="Danh mục tiêu chuẩn kĩ thuật">
                <Table style={{ maxHeight: '75vh' }}>
                  <TableHead>
                    <TableRow>
                      <TableHeader />
                      <TableHeader key="stt">STT</TableHeader>
                      <TableHeader key="techStandardID">Mã tiêu chuẩn kĩ thuật</TableHeader>
                      <TableHeader key="techStandardName">Tên tiêu chuẩn kĩ thuật</TableHeader>
                      <TableHeader key="specUnit">Đơn vị</TableHeader>
                      <TableHeader key="specValue">Giá trị thực tế</TableHeader>
                      <TableHeader key="minValue">Giá trị nhỏ nhất</TableHeader>
                      <TableHeader key="maxValue">Giá trị lớn nhất</TableHeader>
                      <TableHeader key="defaultValue">Giá trị mặc định</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {specStandardList.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell>
                          <Checkbox
                            id={`standard-Checkbox-${index}`}
                            labelText=""
                            value={index}
                            checked={selectedSpecStandardList.includes(index)}
                            onChange={(target) => {
                              if (target) {
                                selectedSpecStandardList.push(index);
                                this.setState({ selectedSpecStandardList });
                              } else {
                                this.setState({ selectedSpecStandardList: selectedSpecStandardList.filter((e) => e !== index) });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                        <TableCell key={`standardID-${index.toString()}`}>
                          <ComboBox
                            id={`standardID-ComboBox-${index}`}
                            titleText=""
                            label=""
                            items={standardIDList}
                            shouldFilterItem={({ item, inputValue }) => {
                              if (!inputValue) return true;
                              return item.label.toLowerCase().includes(inputValue.toLowerCase());
                            }}
                            selectedItem={
                              specStandardList[index].standardID === '' ? null : standardIDList.find((e) => e.id === specStandardList[index].standardID)
                            }
                            onChange={(e) => {
                              if (e.selectedItem == null) {
                                specStandardList[index].standardID = '';
                                specStandardList[index].standardName = '';
                                specStandardList[index].unit = '';
                                specStandardList[index].value = '';
                                specStandardList[index].minValue = '';
                                specStandardList[index].maxValue = '';
                                specStandardList[index].defaultValue = '';
                                standardIDErrors[index] = false;
                                this.setState({
                                  specStandardList,
                                  standardIDErrors,
                                });
                                return;
                              }
                              const selectedStandard = standardList.find((standard) => standard.standardID === e.selectedItem.id);
                              const existedSpecStandard = allSpecStandardList.find(
                                (specStandard) => specStandard.specID === specID && specStandard.standardID === selectedStandard.standardID
                              );
                              specStandardList[index].id = existedSpecStandard === undefined ? '' : existedSpecStandard.id;
                              specStandardList[index].standardID = selectedStandard.standardID;
                              specStandardList[index].standardName = selectedStandard.standardName;
                              specStandardList[index].unit = selectedStandard.unit;
                              specStandardList[index].value = existedSpecStandard === undefined ? '' : existedSpecStandard.value;
                              specStandardList[index].minValue = selectedStandard.minValue;
                              specStandardList[index].maxValue = selectedStandard.maxValue;
                              specStandardList[index].defaultValue = selectedStandard.defaultValue;
                              standardIDErrors[index] = false;
                              this.setState({
                                specStandardList,
                                standardIDErrors,
                              });
                            }}
                            invalid={standardIDErrors[index]}
                            invalidText="Mã tiêu chuẩn không được bỏ trống"
                          />
                        </TableCell>
                        <TableCell key={`standardName-${index.toString()}`}>{specStandardList[index].standardName}</TableCell>
                        <TableCell key={`unit-${index.toString()}`}>{specStandardList[index].unit}</TableCell>
                        <TableCell key={`standardValue-${index.toString()}`}>
                          <TextInput
                            id={`specStandardValue-TextInput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              specStandardList[index].value = e.target.value;
                              this.setState({ specStandardList });
                            }}
                            value={specStandardList[index].value}
                          />
                        </TableCell>
                        <TableCell key={`minValue-${index.toString()}`}>{specStandardList[index].minValue}</TableCell>
                        <TableCell key={`maxValue-${index.toString()}`}>{specStandardList[index].maxValue}</TableCell>
                        <TableCell key={`defaultValue-${index.toString()}`}>{specStandardList[index].defaultValue}</TableCell>
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

TechSpecUpdate.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(TechSpecUpdate);
