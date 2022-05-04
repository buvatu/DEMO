import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  Checkbox,
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
import { getTechSpec, getTechSpecStandards, getTechStandards, updateTechSpec } from '../../services';

class TechSpecUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      techSpecID: '',
      techSpecIDErrorMessage: '',
      techSpecName: '',
      techSpecNameErrorMessage: '',
      techStandardList: [],
      standardIDs: [],
      standards: [],
      selectedTechStandards: [],
      standardIDErrors: [],
      originalTechStandardList: [],
      originalTechSpecName: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, setErrorMessage, location } = this.props;
    const params = new URLSearchParams(location.search);
    if (params == null) {
      setErrorMessage('Không có mã thông số kĩ thuật!!!');
    } else {
      const techSpecID = params.get('techSpecID');
      setLoading(true);
      const getTechSpecInfoResult = await getTechSpec(techSpecID);
      setLoading(false);
      if (getTechSpecInfoResult.data === 'null') {
        setErrorMessage('Mã thông số kĩ thuật không tồn tại!!!');
        return;
      }
      setLoading(true);
      const getSpecStandardsResult = await getTechSpecStandards(techSpecID);
      setLoading(false);

      setLoading(true);
      const getTechStandardsResult = await getTechStandards();
      setLoading(false);

      this.setState({
        standardIDs: getTechStandardsResult.data.map((e) => {
          return { id: e.standard_id, label: e.standard_id };
        }),
        standards: getTechStandardsResult.data.map((e) => {
          return { id: e.standard_id, standardName: e.standard_name, unit: e.unit };
        }),
        techSpecID: getTechSpecInfoResult.data.spec_id,
        techSpecName: getTechSpecInfoResult.data.spec_name,
        techStandardList: getSpecStandardsResult.data.map((e) => {
          return { standardID: e.standard_id, standardName: e.standard_name, techStandardValue: e.value, unit: e.unit };
        }),
        originalTechStandardList: getSpecStandardsResult.data.map((e) => {
          return { standardID: e.standard_id, standardName: e.standard_name, techStandardValue: e.value, unit: e.unit };
        }),
        originalTechSpecName: getTechSpecInfoResult.data.spec_name,
      });
    }
  };

  save = async () => {
    const { techSpecID, techSpecName, techStandardList, standardIDErrors, originalTechStandardList, originalTechSpecName } = this.state;
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    this.setState({
      techSpecIDErrorMessage: '',
      techSpecNameErrorMessage: '',
      standardIDErrors: Array(techStandardList.length).fill(false, 0, techStandardList.length),
    });
    setErrorMessage('');

    let hasError = false;
    techStandardList.forEach((e, index) => {
      if (e.standardID === '') {
        standardIDErrors[index] = true;
      }
    });
    if (techStandardList.length === 0) {
      hasError = true;
      setErrorMessage('Mỗi thông số kĩ thuật cần ít nhất 1 tiêu chuẩn kĩ thuật');
    }
    this.setState({ standardIDErrors });
    if (JSON.stringify(originalTechStandardList) === JSON.stringify(techStandardList) && originalTechSpecName === techSpecName) {
      setErrorMessage('Bạn chưa thay đổi gì cả');
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    const getUpdateTechStandardsResult = await updateTechSpec(techSpecID, techSpecName, techStandardList, auth.userID);
    setLoading(false);
    if (getUpdateTechStandardsResult.data === 1) {
      setSubmitResult('Thông số kĩ thuật được cập nhật thành công!');
    } else {
      setErrorMessage('Có lỗi khi cập nhật thông số kĩ thuật.');
    }
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      techSpecID,
      techSpecIDErrorMessage,
      techSpecName,
      techSpecNameErrorMessage,
      techStandardList,
      standardIDs,
      standards,
      selectedTechStandards,
      standardIDErrors,
    } = this.state;

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
                id="techSpecID-TextInput"
                labelText="Mã thông số kĩ thuật"
                value={techSpecID}
                disabled
                onChange={(e) => this.setState({ techSpecID: e.target.value })}
                invalid={techSpecIDErrorMessage !== ''}
                invalidText={techSpecIDErrorMessage}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="techSpecName-TextInput"
                placeholder="Vui lòng nhập tên thông số kĩ thuật"
                labelText="Tên thông số kĩ thuật"
                value={techSpecName}
                onChange={(e) => this.setState({ techSpecName: e.target.value })}
                invalid={techSpecNameErrorMessage !== ''}
                invalidText={techSpecNameErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  techStandardList.push({
                    standardID: '',
                    standardName: '',
                    standardValue: '',
                  });
                  standardIDErrors.push(false);
                  this.setState({ techStandardList, standardIDErrors });
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
                    techStandardList: techStandardList.filter((e, index) => !selectedTechStandards.includes(index)),
                    standardIDErrors: standardIDErrors.filter((e, index) => !selectedTechStandards.includes(index)),
                    selectedTechStandards: [],
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
                      <TableHeader key="techSpecValue">Giá trị thực tế</TableHeader>
                      <TableHeader key="techSpecUnit">Đơn vị</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {techStandardList.map((row, index) => (
                      <TableRow key={index.toString()}>
                        <TableCell>
                          <Checkbox
                            id={`techStandards-checkbox-${index}`}
                            labelText=""
                            value={index}
                            checked={selectedTechStandards.includes(index)}
                            onChange={(target) => {
                              if (target) {
                                selectedTechStandards.push(index);
                                this.setState({ selectedTechStandards });
                              } else {
                                this.setState({ selectedTechStandards: selectedTechStandards.filter((e) => e !== index) });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                        <TableCell key={`techStandardID-${index.toString()}`}>
                          <Dropdown
                            id={`standardID-Dropdown-${index}`}
                            titleText=""
                            label=""
                            items={standardIDs}
                            selectedItem={techStandardList[index].standardID === '' ? null : standardIDs.find((e) => e.id === techStandardList[index].standardID)}
                            onChange={(e) => {
                              techStandardList[index].standardID = e.selectedItem.id;
                              techStandardList[index].standardName = standards.find((item) => item.id === e.selectedItem.id).standardName;
                              techStandardList[index].unit = standards.find((item) => item.id === e.selectedItem.id).unit;
                              standardIDErrors[index] = false;
                              this.setState({
                                techStandardList,
                                standardIDErrors,
                              });
                            }}
                            invalid={standardIDErrors[index]}
                            invalidText="Mã tiêu chuẩn không được bỏ trống"
                          />
                        </TableCell>
                        <TableCell key={`techStandardName-${index.toString()}`}>{techStandardList[index].standardName}</TableCell>
                        <TableCell key={`techStandardValue-${index.toString()}`}>
                          <TextInput
                            id={`techStandardValue-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              techStandardList[index].techStandardValue = e.target.value;
                              this.setState({ techStandardList });
                            }}
                            value={techStandardList[index].techStandardValue}
                          />
                        </TableCell>
                        <TableCell key={`techStandardUnit-${index.toString()}`}>{techStandardList[index].unit}</TableCell>
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
