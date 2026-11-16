import {
  CCloseButton,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
} from "@coreui/react";
import React, { useEffect, useState } from "react";
import {
  useUpdateRoleMutation,
  useGetMyCoachingNotesQuery,
} from "../../../../redux/apis/role_api";
import { toast } from "react-toastify";

const CoachNote = ({ addCoachNoteModal, onclose, patientId, actorId, actorType }) => {
  const [btnDisable, setBTnDisable] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [note, setNotes] = useState("");

  const [addCoachNote, { isSuccess, isLoading, isError }] =
    useUpdateRoleMutation();
  // eslint-disable-next-line no-unused-vars
  const { data, refetch } = useGetMyCoachingNotesQuery({
    patientId: patientId,
  });

  const MAX_NOTE_LENGTH = 250;

  useEffect(() => {
    if (addCoachNoteModal) {
      setNotes("");
    }
  }, [addCoachNoteModal]);

  useEffect(() => {
    if (isSuccess) {
      onclose();
      setBTnDisable(false);
      setNotes("");
      refetch();
    }
    if (isError) {
      setBTnDisable(false);
      toast.error("Failed to Add Note!");
    }
    if (isLoading) {
      setBTnDisable(true);
    }
  }, [isError, isSuccess, isLoading]);

  // eslint-disable-next-line no-unused-vars
  const handleValidation = () => {
    let error = "";
    if (!note.trim()) {
      error = "Note field is required";
    } else if (note.trim().length < 3) {
      error = "Note must be at least 3 characters";
    } else if (note.trim().length > MAX_NOTE_LENGTH) {
      error = `Note cannot exceed ${MAX_NOTE_LENGTH} characters`;
    }

    setErrMsg(error);
    if (error) {
      setTimeout(() => setErrMsg(""), 3000);
    }
    return !error;
  };

  const handleNoteChange = (e) => {
    const { value } = e.target;

    if (value.length <= MAX_NOTE_LENGTH) {
      setNotes(value);
      setErrMsg("");
    } else {
      setErrMsg(`Note cannot exceed ${MAX_NOTE_LENGTH} characters`);
      setTimeout(() => setErrMsg(""), 3000);
    }
  };

  const onSubmitNote = (e) => {
    e.preventDefault();

    if (!handleValidation()) {
      setTimeout(() => {
        setErrMsg("");
      }, 3000);
      return;
    }

    const payload = {
      isMyCoachingNotes: {
        coach_id: actorId,
        add_notes: note,
        actorId: actorId,
        actorType: actorType
      },
    };

    addCoachNote({ id: patientId, payload });
  };

  return (
    <div>
      <>
        <COffcanvas
          className="ps-3 pe-3 offcanvas_add_user_auto"
          backdrop="static"
          placement="bottom"
          visible={addCoachNoteModal}
          onHide={onclose}
          onClose={onclose}
        >
          <COffcanvasHeader className="">
            <COffcanvasTitle className="pt-4">
              My Coaching Note
            </COffcanvasTitle>
            <CCloseButton
              className="text-reset modal-close-cross"
              onClick={() => {
                setNotes("");
                onclose();
              }}
            />
          </COffcanvasHeader>
          <COffcanvasBody>
            <div>
              <div className="row ">
                <div></div>
                <div className="col">
                  <label htmlfor="formGroupExampleInput" className="p-2">
                    Note *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-input"
                    placeholder=""
                    name="note"
                    value={note}
                    onChange={handleNoteChange}
                  />
                  <small
                    className={
                      note.length > MAX_NOTE_LENGTH ? "text-danger" : "text-muted"
                    }
                  >
                    {note.length}/{MAX_NOTE_LENGTH} characters
                  </small>
                  <div className="error-space">
                    {errMsg && (
                      <p className="text-danger">{errMsg}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="row pt-4">
                <div className="col-md-12 text-end">
                  <button
                    type="button"
                    className="rv-reset-cancel mt-4"
                    onClick={() => {
                      setNotes("");
                      onclose();
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn add-practs-btn fw-bold mx-2 mt-1"
                    onClick={onSubmitNote}
                    disabled={btnDisable === true}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </COffcanvasBody>
        </COffcanvas>
      </>
    </div>
  );
};

export default CoachNote;
