
import React from "react";
import DataTable from "react-data-table-component";

const Support = () => {
    return (
        <>
            <div className="main-container mt-4">
                <div className="d-flex justify-content-between">
                    <div className="font-color">
                        <h6>
                            <strong> Support Message </strong>
                        </h6>
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <DataTable/>
            </div>
        </>
    );
};
export default Support;