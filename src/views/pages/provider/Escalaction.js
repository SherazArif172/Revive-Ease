import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import Addbutton from "../../../assets/icons/plus.png";
import FilterComponent from '../../../utils/FilterComponent';
import Sorticon from '../../../assets/icons/sort.png';
import { customStylesTask } from '../../../Components/DataTable/CustomStyle';
import NewEscalation from './NewEscalation';


const Escalaction = () => {

    const [filterText, setFilterText] = useState("");
    const [mdFormCanva, setMdFormCanva] = useState(false);

    const columnsEscalation = [
      {
        name: "Patient",
        selector: () => "John Smith",
        sortable: true,
      },
      {
        name: "Type",
        selector: () => "Plain Flare",
        sortable: true,
      },
      {
        name: "Level",
        selector: () => "Level 3",
        sortable: true,
      },
      {
        name: "Date",
        selector: () => "09/02/2025",
        sortable: true,
      },
      {
        name: "Status",
        selector: () => "Pending MD Review",
        sortable: true,
      },
      {
        name: "Assigned To",
        selector: () => "Dr. JohnSon",
        sortable: true,
      },
    ];

    const handleMdFormState = () => {
        setMdFormCanva(true);
    };

    const onClose = () => {
        setMdFormCanva(false);
    };

    return (
        <>
            <div className="main-container mt-3">
                <div className="d-flex justify-content-between">
                    <div className="font-color">
                        <h6>
                            <strong>Patient Escalations</strong>
                        </h6>
                    </div>
                    <div className="d-flex flex-wrap align-items-center justify-content-between mx-1">
                        <div className="flex-grow-1 me-2 mb-2">
                            <FilterComponent
                                placeholder={"Search patient by name"}
                                onFilter={(e) => setFilterText(e.target.value)}
                                filterText={filterText}
                            />
                        </div>
                        <div className="me-2 mb-2">
                            <select className="form-select form-control-select">
                                <option value="">All Statuses</option>
                                <option value="all">Pending MD Review</option>
                                <option value="critical">In Progress</option>
                                <option value="moderate">Resolved</option>
                            </select>
                        </div>
                        <div className="me-2 mb-2">
                            <select className="form-select form-control-select">
                                <option value="">All Types</option>
                                <option value="all">Pain Flare</option>
                                <option value="critical">Non-Compliance</option>
                                <option value="moderate">Emotional Concern</option>
                                <option value="moderate">Emergency/Urgent</option>
                            </select>
                        </div>
                        <div className="mb-2">
                            <button
                                className="add-escalation flex-items-center "
                                onClick={handleMdFormState}
                            >
                                <img loading="lazy" src={Addbutton} height={14} width={14} />
                                <span className="ms-2">New Escalation</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div className="mt-2">
                    <DataTable
                    columns={columnsEscalation}
                    data={columnsEscalation}
                    customStyles={customStylesTask}
                    sortIcon={<img loading="lazy" src={Sorticon} />}
                    />
                </div>
            </div>
            <div>
                <NewEscalation
                    mdFormCanva={mdFormCanva}
                    onClose={onClose}
                />
            </div>
        </>
    );
};

export default Escalaction;