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
import { getTechSpecs, getTechStandards } from '../../services';

class specAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      specID: '',
      specIDErrorMessage: '',
      specName: '',
      specNameErrorMessage: '',
      specStandardList: [],
      standards: [],
      selectedSpecStandards: [],
      standardIDErrors: [],
      specList: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getTechStandardsResult = await getTechStandards();
    const getSpecListResult = await getTechSpecs();
    setLoading(false);
    this.setState({
      standardIDs: getTechStandardsResult.data.map((e) => {
        return { id: e.standardID, label: e.standardID.concat(' - ').concat(e.standardName) };
      }),
      standards: getTechStandardsResult.data,
      specList: getSpecListResult.data,
    });
  };

  save = async () => {
    const { specID, specName, specStandardList, standardIDErrors, specList } = this.state;
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    this.setState({
      specIDErrorMessage: '',
      specNameErrorMessage: '',
      standardIDErrors: Array(specStandardList.length).fill(false, 0, specStandardList.length),
    });
    setErrorMessage('');

    let hasError = false;
    if (specID.trim() === '') {
      hasError = true;
      this.setState({ specIDErrorMessage: 'Mã thông số kĩ thuật không thể bỏ trống' });
    }
    if (specList.find((e) => e.specID === specID) !== undefined) {
      hasError = true;
      this.setState({ specIDErrorMessage: 'Mã thông số kĩ thuật đã tồn tại' });
    }
    if (specName.trim() === '') {
      hasError = true;
      this.setState({ specNameErrorMessage: 'Tên thông số kĩ thuật không thể bỏ trống' });
    }
    specStandardList.forEach((e, index) => {
      if (e.standardID === '') {
        standardIDErrors[index] = true;
      }
    });
    this.setState({ standardIDErrors });
    if (specStandardList.length === 0) {
      hasError = true;
      setErrorMessage('Mỗi thông số kĩ thuật cần ít nhất 1 tiêu chuẩn kĩ thuật');
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    const getInsertTechStandardsResult = await insertspec(specID, specName, specStandardList, auth.userID);
    setLoading(false);
    if (getInsertTechStandardsResult.data === 1) {
      setSubmitResult('Thông số kĩ thuật được thêm thành công!');
    } else {
      setErrorMessage('Có lỗi khi thêm thông số kĩ thuật.');
    }
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { specID, specIDErrorMessage, specName, specNameErrorMessage, specStandardList, standardIDs, standards, selectedTechStandards, standardIDErrors } =
      this.state;

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
          <h4>Thêm thông số kĩ thuật mới</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="specID-TextInput"
                placeholder="Vui lòng nhập mã thông số kĩ thuật"
                helperText="Ví dụ: TSKT_000001"
                labelText="Mã thông số kĩ thuật"
                value={specID}
                onChange={(e) => this.setState({ specID: e.target.value })}
                invalid={specIDErrorMessage !== ''}
                invalidText={specIDErrorMessage}
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
                    techStandardValue: '',
                    unit: '',
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
                    specStandardList: specStandardList.filter((e, index) => !selectedTechStandards.includes(index)),
                    standardIDErrors: standardIDErrors.filter((e, index) => !selectedTechStandards.includes(index)),
                    selectedSpecStandards: [],
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
                      <TableHeader key="specValue">Giá trị thực tế</TableHeader>
                      <TableHeader key="specUnit">Đơn vị</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {specStandardList.map((row, index) => (
                      <TableRow key={row.id}>
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
                            selectedItem={specStandardList[index].standardID === '' ? null : standardIDs.find((e) => e.id === specStandardList[index].standardID)}
                            onChange={(e) => {
                              specStandardList[index].standardID = e.selectedItem.id;
                              specStandardList[index].standardName = standards.find((item) => item.id === e.selectedItem.id).standardName;
                              specStandardList[index].unit = standards.find((item) => item.id === e.selectedItem.id).unit;
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
                        <TableCell key={`techStandardName-${index.toString()}`}>{specStandardList[index].standardName}</TableCell>
                        <TableCell key={`techStandardValue-${index.toString()}`}>
                          <TextInput
                            id={`techStandardValue-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              specStandardList[index].techStandardValue = e.target.value;
                              this.setState({ specStandardList });
                            }}
                            value={specStandardList[index].techStandardValue}
                          />
                        </TableCell>
                        <TableCell key={`techStandardUnit-${index.toString()}`}>{specStandardList[index].unit}</TableCell>
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

specAdd.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(specAdd);
