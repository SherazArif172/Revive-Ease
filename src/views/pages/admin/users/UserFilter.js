import { CCloseButton, COffcanvas, COffcanvasHeader, COffcanvasTitle } from "@coreui/react";
import { COffcanvasBody } from "@coreui/react";
import DatePicker from "react-datepicker";
import BlockKeyboardInput from "../../../../utils/BlockKeyboardInput";

const UserFilter = ({
    visible,
    setVisible,
    handleClearFilter,
    tempFilter,
    handleFilterChange,
    handleDateChange,
    handleApplyFilter,
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
                <COffcanvasTitle className="">Filters</COffcanvasTitle>
                <CCloseButton
                    className="text-reset modal-close-cross"
                    onClick={() => {
                        setVisible(false);
                        handleClearFilter();
                    }}
                />
            </COffcanvasHeader>

            <COffcanvasBody className="d-flex justify-content-between flex-column">
                <div>
                    <p className="title-register">Registration Date</p>
                    <div className="form-group has-search-right">
                        <DatePicker
                            customInput={<BlockKeyboardInput />}
                            className="form-control input-dt shadow"
                            placeholderText="From"
                            dateFormat="MM/dd/yyyy"
                            selected={tempFilter?.startDate}
                            onChange={(date) => handleDateChange("startDate", date)}
                            selectsStart
                            startDate={tempFilter?.startDate}
                            endDate={tempFilter?.endDate}
                            maxDate={new Date()}
                        />
                    </div>
                    <div className="form-group has-search-right mt-4">
                        <DatePicker
                            customInput={<BlockKeyboardInput />}
                            className="form-control input-dt shadow"
                            placeholderText="To"
                            dateFormat="MM/dd/yyyy"
                            selected={tempFilter?.endDate}
                            onChange={(date) => handleDateChange("endDate", date)}
                            selectsEnd
                            startDate={tempFilter?.startDate}
                            endDate={tempFilter?.endDate}
                            minDate={tempFilter?.startDate}
                            maxDate={new Date()}
                        />
                    </div>

                    <div>
                        <p className="title-register mt-4">Status</p>
                        <div className="ms-4">
                            <p>
                                <input
                                    type="radio"
                                    name="status"
                                    id="allStatus"
                                    value=""
                                    checked={tempFilter?.status === ""}
                                    onChange={handleFilterChange}
                                />
                                <label htmlFor="allStatus">All</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="status"
                                    id="active"
                                    value="active"
                                    checked={tempFilter?.status === "active"}
                                    onChange={handleFilterChange}
                                />
                                <label htmlFor="active">Active</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="status"
                                    id="inactive"
                                    value="inactive"
                                    checked={tempFilter?.status === "inactive"}
                                    onChange={handleFilterChange}
                                />
                                <label htmlFor="inactive">Inactive</label>
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className="title-register mt-4">User Type</p>
                        <div className="ms-4">
                            <p>
                                <input
                                    type="radio"
                                    name="userType"
                                    id="coach"
                                    value="coach"
                                    checked={tempFilter?.userType === "coach"}
                                    onChange={handleFilterChange}
                                />
                                <label htmlFor="coach">Coach</label>
                            </p>
                            <p>
                                <input
                                    type="radio"
                                    name="userType"
                                    id="provider"
                                    value="provider"
                                    checked={tempFilter?.userType === "provider"}
                                    onChange={handleFilterChange}
                                />
                                <label htmlFor="provider">Provider</label>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="col-12">
                    <div className="d-grid">
                   
                    <button
                            onClick={() => {
                                handleClearFilter(); }}
                            className="shadow-none reset-apply-btn  fw-bold"
                        >
                            Reset
                        </button>
                        <button
                            onClick={handleApplyFilter}
                            className="shadow-none filter-apply-btn mt-2 fw-bold"
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </COffcanvasBody>
        </COffcanvas>
    );
};

export default UserFilter;