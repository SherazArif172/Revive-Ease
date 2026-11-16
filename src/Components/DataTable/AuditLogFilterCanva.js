import React from 'react';
import {
    CCloseButton,
    COffcanvas,
    COffcanvasBody,
    COffcanvasHeader,
    COffcanvasTitle,
} from "@coreui/react";
import 'react-datepicker/dist/react-datepicker.css';
import BlockKeyboardInput from '../../utils/BlockKeyboardInput';
import DatePicker from 'react-datepicker';
import { Checkbox, FormControlLabel } from '@mui/material';


const AuditLogFilterCanva = ({
    visible,
    onclose,
    handleInputChange,
    handleDateChange,
    handleCheckboxChange,
    handleApplyFilter,
    handleClear,
    filters
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
                    onClick={onclose}
                />
            </COffcanvasHeader>
            <COffcanvasBody>
                <>
                    <div className='d-flex justify-content-between flex-column' style={{ height: "100%" }}>
                        <div className="form-group has-search-right mt-2">
                            <input
                                type="text"
                                className="form-control form-control-input"
                                name="userName"
                                placeholder="Search by user role"
                                value={filters.userName}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="mt-4">
                            <p className="title-register mb-2 ">Date Range</p>
                            <div className="form-group has-search-right">
                                <DatePicker
                                    customInput={<BlockKeyboardInput />}
                                    className="form-control input-dt shadow"
                                    placeholderText="From"
                                    dateFormat="MM/dd/yyyy"
                                    selected={filters.registrationDateFrom}
                                    onChange={(date) => handleDateChange("registrationDateFrom", date)}
                                    selectsStart
                                    startDate={filters.registrationDateFrom}
                                    endDate={filters.registrationDateTo}
                                    maxDate={new Date()}
                                />
                            </div>
                            <div className="form-group has-search-right mt-2">
                                <DatePicker
                                    customInput={<BlockKeyboardInput />}
                                    className="form-control input-dt shadow"
                                    placeholderText="To"
                                    dateFormat="MM/dd/yyyy"
                                    selected={filters.registrationDateTo}
                                    onChange={(date) => handleDateChange("registrationDateTo", date)}
                                    selectsEnd
                                    startDate={filters.registrationDateFrom}
                                    endDate={filters.registrationDateTo}
                                    maxDate={new Date()}
                                    minDate={filters.registrationDateFrom}
                                />
                            </div>

                            <div className="mt-4">
                                <p className="mb-3">Action</p>
                                <FormControlLabel
                                    className='ms-1'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="actionCreate"
                                            checked={filters.actionCreate}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Create"
                                />
                                <FormControlLabel
                                    className='ms'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="actionUpdate"
                                            checked={filters.actionUpdate}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Update"
                                />
                                <FormControlLabel
                                    className=''

                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="actionView"
                                            checked={filters.actionView}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="View"
                                />
                                <FormControlLabel
                                    className='ms-1'

                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="actionDelete"
                                            checked={filters.actionDelete}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Delete"
                                />
                            </div>

                            <div className="mt-3">
                                <p className="mb-3">Module</p>
                                <FormControlLabel
                                    className='ms-1'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="targetTypeClinic"
                                            checked={filters.targetTypeClinic}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Clinic"
                                />
                                <FormControlLabel
                                    className='ms-1'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="targetTypeUsers"
                                            checked={filters.targetTypeUsers}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Users"
                                />
                                <FormControlLabel
                                    className='ms-1'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="targetTypePatient"
                                            checked={filters.targetTypePatient}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Patient"
                                />
                                <FormControlLabel
                                    className='ms-1'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="targetTypeReportAnalytics"
                                            checked={filters.targetTypeReportAnalytics}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Report & Analytics"
                                />
                                <FormControlLabel
                                    className='ms-1'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="targetTypeBilling"
                                            checked={filters.targetTypeBilling}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Billing"
                                />
                                <FormControlLabel
                                    className='ms-1'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="targetTypeContentManagement"
                                            checked={filters.targetTypeContentManagement}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Content Management"
                                />
                                <FormControlLabel
                                    className='ms-1'
                                    control={
                                        <Checkbox
                                            className='filter-checkbox'
                                            name="targetTypeJourneyTemplate"
                                            checked={filters.targetTypeJourneyTemplate}
                                            onChange={handleCheckboxChange}
                                        />
                                    }
                                    label="Journey Template"
                                />

                            </div>
                        </div>
                        <div className="col-12">
                            <div className="d-grid">
                                <button
                                    onClick={() => {
                                        handleClear();
                                    }}
                                    className="shadow-none reset-apply-btn  fw-bold"
                                >
                                    Reset
                                </button>
                                <button
                                    onClick={() => {
                                        handleApplyFilter();
                                        onclose();
                                    }}
                                    className="shadow-none filter-apply-btn mt-4"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>


                </>
            </COffcanvasBody>
        </COffcanvas>
    );
};

export default AuditLogFilterCanva;



