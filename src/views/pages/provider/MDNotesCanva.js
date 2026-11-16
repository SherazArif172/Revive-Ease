import { CCloseButton, COffcanvas, COffcanvasBody, COffcanvasHeader, COffcanvasTitle } from "@coreui/react";
import { usePostMdNotesMutation, useUpdateMdNotesMutation } from "../../../redux/apis/md_notes_api";
import { useEffect, useState } from "react";
import { validateRequired } from "../../../utils/inputValidation";

const MdNotesCanva = ({mdNotesCanva, setMdNotesCanva, patientId, refetch, edit, mdNotesData, setEdit, onclose}) => {

    const [ addMDNotes, {isSuccess: addMDNotesSuccess} ] = usePostMdNotesMutation();
    const [ updateMdNotes, {isSuccess: updateMdNotesSuccess} ] = useUpdateMdNotesMutation();

    const [formData, setFormData] = useState({
        taskName: "",
        description: "",
    });
    const [errors, setErrors] = useState("");

    useEffect(() => {
        if(mdNotesData !== null){
            setFormData({
                taskName: mdNotesData?.task_name,
                description: mdNotesData?.description,
            });
        }
    }, [mdNotesData]);

    useEffect(() => {
        if(addMDNotesSuccess){
            refetch();
            setMdNotesCanva(false);
            setFormData({
                taskName: "",
                description: "",
            });
        }
    }, [addMDNotesSuccess]);

    useEffect(() => {
        if(updateMdNotesSuccess){
            refetch();
            setMdNotesCanva(false);
            setFormData({
                taskName: "",
                description: "",
            });
            setEdit(false);
        }
    }, [updateMdNotesSuccess]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
        if (name === 'taskName') {
              const error = validateRequired(value);
              setErrors({ ...errors, [name]: error });
            } else if (name === "description") {
              const error = validateRequired(value);
              setErrors({ ...errors, [name]: error });
            }
    };

    const handleAddMdNotes = (e) => {
        e.preventDefault();
        if (!formData?.taskName || !formData?.description) {
            setErrors({ ...errors, ["requiredField"]: "Please fill all mandatory fields" });
            setTimeout(() => {
              setErrors({ ...errors, ["requiredField"]: "" });
            }, 2000);
            return;
        }
        if(edit === true){
            let payloadEdit = {
                user_id: patientId,
                task_name: formData?.taskName,
                description: formData?.description,
            };
            updateMdNotes({data: payloadEdit, id: mdNotesData?._id});
        } else {
            let payload = {
                user_id: patientId,
                task_name: formData?.taskName,
                description: formData?.description,
            };
            addMDNotes(payload);
        }
    };

    return (
        <>
            <COffcanvas
                className="ps-3 pe-3  offcanvas_add_user"
                backdrop="static"
                placement="bottom"
                visible={mdNotesCanva}
                onHide={onclose}
                
            >
                <COffcanvasHeader className="">
                    <COffcanvasTitle className="pt-4 text-black">
                        {edit === true ? "Update Md Notes" : "Add Md Notes"}
                        <span className="ms-2">
                            {errors?.requiredField ? (
                                <span
                                    className="mt-4 ml-5 text-center rg-err"
                                    style={{ fontSize: 14 }}
                                >
                                    {errors?.requiredField}
                                </span>
                            ) : (
                                ""
                            )}
                        </span>
                    </COffcanvasTitle>
                    <CCloseButton
                        className="text-reset modal-close-cross"
                        onClick={() => {setMdNotesCanva(false); setFormData({taskName: "", description: ""}); setEdit(false);}}
                    />
                </COffcanvasHeader>

                <COffcanvasBody>
                    <div>
                        <div className="row ">
                            <div className="col">
                                <label className="p-2">
                                    Task Name *
                                </label>
                                <input
                                    type="text"
                                    className="form-control form-control-input"
                                    placeholder=""
                                    name="taskName"
                                    value={formData?.taskName}
                                    defaultValue={mdNotesData?.task_name}
                                    onChange={handleInputChange}
                                    disabled={edit == true}
                                />
                            </div>
                            {errors?.taskName && <div className="text-danger mt-3">{errors?.taskName}</div>}
                        </div>
                        <div className="col mt-4">
                            <label className="p-2">
                                Description *
                            </label>
                            <textarea
                                type="text"
                                className="form-control form-control-input"
                                placeholder=""
                                name="description"
                                value={formData?.description}
                                defaultValue={mdNotesData?.description}
                                onChange={handleInputChange}
                            />
                            {errors?.description && <div className="text-danger mt-3">{errors?.description}</div>}
                        </div>
                        <div className="row pt-2">
                            <div className="col-md-12 text-end">
                                {edit === false ?
                                    <button
                                        className="btn cncl-practs-btn mt-4"
                                        onClick={() => { setMdNotesCanva(false); setEdit(false); }}
                                    >
                                        Cancel
                                    </button> : null
                                }
                                <button
                                    className="btn add-practs-btn ms-2 mt-4"
                                    onClick={handleAddMdNotes}
                                    disabled={errors?.taskName || errors?.description}
                                >
                                    {edit === true ? "Update" : "Add"}
                                </button>
                            </div>
                        </div>
                    </div>
                </COffcanvasBody>
            </COffcanvas>
        </>

    );
};

export default MdNotesCanva;