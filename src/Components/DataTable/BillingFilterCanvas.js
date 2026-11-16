import React from "react";
import {
  COffcanvas,
  COffcanvasHeader,
  COffcanvasTitle,
  COffcanvasBody,
  CCloseButton,
} from "@coreui/react";
import DatePicker from "react-datepicker";
import BlockKeyboardInput from "../../utils/BlockKeyboardInput";

const BillingFilterCanvas = ({
  visible,
  setVisible,
  handleApplyFilter,
  handleDateChange,
  handleStatusChange,
  tempFilter,
  handleClear,
  onclose
}) => {
  return (
    <COffcanvas
      className="ps-3 pe-3 pt-3 offcanvas_filter"
      backdrop="static"
      placement="end"
      visible={visible}
      onHide={onclose}
    >
      <COffcanvasHeader>
        <COffcanvasTitle>Filters</COffcanvasTitle>
        <CCloseButton
          className="text-reset modal-close-cross"
          onClick={() => {
            setVisible(false);
          }}
        />
      </COffcanvasHeader>
      <COffcanvasBody>
        <div
          className="d-flex justify-content-between flex-column"
          style={{ height: "100%" }}
        >
          <div>
            <div className="mt-4">
              <p className="title-register mb-2">Select Month</p>
              <div className="form-group has-search-right">
                <DatePicker
                  customInput={<BlockKeyboardInput />}
                  className="form-control input-dt shadow"
                  selected={tempFilter?.selectedMonth}
                  onChange={(date) => handleDateChange("selectedMonth", date)}
                  dateFormat="MM/yyyy"
                  showMonthYearPicker
                  placeholderText="Select Month"
                  maxDate={new Date()}
                />
              </div>
            </div>

            <div>
              <div>
                <p className="title-register mt-4">Status</p>
                <div className="ms-4">
                  <p>
                    <input
                      type="radio"
                      name="status"
                      id="all"
                      value=""
                      checked={tempFilter?.status === ""}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    />
                    <label htmlFor="all" className="ms-2">All</label>
                  </p>
                  <p>
                    <input
                      type="radio"
                      name="status"
                      id="pending"
                      value="Pending"
                      checked={tempFilter?.status === "Pending"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    />
                    <label htmlFor="pending" className="ms-2">Pending</label>
                  </p>
                  <p>
                    <input
                      type="radio"
                      name="status"
                      id="billed"
                      value="Billed"
                      checked={tempFilter?.status === "Billed"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    />
                    <label htmlFor="billed" className="ms-2">Billed</label>
                  </p>
                  <p>
                    <input
                      type="radio"
                      name="status"
                      id="paymentReceived"
                      value="Payment Received"
                      checked={tempFilter?.status === "Payment Received"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    />
                    <label htmlFor="paymentReceived" className="ms-2">Payment Received</label>
                  </p>
                  
                  <p>
                    <input
                      type="radio"
                      name="status"
                      id="cancelled"
                      value="Cancelled"
                      checked={tempFilter?.status === "Cancelled"}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    />
                    <label htmlFor="cancelled" className="ms-2">Cancelled</label>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="d-grid">
            <button
                            onClick={() => {
                              handleClear(); }}
                            className="shadow-none reset-apply-btn  fw-bold"
                        >
                            Reset
                        </button>
              <button
                onClick={() => {
                  setVisible(false);
                  handleApplyFilter();
                }}
                className="shadow-none filter-apply-btn mt-4"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </COffcanvasBody>
    </COffcanvas>
  );
};

export default BillingFilterCanvas;
