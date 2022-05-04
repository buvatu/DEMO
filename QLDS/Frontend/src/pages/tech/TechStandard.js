import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComposedModal,
  DataTable,
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
  TableSelectRow,
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
      techStandardList: [],
      newStandardID: '',
      newStandardIDErrorMessage: '',
      newStandardName: '',
      newStandardNameErrorMessage: '',
      newStandardUnit: '',
      newStandardUnitErrorMessage: '',
      newMinValue: '',
      newMaxValue: '',
      newStandardValue: '',
      updatedStandardID: '',
      updatedStandardName: '',
      updatedStandardNameErrorMessage: '',
      updatedStandardUnit: '',
      updatedStandardUnitErrorMessage: '',
      updatedMinValue: '',
      updatedMaxValue: '',
      updatedStandardValue: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getTechStandardsResult = await getTechStandards();
    setLoading(false);
    this.setState({
      techStandardList: getTechStandardsResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    setSubmitResult('');
    setLoading(true);
    const getTechStandardsResult = await getTechStandards();
    setLoading(false);
    this.setState({
      techStandardList: getTechStandardsResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
      newStandardID: '',
      newStandardIDErrorMessage: '',
      newStandardName: '',
      newStandardNameErrorMessage: '',
      newStandardUnit: '',
      newStandardUnitErrorMessage: '',
      newMinValue: '',
      newMaxValue: '',
      newStandardValue: '',
      updatedStandardID: '',
      updatedStandardName: '',
      updatedStandardNameErrorMessage: '',
      updatedStandardUnit: '',
      updatedStandardUnitErrorMessage: '',
      updatedMinValue: '',
      updatedMaxValue: '',
      updatedStandardValue: '',
    });
  };

  addNewStandard = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const { techStandardList, newStandardID, newStandardName, newStandardUnit, newMinValue, newMaxValue, newStandardValue } = this.state;
    let hasError = false;
    if (newStandardID.trim() === '') {
      this.setState({ newStandardIDErrorMessage: 'Mã tiêu chuẩn không được bỏ trống' });
      hasError = true;
    }
    if (
      techStandardList
        .map((e) => {
          return e.standard_id;
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
      techStandardList
        .map((e) => {
          return e.Standard_name;
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
    const getAddStandardResult = await insertTechStandard(
      newStandardID,
      newStandardName,
      newStandardUnit,
      newMinValue,
      newMaxValue,
      newStandardValue,
      auth.userID
    );
    setLoading(false);
    if (getAddStandardResult.data === 1) {
      setSubmitResult('Tiêu chuẩn mới được thêm thành công!');
    } else {
      setErrorMessage('Tiêu chuẩn mới đã tồn tại. Vui lòng kiểm tra lại.');
    }
  };

  updateStandard = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const { techStandardList, updatedStandardID, updatedStandardName, updatedStandardUnit, updatedMinValue, updatedMaxValue, updatedStandardValue } = this.state;
    let hasError = false;
    if (updatedStandardName.trim() === '') {
      this.setState({ updatedStandardNameErrorMessage: 'Tên tiêu chuẩn không được bỏ trống' });
      hasError = true;
    }
    if (
      techStandardList
        .map((e) => {
          return e.standard_id === updatedStandardID ? '' : e.standard_name;
        })
        .includes(updatedStandardName.trim())
    ) {
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
    const getUpdatStandardResult = await updateTechStandard(
      updatedStandardID,
      updatedStandardName,
      updatedStandardUnit,
      updatedMinValue,
      updatedMaxValue,
      updatedStandardValue,
      auth.userID
    );
    setLoading(false);
    if (getUpdatStandardResult.data === 1) {
      setSubmitResult('Tiêu chuẩn được cập nhật thành công!');
    } else {
      setErrorMessage('Tiêu chuẩn mới đã tồn tại. Vui lòng kiểm tra lại.');
    }
  };

  render() {
    // Props first
    const { setErrorMessage, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      techStandardList,
      newStandardID,
      newStandardIDErrorMessage,
      newStandardName,
      newStandardNameErrorMessage,
      newStandardUnit,
      newStandardUnitErrorMessage,
      newMinValue,
      newMaxValue,
      newStandardValue,
      updatedStandardID,
      updatedStandardName,
      updatedStandardNameErrorMessage,
      updatedStandardUnit,
      updatedStandardUnitErrorMessage,
      updatedMinValue,
      updatedMaxValue,
      updatedStandardValue,
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
                id="newStandardValue-TextInput"
                placeholder=""
                labelText="Giá trị mặc định"
                value={newStandardValue}
                onChange={(e) => this.setState({ newStandardValue: e.target.value })}
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
              <TextInput
                id="updatedStandardName-TextInput"
                placeholder="Vui lòng tên tiêu chuẩn kĩ thuật"
                labelText="Tên tiêu chuẩn kĩ thuật"
                value={updatedStandardName}
                onChange={(e) => this.setState({ updatedStandardName: e.target.value })}
                invalid={updatedStandardNameErrorMessage !== ''}
                invalidText={updatedStandardNameErrorMessage}
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
                id="updatedStandardID-TextInput"
                placeholder=""
                labelText="Mã tiêu chuẩn"
                value={updatedStandardID}
                disabled
                onChange={(e) => this.setState({ updatedStandardID: e.target.value })}
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
                id="updatedStandardValue-TextInput"
                placeholder=""
                labelText="Giá trị mặc định"
                value={updatedStandardValue}
                onChange={(e) => this.setState({ updatedStandardValue: e.target.value })}
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
              <DataTable
                rows={techStandardList}
                headers={[
                  { header: 'Mã tiêu chuẩn', key: 'standard_id' },
                  { header: 'Tên tiêu chuẩn', key: 'standard_name' },
                  { header: 'Đơn vị', key: 'unit' },
                  { header: 'Giá trị nhỏ nhất', key: 'min_value' },
                  { header: 'Giá trị lớn nhất', key: 'max_value' },
                  { header: 'Giá trị mặc định', key: 'default_value' },
                ]}
                radio
                render={({ rows, headers, getSelectionProps, selectRow }) => (
                  <div>
                    <TableContainer title={`Có tất cả ${techStandardList.length} tiêu chuẩn.`}>
                      <Table style={{ maxHeigh: '50vh', overFlowY: 'auto' }}>
                        <TableHead>
                          <TableRow>
                            <TableHeader />
                            {headers.map((header) => (
                              <TableHeader key={header.key}>{header.header}</TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id}>
                              <TableSelectRow
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...getSelectionProps({ row })}
                                onSelect={() => {
                                  selectRow(row.id);
                                  this.setState({
                                    updatedStandardID: row.cells[0].value,
                                    updatedStandardName: row.cells[1].value,
                                    updatedStandardUnit: row.cells[2].value,
                                    updatedMinValue: row.cells[3].value,
                                    updatedMaxValue: row.cells[4].value,
                                    updatedStandardValue: row.cells[5].value,
                                  });
                                }}
                              />
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id}>{cell.value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                )}
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

export default connect(mapStateToProps, mapDispatchToProps)(TechStandard);
