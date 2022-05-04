import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComposedModal,
  DataTable,
  Dropdown,
  InlineNotification,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
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
import { getVCFList, saveVCF } from '../../services';

const months = [
  { id: 0, label: 'Tháng một', translate: '01' },
  { id: 1, label: 'Tháng hai', translate: '02' },
  { id: 2, label: 'Tháng ba', translate: '03' },
  { id: 3, label: 'Tháng bốn', translate: '04' },
  { id: 4, label: 'Tháng năm', translate: '05' },
  { id: 5, label: 'Tháng sáu', translate: '06' },
  { id: 6, label: 'Tháng bẩy', translate: '07' },
  { id: 7, label: 'Tháng tám', translate: '08' },
  { id: 8, label: 'Tháng chín', translate: '09' },
  { id: 9, label: 'Tháng mười', translate: '10' },
  { id: 10, label: 'Tháng mười một', translate: '11' },
  { id: 11, label: 'Tháng mười hai', translate: '12' },
];

class VCFAdjust extends Component {
  constructor(props) {
    super(props);
    this.state = {
      month: -1,
      year: 2022,
      vcf: 1,
      vcfList: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    const getVCFListResult = await getVCFList(auth.companyID);
    setLoading(false);
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const month = currentMonth === 0 ? 11 : currentMonth - 1;
    const year = currentMonth === 0 ? currentYear - 1 : currentYear;
    const currentVCF = getVCFListResult.data.find(
      (e) => month === months.find((m) => e.vcf_key.split('-')[1] === m.translate).id && year === e.vcf_key.split('-')[0]
    );
    this.setState({
      month,
      year,
      vcf: currentVCF == null ? 1 : currentVCF.vcf,
      vcfList: getVCFListResult.data.map((e, index) => {
        e.id = index.toString();
        const [vcfYear, vcfMonth] = e.vcf_key.split('-');
        e.thang = months.find((item) => item.translate === vcfMonth).label;
        e.nam = vcfYear;
        e.year = vcfYear;
        e.month = months.find((item) => item.translate === vcfMonth).id;
        return e;
      }),
    });
  };

  saveVCF = async () => {
    const { setLoading, setErrorMessage, setSubmitResult, auth } = this.props;
    const { vcf, month, year } = this.state;
    setErrorMessage('');

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(vcf)) {
      setErrorMessage('VCF không hợp lệ');
      return;
    }
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    if (month >= currentMonth && year >= currentYear) {
      setErrorMessage('Không thể điều chỉnh VCF cho tương lai');
      return;
    }
    setLoading(true);
    const vcfKey = year
      .toString()
      .concat('-')
      .concat(months.find((e) => e.id === month).translate)
      .concat('-')
      .concat(auth.companyID);
    const getSaveVCFResult = await saveVCF(vcfKey, vcf, auth.companyID, auth.userID);
    setLoading(false);
    if (getSaveVCFResult.data !== 1) {
      setErrorMessage('Có lỗi khi lưu VCF. Vui lòng thử lại');
      return;
    }
    setSubmitResult('VCF đã được lưu thành công');
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { vcf, month, year, vcfList } = this.state;

    return (
      <div className="vcf-adjust">
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
          <h4>Điều chỉnh VCF</h4>
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
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="vcf-TextInput" labelText="VCF" value={vcf} onChange={(e) => this.setState({ vcf: e.target.value })} />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="month-Dropdown"
                titleText="Tháng"
                label=""
                items={months}
                selectedItem={month === -1 ? null : months.find((e) => e.id === month)}
                onChange={(e) => this.setState({ month: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <NumberInput
                id="tj-input"
                label="Năm"
                invalidText="Number is not valid"
                max={2100}
                min={2020}
                step={1}
                value={year}
                onChange={(e) => this.setState({ year: e.imaginaryTarget.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.saveVCF()} style={{ marginTop: '1rem' }}>
                Lưu thông tin
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <DataTable
                rows={vcfList}
                headers={[
                  { header: 'VCF', key: 'vcf' },
                  { header: 'Tháng', key: 'thang' },
                  { header: 'Năm', key: 'year' },
                ]}
                radio
                render={({ rows, headers, getSelectionProps, selectRow }) => (
                  <div>
                    <TableContainer title="Lịch sử thay đổi VCF">
                      <Table>
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
                                    vcf: row.cells[0].value,
                                    month: months.find((e) => e.label === row.cells[1].value).id,
                                    year: row.cells[2].value,
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
        </div>
      </div>
    );
  }
}

VCFAdjust.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(VCFAdjust);
