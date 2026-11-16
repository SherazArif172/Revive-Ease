import React, { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import {
  CBreadcrumb,
  CBreadcrumbItem,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from "@coreui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import {
  useDeleteTemplateDetailMutation,
  useGetCategoriesQuery,
  useGetTemplateDetailsQuery,
  useTemplateDetailsUpdateMutation,
} from "../../../../redux/apis/patient_coach_api";
import BackArrow from "../../../../assets/icons/backArrow.png";
import PlusCircle from "../../../../assets/icons/plus-circle.png";
import DeleteIcon from "../../../../assets/icons/trash-2.png";
import Sorticon from "../../../../assets/icons/sort.png";
import { customStylesTask } from "../../../../Components/DataTable/CustomStyle";
import DeleteModal from "../../../../Components/Modal/DeleteModal";

const VideoSelectForRow = ({ category, selected, onChange }) => {
  const isFetchableCategory = ["Relax", "Activity", "Learn"].includes(category);
  const { data } = useGetCategoriesQuery(
    { category },
    { skip: !isFetchableCategory }
  );
  const videos = data?.data ?? [];

  const handleChange = (e) => {
    const id = e.target.value;
    if (id === "Rest Day") {
      onChange(id, {
        title: "Rest Day",
        video_duration: "Rest Day",
        description: "Rest Day",
        thumbnail: "Rest Day",
      });
      return;
    }
    const video = videos.find((v) => v.video_url === id);
    onChange(id, video);
  };

  return (
    
    <select
      className="select-task-details"
      value={selected || ""}
      onChange={handleChange}
    >
      <option value="">Select a video</option>
      <option value="Rest Day">Rest Day</option>
      {videos.map((v) => {
        return (
          
          <option key={v._id} value={v.video_url}>
            {v?.title}
          </option>
        );
      })}
    </select>
  );
};

const TaskDetails = () => {
  const { state } = useLocation();
  const afterSaveTemp = state?.template;
  const template_ID = afterSaveTemp ? afterSaveTemp?._id : state?._id;
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [rowData, setRowData] = useState();
  const { data: templateData, refetch } = useGetTemplateDetailsQuery(template_ID);
  const [deleteTemplateByRow, { isSuccess: isDeleteSuccess }] =
    useDeleteTemplateDetailMutation();
  const [updateDetails, { isSuccess: isUpdateSuccess }] =
    useTemplateDetailsUpdateMutation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!templateData?.data?.days?.length) return;

    const flattened = templateData?.data?.days.flatMap(
      ({ dayNumber, activities = [], relaxation = [], learning = [] }) => [
        ...activities.map((t) => ({ ...t, dayNumber, type: "Activity" })),
        ...relaxation.map((t) => ({ ...t, dayNumber, type: "Relaxation" })),
        ...learning.map((t) => ({ ...t, dayNumber, type: "Learning" })),
      ]
    );

    setRows(flattened);
    setLoading(false);
  }, [templateData]);

  useEffect(() => {
    if (isDeleteSuccess || state !== null || isUpdateSuccess) {
      if (isDeleteSuccess) {
        setDeleteModal(false);
      }
      refetch();
    }
  }, [isDeleteSuccess, state, isUpdateSuccess]);

  const updateRow = useCallback((id, patch) => {
    setRows((prev) => prev.map((r) => (r._id === id ? { ...r, ...patch } : r)));
  }, []);

  const columns = [
    { name: "Day", selector: (r) => `Day ${r.dayNumber}` },
    {
      name: "Category",
      cell: (row) => (
        <select
          className="select-task-details"
          value={row.category || ""}
          onChange={(e) => {
            const newCategory = e.target.value || row?.category;
            const clearVideoFields = {
              video_url: "",
              video_duration: "",
              description: "",
              thumbnail: "",
              title: "",
            };
            updateRow(row._id, {
              category: newCategory,
              ...(newCategory === "Rest Day" ? clearVideoFields : { video_url: "" }),
            });
          }}
        >
          <option value="" disabled>
            Select category
          </option>
          <option value="Relax">Relax</option>
          <option value="Activity">Activity</option>
          <option value="Learn">Learn</option>
        </select>
      ),
    },
    {
      name: "Video",
      cell: (row) => (
        <VideoSelectForRow
          category={row.category}
          selected={row.video_url}
          onChange={(video_url, video) =>
            updateRow(row._id, {
              video_url,
              video_duration: video?.video_duration ?? "",
              description: video?.description ?? "",
              thumbnail: video?.thumbnail ?? "",
              title: video?.title ?? "",
            })
          }
        />
      ),
    },
    {
      name: "Description",
      selector: (row) => {
        const desc = row?.description || "";
        const isLong = desc.length > 50;

        return (
          <span title={desc}>
            {isLong ? `${desc.substring(0, 50)}...` : desc}
          </span>
        );
      },
      grow: 2,
    },
    { name: "Duration", selector: (r) => r.video_duration },
    {
      name: "Action",
      button: true,
      cell: (row) => (
        <CDropdown direction="dropstart">
          <CDropdownToggle size="sm">
            <FontAwesomeIcon
              icon={faEllipsis}
              rotation={90}
              size="lg"
              style={{ color: "#04470C" }}
            />
          </CDropdownToggle>
          <CDropdownMenu>
            <CDropdownItem onClick={() => addActivity(row)}>
              <img src={PlusCircle} className="me-2" />
              Add Move
            </CDropdownItem>
            <CDropdownItem
              
              onClick={() => {
                setDeleteModal(true);
                setRowData(row);
              }}
            >
           
              <img src={DeleteIcon} className="me-2" />

              Delete
            </CDropdownItem>
          </CDropdownMenu>
        </CDropdown>
      ),
    },
  ];

  const onClose = () => {
    setDeleteModal(false);
  };

  const onConfirm = () => {
    deleteTemplateByRow({ templateId: template_ID, rowId: rowData?._id });
  };

  const onSubmit = () => {
    const payload = {
      template_id: template_ID,
      updates: rows?.map((row) => ({
        activity_id: row?._id,
        data: {
          category: row?.category,
          video_url: row?.video_url,
          video_duration: row?.video_duration,
          title: row?.title,
          thumbnail: row?.thumbnail,
          description: row?.description,
        },
      })),
    };
    updateDetails(payload);
  };

  const handleAddDays = () => {
    const payload = {
      template_id: template_ID,
      add_days: 1,
    };
    updateDetails(payload);
  };

  const addActivity = (row) => {
    const payload = {
      template_id: template_ID,
      add_items: [
        {
          dayNumber: row?.dayNumber,
          category:
            row?.category === "Activity"
              ? "activities"
              : row?.category === "Relax"
                ? "relaxation"
                : row?.category === "Learn"
                  ? "learning"
                  : null,
          data: {
            category: row?.type,
            video_url: "",
            description: "",
            video_duration: "",
          },
        },
      ],
    };
    updateDetails(payload);
  };

  return (
    <div className="main-container mt-3 py-3">
      <CBreadcrumb>
        <CBreadcrumbItem className="font-color">
          <span className="pointer px-2" onClick={() => navigate(-1)}>
            <img
              loading="lazy"
              src={BackArrow}
              height={16}
              width={9.6}
              alt="Back Arrow"
              className="me-2"
            />
            {afterSaveTemp ? afterSaveTemp?.template_name : state?.template_name}
          </span>
        </CBreadcrumbItem>
      </CBreadcrumb>

      <DataTable
        data={rows}
        columns={columns}
        customStyles={customStylesTask}
        progressPending={loading}
        responsive={true}
        sortIcon={<img loading="lazy" src={Sorticon} />}
      />
      <div className="row mt-4">
        <div className="col text-end">
          <button className="task-details-cancel" onClick={handleAddDays}>
            Add Days
          </button>
          <button
            className="btn task-detail-btn-save ms-2 text-white me-4"
            onClick={onSubmit}
          >
            Save
          </button>
        </div>
      </div>
      <DeleteModal
        onClose={onClose}
        deleteModal={deleteModal}
        content={"Do you want to delete this task?"}
        onConfirm={onConfirm}
      />
    </div>
  );
};

export default TaskDetails;
