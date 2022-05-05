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
  OverflowMenu,
  OverflowMenuItem,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { getTechSpecs } from '../../services';

class TechSpecList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      techSpecList: [],
      techSpecListDisplay: [],
      page: 1,
      pageSize: 10,
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    const { pageSize } = this.state;
    setLoading(true);
    const getTechSpecsResult = await getTechSpecs();
    setLoading(false);
    this.setState({
      techSpecList: getTechSpecsResult.data,
      techSpecListDisplay: getTechSpecsResult.data.slice(0, pageSize),
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    const { pageSize } = this.state;
    setSubmitResult('');
    setLoading(true);
    const getTechSpecsResult = await getTechSpecs();
    setLoading(false);
    this.setState({
      techSpecList: getTechSpecsResult.data,
      techSpecListDisplay: getTechSpecsResult.data.slice(0, pageSize),
    });
  };

  render() {
    // Props first
    const { setErrorMessage, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { techSpecList, techSpecListDisplay, page, pageSize } = this.state;

    return (
      <div className="tech-spec-list">
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
          <h4>Danh mục thông số kĩ thuật</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <DataTable
                rows={techSpecListDisplay}
                headers={[
                  { header: 'Mã thông số', key: 'specID' },
                  { header: 'Tên thông số', key: 'specName' },
                ]}
                render={({ rows, headers }) => (
                  <div>
                    <TableContainer title={`Có tất cả ${techSpecList.length} danh mục thông số kĩ thuật.`}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader key={header.key}>{header.header}</TableHeader>
                            ))}
                            <TableHeader />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id}>
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id}>{cell.value}</TableCell>
                              ))}
                              <TableCell>
                                <OverflowMenu>
                                  <OverflowMenuItem itemText="Sửa" onClick={() => history.push(`/tech/spec/update?specID=${row.cells[0].value}`)} />
                                </OverflowMenu>
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
                      pageSizes={[10, 20, 30, 40, 50]}
                      totalItems={techSpecList.length}
                      onChange={(target) => {
                        this.setState({
                          techSpecListDisplay: techSpecList.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                          page: target.page,
                          pageSize: target.pageSize,
                        });
                      }}
                    />
                  </div>
                )}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
          <br />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-8">
              <Button onClick={() => history.push('/tech/spec/add')}>Thêm thông số kĩ thuật mới</Button>
            </div>
            <div className="bx--col-lg-4" />
          </div>
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

TechSpecList.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(TechSpecList);
