import React, { useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { auditLogColumns, CustomSortIcon } from "../../../../Components/DataTable/commonColumn";
import customStyles from "../../../../Components/DataTable/CustomStyle";
import { useSelector } from "react-redux";
import { useLazyExportAuditLogsCSVQuery, useGetAuditLogsQuery } from "../../../../redux/apis/allPatient_api";
import PaginationComponent from "../../../../utils/Pagination";
import AuditLogFilterCanva from "../../../../Components/DataTable/AuditLogFilterCanva";
import Filter from "../../../../assets/icons/filter.png";


const AuditLog = () => {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortField, setSortField] = useState('timestamp');
    const [sortOrder, setSortOrder] = useState('asc');
    const [isExporting, setIsExporting] = useState(false);
    const [visible, setVisible] = useState(false);

    const initialFilterState = {
        userName: '',
        registrationDateFrom: null,
        registrationDateTo: null,
        actionCreate: false,
        actionUpdate: false,
        actionView: false,
        actionDelete: false,
        targetTypeClinic: false,
        targetTypeUsers: false,
        targetTypePatient: false,
        targetTypeReportAnalytics: false,
        targetTypeContentManagement: false,
        targetTypeBilling: false,
        targetTypeJourneyTemplate: false,
    };
    const [filters, setFilters] = useState(initialFilterState);
    const [appliedFilters, setAppliedFilters] = useState(initialFilterState);

    const buildApiFilters = (filters) => {
        const apiFilters = {};

        if (filters.userName) {
            apiFilters.actorType = filters.userName;
        }

        if (filters.registrationDateFrom) {
            // Format as YYYY-MM-DD to avoid timezone issues
            const year = filters.registrationDateFrom.getFullYear();
            const month = String(filters.registrationDateFrom.getMonth() + 1).padStart(2, '0');
            const day = String(filters.registrationDateFrom.getDate()).padStart(2, '0');
            apiFilters.startDate = `${year}-${month}-${day}`;
        }

        if (filters.registrationDateTo) {
            // Format as YYYY-MM-DD to avoid timezone issues
            const year = filters.registrationDateTo.getFullYear();
            const month = String(filters.registrationDateTo.getMonth() + 1).padStart(2, '0');
            const day = String(filters.registrationDateTo.getDate()).padStart(2, '0');
            apiFilters.endDate = `${year}-${month}-${day}`;
        }

        const actions = [];
        if (filters.actionCreate) actions.push('create');
        if (filters.actionUpdate) actions.push('update');
        if (filters.actionView) actions.push('view');
        if (filters.actionDelete) actions.push('delete');

        const targetTypes = [];
        if (filters.targetTypeClinic) targetTypes.push('Clinic');
        if (filters.targetTypeUsers) targetTypes.push('Users');
        if (filters.targetTypePatient) targetTypes.push('Patient');
        if (filters.targetTypeReportAnalytics) targetTypes.push('Report & Analytics');
        if (filters.targetTypeContentManagement) targetTypes.push('Content Management');
        if (filters.targetTypeBilling) targetTypes.push('Billing');
        if (filters.targetTypeJourneyTemplate) targetTypes.push('Journey Template');
        if (targetTypes.length) {
            apiFilters.targetType = targetTypes;
        }

        if (actions.length) {
            apiFilters.action = actions;
        }

        if (filters.module) {
            apiFilters.module = 'module';
        }

        return apiFilters;
    };
    const stableFilters = useMemo(() => ({ ...buildApiFilters(appliedFilters) }), [appliedFilters]);
    // eslint-disable-next-line no-unused-vars
const { data, isLoading: isLoadingAuditLogs, error, refetch } = useGetAuditLogsQuery({ page: page, limit: rowsPerPage, sortField, sortOrder, filters: stableFilters }, { refetchOnMountOrArgChange: true });    const auditLogs = useSelector(
        (state) => state.allPatients.allAuditLogs.data
    );
    const paginationData = useSelector(
        (state) => state.allPatients?.allAuditLogs
    );

    // Handle different possible response structures
    const totalRecords = paginationData?.total || paginationData?.totalRecords || paginationData?.totalCount || 0;



    // Debug: Log the full response structure
    console.log('Full Response Structure:', {
        auditLogs,
        paginationData,
        fullState: useSelector((state) => state.allPatients)
    });

    const handleChangePage = (event, newPage) => {
        setPage(newPage + 1);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    const handleSort = (field, direction) => {
        setSortField(field);
        setSortOrder(direction);
        setPage(1);
    };

    const columns = auditLogColumns.map(col => ({
        ...col,
        name: (
            <span
                className="flex-items-between"
                style={{ cursor: 'pointer', width: '100%' }}
                onClick={() => handleSort(col.sortField, sortField === col.sortField && sortOrder === 'asc' ? 'desc' : 'asc')}
            >
                {col.name}
                <CustomSortIcon
                    column={col}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    handleSort={handleSort}
                />
            </span>
        ),
    }));

    const handleDateChange = (name, date) => {
        setFilters(prev => ({
            ...prev,
            [name]: date,
            ...(name === 'registrationDateFrom' &&
                prev.registrationDateTo &&
                date > prev.registrationDateTo && { registrationDateTo: null })
        }));
    };

    const handleClear = () => {
        setFilters(initialFilterState);
        setAppliedFilters(initialFilterState);
        setPage(1);
        setVisible(false);
        setTimeout(() => {
            refetch();
        }, 0);
    };
    const onclose = () => {
        setVisible(false);
    };

    const handleApplyFilter = () => {
        setAppliedFilters(filters);
        setPage(1);
        setVisible(false);
        // Removed refetch() to avoid double API call
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };
    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setFilters(prev => ({ ...prev, [name]: checked }));
    };

    const [triggerExport] = useLazyExportAuditLogsCSVQuery();

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(async () => {
            try {
                const result = await triggerExport(buildApiFilters(appliedFilters)).unwrap();
                const url = window.URL.createObjectURL(result);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'audit-logs.csv';
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                alert('Export failed: ' + error.message);
            } finally {
                setIsExporting(false);
            }
        }, 0);
    };

    return (
        <>
            <div className="font-color my-3 flex-items-between">
                <h6>
                    <strong> Audit Log</strong>
                </h6>
                <div className="d-flex flex-items-between flex-row gap-2" >
                    <div className=" ">
                        <button
                            className="btn filter-btn d-flex align-items-center "
                            onClick={() => setVisible(true)}
                        >
                            <img loading="lazy" src={Filter} height={14} width={12.26} />
                            <span className="ms-2">Filters</span>
                        </button>
                    </div>
                    <div>
                        <button
                            className={`btn download-pdf px-3`}
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? "Exporting..." : "Export"}
                        </button>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={auditLogs || []}
                customStyles={customStyles}
                progressPending={isLoadingAuditLogs ? true : false}
                sortServer
                sortField={sortField}
                sortOrder={sortOrder}
            />
            <PaginationComponent
                totalRecords={totalRecords}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 15, 20 , 50]}
            />

            <AuditLogFilterCanva
                visible={visible}
                setVisible={setVisible}
                handleInputChange={handleInputChange}
                handleDateChange={handleDateChange}
                handleCheckboxChange={handleCheckboxChange}
                handleApplyFilter={handleApplyFilter}
                handleClear={handleClear}
                onclose={onclose}
                filters={filters}
            />
        </>
    );
};

export default AuditLog;
